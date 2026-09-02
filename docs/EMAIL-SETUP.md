# Email setup — Resend + Supabase

Two separate email paths run on this site. They both go through Resend, but
they are wired up in different places and can fail independently.

| | Admin login codes | Appointment emails |
|---|---|---|
| Sent by | Supabase Auth (GoTrue) | This app's own code |
| Reaches Resend via | SMTP (`smtp.resend.com`) | REST API (`api.resend.com`) |
| Key lives in | Supabase → SMTP settings | `RESEND_API_KEY` env var |
| Template lives in | Supabase dashboard | `src/lib/email/templates.ts` |

---

## 1. Resend — verify the domain

The API key is **account-wide**, not per-domain. What is per-domain is the
*verified sending domain*. So an existing key from another project keeps
working here, provided:

- `vipmotorsbd.com` is added under **Resend → Domains** and shows **Verified**, and
- that key was **not** created with a domain restriction (Resend lets you scope a
  key to one domain — if the old key is scoped to the other domain, it will
  reject every send from this one and a new key is required).

Add the domain, publish the DNS records Resend gives you (DKIM `TXT`, SPF, and
the `MX` for the return path), and wait for verification.

> **Recommendation:** create a fresh key named `vipmotorsbd` anyway. It costs
> nothing, lets you revoke this site without breaking the other project, and
> keeps the two sites' sending stats apart.

Once verified, `noreply@vipmotorsbd.com` and `info@vipmotorsbd.com` are usable
as `from` addresses.

---

## 2. Supabase — admin login codes

### 2a. SMTP

**Project Settings → Authentication → SMTP Settings** → enable custom SMTP:

| Field | Value |
|---|---|
| Host | `smtp.resend.com` |
| Port | `587` |
| Username | `resend` (the literal word) |
| Password | your Resend API key (`re_...`) |
| Sender email | `noreply@vipmotorsbd.com` |
| Sender name | `VIP Motors` |

Without this, Supabase's built-in SMTP caps you at a couple of emails per hour —
which OTP retries hit almost immediately.

### 2b. Templates

**Authentication → Emails → Templates** — paste
[`supabase/email-templates/login-code.html`](supabase/email-templates/login-code.html)
into **both**:

- **Magic Link**
- **Confirm signup** ← easy to miss; a brand-new admin's *first* login uses this
  one, not the magic link template

The template uses `{{ .Token }}` and no `{{ .ConfirmationURL }}`. That single
swap is what turns the email from a clickable link into a 6-digit code —
Supabase generates both every time, the template decides which one ships.

### 2c. OTP settings

**Authentication → Sign In / Providers → Email**:

- Email OTP Expiration: `600` (10 minutes — matches the copy in the login form)
- Email OTP Length: `6`

**Authentication → Rate Limits**: raise "Rate limit for sending emails" above the
default now that Resend, not Supabase, is doing the sending.

### 2d. Session length

**Authentication → Sessions → Time-box user sessions**: `336` hours (14 days).

This is the authoritative half of the 14-day rule — GoTrue itself refuses to
refresh a session past that point, so it holds even for a stolen refresh token.
The app enforces the same limit in `src/lib/supabase/middleware.ts` off
`SESSION_MAX_AGE_DAYS`, which covers the free tier (where time-boxing is a paid
feature) and gives a clean "you were signed out" message instead of a silent
failure. **Keep the two numbers in sync** if you change either.

### 2e. URLs

**Authentication → URL Configuration**:

- Site URL: `https://www.vipmotorsbd.com`
- Redirect URLs: add `https://www.vipmotorsbd.com/**`

Not used by the code flow, but `/auth/callback` is still live for links already
sitting in someone's inbox.

### 2f. Database

**No schema changes.** The `appointments` and `admin_members` tables already
have everything both features need.

To add an admin, insert their email into `admin_members` — it is the whitelist
that gates who can even request a code.

---

## 3. Environment variables

Set these in **Vercel → Settings → Environment Variables** (and `.env.local` for
local dev):

```
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=VIP Motors <noreply@vipmotorsbd.com>
NEXT_PUBLIC_SITE_URL=https://www.vipmotorsbd.com
```

`RESEND_API_KEY` may be the same key as the SMTP password, or a different one.
A missing key is handled gracefully: bookings still save, emails are skipped
with a warning in the logs.

---

## 4. What gets sent

Every appointment email goes to the **customer**. Nothing is emailed to the
showroom — staff learn about new requests from the red badge on **Appointments**
in the admin nav.

| Trigger | To | Template |
|---|---|---|
| Visitor submits the booking form | The visitor | `appointmentReceivedEmail` |
| Admin clicks **Confirm** | The visitor | `appointmentStatusEmail(…, "confirmed")` |
| Admin clicks **Cancel** | The visitor | `appointmentStatusEmail(…, "cancelled")` |

All three go out through `after()`, so a slow or failing Resend never delays the
visitor's confirmation screen or the admin's status click. Status emails only
fire on an actual change, so a stale admin tab cannot re-send a confirmation the
customer already has.

### The nav badge

`AppointmentsLink` server-renders the pending count, then re-checks every 60
seconds and whenever the tab regains focus — new requests come from visitors, so
nothing on the admin's own side would otherwise trigger a refresh. Confirming or
cancelling revalidates the admin layout, which updates the badge immediately.
