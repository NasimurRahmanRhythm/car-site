import "server-only";
import { SITE } from "@/data/site";
import { getSiteUrl } from "@/lib/site-url";
import { BOOKINGS, type BookingKind } from "@/lib/bookings";

export interface BookingEmailData {
  name: string;
  email: string;
  phone?: string | null;
  preferredDate?: string | null;
  preferredTime?: string | null;
  message?: string | null;
}

/* ----------------------------------------------------------- formatting */

/**
 * Escapes user-supplied text before it goes into the HTML body. Names and
 * messages come straight from a public form, so this is the one thing in this
 * file that must not be skipped.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** `2026-09-04` becomes `Friday, 4 September 2026`; anything unparseable passes through. */
function formatEmailDate(value?: string | null): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

/** `14:30` or `14:30:00` becomes `2:30 PM`; anything else passes through. */
function formatEmailTime(value?: string | null): string | null {
  if (!value) return null;
  const match = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!match) return value;
  const hours = Number(match[1]);
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${match[2]} ${suffix}`;
}

/** The requested slot as one line, or a note that no specific time was asked for. */
function slotLine(data: BookingEmailData): string {
  const date = formatEmailDate(data.preferredDate);
  const time = formatEmailTime(data.preferredTime);
  if (date && time) return `${date} at ${time}`;
  if (date) return date;
  if (time) return `Time requested: ${time}`;
  return "No specific time requested";
}

/* --------------------------------------------------------------- layout */

// Inline styles and table layout throughout: Outlook and Gmail strip <style>
// blocks and most modern CSS, so nothing here can rely on a stylesheet.
const BODY_BG = "#f4f4f5";
const INK = "#0b0b0b";
const MUTED = "#5f5f63";
const LINE = "#e2e2e5";
const ACCENT = "#ea2b33";

const SERIF = "Georgia, &#39;Times New Roman&#39;, serif";
const SANS = "Arial, Helvetica, sans-serif";

function layout({
  preheader,
  heading,
  intro,
  bodyHtml,
  footerNote,
}: {
  preheader: string;
  heading: string;
  intro: string;
  bodyHtml: string;
  footerNote?: string;
}): string {
  const siteUrl = getSiteUrl();

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:${BODY_BG};">
  <!-- Preview line shown in the inbox list, hidden inside the message itself. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BODY_BG};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid ${LINE};border-radius:12px;overflow:hidden;">

          <tr>
            <td style="background:${INK};padding:28px 32px;text-align:center;">
              <a href="${siteUrl}" style="color:#ffffff;font-family:${SERIF};font-size:22px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;">${escapeHtml(SITE.name)}</a>
              <div style="margin-top:8px;color:#a9a9ad;font-family:${SANS};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">${escapeHtml(SITE.locationLabel)}</div>
            </td>
          </tr>

          <tr>
            <td style="padding:32px;font-family:${SANS};">
              <h1 style="margin:0 0 12px;color:${INK};font-family:${SERIF};font-size:24px;font-weight:normal;line-height:1.3;">${escapeHtml(heading)}</h1>
              <p style="margin:0 0 24px;color:${MUTED};font-size:15px;line-height:1.6;">${escapeHtml(intro)}</p>
              ${bodyHtml}
            </td>
          </tr>

          <tr>
            <td style="border-top:1px solid ${LINE};padding:24px 32px;font-family:${SANS};font-size:12px;line-height:1.7;color:${MUTED};">
              ${footerNote ? `<p style="margin:0 0 12px;">${escapeHtml(footerNote)}</p>` : ""}
              <strong style="color:${INK};">${escapeHtml(SITE.name)}</strong><br>
              ${escapeHtml(SITE.address)}<br>
              <a href="tel:${escapeHtml(SITE.phone)}" style="color:${MUTED};text-decoration:none;">${escapeHtml(SITE.phoneDisplay)}</a>
              &nbsp;&middot;&nbsp;
              <a href="mailto:${escapeHtml(SITE.email)}" style="color:${MUTED};text-decoration:none;">${escapeHtml(SITE.email)}</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** One label/value row of the detail table. Omitted entirely when the value is empty. */
function detailRow(label: string, value?: string | null): string {
  if (!value) return "";
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid ${LINE};color:${MUTED};font-size:12px;letter-spacing:1px;text-transform:uppercase;width:38%;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:10px 0;border-bottom:1px solid ${LINE};color:${INK};font-size:15px;vertical-align:top;">${escapeHtml(value)}</td>
  </tr>`;
}

