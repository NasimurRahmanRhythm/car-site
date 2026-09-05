"use client";

import Image from "next/image";
import { useState } from "react";
import { ConfirmDeleteButton } from "@/components/common/ConfirmDialog";
import { Badge } from "@/components/common/Badge";
import { deleteGalleryItemAction, updateGalleryCaptionAction } from "@/app/actions/gallery";
import type { GalleryItem } from "@/types/gallery";
import styles from "./GalleryManager.module.css";

export function GalleryItemCard({ item }: { item: GalleryItem }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <figure className={styles.card}>
      <div className={styles.media}>
        {item.media_type === "video" ? (
          <video
            src={item.url}
            className={styles.video}
            controls
            preload="metadata"
            playsInline
          />
        ) : (
          <Image
            src={item.url}
            alt={item.caption ?? ""}
            fill
            sizes="200px"
            style={{ objectFit: "cover" }}
          />
        )}

        {item.media_type === "video" && (
          <Badge variant="accent" className={styles.kindBadge}>
            Video
          </Badge>
        )}
      </div>

      <figcaption className={styles.caption}>
        {isEditing ? (
          <form
            action={async (formData) => {
              await updateGalleryCaptionAction(item.id, formData);
              setIsEditing(false);
            }}
            className={styles.captionForm}
          >
            <input
              name="caption"
              type="text"
              defaultValue={item.caption ?? ""}
              className={styles.input}
              placeholder="Caption"
              autoFocus
            />
            <button type="submit" className="admin-action admin-action-solid">
              Save
            </button>
          </form>
        ) : (
          <span className={styles.captionText}>{item.caption ?? "No caption"}</span>
        )}
      </figcaption>

      <div className={styles.cardActions}>
        {!isEditing && (
          <button type="button" className="admin-action" onClick={() => setIsEditing(true)}>
            {item.caption ? "Edit caption" : "Add caption"}
          </button>
        )}
        <ConfirmDeleteButton
          label="Remove"
          title="Remove from the gallery?"
          message="The file is deleted from storage. This cannot be undone."
          onConfirm={() => deleteGalleryItemAction(item.id)}
        />
      </div>
    </figure>
  );
}
