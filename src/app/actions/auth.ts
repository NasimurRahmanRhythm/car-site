"use server";

import { redirect } from "next/navigation";
import { sendMagicLink, signOut } from "@/lib/services/auth.service";
import { getSiteUrl } from "@/lib/site-url";

export interface LoginActionState {
  success: boolean;
  error?: string;
}

export async function loginAction(
  _prevState: LoginActionState | null,
  formData: FormData
): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { success: false, error: "Please enter your email address." };
  }

  // Deliberately the configured site URL rather than the requesting host: the
  // link has to land on the deployed admin panel even when it was requested
  // from a local dev server.
  return sendMagicLink(email, `${getSiteUrl()}/auth/callback`);
}

export async function signOutAction(): Promise<void> {
  await signOut();
  redirect("/admin/login");
}
