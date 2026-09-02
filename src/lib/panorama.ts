/**
 * Format rules for the showroom 360° tour panoramas.
 *
 * A 360° view is not just "an image": the viewer wraps it around a sphere, so
 * it has to be an *equirectangular* projection — one frame covering a full 360°
 * horizontally. Feed it a normal photo and you get a smeared, unreadable mess
 * rather than an obvious error, so the shape is checked before anything is
 * stored.
 *
 * These constants are shared by the browser (instant feedback while picking)
 * and the server action (the authoritative check — a browser check alone is
 * only a convenience, never a guarantee).
 */

export const PANORAMA_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const PANORAMA_EXTENSIONS = ".jpg,.jpeg,.png,.webp";

/**
 * A full sphere is exactly 2:1, but real 360 cameras and stitchers routinely
 * crop the poles and ship something a little wider — vipmotors.ae's own tour
 * runs at 2.15:1. Anything in this band is a genuine panorama, and the viewer
 * derives the true vertical coverage from the ratio (see `verticalArcRadians`)
 * instead of stretching it to fit.
 */
export const PANORAMA_MIN_RATIO = 1.9;
export const PANORAMA_MAX_RATIO = 2.4;

/** Below this the panorama looks soft, because each frame only shows a slice of it. */
export const PANORAMA_MIN_WIDTH = 2048;

/** Server Actions are capped at 25 MB in next.config.ts; stay well inside it. */
export const PANORAMA_MAX_BYTES = 20 * 1024 * 1024;

export const PANORAMA_MAX_MB = Math.round(PANORAMA_MAX_BYTES / (1024 * 1024));

export interface PanoramaDimensions {
  width: number;
  height: number;
}

/**
 * How much of the vertical sphere the image actually covers, in radians.
 *
 * A 2:1 image spans the full 180°. A wider one was cropped at the poles, so
 * mapping it as if it were 180° would stretch everything vertically — which is
 * exactly the distortion vipmotors.ae ships. Deriving the arc from the ratio
 * keeps the room's proportions honest and leaves the small polar gaps to be
 * filled by the edge pixels.
 */
export function verticalArcRadians({ width, height }: PanoramaDimensions): number {
  return (2 * Math.PI * height) / width;
}

/**
 * Returns a human-readable reason the file is unusable, or null if it passes.
 * Both callers show this string verbatim, so it says what to do next rather
 * than just what went wrong.
 */
export function validatePanorama(
  file: { type: string; size: number },
  dimensions: PanoramaDimensions | null
): string | null {
  if (!(PANORAMA_MIME_TYPES as readonly string[]).includes(file.type)) {
    return "That file type will not work. Upload a JPG, PNG or WebP.";
  }

  if (file.size > PANORAMA_MAX_BYTES) {
    return `That file is ${(file.size / (1024 * 1024)).toFixed(1)} MB. The limit is ${PANORAMA_MAX_MB} MB — export it at a lower quality and try again.`;
  }

  if (!dimensions) {
    return "That image could not be read. Re-export it as a JPG and try again.";
  }

  const { width, height } = dimensions;
  const ratio = width / height;

  if (ratio < PANORAMA_MIN_RATIO || ratio > PANORAMA_MAX_RATIO) {
    return `A 360° panorama is about twice as wide as it is tall. This one is ${width}×${height}, a ratio of ${ratio.toFixed(2)}:1, so it is not a panorama. Use your camera's panorama or photo-sphere mode — an ordinary photo will not work here.`;
  }

  if (width < PANORAMA_MIN_WIDTH) {
    return `At ${width}px wide this will look blurry once it wraps around the viewer. Use an image at least ${PANORAMA_MIN_WIDTH}px wide (4096px or more is ideal).`;
  }

  return null;
}
