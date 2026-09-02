"use client";

import { useActionState, type MouseEvent } from "react";
import {
  bookAppointmentAction,
  bookTestDriveAction,
  type AppointmentActionState,
} from "@/app/actions/appointment";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";
import { BOOKINGS, type BookingKind } from "@/lib/bookings";
import { SITE } from "@/data/site";
import styles from "./AppointmentForm.module.css";

const initialState: AppointmentActionState | null = null;

const ACTIONS = {
  appointment: bookAppointmentAction,
  test_drive: bookTestDriveAction,
} as const;

/**
 * Opens a date or time field's native picker from a click anywhere on it.
 *
 * Left alone, most browsers only open it from the small icon at the right
 * edge, so clicking the field looks like nothing happened. `showPicker` is
 * missing on older browsers and throws when the browser declines it, and in
 * both cases the field is still typeable — so failure here is silent by design.
 */
function openPicker(event: MouseEvent<HTMLInputElement>) {
  const input = event.currentTarget;
  if (typeof input.showPicker !== "function") return;

  try {
    input.showPicker();
  } catch {
    // Declined by the browser; typing into the field still works.
  }
}

/**
 * The public booking form, shared by appointments and test drives.
 *
 * Only the wording and the server action differ between the two, so `kind`
 * carries both rather than the page owning a second copy of the form.
 */
export function AppointmentForm({ kind = "appointment" }: { kind?: BookingKind }) {
  const [state, formAction, isPending] = useActionState(ACTIONS[kind], initialState);
  const { title, noun } = BOOKINGS[kind];

  // Nobody books a slot in the past — the browser enforces it for us.
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className={styles.form}>
      <h3 className={styles.heading}>Request a {kind === "appointment" ? "Meeting" : title}</h3>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="appointment-name">
            Name <span className={styles.required}>*</span>
          </label>
          <input
            id="appointment-name"
            name="name"
            type="text"
            required
            className={styles.input}
            placeholder="Your full name"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="appointment-email">
            Email <span className={styles.required}>*</span>
          </label>
          <input
            id="appointment-email"
            name="email"
            type="email"
            required
            className={styles.input}
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="appointment-phone">
            Phone
          </label>
          <input
            id="appointment-phone"
            name="phone"
            type="tel"
            className={styles.input}
            placeholder={SITE.phoneDisplay}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="appointment-date">
            Preferred Date <span className={styles.required}>*</span>
          </label>
          <input
            id="appointment-date"
            name="preferred_date"
            type="date"
            required
            min={today}
            className={styles.input}
            onClick={openPicker}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="appointment-time">
            Preferred Time <span className={styles.required}>*</span>
          </label>
          <input
            id="appointment-time"
            name="preferred_time"
            type="time"
            required
            className={styles.input}
            onClick={openPicker}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="appointment-message">
          Anything We Should Know?
        </label>
        <textarea
          id="appointment-message"
          name="message"
          className={styles.textarea}
          placeholder={
            kind === "test_drive"
              ? "Which vehicle would you like to drive?"
              : "Which vehicle would you like to see?"
          }
        />
      </div>

      {state?.success && (
        <p className={`${styles.feedback} ${styles.success}`}>
          Thank you — your {noun} request is in. We&apos;ll email you to confirm the time.
        </p>
      )}
      {state?.error && <p className={`${styles.feedback} ${styles.error}`}>{state.error}</p>}

      <Button type="submit" disabled={isPending} fullWidth>
        {isPending ? <Spinner /> : `Book ${title}`}
      </Button>
    </form>
  );
}
