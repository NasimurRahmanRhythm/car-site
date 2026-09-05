"use client";

import { useActionState } from "react";
import { addGalleryItemsAction, type GalleryUploadState } from "@/app/actions/gallery";
import { FileDropzone } from "@/components/common/FileDropzone";
import { SubmitButton } from "@/components/common/SubmitButton";
import styles from "./GalleryManager.module.css";

const initialState: GalleryUploadState | null = null;

export function GalleryUploadForm() {
  const [state, formAction] = useActionState(addGalleryItemsAction, initialState);

  // A new key after a successful run remounts the dropzone, which is how its
  // picked-file list gets cleared once those files are safely uploaded.
  const dropzoneKey = state?.added ? state.completedAt : "idle";

  return (
    <form action={formAction} className={styles.uploadForm} key={dropzoneKey}>
      <FileDropzone
        id="gallery-media"
        name="files"
        multiple
        required
        accepts="media"
        label="Add photos or videos"
        hint="JPG, PNG, WebP or MP4. Large videos may be refused — keep clips under 24 MB."
      />

      <div className={styles.captionField}>
        <label className={styles.label} htmlFor="gallery-caption">
          Caption (optional)
        </label>
        <input
          id="gallery-caption"
          name="caption"
          type="text"
          className={styles.input}
          placeholder="Shown over the tile on hover."
        />
      </div>

      {state?.added ? (
        <p className={`${styles.feedback} ${styles.success}`}>
          Added {state.added} item{state.added === 1 ? "" : "s"} to the gallery.
        </p>
      ) : null}
      {state?.error && <p className={`${styles.feedback} ${styles.error}`}>{state.error}</p>}

      <SubmitButton label="Upload to Gallery" />
    </form>
  );
}
