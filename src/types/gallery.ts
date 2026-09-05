import type { Database, GalleryMediaType } from "./database";

export type GalleryItem = Database["public"]["Tables"]["gallery_items"]["Row"];

export type { GalleryMediaType };

/**
 * One tile on the public gallery page, whichever pool it came from — a file
 * uploaded straight to the gallery, or a photo already attached to a vehicle.
 */
export interface GalleryEntry {
  id: string;
  kind: GalleryMediaType;
  url: string;
  /** Shown over the tile: a caption, or the vehicle's name. */
  caption: string | null;
  alt: string;
  /** Set when the tile belongs to a car, so the tile can link to it. */
  href: string | null;
}
