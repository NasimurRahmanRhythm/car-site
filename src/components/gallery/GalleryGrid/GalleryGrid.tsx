import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { carDisplayName } from "@/lib/utils";
import type { GalleryImage } from "@/lib/services/car.service";
import type { GalleryItem } from "@/types/gallery";
import { VideoTile } from "./VideoTile";
import styles from "./GalleryGrid.module.css";

const SIZES = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";

interface GalleryGridProps {
  /** Photos, videos and YouTube links added on the admin Gallery page. */
  items?: GalleryItem[];
  /** Photos attached to vehicles in the collection. */
  images: GalleryImage[];
}

function MediaTile({ item, priority }: { item: GalleryItem; priority: boolean }) {
  if (item.kind === "video") {
    return (
      <VideoTile url={item.url} poster={item.thumbnail_url} title={item.title} sizes={SIZES} />
    );
  }

  if (item.kind === "youtube") {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.tile}
        aria-label={item.title ? `Watch on YouTube: ${item.title}` : "Watch on YouTube"}
      >
        {item.thumbnail_url && (
          <Image
            src={item.thumbnail_url}
            alt=""
            fill
            sizes={SIZES}
            className={styles.image}
            priority={priority}
          />
        )}
        <span className={`${styles.play} ${styles.youtube}`} aria-hidden="true">
          <Play size={22} />
        </span>
        {item.title && <span className={styles.caption}>{item.title}</span>}
      </a>
    );
  }

  return (
    <div className={styles.tile}>
      <Image
        src={item.url}
        alt={item.title ?? "Showroom photograph"}
        fill
        sizes={SIZES}
        className={styles.image}
        priority={priority}
      />
      {item.title && <span className={styles.caption}>{item.title}</span>}
    </div>
  );
}

export function GalleryGrid({ items = [], images }: GalleryGridProps) {
  if (items.length === 0 && images.length === 0) {
    return (
      <p className={styles.empty}>
        No photos yet — they arrive as vehicles are added to the collection.
      </p>
    );
  }

  return (
    <div className={styles.grid}>
      {items.map((item, index) => (
        <MediaTile key={item.id} item={item} priority={index < 4} />
      ))}

      {images.map((image, index) => {
        const name = image.car ? carDisplayName(image.car) : null;

        const tile = (
          <>
            <Image
              src={image.url}
              alt={image.alt ?? name ?? "Vehicle photograph"}
              fill
              sizes={SIZES}
              className={styles.image}
              priority={items.length + index < 4}
            />
            {name && <span className={styles.caption}>{name}</span>}
          </>
        );

        return image.car ? (
          <Link key={image.id} href={`/inventory/${image.car.slug}`} className={styles.tile}>
            {tile}
          </Link>
        ) : (
          <div key={image.id} className={styles.tile}>
            {tile}
          </div>
        );
      })}
    </div>
  );
}
