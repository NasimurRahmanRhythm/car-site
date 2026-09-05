import Image from "next/image";
import Link from "next/link";
import type { GalleryEntry } from "@/types/gallery";
import styles from "./GalleryGrid.module.css";

export function GalleryGrid({ entries }: { entries: GalleryEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className={styles.empty}>
        No photos yet — they arrive as vehicles are added to the collection.
      </p>
    );
  }

  return (
    <div className={styles.grid}>
      {entries.map((entry, index) => {
        // A clip needs its own controls, so it is never wrapped in a link —
        // tapping play would otherwise navigate away instead.
        if (entry.kind === "video") {
          return (
            <div key={entry.id} className={styles.tile}>
              <video
                src={entry.url}
                className={styles.video}
                controls
                preload="metadata"
                playsInline
              />
              {entry.caption && <span className={styles.staticCaption}>{entry.caption}</span>}
            </div>
          );
        }

        const tile = (
          <>
            <Image
              src={entry.url}
              alt={entry.alt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={styles.image}
              priority={index < 4}
            />
            {entry.caption && <span className={styles.caption}>{entry.caption}</span>}
          </>
        );

        return entry.href ? (
          <Link key={entry.id} href={entry.href} className={styles.tile}>
            {tile}
          </Link>
        ) : (
          <div key={entry.id} className={styles.tile}>
            {tile}
          </div>
        );
      })}
    </div>
  );
}
