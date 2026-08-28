"use client";

import { useTransition } from "react";
import { deleteImageAction, setCoverImageAction } from "@/app/actions/admin";
import { cn } from "@/lib/utils";
import styles from "./ImageUploader.module.css";

interface ImageActionsProps {
  carId: string;
  imageId: string;
  storagePath: string;
  isCover: boolean;
}

export function ImageActions({ carId, imageId, storagePath, isCover }: ImageActionsProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className={styles.cardActions}>
      {!isCover && (
        <button
          type="button"
          className={styles.actionButton}
          disabled={isPending}
          onClick={() => startTransition(() => setCoverImageAction(carId, imageId))}
        >
          Set Cover
        </button>
      )}
      <button
        type="button"
        className={cn(styles.actionButton, styles.deleteAction)}
        disabled={isPending}
        onClick={() => {
          if (!window.confirm("Remove this image?")) return;
          startTransition(() => deleteImageAction(carId, imageId, storagePath));
        }}
      >
        Remove
      </button>
    </div>
  );
}
