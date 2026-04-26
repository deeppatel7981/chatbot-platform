import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabasePublicConfig } from "@/lib/supabase/env";

/**
 * OAuth / magic-link callback for Supabase Auth (App Router).
 */
export async function GET(request: Request) {
  const cfg = getSupabasePublicConfig();
  if (!cfg) {
    return NextResponse.redirect(new URL("/login?error=config", request.url));
  }

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next")?.startsWith("/") ? searchParams.get("next")! : "/app";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(cfg.url, cfg.key, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    });
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth", request.url));
}
