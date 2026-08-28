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

export async function sendMagicLink(
  email: string,
  redirectTo: string
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
      emailRedirectTo: redirectTo,
    },
  });

  if (error) {
    console.error("sendMagicLink failed:", error.message);
    return { success: false, error: "Could not send the login link. Please try again." };
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
