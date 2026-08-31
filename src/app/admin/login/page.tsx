import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";
import { SESSION_MAX_AGE_DAYS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Admin Login",
};

/**
 * Why the proxy sent someone here. Anything unrecognised shows no message at
 * all — a stray `?error=` in the URL should not put wording on the page.
 */
const REDIRECT_NOTICES: Record<string, string> = {
  "session-expired": `You were signed out after ${SESSION_MAX_AGE_DAYS} days. Sign in again to continue.`,
  "not-authorized": "That account no longer has admin access.",
  "auth-failed": "That sign-in link did not work. Request a new code below.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return <LoginForm notice={error ? REDIRECT_NOTICES[error] : undefined} />;
}
