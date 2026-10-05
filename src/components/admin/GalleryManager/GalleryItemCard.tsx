"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/common/ConfirmDialog";
import { Badge } from "@/components/common/Badge";
import { deleteGalleryItemAction, updateGalleryCaptionAction } from "@/app/actions/gallery";
import type { GalleryItem } from "@/types/gallery";
import styles from "./GalleryManager.module.css";

const KIND_LABEL: Record<GalleryItem["kind"], string> = {
  image: "Photo",
  video: "Video",
  youtube: "YouTube",
};

export function GalleryItemCard({ item }: { item: GalleryItem }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <figure className={styles.card}>
      <div className={styles.media}>
        <div className={styles.thumb}>
          {item.kind === "video" ? (
            <video
              src={item.url}
              poster={item.thumbnail_url ?? undefined}
              className={styles.video}
              controls
              preload="metadata"
              playsInline
            />
          ) : item.kind === "youtube" ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mediaLink}
              aria-label={item.title ? `Watch on YouTube: ${item.title}` : "Watch on YouTube"}
            >
              {item.thumbnail_url && (
                <Image src={item.thumbnail_url} alt="" fill sizes="200px" />
              )}
              <span className={styles.playIcon} aria-hidden="true">
                <Play size={20} />
              </span>
            </a>
          ) : (
            <Image src={item.url} alt={item.title ?? ""} fill sizes="200px" />
          )}

          {item.kind !== "image" && (
            <Badge variant="accent" className={styles.kindBadge}>
              {KIND_LABEL[item.kind]}
            </Badge>
          )}
        </div>
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
              maxLength={120}
              defaultValue={item.title ?? ""}
              className={styles.input}
              placeholder="Caption"
              autoFocus
            />
            <button type="submit" className="admin-action admin-action-solid">
              Save
            </button>
          </form>
        ) : (
          <span className={styles.captionText}>{item.title ?? "No caption"}</span>
        )}
      </figcaption>

      <div className={styles.cardActions}>
        {!isEditing && (
          <button type="button" className="admin-action" onClick={() => setIsEditing(true)}>
            {item.title ? "Edit caption" : "Add caption"}
          </button>
        )}
        <ConfirmDeleteButton
          label="Remove"
          title={`Remove this ${KIND_LABEL[item.kind].toLowerCase()} from the gallery?`}
          message={
            item.kind === "youtube"
              ? "It is removed from the gallery. The video stays on YouTube."
              : "The file is deleted from storage. This cannot be undone."
          }
          onConfirm={() => deleteGalleryItemAction(item.id)}
        />
      </div>
    </figure>
  );
}
