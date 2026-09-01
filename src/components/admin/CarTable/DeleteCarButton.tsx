"use client";

import { useTransition } from "react";
import { deleteCarAction } from "@/app/actions/admin";

export function DeleteCarButton({ carId }: { carId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm("Delete this vehicle? This cannot be undone.")) return;
    startTransition(() => {
      deleteCarAction(carId);
    });
  }

  return (
    <button type="button" className="admin-action admin-action-danger" onClick={handleClick} disabled={isPending}>
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
