import "server-only";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/**
 * Fallback sender. Overridable with `RESEND_FROM_EMAIL` so the address can be
 * changed without a deploy — but the domain must stay one that is verified in
 * Resend, otherwise every send is rejected.
 */
const DEFAULT_FROM = "VIP Motors <noreply@vipmotorsbd.com>";

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  /** Plain-text alternative. Improves deliverability; worth always sending. */
  text?: string;
  /** Where a customer's "Reply" lands — the showroom inbox, not the sender. */
  replyTo?: string;
}

export type EmailResult = { success: boolean; error?: string };

/**
 * Posts one email through the Resend REST API.
 *
 * Deliberately no SDK: this is a single authenticated POST, and the project
 * keeps its dependency list small.
 *
 * Never throws. Email is a side effect of booking a viewing, never the point of
 * it — a Resend outage must not turn a saved appointment into an error message.
 */
export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Local dev without a key is a normal state, not a bug — log and move on.
    console.warn("RESEND_API_KEY is not set; skipped email:", message.subject);
    return { success: false, error: "Email is not configured." };
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM,
        to: Array.isArray(message.to) ? message.to : [message.to],
        subject: message.subject,
        html: message.html,
        ...(message.text ? { text: message.text } : {}),
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      }),
    });

    if (!response.ok) {
      // Resend puts the useful part in the body, not the status text.
      const detail = await response.text();
      console.error(`sendEmail failed (${response.status}):`, detail);
      return { success: false, error: "Could not send the email." };
    }

    return { success: true };
  } catch (error) {
    console.error("sendEmail request failed:", error);
    return { success: false, error: "Could not reach the email service." };
  }
}
