import type { Metadata } from "next";
import { GalleryManager } from "@/components/admin/GalleryManager";
import { getGalleryItems } from "@/lib/services/gallery.service";
import { getGalleryImages } from "@/lib/services/car.service";
import styles from "../admin.module.css";

export const metadata: Metadata = {
  title: "Manage Gallery",
};

export default async function AdminGalleryPage() {
  const [items, carImages] = await Promise.all([getGalleryItems(), getGalleryImages(60)]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Gallery</h1>
        <span className={styles.headerNote}>
          {items.length + carImages.length} tile
          {items.length + carImages.length === 1 ? "" : "s"} on the gallery page
        </span>
      </div>

      <GalleryManager items={items} carImages={carImages} />
    </div>
  );
}
