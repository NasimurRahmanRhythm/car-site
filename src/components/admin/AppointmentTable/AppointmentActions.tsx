"use client";

import { useTransition } from "react";
import {
  deleteBookingAction,
  setBookingStatusAction,
} from "@/app/actions/appointment";
import type { BookingKind } from "@/lib/bookings";
import { ConfirmDeleteButton } from "@/components/common/ConfirmDialog";
import type { AppointmentStatus } from "@/types/appointment";
import styles from "./AppointmentTable.module.css";

export function AppointmentActions({
  kind,
  id,
  status,
}: {
  kind: BookingKind;
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
          onClick={() => startTransition(() => setBookingStatusAction(kind, id, "confirmed"))}
        >
          Confirm
        </button>
      )}
      {status !== "cancelled" && (
        <button
          type="button"
          className="admin-action"
          disabled={isPending}
          onClick={() => startTransition(() => setBookingStatusAction(kind, id, "cancelled"))}
        >
          Cancel
        </button>
      )}
      <ConfirmDeleteButton
        title="Delete this request?"
        message="This cannot be undone."
        onConfirm={() => deleteBookingAction(kind, id)}
      />
    </div>
  );
}
