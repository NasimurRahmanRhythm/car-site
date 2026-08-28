import Image from "next/image";
import { uploadImagesAction } from "@/app/actions/admin";
import { Badge } from "@/components/common/Badge";
import { SubmitButton } from "@/components/common/SubmitButton";
import { cn } from "@/lib/utils";
import type { CarImage } from "@/types/car";
import { ImageActions } from "./ImageActions";
import styles from "./ImageUploader.module.css";

export function ImageUploader({ carId, images }: { carId: string; images: CarImage[] }) {
  const uploadAction = uploadImagesAction.bind(null, carId);

  return (
    <div className={styles.wrapper}>
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

      <form action={uploadAction} className={styles.uploadForm}>
        <input
          type="file"
          name="files"
          accept="image/*"
          multiple
          required
          className={styles.fileInput}
        />
        <SubmitButton label="Upload Images" />
      </form>
    </div>
  );
}
