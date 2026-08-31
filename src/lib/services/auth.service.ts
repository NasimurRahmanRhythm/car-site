import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function isEmailAllowed(email: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("admin_members")
    .select("email")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  if (error) {
    console.error("isEmailAllowed failed:", error.message);
    return false;
  }

  return Boolean(data);
}

/**
 * Emails a six-digit sign-in code to a whitelisted admin.
 *
 * The same `signInWithOtp` call backs both magic links and codes — Supabase
 * always generates both, and the email template alone decides which one the
 * recipient sees. No `emailRedirectTo` here: with a code there is nothing to
 * redirect to.
 */
export async function sendLoginCode(
  email: string
): Promise<{ success: boolean; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const allowed = await isEmailAllowed(normalizedEmail);

  if (!allowed) {
    return { success: false, error: "This email is not registered as an admin." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      // Safe to auto-create: isEmailAllowed() above already gated this to
      // whitelisted admin emails only — no other email reaches this call.
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error("sendLoginCode failed:", error.message);
    return { success: false, error: "Could not send the login code. Please try again." };
  }

  return { success: true };
}

/**
 * Exchanges a six-digit code for a session.
 *
 * `type` differs by account age: an existing user verifies as `email`, while an
 * admin signing in for the very first time is still in GoTrue's signup flow and
 * needs `signup`. Trying `email` first and falling back covers both without the
 * caller having to know which case it is.
 */
export async function verifyLoginCode(
  email: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedToken = token.replace(/\D/g, "");

  if (normalizedToken.length !== 6) {
    return { success: false, error: "Enter the 6-digit code from your email." };
  }

  // Re-checked after the send step on purpose: the two calls are separate
  // requests, and an email removed from the whitelist in between must not still
  // be able to trade a valid code for a session.
  const allowed = await isEmailAllowed(normalizedEmail);
  if (!allowed) {
    return { success: false, error: "This email is not registered as an admin." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: normalizedEmail,
    token: normalizedToken,
    type: "email",
  });

  if (error) {
    const { error: signupError } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token: normalizedToken,
      type: "signup",
    });

    if (signupError) {
      // Supabase's own wording leaks flow details; the user only needs to know
      // the code did not work.
      console.error("verifyLoginCode failed:", signupError.message);
      return {
        success: false,
        error: "That code is invalid or has expired. Request a new one.",
      };
    }
  }

  return { success: true };
}

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function isAdmin(): Promise<boolean> {
  const user = await getSessionUser();
  if (!user?.email) return false;

  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_members")
    .select("email")
    .eq("email", user.email)
    .maybeSingle();

  return Boolean(data);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
