import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/get-session";

/** Session + user for client bootstrap (Cognito migration can mirror this shape). */
export async function GET() {
  const session = await getAppSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const u = session.user as typeof session.user & { accessMode?: string; portalClientIds?: string[] };

  return NextResponse.json({
    data: {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        organizationId: session.user.organizationId,
        accessMode: u.accessMode ?? "full",
        portalClientIds: u.portalClientIds ?? [],
      },
    },
  });
}
