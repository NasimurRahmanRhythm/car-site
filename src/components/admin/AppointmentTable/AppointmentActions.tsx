"use client";

import { useTransition } from "react";
import {
  deleteAppointmentAction,
  setAppointmentStatusAction,
} from "@/app/actions/appointment";
import { cn } from "@/lib/utils";
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
          className={styles.actionButton}
          disabled={isPending}
          onClick={() => startTransition(() => setAppointmentStatusAction(id, "confirmed"))}
        >
          Confirm
        </button>
      )}
      {status !== "cancelled" && (
        <button
          type="button"
          className={styles.actionButton}
          disabled={isPending}
          onClick={() => startTransition(() => setAppointmentStatusAction(id, "cancelled"))}
        >
          Cancel
        </button>
      )}
      <button
        type="button"
        className={cn(styles.actionButton, styles.deleteButton)}
        disabled={isPending}
        onClick={() => {
          if (!window.confirm("Delete this request? This cannot be undone.")) return;
          startTransition(() => deleteAppointmentAction(id));
        }}
      >
        Delete
      </button>
    </div>
  );
}
