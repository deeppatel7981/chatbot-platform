import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { getAccessFromSession, requireFullOrg } from "@/lib/access-scope";

/** Workspace-only APIs return 403 for merchant portal logins. */
export function requireFullOrgApi(session: Session | null): NextResponse | null {
  const scope = getAccessFromSession(session);
  if (!scope) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!requireFullOrg(scope)) {
    return NextResponse.json({ error: "Not available for merchant portal logins." }, { status: 403 });
  }
  return null;
}
