import "server-only";
import { SITE } from "@/data/site";
import { sendEmail } from "./client";
import {
  appointmentReceivedEmail,
  appointmentStatusEmail,
  type AppointmentEmailData,
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
 * from the badge in the admin nav, not from an inbox.
 */
export async function sendAppointmentReceiptEmail(
  data: AppointmentEmailData
): Promise<void> {
  const email = appointmentReceivedEmail(data);

  await trySend("Appointment receipt", () =>
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

/** Tells the visitor an admin has confirmed or cancelled their request. */
export async function sendAppointmentStatusEmail(
  data: AppointmentEmailData,
  status: "confirmed" | "cancelled"
): Promise<void> {
  const email = appointmentStatusEmail(data, status);

  await trySend(`Appointment ${status} notice`, () =>
    sendEmail({
      to: data.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
      replyTo: SITE.email,
    })
  );
}
