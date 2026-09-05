import Image from "next/image";
import Link from "next/link";
import type { GalleryItem } from "@/types/gallery";
import type { GalleryImage } from "@/lib/services/car.service";
import { carDisplayName } from "@/lib/utils";
import { GalleryItemCard } from "./GalleryItemCard";
import { GalleryUploadForm } from "./GalleryUploadForm";
import styles from "./GalleryManager.module.css";

interface GalleryManagerProps {
  items: GalleryItem[];
  /** Vehicle photos the gallery page pulls in on its own. */
  carImages: GalleryImage[];
}

/**
 * What the public gallery is made of, in the two pieces it actually has:
 * media uploaded for the gallery, which the admin owns outright, and the
 * vehicle photos it borrows from the inventory, which are managed on the
 * vehicle and shown here only so the page holds no surprises.
 */
export function GalleryManager({ items, carImages }: GalleryManagerProps) {
  return (
    <div className={styles.wrapper}>
      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Add to the gallery</h2>
        <p className={styles.hint}>
          Photos and videos uploaded here open the gallery page, ahead of the vehicle
          photographs. Pick several at once to upload them in one go.
        </p>
        <GalleryUploadForm />
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}>Gallery uploads</h2>
          <span className={styles.meta}>
            {items.length} item{items.length === 1 ? "" : "s"}
          </span>
        </div>

        {items.length === 0 ? (
          <p className={styles.empty}>
            Nothing uploaded yet — the gallery page is showing vehicle photographs only.
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
            {carImages.length} photo{carImages.length === 1 ? "" : "s"}
          </span>
        </div>
        <p className={styles.hint}>
          Every photo attached to a vehicle also appears in the gallery. Remove one from
          its vehicle to take it off this page.
        </p>

        {carImages.length === 0 ? (
          <p className={styles.empty}>No vehicle photographs yet.</p>
        ) : (
          <div className={styles.grid}>
            {carImages.map((image) => {
              const name = image.car ? carDisplayName(image.car) : null;

              return (
                <figure key={image.id} className={styles.card}>
                  <div className={styles.media}>
                    <Image
                      src={image.url}
                      alt={image.alt ?? name ?? ""}
                      fill
                      sizes="200px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <figcaption className={styles.caption}>
                    {image.car ? (
                      <Link
                        href={`/inventory/${image.car.slug}`}
                        className={styles.cardLink}
                        target="_blank"
                      >
                        {name}
                      </Link>
                    ) : (
                      (name ?? "Unattached photo")
                    )}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
