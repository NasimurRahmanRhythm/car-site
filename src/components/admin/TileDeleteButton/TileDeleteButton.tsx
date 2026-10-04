"use client";

import { Trash2 } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/common/ConfirmDialog";
import styles from "./TileDeleteButton.module.css";

interface TileDeleteButtonProps {
  title: string;
  message?: string;
  onConfirm: () => void | Promise<void>;
}

/**
 * A round trash button pinned to the top-right corner of a media tile. The
 * tile needs `position: relative`.
 */
export function TileDeleteButton({
  title,
  message = "The file is deleted from storage too. This cannot be undone.",
  onConfirm,
}: TileDeleteButtonProps) {
  return (
    <ConfirmDeleteButton
      label={<Trash2 size={15} aria-hidden="true" />}
      pendingLabel={<span className={styles.pending} aria-hidden="true" />}
      ariaLabel={title}
      title={title}
      message={message}
      onConfirm={onConfirm}
      className={styles.button}
    />
  );
}
