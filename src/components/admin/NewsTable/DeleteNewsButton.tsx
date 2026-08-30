"use client";

import { useTransition } from "react";
import { deleteNewsAction } from "@/app/actions/news";
import styles from "./NewsTable.module.css";

export function DeleteNewsButton({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    startTransition(() => {
      deleteNewsAction(postId);
    });
  }

  return (
    <button type="button" className={styles.deleteButton} onClick={handleClick} disabled={isPending}>
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
