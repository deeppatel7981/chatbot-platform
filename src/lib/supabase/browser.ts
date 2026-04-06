"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "./env";

let cached: SupabaseClient | null = null;

/** Browser Supabase client (Auth, Realtime, Storage). Returns null if env is not set. */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  const cfg = getSupabasePublicConfig();
  if (!cfg) return null;
  if (!cached) {
    cached = createClient(cfg.url, cfg.key);
  }
  return cached;
}
