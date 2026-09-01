"use client";

import { useTransition } from "react";
import {
  deleteAppointmentAction,
  setAppointmentStatusAction,
} from "@/app/actions/appointment";
import { ConfirmDeleteButton } from "@/components/common/ConfirmDialog";
import type { AppointmentStatus } from "@/types/appointment";
import styles from "./AppointmentTable.module.css";

export function AppointmentActions({
  id,
  status,
}: {
  id: string;
  status: AppointmentStatus;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className={styles.actions}>
      {status !== "confirmed" && (
        <button
          type="button"
          className="admin-action admin-action-solid"
          disabled={isPending}
          onClick={() => startTransition(() => setAppointmentStatusAction(id, "confirmed"))}
        >
          Confirm
        </button>
      )}
      {status !== "cancelled" && (
        <button
          type="button"
          className="admin-action"
          disabled={isPending}
          onClick={() => startTransition(() => setAppointmentStatusAction(id, "cancelled"))}
        >
          Cancel
        </button>
      )}
      <ConfirmDeleteButton
        title="Delete this request?"
        message="This cannot be undone."
        onConfirm={() => deleteAppointmentAction(id)}
      />
    </div>
  );
}
