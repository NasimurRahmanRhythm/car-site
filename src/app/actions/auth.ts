"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { sendMagicLink, signOut } from "@/lib/services/auth.service";

export interface LoginActionState {
  success: boolean;
  error?: string;
}

async function getOrigin(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
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
