"use client";

import { useTransition } from "react";
import { setCoverImageAction } from "@/app/actions/admin";
import styles from "./ImageUploader.module.css";

interface ImageActionsProps {
  carId: string;
  imageId: string;
  isCover: boolean;
}

export function ImageActions({ carId, imageId, isCover }: ImageActionsProps) {
  const [isPending, startTransition] = useTransition();

  if (isCover) return null;

  return (
    <div className={styles.cardActions}>
      <button
        type="button"
        className="admin-action"
        disabled={isPending}
        onClick={() => startTransition(() => setCoverImageAction(carId, imageId))}
      >
        Set Cover
      </button>
    </div>
  );
}
