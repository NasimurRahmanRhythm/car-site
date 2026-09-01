"use client";

import { ConfirmDeleteButton } from "@/components/common/ConfirmDialog";
import { deleteCarAction } from "@/app/actions/admin";

export function DeleteCarButton({ carId }: { carId: string }) {
  return (
    <ConfirmDeleteButton
      title="Delete this vehicle?"
      message="This cannot be undone."
      onConfirm={() => deleteCarAction(carId)}
    />
  );
}
