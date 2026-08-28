"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { CarImage } from "@/types/car";
import styles from "./CarGallery.module.css";

export function CarGallery({ images, carName }: { images: CarImage[]; carName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  return (
    <div className={styles.gallery}>
      <div className={styles.mainImage}>
        {active ? (
          <Image
            src={active.url}
            alt={active.alt ?? carName}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className={styles.image}
            priority
          />
        ) : (
          <div className={styles.placeholder}>Image Coming Soon</div>
        )}
      </div>

      {images.length > 1 && (
        <div className={styles.thumbs}>
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              className={cn(styles.thumb, index === activeIndex && styles.thumbActive)}
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image.url}
                alt={image.alt ?? `${carName} ${index + 1}`}
                fill
                sizes="96px"
                className={styles.thumbImage}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
