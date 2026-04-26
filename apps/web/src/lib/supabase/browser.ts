"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "./env";

let cached: SupabaseClient | null = null;

/** Browser Supabase client — cookie session matches `@supabase/ssr` server/middleware. */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  const cfg = getSupabasePublicConfig();
  if (!cfg) return null;
  if (!cached) {
    cached = createBrowserClient(cfg.url, cfg.key);
  }
  return cached;
}
