import type { Metadata } from "next";
import { GalleryManager } from "@/components/admin/GalleryManager";
import { getInventoryPhotosForAdmin } from "@/lib/services/admin.service";
import { getGalleryItems } from "@/lib/services/gallery.service";
import styles from "../admin.module.css";

export const metadata: Metadata = {
  title: "Gallery",
};

export default async function AdminGalleryPage() {
  const [items, inventoryPhotos] = await Promise.all([
    getGalleryItems(),
    getInventoryPhotosForAdmin(),
  ]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Gallery</h1>
        <p className={styles.headerNote}>
          Shown on the public Gallery page, ahead of the vehicle photos.
        </p>
      </div>

      <GalleryManager items={items} inventoryPhotos={inventoryPhotos} />
    </div>
  );
}
