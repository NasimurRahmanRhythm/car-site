import Image from "next/image";
import Link from "next/link";
import { deleteImageAction } from "@/app/actions/admin";
import { TileDeleteButton } from "@/components/admin/TileDeleteButton";
import { Badge } from "@/components/common/Badge";
import type { InventoryPhoto } from "@/lib/services/admin.service";
import { carDisplayName } from "@/lib/utils";
import type { GalleryItem } from "@/types/gallery";
import { GalleryItemCard } from "./GalleryItemCard";
import { GalleryUploadForm } from "./GalleryUploadForm";
import { YoutubeLinkForm } from "./YoutubeLinkForm";
import styles from "./GalleryManager.module.css";

interface GalleryManagerProps {
  items: GalleryItem[];
  /** Vehicle photos the gallery page pulls in on its own. */
  inventoryPhotos: InventoryPhoto[];
}

/**
 * What the public gallery is made of, in the two pieces it actually has:
 * media added for the gallery, which the admin owns outright, and the vehicle
 * photos it borrows from the inventory, shown here so the page holds no
 * surprises.
 */
export function GalleryManager({ items, inventoryPhotos }: GalleryManagerProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.panels}>
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Upload photos &amp; videos</h2>
          <p className={styles.hint}>
            Photos and videos uploaded here open the gallery page, ahead of the vehicle
            photographs. Pick several at once to upload them in one go.
          </p>
          <GalleryUploadForm />
        </section>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Add a YouTube video</h2>
          <YoutubeLinkForm />
        </section>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}>Gallery uploads</h2>
          <span className={styles.meta}>
            {items.length} item{items.length === 1 ? "" : "s"}
          </span>
        </div>

        {items.length === 0 ? (
          <p className={styles.empty}>
            Nothing added yet — the gallery page is showing vehicle photographs only.
          </p>
        ) : (
          <div className={styles.grid}>
            {items.map((item) => (
              <GalleryItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}>From the inventory</h2>
          <span className={styles.meta}>
            {inventoryPhotos.length} photo{inventoryPhotos.length === 1 ? "" : "s"}
          </span>
        </div>
        <p className={styles.hint}>
          Photos attached to vehicles also appear in the public gallery. Add them from a
          vehicle&apos;s edit page, or delete one here to take it off the vehicle and this page.
        </p>

        {inventoryPhotos.length === 0 ? (
          <p className={styles.empty}>No vehicle photographs yet.</p>
        ) : (
          <div className={styles.grid}>
            {inventoryPhotos.map((photo) => (
              <figure key={photo.id} className={styles.card}>
                <div className={styles.media}>
                  <div className={styles.thumb}>
                    <Image src={photo.url} alt="" fill sizes="200px" />
                    {photo.is_cover && (
                      <Badge variant="accent" className={styles.kindBadge}>
                        Cover
                      </Badge>
                    )}
                  </div>
                  {photo.car && (
                    <TileDeleteButton
                      title="Delete this vehicle photo?"
                      onConfirm={deleteImageAction.bind(null, photo.car.id, photo.id)}
                    />
                  )}
                </div>
                <figcaption className={styles.caption}>
                  {photo.car ? (
                    <Link href={`/admin/cars/${photo.car.id}`} className={styles.cardLink}>
                      <span className={styles.captionText}>{carDisplayName(photo.car)}</span>
                    </Link>
                  ) : (
                    "Unattached photo"
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
