import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "./env";

/** Server Components / Route Handlers: cookie-backed session (requires `await`). */
export async function createSupabaseServerClient(): Promise<SupabaseClient | null> {
  const cfg = getSupabasePublicConfig();
  if (!cfg) return null;

  const cookieStore = await cookies();

  return createServerClient(cfg.url, cfg.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          /* ignore when called from a Server Component that cannot set cookies */
        }
      },
    },
  });
}