function detailTable(rows: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:${SANS};border-top:1px solid ${LINE};">${rows}</table>`;
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0;">
    <tr><td style="background:${ACCENT};border-radius:4px;">
      <a href="${href}" style="display:inline-block;padding:13px 28px;color:#ffffff;font-family:${SANS};font-size:13px;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;">${escapeHtml(label)}</a>
    </td></tr>
  </table>`;
}

/* ------------------------------------------------------------ templates */

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

/** Sent to the visitor the moment their request is stored. */
export function bookingReceivedEmail(
  kind: BookingKind,
  data: BookingEmailData
): RenderedEmail {
  const { noun } = BOOKINGS[kind];
  const slot = slotLine(data);
  const firstName = data.name.split(" ")[0] || data.name;

  const html = layout({
    preheader: `We have your ${noun} request for ${slot}.`,
    heading: `Thank you, ${firstName}.`,
    intro: `Your ${noun} request has reached our showroom team. We will confirm it shortly, usually within one business day.`,
    bodyHtml:
      detailTable(
        detailRow("Requested slot", slot) +
          detailRow("Name", data.name) +
          detailRow("Email", data.email) +
          detailRow("Phone", data.phone) +
          detailRow("Your note", data.message)
      ) + button(`${getSiteUrl()}/inventory`, "Browse the Collection"),
    footerNote:
      "This request is not confirmed yet. You will receive a second email once we lock in the time.",
  });

  const text = [
    `Thank you, ${firstName}.`,
    "",
    `Your ${noun} request has reached our showroom team. We will confirm it shortly, usually within one business day.`,
    "",
    `Requested slot: ${slot}`,
    data.phone ? `Phone: ${data.phone}` : "",
    data.message ? `Your note: ${data.message}` : "",
    "",
    `${SITE.name} - ${SITE.address} - ${SITE.phoneDisplay}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject: `We received your ${noun} request - ${SITE.name}`, html, text };
}

/** Sent to the visitor when an admin confirms or cancels their request. */
export function bookingStatusEmail(
  kind: BookingKind,
  data: BookingEmailData,
  status: "confirmed" | "cancelled"
): RenderedEmail {
  const { noun, path } = BOOKINGS[kind];
  const slot = slotLine(data);
  const firstName = data.name.split(" ")[0] || data.name;
  const confirmed = status === "confirmed";

  const heading = confirmed
    ? `Your ${noun} is confirmed`
    : `Your ${noun} request was cancelled`;

  const intro = confirmed
    ? `${firstName}, we look forward to welcoming you to the showroom. Your ${noun} is set for the slot below.`
    : `${firstName}, we are sorry that we could not hold this slot for you. Reply to this email or call us and we will gladly arrange another time.`;

  const html = layout({
    preheader: confirmed ? `Confirmed for ${slot}.` : `Your ${noun} request was cancelled.`,
    heading,
    intro,
    bodyHtml:
      detailTable(
        detailRow(confirmed ? "Confirmed slot" : "Requested slot", slot) +
          detailRow("Name", data.name) +
          detailRow("Phone", data.phone)
      ) +
      button(
        confirmed ? `${getSiteUrl()}/360-view` : `${getSiteUrl()}${path}`,
        confirmed ? "See the Showroom" : "Request Another Time"
      ),
    footerNote: confirmed ? "Need to reschedule? Just reply to this email." : undefined,
  });

  const text = [
    heading,
    "",
    intro,
    "",
    `${confirmed ? "Confirmed" : "Requested"} slot: ${slot}`,
    "",
    `${SITE.name} - ${SITE.address} - ${SITE.phoneDisplay}`,
  ].join("\n");

  return {
    subject: confirmed
      ? `Your ${noun} is confirmed - ${SITE.name}`
      : `About your ${noun} request - ${SITE.name}`,
    html,
    text,
  };
}
