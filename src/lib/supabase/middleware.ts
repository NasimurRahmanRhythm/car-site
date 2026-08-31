import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { SESSION_MAX_AGE_MS } from "@/lib/constants";

/**
 * Whether the sign-in behind this session is older than the maximum session age.
 *
 * `last_sign_in_at` only moves when someone actually verifies a code — a token
 * refresh leaves it untouched — so it is a true "signed in at" stamp rather than
 * a sliding window that active use would keep pushing forward.
 */
function isSessionExpired(user: User): boolean {
  if (!user.last_sign_in_at) return false;

  const signedInAt = Date.parse(user.last_sign_in_at);

  // Fail open on a missing or unreadable timestamp: locking the only admin out
  // of the panel is a worse outcome than a session that lives a little too long.
  if (Number.isNaN(signedInAt)) return false;

  return Date.now() - signedInAt > SESSION_MAX_AGE_MS;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = request.nextUrl.pathname === "/admin/login";

  /**
   * A redirect that carries over whatever cookie changes Supabase made getting
   * here.
   *
   * Without this, a `signOut()` clears the session on `supabaseResponse` — which
   * is then thrown away in favour of the redirect — and the browser keeps the
   * stale cookie. The next request would bounce straight back, looping between
   * /admin and /admin/login forever.
   */
  const redirectTo = (path: string, error?: string) => {
    const url = new URL(path, request.url);
    if (error) url.searchParams.set("error", error);

    const response = NextResponse.redirect(url);
    supabaseResponse.cookies
      .getAll()
      .forEach((cookie) => response.cookies.set(cookie));
    return response;
  };

  const expired = user ? isSessionExpired(user) : false;

  if (isAdminRoute && !isLoginRoute) {
    if (!user?.email) {
      return redirectTo("/admin/login");
    }

    // Checked before the whitelist lookup so an expired session costs one less
    // query, and so the user is told what actually happened.
    if (expired) {
      await supabase.auth.signOut();
      return redirectTo("/admin/login", "session-expired");
    }

    const { data: adminRow } = await supabase
      .from("admin_members")
      .select("email")
      .eq("email", user.email)
      .maybeSingle();

    if (!adminRow) {
      await supabase.auth.signOut();
      return redirectTo("/admin/login", "not-authorized");
    }
  }

  // An expired session must not be bounced back to /admin — that is the other
  // half of the redirect loop. The stale cookie is left alone here; verifying a
  // new code overwrites it.
  if (isLoginRoute && user?.email && !expired) {
    const { data: adminRow } = await supabase
      .from("admin_members")
      .select("email")
      .eq("email", user.email)
      .maybeSingle();

    if (adminRow) {
      return redirectTo("/admin");
    }
  }

  return supabaseResponse;
}
