import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import type { GalleryEntry } from "@/types/gallery";
import { VideoTile } from "./VideoTile";
import styles from "./GalleryGrid.module.css";

const SIZES = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";

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
        // A clip plays in its own lightbox, so it is never wrapped in a link —
        // tapping play would otherwise navigate away instead.
        if (entry.kind === "video") {
          return (
            <VideoTile
              key={entry.id}
              url={entry.url}
              poster={entry.poster}
              title={entry.caption}
              sizes={SIZES}
            />
          );
        }

        if (entry.kind === "youtube") {
          return (
            <a
              key={entry.id}
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.tile}
              aria-label={entry.caption ? `Watch on YouTube: ${entry.caption}` : "Watch on YouTube"}
            >
              {entry.poster && (
                <Image
                  src={entry.poster}
                  alt=""
                  fill
                  sizes={SIZES}
                  className={styles.image}
                  priority={index < 4}
                />
              )}
              <span className={`${styles.play} ${styles.youtube}`} aria-hidden="true">
                <Play size={22} />
              </span>
              {entry.caption && <span className={styles.caption}>{entry.caption}</span>}
            </a>
          );
        }

        const tile = (
          <>
            <Image
              src={entry.url}
              alt={entry.alt}
              fill
              sizes={SIZES}
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
