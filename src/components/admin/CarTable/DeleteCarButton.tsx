"use client";

import { useTransition } from "react";
import { deleteCarAction } from "@/app/actions/admin";
import styles from "./CarTable.module.css";

export function DeleteCarButton({ carId }: { carId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("Delete this vehicle? This cannot be undone.")) return;
    startTransition(() => {
      deleteCarAction(carId);
    });
  }

  return (
    <button type="button" className={styles.deleteButton} onClick={handleClick} disabled={isPending}>
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
