import Image from "next/image";
import Link from "next/link";
import { carDisplayName } from "@/lib/utils";
import type { GalleryImage } from "@/lib/services/car.service";
import styles from "./GalleryGrid.module.css";

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  if (images.length === 0) {
    return (
      <p className={styles.empty}>
        No photos yet — they arrive as vehicles are added to the collection.
      </p>
    );
  }

  return (
    <div className={styles.grid}>
      {images.map((image, index) => {
        const name = image.car ? carDisplayName(image.car) : null;

        const tile = (
          <>
            <Image
              src={image.url}
              alt={image.alt ?? name ?? "Vehicle photograph"}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={styles.image}
              priority={index < 4}
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
