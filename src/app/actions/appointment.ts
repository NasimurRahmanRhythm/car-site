"use server";

import { revalidatePath } from "next/cache";
import {
  submitBooking,
  deleteBooking,
  getPendingBookingCount,
  setBookingStatus,
} from "@/lib/services/booking.service";
import { BOOKINGS, type BookingKind } from "@/lib/bookings";
import type { AppointmentStatus } from "@/types/appointment";

export interface AppointmentActionState {
  success: boolean;
  error?: string;
}

/**
 * Name, email, date and time are all required.
 *
 * The form marks them `required` too, but that only stops an honest browser —
 * this is the check that actually holds, and it is also what keeps a request
 * without a slot from reaching the admin table with nothing to confirm.
 */
function parseBooking(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const preferredDate = String(formData.get("preferred_date") ?? "").trim();
  const preferredTime = String(formData.get("preferred_time") ?? "").trim();

  const missing = [
    !name && "name",
    !email && "email",
    !preferredDate && "date",
    !preferredTime && "time",
  ].filter(Boolean) as string[];

  if (missing.length > 0) {
    return {
      error: `Please fill in your ${missing.join(", ").replace(/, ([^,]*)$/, " and $1")}.`,
    };
  }

  return {
    input: {
      name,
      email,
      phone: String(formData.get("phone") ?? "").trim(),
      preferredDate,
      preferredTime,
      message: String(formData.get("message") ?? "").trim(),
    },
  };
}

async function book(
  kind: BookingKind,
  formData: FormData
): Promise<AppointmentActionState> {
  const parsed = parseBooking(formData);
  if (parsed.error) return { success: false, error: parsed.error };

  return submitBooking(kind, parsed.input!);
}

export async function bookAppointmentAction(
  _prevState: AppointmentActionState | null,
  formData: FormData
): Promise<AppointmentActionState> {
  return book("appointment", formData);
}

export async function bookTestDriveAction(
  _prevState: AppointmentActionState | null,
  formData: FormData
): Promise<AppointmentActionState> {
  return book("test_drive", formData);
}

export async function setBookingStatusAction(
  kind: BookingKind,
  id: string,
  status: AppointmentStatus
): Promise<void> {
  await setBookingStatus(kind, id, status);
  revalidateBookings(kind);
}

export async function deleteBookingAction(kind: BookingKind, id: string): Promise<void> {
  await deleteBooking(kind, id);
  revalidateBookings(kind);
}

/**
 * The nav badges live in the admin layout, so the layout has to be revalidated
 * too — refreshing only the page would leave a stale count sitting in the nav
 * until the next poll.
 */
function revalidateBookings(kind: BookingKind): void {
  revalidatePath(BOOKINGS[kind].adminPath);
  revalidatePath("/admin", "layout");
}

/** Polled by the nav badges so a request that arrives mid-session shows up. */
export async function getPendingBookingCountAction(kind: BookingKind): Promise<number> {
  return getPendingBookingCount(kind);
}
