"use client";

import { useEffect, useRef, useState } from "react";
import { verticalArcRadians } from "@/lib/panorama";
import { cn } from "@/lib/utils";
import styles from "./PanoramaViewer.module.css";

export interface ViewerHotspot {
  id: string;
  /** Degrees, positive upward. */
  pitch: number;
  /** Degrees; 0 is the horizontal centre of the panorama. */
  yaw: number;
  label: string | null;
}

interface PanoramaViewerProps {
  /** Equirectangular image — a hosted URL, or an object URL for a local file. */
  src: string;
  /** Pixel size of the source, used to work out its true vertical coverage. */
  width: number;
  height: number;
  alt?: string | null;
  className?: string;
  hotspots?: ViewerHotspot[];
  onHotspotActivate?: (id: string) => void;
  /** Turns the viewer into a target picker: a click reports where it landed. */
  onPick?: (position: { pitch: number; yaw: number }) => void;
  /** Drifts slowly until the visitor takes over, so the view reads as interactive. */
  autoRotate?: boolean;
}

const VERTEX_SHADER = `
attribute vec2 aPosition;
varying vec2 vScreen;
void main() {
  vScreen = aPosition;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

/**
 * Casts one ray per pixel and looks it up in the equirectangular image, which
 * is the whole projection: no sphere geometry is needed, so a full-screen quad
 * plus this shader is the entire renderer.
 */
const FRAGMENT_SHADER = `
precision highp float;
varying vec2 vScreen;
uniform sampler2D uPanorama;
uniform vec2 uYawPitch;
uniform float uHalfFovTan;
uniform float uAspect;
uniform float uVerticalArc;
const float PI = 3.14159265359;

