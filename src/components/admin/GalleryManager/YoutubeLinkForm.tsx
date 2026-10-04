"use client";

import { useActionState } from "react";
import { addYoutubeLinkAction, type YoutubeLinkState } from "@/app/actions/gallery";
import { SubmitButton } from "@/components/common/SubmitButton";
import styles from "./GalleryManager.module.css";

const initialState: YoutubeLinkState | null = null;

export function YoutubeLinkForm() {
  const [state, formAction] = useActionState(addYoutubeLinkAction, initialState);

  return (
    // Keyed on each success so the fields clear once the link is saved.
    <form
      key={state?.success ? state.completedAt : "idle"}
      action={formAction}
      className={styles.form}
    >
      <label className={styles.field}>
        <span className={styles.label}>YouTube link</span>
        <input
          name="youtube_url"
          type="url"
          required
          placeholder="https://www.youtube.com/watch?v=…"
          className={styles.input}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Title (optional)</span>
        <input name="title" type="text" maxLength={120} className={styles.input} />
      </label>

      <p className={styles.hint}>
        The video&apos;s thumbnail appears in the gallery and opens it on YouTube.
      </p>

      {state?.success && (
        <p className={`${styles.feedback} ${styles.success}`}>Added to the gallery.</p>
      )}
      {state?.error && <p className={`${styles.feedback} ${styles.error}`}>{state.error}</p>}

      <SubmitButton label="Add Link" />
    </form>
  );
}
