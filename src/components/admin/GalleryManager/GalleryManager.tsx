import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { deleteImageAction } from "@/app/actions/admin";
import { deleteGalleryItemAction } from "@/app/actions/gallery";
import { TileDeleteButton } from "@/components/admin/TileDeleteButton";
import { Badge } from "@/components/common/Badge";
import type { InventoryPhoto } from "@/lib/services/admin.service";
import { carDisplayName } from "@/lib/utils";
import type { GalleryItem } from "@/types/gallery";
import { GalleryUploadForm } from "./GalleryUploadForm";
import { YoutubeLinkForm } from "./YoutubeLinkForm";
import styles from "./GalleryManager.module.css";

const KIND_LABEL: Record<GalleryItem["kind"], string> = {
  image: "Photo",
  video: "Video",
  youtube: "YouTube",
};

interface GalleryManagerProps {
  items: GalleryItem[];
  inventoryPhotos: InventoryPhoto[];
}

export function GalleryManager({ items, inventoryPhotos }: GalleryManagerProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.panels}>
        <section className={styles.panel}>
          <h2 className={styles.panelHeading}>Upload photos &amp; videos</h2>
          <GalleryUploadForm />
        </section>

        <section className={styles.panel}>
          <h2 className={styles.panelHeading}>Add a YouTube video</h2>
          <YoutubeLinkForm />
        </section>
      </div>

      <section className={styles.panel}>
        <h2 className={styles.panelHeading}>Gallery uploads ({items.length})</h2>

        {items.length === 0 ? (
          <p className={styles.empty}>Nothing here yet — upload something above.</p>
        ) : (
          <div className={styles.grid}>
            {items.map((item) => {
              const thumb = item.kind === "image" ? item.url : item.thumbnail_url;

              return (
                <div key={item.id} className={styles.card}>
                  <div className={styles.media}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.thumb}
                    >
                      {thumb ? (
                        <Image src={thumb} alt={item.title ?? ""} fill sizes="180px" />
                      ) : (
                        <video src={item.url} muted preload="metadata" className={styles.video} />
                      )}
                      {item.kind !== "image" && (
                        <span className={styles.playIcon} aria-hidden="true">
                          <Play size={20} />
                        </span>
                      )}
                      <Badge className={styles.kind}>{KIND_LABEL[item.kind]}</Badge>
                    </a>
                    <TileDeleteButton
                      title={`Delete this ${KIND_LABEL[item.kind].toLowerCase()}?`}
                      message={
                        item.kind === "youtube"
                          ? "It is removed from the gallery. The video stays on YouTube."
                          : undefined
                      }
                      onConfirm={deleteGalleryItemAction.bind(null, item.id)}
                    />
                  </div>
                  {item.title && <p className={styles.title}>{item.title}</p>}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <div>
          <h2 className={styles.panelHeading}>Inventory photos ({inventoryPhotos.length})</h2>
          <p className={styles.hint}>
            Photos attached to vehicles also appear in the public gallery. Add them from a
            vehicle&apos;s edit page.
          </p>
        </div>

        {inventoryPhotos.length === 0 ? (
          <p className={styles.empty}>No vehicle photos yet.</p>
        ) : (
          <div className={styles.grid}>
            {inventoryPhotos.map((photo) => (
              <div key={photo.id} className={styles.card}>
                <div className={styles.media}>
                  <div className={styles.thumb}>
                    <Image src={photo.url} alt="" fill sizes="180px" />
                    {photo.is_cover && (
                      <Badge variant="accent" className={styles.kind}>
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
                {photo.car && (
                  <Link href={`/admin/cars/${photo.car.id}`} className={styles.title}>
                    {carDisplayName(photo.car)}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
