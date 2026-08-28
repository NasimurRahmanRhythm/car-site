import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

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

  if (isAdminRoute && !isLoginRoute) {
    if (!user || !user.email) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    const { data: adminRow } = await supabase
      .from("admin_members")
      .select("email")
      .eq("email", user.email)
      .maybeSingle();

    if (!adminRow) {
      await supabase.auth.signOut();
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("error", "not-authorized");
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isLoginRoute && user?.email) {
    const { data: adminRow } = await supabase
      .from("admin_members")
      .select("email")
      .eq("email", user.email)
      .maybeSingle();

    if (adminRow) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return supabaseResponse;
}
