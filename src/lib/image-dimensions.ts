import type { PanoramaDimensions } from "@/lib/panorama";

/**
 * Reads pixel dimensions straight out of an image's header bytes.
 *
 * The browser reports dimensions too, but a Server Action is reachable without
 * the browser, so the aspect-ratio rule has to be enforceable server-side. All
 * three accepted formats declare their size in a fixed spot near the start of
 * the file, so this needs no decoding and no image library — just the first
 * few dozen bytes.
 *
 * Returns null for anything it cannot parse; the caller turns that into a
 * "could not read that image" message rather than trusting it.
 */
export function readImageDimensions(bytes: Uint8Array): PanoramaDimensions | null {
  return readPng(bytes) ?? readWebp(bytes) ?? readJpeg(bytes) ?? null;
}

function readPng(b: Uint8Array): PanoramaDimensions | null {
  // 8-byte signature, then the IHDR chunk whose width/height are the first
  // two big-endian uint32s of its payload.
  if (b.length < 24) return null;
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (!signature.every((byte, i) => b[i] === byte)) return null;

  return { width: be32(b, 16), height: be32(b, 20) };
}

function readWebp(b: Uint8Array): PanoramaDimensions | null {
  if (b.length < 30) return null;
  if (ascii(b, 0, 4) !== "RIFF" || ascii(b, 8, 4) !== "WEBP") return null;

  const format = ascii(b, 12, 4);

  if (format === "VP8 ") {
    // Lossy: a 3-byte frame tag, a fixed sync code, then two 14-bit sizes.
    if (b[23] !== 0x9d || b[24] !== 0x01 || b[25] !== 0x2a) return null;
    return { width: le16(b, 26) & 0x3fff, height: le16(b, 28) & 0x3fff };
  }

  if (format === "VP8L") {
    // Lossless: both sizes packed into one little-endian uint32, stored as
    // size-1 so that 16384 still fits in 14 bits.
    if (b[20] !== 0x2f) return null;
    const packed = le32(b, 21);
    return {
      width: (packed & 0x3fff) + 1,
      height: ((packed >> 14) & 0x3fff) + 1,
    };
  }

  if (format === "VP8X") {
    // Extended: canvas size as two 24-bit little-endian values, also size-1.
    return {
      width: le24(b, 24) + 1,
      height: le24(b, 27) + 1,
    };
  }

  return null;
}

function readJpeg(b: Uint8Array): PanoramaDimensions | null {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null;

  let offset = 2;

  while (offset + 9 < b.length) {
    // Segments are 0xFF followed by a marker byte; padding 0xFFs are legal
    // between them, so walk forward until a real marker appears.
    if (b[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = b[offset + 1];
    if (marker === 0xff) {
      offset += 1;
      continue;
    }

    // Standalone markers carry no length field.
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
      offset += 2;
      continue;
    }

    // A Start Of Frame holds the dimensions. 0xC4, 0xC8 and 0xCC share the
    // range but are Huffman/arithmetic tables, not frames.
    const isStartOfFrame =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;

    if (isStartOfFrame) {
      return { height: be16(b, offset + 5), width: be16(b, offset + 7) };
    }

    const length = be16(b, offset + 2);
    if (length < 2) return null;
    offset += 2 + length;
  }

  return null;
}

function ascii(b: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...b.subarray(start, start + length));
}

function be16(b: Uint8Array, i: number): number {
  return (b[i] << 8) | b[i + 1];
}

function be32(b: Uint8Array, i: number): number {
  return ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0;
}

function le16(b: Uint8Array, i: number): number {
  return b[i] | (b[i + 1] << 8);
}

function le24(b: Uint8Array, i: number): number {
  return b[i] | (b[i + 1] << 8) | (b[i + 2] << 16);
}

function le32(b: Uint8Array, i: number): number {
  return (b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24)) >>> 0;
}
