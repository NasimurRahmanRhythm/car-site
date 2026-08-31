"use server";

import { redirect } from "next/navigation";
import {
  sendLoginCode,
  signOut,
  verifyLoginCode,
} from "@/lib/services/auth.service";

export interface LoginActionState {
  /**
   * Which half of the form to show. `code` means an email went out and the form
   * should now ask for the six digits.
   */
  step: "email" | "code";
  /** Carried forward so the verify step knows who is signing in. */
  email?: string;
  error?: string;
  /** Confirmation after a resend, shown without changing step. */
  notice?: string;
}

/**
 * Both halves of the login form run through this one action.
 *
 * A single `useActionState` keeps one source of truth for the step and the
 * message: with a hook per step, a stale error from a failed code attempt would
 * linger next to the "new code sent" notice.
 *
 * The branch is chosen by the submit button's own `name="intent"`, which the
 * browser includes in the form data.
 */
export async function loginAction(
  prevState: LoginActionState | null,
  formData: FormData
): Promise<LoginActionState> {
  const intent = String(formData.get("intent") ?? "send");
  const email = String(formData.get("email") ?? prevState?.email ?? "").trim();

  if (intent === "change-email") {
    // Keep the address in the field so a typo is a small edit, not a retype.
    return { step: "email", email };
  }

  if (!email) {
    return { step: "email", error: "Please enter your email address." };
  }

  if (intent === "verify") {
    const code = String(formData.get("code") ?? "").trim();
    const result = await verifyLoginCode(email, code);

    if (!result.success) {
      return { step: "code", email, error: result.error };
    }

    // redirect() signals by throwing, so it stays outside any error handling.
    redirect("/admin");
  }

  const result = await sendLoginCode(email);

  if (!result.success) {
    // Back to the email step on failure — a rejected address should be editable
    // rather than leaving the user staring at a code field.
    return { step: "email", email, error: result.error };
  }

  return {
    step: "code",
    email,
    notice: intent === "resend" ? "A new code is on its way." : undefined,
  };
}

export async function signOutAction(): Promise<void> {
  await signOut();
  redirect("/admin/login");
}
