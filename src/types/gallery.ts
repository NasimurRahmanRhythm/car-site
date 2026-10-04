import type { Database, GalleryItemKind } from "./database";

export type { GalleryItemKind };

export type GalleryItem = Database["public"]["Tables"]["gallery_items"]["Row"];
