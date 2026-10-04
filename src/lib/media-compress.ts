/**
 * Browser-side media compression, run before anything is uploaded — so a
 * phone photo or a raw clip is shrunk on the admin's machine instead of being
 * pushed through the server at full size. Only import this from client code.
 */

export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

/** Longest edge a stored photo keeps. Plenty for a full-width gallery tile. */
const IMAGE_MAX_EDGE = 2400;
const IMAGE_QUALITY = 0.82;

/** Longest edge of a compressed video — 720p for landscape clips. */
const VIDEO_MAX_EDGE = 1280;
const VIDEO_MAX_FPS = 30;

async function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

function scaled(width: number, height: number, maxEdge: number) {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  // Video encoders want even dimensions.
  const even = (n: number) => Math.max(2, Math.round((n * scale) / 2) * 2);
  return { width: even(width), height: even(height) };
}

function renamed(name: string, extension: string) {
  const base = name.replace(/\.[^.]+$/, "") || "upload";
  return `${base}.${extension}`;
}

/**
 * Downscales and re-encodes a photo as WebP (JPEG where the browser cannot
 * encode WebP). GIFs and SVGs are passed through untouched — a canvas would
 * flatten the animation or rasterise the vector. If the result is not actually
 * smaller, the original is kept.
 */
export async function compressImage(file: File): Promise<File> {
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // A format this browser can't decode (e.g. HEIC outside Safari) — upload as is.
    return file;
  }

  const { width, height } = scaled(bitmap.width, bitmap.height, IMAGE_MAX_EDGE);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let blob = await canvasToBlob(canvas, "image/webp", IMAGE_QUALITY);
  // Safari silently falls back to PNG for an unsupported type.
  if (!blob || blob.type !== "image/webp") {
    blob = await canvasToBlob(canvas, "image/jpeg", IMAGE_QUALITY);
  }

  if (!blob || blob.size >= file.size) return file;

  const extension = blob.type === "image/webp" ? "webp" : "jpg";
  return new File([blob], renamed(file.name, extension), { type: blob.type });
}

/**
 * Re-encodes a video to H.264 MP4 at no more than 720p / 30 fps with
 * WebCodecs, which is hardware-accelerated and far faster than a WASM ffmpeg.
 * Falls back to the original file when the browser can't transcode it, or
 * when the result would not be smaller.
 */
export async function compressVideo(
  file: File,
  onProgress?: (fraction: number) => void
): Promise<{ file: File; compressed: boolean }> {
  if (typeof VideoEncoder === "undefined") return { file, compressed: false };

  // Loaded on demand: the library is only needed once someone picks a video.
  const {
    ALL_FORMATS,
    BlobSource,
    BufferTarget,
    Conversion,
    Input,
    Mp4OutputFormat,
    Output,
    Quality,
  } = await import("mediabunny");

  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  const output = new Output({
    format: new Mp4OutputFormat({ fastStart: "in-memory" }),
    target: new BufferTarget(),
  });

  try {
    const conversion = await Conversion.init({
      input,
      output,
      tracks: "primary",
      video: (track) => ({
        ...scaled(track.displayWidth, track.displayHeight, VIDEO_MAX_EDGE),
        fit: "contain",
        codec: "avc",
        quality: new Quality("medium"),
        frameRate: VIDEO_MAX_FPS,
        forceTranscode: true,
      }),
      audio: { codec: "aac", quality: new Quality("medium") },
      showWarnings: false,
    });

    if (!conversion.isValid) return { file, compressed: false };

    if (onProgress) conversion.onProgress = (progress) => onProgress(progress);
    await conversion.execute();

    const buffer = output.target.buffer;
    if (!buffer || buffer.byteLength >= file.size) return { file, compressed: false };

    return {
      file: new File([buffer], renamed(file.name, "mp4"), { type: "video/mp4" }),
      compressed: true,
    };
  } catch (error) {
    console.warn("Video compression failed, uploading the original:", error);
    return { file, compressed: false };
  } finally {
    input.dispose();
  }
}

/**
 * Grabs a frame about a second in as a JPEG, used as the video's thumbnail in
 * the gallery grid. Returns null if the browser can't decode the clip.
 */
export async function captureVideoPoster(file: File): Promise<File | null> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error("decode failed"));
    });

    video.currentTime = Math.min(1, (video.duration || 0) / 2);
    await new Promise<void>((resolve, reject) => {
      video.onseeked = () => resolve();
      video.onerror = () => reject(new Error("seek failed"));
    });

    const { width, height } = scaled(video.videoWidth, video.videoHeight, 1280);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")?.drawImage(video, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, "image/jpeg", 0.8);
    return blob ? new File([blob], "poster.jpg", { type: "image/jpeg" }) : null;
  } catch {
    return null;
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(url);
  }
}

/** A safe storage extension for a file — from its name, else its MIME type. */
export function fileExtension(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName;
  return file.type.split("/")[1]?.replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
}
