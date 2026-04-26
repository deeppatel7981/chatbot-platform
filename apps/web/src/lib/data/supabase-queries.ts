/**
 * PostgREST reads/writes under RLS (LLD §12–13).
 * Use with `createSupabaseServerClient()` in Route Handlers after the user session exists.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export type ContactRow = {
  id: string;
  organization_id: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  source: string | null;
  external_id: string | null;
  created_at: string;
};

export function mapContactRow(r: ContactRow) {
  return {
    id: r.id,
    organizationId: r.organization_id,
    phone: r.phone,
    email: r.email,
    name: r.name,
    source: r.source,
    externalId: r.external_id,
    createdAt: r.created_at,
  };
}

export async function listContactsRls(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as ContactRow[]).map(mapContactRow);
}

export async function insertContactRls(
  supabase: SupabaseClient,
  row: {
    organization_id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
    source: string | null;
  }
) {
  const { data, error } = await supabase.from("contacts").insert(row).select("*").single();
  if (error) throw error;
  return mapContactRow(data as ContactRow);
}
