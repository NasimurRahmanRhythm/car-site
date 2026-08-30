"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { sendMagicLink, signOut } from "@/lib/services/auth.service";
import { getSiteUrl } from "@/lib/site-url";

export interface LoginActionState {
  success: boolean;
  error?: string;
}

/**
 * Where the sign-in link should land. Built from the request that asked for the
 * link, so a preview deployment sends you back to that same preview rather than
 * to production — falling back to the configured site URL if the host header is
 * missing.
 */
async function getOrigin(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  if (!host) return getSiteUrl();

  const protocol =
    headersList.get("x-forwarded-proto") ??
    (/^(localhost|127\.0\.0\.1|\[::1\])(:|$)/.test(host) ? "http" : "https");

  return `${protocol}://${host}`;
}

export async function loginAction(
  _prevState: LoginActionState | null,
  formData: FormData
): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { success: false, error: "Please enter your email address." };
  }

  const origin = await getOrigin();
  const result = await sendMagicLink(email, `${origin}/auth/callback`);
  return result;
}

export async function signOutAction(): Promise<void> {
  await signOut();
  redirect("/admin/login");
}
