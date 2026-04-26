import { redirect } from "next/navigation";
import PortalShell from "@/components/portal/PortalShell";
import { getAccessFromSession, validatePortalClientRoute } from "@/lib/access-scope";
import { getAppSession } from "@/lib/get-session";

export default async function PortalClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const session = await getAppSession();
  const scope = getAccessFromSession(session);
  if (!scope) {
    redirect("/login");
  }

  const v = await validatePortalClientRoute(scope, clientId);
  if (!v.ok) {
    redirect("/portal");
  }

  return (
    <PortalShell clientId={clientId} clientName={v.clientName}>
      {children}
    </PortalShell>
  );
}
