import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");

  // Only same-site paths — an absolute or protocol-relative `next` would turn
  // this into an open redirect.
  const next = nextParam && /^\/(?!\/)/.test(nextParam) ? nextParam : "/admin";

  // The configured site URL, not the request's own origin, so the session
  // always lands on the deployed admin panel.
  const siteUrl = getSiteUrl();

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${siteUrl}${next}`);
    }
  }

  return NextResponse.redirect(`${siteUrl}/admin/login?error=auth-failed`);
}
