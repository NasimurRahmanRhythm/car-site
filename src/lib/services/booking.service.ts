import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BOOKINGS, type BookingKind } from "@/lib/bookings";
import {
  sendBookingReceiptEmail,
  sendBookingStatusEmail,
} from "@/lib/email/booking-notifications";
import type { AppointmentStatus, BookingRequest } from "@/types/appointment";

export interface BookingInput {
  name: string;
  email: string;
  phone?: string;
  preferredDate: string;
  preferredTime: string;
  message?: string;
}

/**
 * Stores a request from the public form and acknowledges it by email.
 *
 * The two tables are column-identical, so `kind` picks the table and the
 * wording; nothing else here changes between an appointment and a test drive.
 */
export async function submitBooking(
  kind: BookingKind,
  input: BookingInput
): Promise<{ success: boolean; error?: string }> {
  const config = BOOKINGS[kind];
  const supabase = await createClient();

  const { error } = await supabase.from(config.table).insert({
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    preferred_date: input.preferredDate,
    preferred_time: input.preferredTime,
    message: input.message || null,
  });

  if (error) {
    console.error(`submitBooking (${kind}) failed:`, error.message);
    return {
      success: false,
      error: `Could not book your ${config.noun}. Please try again.`,
    };
  }

  // After the response, not before: the request is already saved and visible in
  // the admin panel, so a round-trip to Resend should not sit between the
  // visitor and their confirmation screen.
  after(async () => {
    await sendBookingReceiptEmail(kind, {
      name: input.name,
      email: input.email,
      phone: input.phone,
      preferredDate: input.preferredDate,
      preferredTime: input.preferredTime,
      message: input.message,
    });
  });

  return { success: true };
}

export async function getAllBookings(kind: BookingKind): Promise<BookingRequest[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(BOOKINGS[kind].table)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`getAllBookings (${kind}) failed:`, error.message);
    return [];
  }

  return data ?? [];
}

/**
 * How many requests nobody has actioned yet — the number on the nav badge.
 *
 * `head: true` asks Postgres for the count without shipping any rows, which
 * matters because the admin nav polls this on a timer.
 */
export async function getPendingBookingCount(kind: BookingKind): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from(BOOKINGS[kind].table)
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  if (error) {
    // A badge is not worth breaking the whole admin shell over.
    console.error(`getPendingBookingCount (${kind}) failed:`, error.message);
    return 0;
  }

  return count ?? 0;
}

export async function setBookingStatus(
  kind: BookingKind,
  id: string,
  status: AppointmentStatus
): Promise<{ success: boolean; error?: string }> {
  const config = BOOKINGS[kind];
  const supabase = await createClient();

  // Read before writing: the customer's details are needed for the email, and
  // the old status tells us whether this is a real change. A stale admin tab
  // could otherwise re-send a confirmation the customer already has.
  const { data: existing, error: readError } = await supabase
    .from(config.table)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (readError) {
    console.error(`setBookingStatus (${kind}) lookup failed:`, readError.message);
    return { success: false, error: readError.message };
  }

  if (!existing) {
    return { success: false, error: `${config.title} request not found.` };
  }

  const { error } = await supabase.from(config.table).update({ status }).eq("id", id);

  if (error) {
    console.error(`setBookingStatus (${kind}) failed:`, error.message);
    return { success: false, error: error.message };
  }

  // "pending" is the initial state, not something a customer needs told about.
  if (existing.status !== status && status !== "pending") {
    after(async () => {
      await sendBookingStatusEmail(
        kind,
        {
          name: existing.name,
          email: existing.email,
          phone: existing.phone,
          preferredDate: existing.preferred_date,
          preferredTime: existing.preferred_time,
          message: existing.message,
        },
        status
      );
    });
  }

  return { success: true };
}

export async function deleteBooking(
  kind: BookingKind,
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from(BOOKINGS[kind].table).delete().eq("id", id);

  if (error) {
    console.error(`deleteBooking (${kind}) failed:`, error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}
