import "server-only";
import { SITE } from "@/data/site";
import { BOOKINGS, type BookingKind } from "@/lib/bookings";
import { sendEmail } from "./client";
import {
  bookingReceivedEmail,
  bookingStatusEmail,
  type BookingEmailData,
} from "./templates";

/**
 * Fire-and-forget wrapper. Every caller here is a side effect of something that
 * already succeeded, so a failed send is logged and swallowed rather than
 * bubbled up into the user's result.
 */
async function trySend(
  label: string,
  send: () => Promise<{ success: boolean; error?: string }>
): Promise<void> {
  try {
    const result = await send();
    if (!result.success) console.error(`${label} was not sent:`, result.error);
  } catch (error) {
    console.error(`${label} threw:`, error);
  }
}

/**
 * Acknowledges a new request to the visitor who made it.
 *
 * Nothing goes to the showroom here on purpose — staff learn about new requests
 * from the badges in the admin nav, not from an inbox.
 */
export async function sendBookingReceiptEmail(
  kind: BookingKind,
  data: BookingEmailData
): Promise<void> {
  const email = bookingReceivedEmail(kind, data);

  await trySend(`${BOOKINGS[kind].title} receipt`, () =>
    sendEmail({
      to: data.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
      // A customer replying to the receipt should reach a human inbox.
      replyTo: SITE.email,
    })
  );
}

/**
 * Tells the visitor an admin has confirmed or cancelled their request.
 *
 * It goes to the address they gave when booking — the row is read back before
 * the update precisely so this still has it.
 */
export async function sendBookingStatusEmail(
  kind: BookingKind,
  data: BookingEmailData,
  status: "confirmed" | "cancelled"
): Promise<void> {
  const email = bookingStatusEmail(kind, data, status);

  await trySend(`${BOOKINGS[kind].title} ${status} notice`, () =>
    sendEmail({
      to: data.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
      replyTo: SITE.email,
    })
  );
}
