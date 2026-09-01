import Image from "next/image";
import { Badge } from "@/components/common/Badge";
import { cn } from "@/lib/utils";
import type { CarImage } from "@/types/car";
import { ImageActions } from "./ImageActions";
import { UploadImagesForm } from "./UploadImagesForm";
import styles from "./ImageUploader.module.css";

interface ImageUploaderProps {
  carId: string;
  images: CarImage[];
  /** Photos that failed while the vehicle was being created, if any. */
  error?: string;
}

export function ImageUploader({ carId, images, error }: ImageUploaderProps) {
  return (
    <div className={styles.wrapper}>
      {error && <p className={`${styles.feedback} ${styles.error}`}>{error}</p>}

      {images.length > 0 && (
        <div className={styles.grid}>
          {images.map((image) => (
            <div key={image.id} className={styles.imageCard}>
              <div className={cn(styles.imageWrap, image.is_cover && styles.coverImage)}>
                {image.is_cover && (
                  <Badge variant="accent" className={styles.coverBadge}>
                    Cover
                  </Badge>
                )}
                <Image
                  src={image.url}
                  alt={image.alt ?? ""}
                  fill
                  sizes="140px"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <ImageActions
                carId={carId}
                imageId={image.id}
                storagePath={image.storage_path}
                isCover={image.is_cover}
              />
            </div>
          ))}
        </div>
      )}

      <UploadImagesForm carId={carId} />
    </div>
  );
}
