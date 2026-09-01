"use client";

import { useTransition } from "react";
import { deleteImageAction, setCoverImageAction } from "@/app/actions/admin";
import { ConfirmDeleteButton } from "@/components/common/ConfirmDialog";
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
          className="admin-action"
          disabled={isPending}
          onClick={() => startTransition(() => setCoverImageAction(carId, imageId))}
        >
          Set Cover
        </button>
      )}
      <ConfirmDeleteButton
        label="Remove"
        title="Remove this image?"
        message="This cannot be undone."
        onConfirm={() => deleteImageAction(carId, imageId, storagePath)}
      />
    </div>
  );
}
