"use client";

import { useActionState } from "react";
import { addSceneAction, type SceneUploadState } from "@/app/actions/admin";
import { PanoramaPicker } from "./PanoramaPicker";
import styles from "./Showroom360Manager.module.css";

const initialState: SceneUploadState | null = null;

export function Showroom360Form() {
  const [state, formAction] = useActionState(addSceneAction, initialState);

  // A new key after a successful publish remounts the picker, which is how the
  // staged file, its preview and the file input all get cleared at once —
  // the same trick the car photo uploader uses.
  const pickerKey = state?.success ? state.completedAt : "idle";

  return (
    <form action={formAction} className={styles.form}>
      <PanoramaPicker key={pickerKey} />

      {state?.success && (
        <p className={`${styles.feedback} ${styles.success}`}>
          Scene added. It is live on the 360° View page.
        </p>
      )}
      {state?.error && <p className={`${styles.feedback} ${styles.error}`}>{state.error}</p>}
    </form>
  );
}
