import type { Database, GalleryItemKind } from "./database";

export type { GalleryItemKind };

export type GalleryItem = Database["public"]["Tables"]["gallery_items"]["Row"];

/**
 * One tile on the public gallery page, whichever pool it came from — something
 * added straight to the gallery, or a photo already attached to a vehicle.
 */
export interface GalleryEntry {
  id: string;
  kind: GalleryItemKind;
  url: string;
  /** A poster frame for a video, the thumbnail for a YouTube link. */
  poster: string | null;
  /** Shown over the tile: a caption, or the vehicle's name. */
  caption: string | null;
  alt: string;
  /** Set when the tile belongs to a car, so the tile can link to it. */
  href: string | null;
}