void main() {
  vec3 ray = normalize(vec3(vScreen.x * uHalfFovTan * uAspect, vScreen.y * uHalfFovTan, -1.0));

  float cp = cos(uYawPitch.y);
  float sp = sin(uYawPitch.y);
  ray = vec3(ray.x, ray.y * cp - ray.z * sp, ray.y * sp + ray.z * cp);

  float cy = cos(uYawPitch.x);
  float sy = sin(uYawPitch.x);
  ray = vec3(ray.x * cy + ray.z * sy, ray.y, -ray.x * sy + ray.z * cy);

  float u = 0.5 + atan(ray.z, ray.x) / (2.0 * PI);
  // Dividing by the image's real vertical arc rather than PI keeps a panorama
  // that was cropped at the poles from being stretched to fill the sphere.
  float v = 0.5 - asin(clamp(ray.y, -1.0, 1.0)) / uVerticalArc;
  gl_FragColor = texture2D(uPanorama, vec2(u, v));
}
`;

// Matched to the zoom range vipmotors.ae uses (100° horizontal, 50°–120°),
// converted to the vertical field of view this shader takes.
const DEFAULT_FOV = 1.18;
const MIN_FOV = 0.5;
const MAX_FOV = 1.6;
const PITCH_LIMIT = Math.PI / 2 - 0.05;
const DEGREES = Math.PI / 180;

export function PanoramaViewer({
  src,
  width,
  height,
  alt,
  className,
  hotspots = [],
  onHotspotActivate,
  onPick,
  autoRotate = true,
}: PanoramaViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const markersRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [unsupported, setUnsupported] = useState(false);

  // Read by the render loop, which outlives any single render — without these
  // the loop would keep projecting whichever hotspots existed when it started,
  // and keep calling whichever onPick it was first handed. Synced after every
  // render rather than during one, since a render must not write to a ref.
  const hotspotsRef = useRef(hotspots);
  const pickRef = useRef(onPick);

  useEffect(() => {
    hotspotsRef.current = hotspots;
    pickRef.current = onPick;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (canvas.getContext("webgl2") ??
      canvas.getContext("webgl")) as WebGLRenderingContext | null;

    if (!gl) {
      setUnsupported(true);
      return;
    }

    // Everything the render loop mutates lives here rather than in React
    // state: a pointer drag changes these on every frame, and re-rendering the
    // component sixty times a second to move a camera would be wasteful.
    // Increasing yaw turns the view left, and -PI/2 is what puts the centre of
    // the panorama dead ahead on the first frame.
    const view = { yaw: -Math.PI / 2, pitch: 0, fov: DEFAULT_FOV };
    const verticalArc = verticalArcRadians({ width, height });
    let drifting = autoRotate;
    let frame = 0;
    let disposed = false;

    const program = buildProgram(gl);
    if (!program) {
      setUnsupported(true);
      return;
    }

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    gl.useProgram(program);
    const position = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uYawPitch = gl.getUniformLocation(program, "uYawPitch");
    const uHalfFovTan = gl.getUniformLocation(program, "uHalfFovTan");
    const uAspect = gl.getUniformLocation(program, "uAspect");
    gl.uniform1f(gl.getUniformLocation(program, "uVerticalArc"), verticalArc);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // A one-pixel placeholder keeps the first frames valid while the real
    // image is still downloading.
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([17, 17, 17, 255])
    );

    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      if (disposed) return;
      const source = toTextureSource(image, gl.getParameter(gl.MAX_TEXTURE_SIZE) as number);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      // The image is resampled to power-of-two above, so REPEAT is legal even
      // on WebGL 1 — and REPEAT is what makes the 0°/360° seam invisible.
      // CLAMP vertically fills the polar gaps of a cropped panorama with its
      // own edge pixels instead of stretching it.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      setStatus("ready");
    };
    image.onerror = () => {
      if (!disposed) setStatus("error");
    };
    image.src = src;

    function resize() {
      if (!gl) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const nextWidth = Math.round(canvas!.clientWidth * ratio);
      const nextHeight = Math.round(canvas!.clientHeight * ratio);
      if (canvas!.width !== nextWidth || canvas!.height !== nextHeight) {
        canvas!.width = nextWidth;
        canvas!.height = nextHeight;
      }
      gl.viewport(0, 0, canvas!.width, canvas!.height);
    }

    /** Screen position of a compass direction, or null when it is behind the camera. */
    function project(pitchDeg: number, yawDeg: number) {
      const lat = pitchDeg * DEGREES;
      const lon = yawDeg * DEGREES;
      const world = [
        Math.cos(lat) * Math.cos(lon),
        Math.sin(lat),
        Math.cos(lat) * Math.sin(lon),
      ] as const;

      // Undo the camera rotation the shader applies, in reverse order.
      const cy = Math.cos(-view.yaw);
      const sy = Math.sin(-view.yaw);
      const yawed = [world[0] * cy + world[2] * sy, world[1], -world[0] * sy + world[2] * cy];

      const cp = Math.cos(-view.pitch);
      const sp = Math.sin(-view.pitch);
      const cam = [yawed[0], yawed[1] * cp - yawed[2] * sp, yawed[1] * sp + yawed[2] * cp];

      if (cam[2] >= -0.001) return null;

      const halfFovTan = Math.tan(view.fov / 2);
      const aspect = Math.max(canvas!.clientWidth, 1) / Math.max(canvas!.clientHeight, 1);
      const x = (cam[0] / -cam[2] / (halfFovTan * aspect) + 1) / 2;
      const y = (1 - cam[1] / -cam[2] / halfFovTan) / 2;

      if (x < -0.2 || x > 1.2 || y < -0.2 || y > 1.2) return null;
      return { x, y };
    }

    function positionMarkers() {
      for (const hotspot of hotspotsRef.current) {
        const marker = markersRef.current.get(hotspot.id);
        if (!marker) continue;

        const point = project(hotspot.pitch, hotspot.yaw);
        if (!point) {
          marker.style.visibility = "hidden";
          continue;
        }

        marker.style.visibility = "visible";
        marker.style.left = `${point.x * 100}%`;
        marker.style.top = `${point.y * 100}%`;
      }
    }

    function draw() {
      if (disposed || !gl) return;
      resize();
      if (drifting) view.yaw -= 0.0006;
      gl.uniform2f(uYawPitch, view.yaw, view.pitch);
      gl.uniform1f(uHalfFovTan, Math.tan(view.fov / 2));
      gl.uniform1f(uAspect, Math.max(canvas!.width, 1) / Math.max(canvas!.height, 1));
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      positionMarkers();
      frame = requestAnimationFrame(draw);
    }

    frame = requestAnimationFrame(draw);

    // ── Interaction ──────────────────────────────────────────────
    const pointers = new Map<number, { x: number; y: number }>();
    let pinchDistance = 0;
    let dragDistance = 0;

    function onPointerDown(event: PointerEvent) {
      drifting = false;
      dragDistance = 0;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      canvas!.setPointerCapture(event.pointerId);
      if (pointers.size === 2) pinchDistance = spread(pointers);
    }

    function onPointerMove(event: PointerEvent) {
      const previous = pointers.get(event.pointerId);
      if (!previous) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointers.size === 2) {
        const distance = spread(pointers);
        if (pinchDistance > 0 && distance > 0) {
          view.fov = clamp(view.fov * (pinchDistance / distance), MIN_FOV, MAX_FOV);
        }
        pinchDistance = distance;
        return;
      }

      const dx = event.clientX - previous.x;
      const dy = event.clientY - previous.y;
      dragDistance += Math.abs(dx) + Math.abs(dy);

      // Dragging a pixel should move the scene by the angle that pixel covers,
      // so the image keeps tracking the finger at any zoom level.
      const perPixel = view.fov / Math.max(canvas!.clientHeight, 1);
      view.yaw += dx * perPixel;
      view.pitch = clamp(view.pitch + dy * perPixel, -PITCH_LIMIT, PITCH_LIMIT);
    }

    function onPointerUp(event: PointerEvent) {
      pointers.delete(event.pointerId);
      if (pointers.size < 2) pinchDistance = 0;
    }

    /** Turns a click back into the compass direction it landed on. */
    function onClick(event: MouseEvent) {
      const pick = pickRef.current;
      // A click that ended a drag was aiming the camera, not placing a marker.
      if (!pick || dragDistance > 6) return;

      const bounds = canvas!.getBoundingClientRect();
      const sx = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      const sy = 1 - ((event.clientY - bounds.top) / bounds.height) * 2;

      const halfFovTan = Math.tan(view.fov / 2);
      const aspect = Math.max(bounds.width, 1) / Math.max(bounds.height, 1);
      let ray = normalize([sx * halfFovTan * aspect, sy * halfFovTan, -1]);

      const cp = Math.cos(view.pitch);
      const sp = Math.sin(view.pitch);
      ray = [ray[0], ray[1] * cp - ray[2] * sp, ray[1] * sp + ray[2] * cp];

      const cy = Math.cos(view.yaw);
      const sy2 = Math.sin(view.yaw);
      ray = [ray[0] * cy + ray[2] * sy2, ray[1], -ray[0] * sy2 + ray[2] * cy];

      pick({
        pitch: Math.asin(clamp(ray[1], -1, 1)) / DEGREES,
        yaw: Math.atan2(ray[2], ray[0]) / DEGREES,
      });
    }

    function onWheel(event: WheelEvent) {
      event.preventDefault();
      drifting = false;
      view.fov = clamp(view.fov * (event.deltaY > 0 ? 1.08 : 0.92), MIN_FOV, MAX_FOV);
    }

    function onKeyDown(event: KeyboardEvent) {
      const step = view.fov / 12;
      // Arrow keys point where the visitor wants to look, which is the
      // opposite sign to a drag: the keys move the camera, a drag moves the scene.
      if (event.key === "ArrowLeft") view.yaw += step;
      else if (event.key === "ArrowRight") view.yaw -= step;
      else if (event.key === "ArrowUp") view.pitch = clamp(view.pitch + step, -PITCH_LIMIT, PITCH_LIMIT);
      else if (event.key === "ArrowDown") view.pitch = clamp(view.pitch - step, -PITCH_LIMIT, PITCH_LIMIT);
      else return;

      event.preventDefault();
      drifting = false;
    }

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("keydown", onKeyDown);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      image.onload = null;
      image.onerror = null;
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("keydown", onKeyDown);
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [src, width, height, autoRotate]);

  if (unsupported) {
    // Without WebGL there is no projection to do, but the panorama is still a
    // picture of the showroom — flat beats nothing.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt ?? "Showroom panorama"} className={cn(styles.flat, className)} />;
  }

  return (
    <div className={cn(styles.stage, className)}>
      <canvas
        ref={canvasRef}
        className={cn(styles.canvas, onPick && styles.picking)}
        tabIndex={0}
        role="img"
        aria-label={alt ?? "Interactive 360 degree view of the showroom"}
      />

      {hotspots.map((hotspot) => (
        <button
          key={hotspot.id}
          type="button"
          ref={(element) => {
            if (element) markersRef.current.set(hotspot.id, element);
            else markersRef.current.delete(hotspot.id);
          }}
          className={styles.hotspot}
          style={{ visibility: "hidden" }}
          onClick={() => onHotspotActivate?.(hotspot.id)}
          disabled={!onHotspotActivate}
        >
          <span className={styles.hotspotRing} aria-hidden="true" />
          <span className={styles.hotspotLabel}>{hotspot.label ?? "Go here"}</span>
        </button>
      ))}

      {status === "loading" && <p className={styles.overlay}>Loading 360° view…</p>}
      {status === "error" && <p className={styles.overlay}>That panorama could not be loaded.</p>}
      {status === "ready" && (
        <p className={styles.hint}>
          {onPick ? "Click where the hotspot should go" : "Drag to look around · scroll to zoom"}
        </p>
      )}
    </div>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalize([x, y, z]: number[]): number[] {
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length];
}

function spread(pointers: Map<number, { x: number; y: number }>): number {
  const [a, b] = [...pointers.values()];
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Resamples the panorama to a power-of-two width the GPU will accept.
 *
 * Two constraints meet here: WebGL 1 only allows REPEAT wrapping — which is
 * what hides the 360° seam — on power-of-two textures, and every GPU has a
 * hard size ceiling that a 15K panorama would otherwise blow past.
 */
function toTextureSource(image: HTMLImageElement, maxTextureSize: number): TexImageSource {
  const ceiling = Math.min(maxTextureSize, 8192);
  const width = Math.min(2 ** Math.floor(Math.log2(image.naturalWidth)), ceiling);
  // Both dimensions have to be powers of two, so a cropped panorama is squeezed
  // into a 2:1 texture here. That costs nothing: the shader addresses the image
  // by normalised height and gets its real vertical arc from uVerticalArc, so
  // where each row sits on the sphere is unchanged.
  const height = width / 2;

  if (width === image.naturalWidth && height === image.naturalHeight) return image;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")?.drawImage(image, 0, 0, width, height);
  return canvas;
}

function buildProgram(gl: WebGLRenderingContext): WebGLProgram | null {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vertex || !fragment) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("PanoramaViewer link failed:", gl.getProgramInfoLog(program));
    return null;
  }

  return program;
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("PanoramaViewer shader failed:", gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}
