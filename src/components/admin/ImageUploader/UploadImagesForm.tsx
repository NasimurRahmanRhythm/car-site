"use client";

import { useActionState } from "react";
import { uploadImagesAction, type UploadImagesState } from "@/app/actions/admin";
import { FileDropzone } from "@/components/common/FileDropzone";
import { SubmitButton } from "@/components/common/SubmitButton";
import styles from "./ImageUploader.module.css";

const initialState: UploadImagesState | null = null;

export function UploadImagesForm({ carId }: { carId: string }) {
  const [state, formAction] = useActionState(
    uploadImagesAction.bind(null, carId),
    initialState
  );

  // A new key after a successful run remounts the dropzone, which is how its
  // picked-file list gets cleared once those files are safely uploaded.
  const dropzoneKey = state && state.uploaded > 0 ? state.completedAt : "idle";

  return (
    <form action={formAction} className={styles.uploadForm}>
      <FileDropzone
        key={dropzoneKey}
        id="car-images"
        name="files"
        multiple
        required
        label="Add photos"
        hint="JPG, PNG or WebP. The first upload becomes the cover unless you set another."
      />

      {state && state.uploaded > 0 && (
        <p className={`${styles.feedback} ${styles.success}`}>
          Uploaded {state.uploaded} image{state.uploaded === 1 ? "" : "s"}.
        </p>
      )}
      {state?.error && <p className={`${styles.feedback} ${styles.error}`}>{state.error}</p>}

      <SubmitButton label="Upload Images" />
    </form>
  );
}
