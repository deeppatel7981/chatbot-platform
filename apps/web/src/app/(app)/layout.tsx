import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { getAccessFromSession } from "@/lib/access-scope";
import { getAppSession } from "@/lib/get-session";

/** Authenticated app shell (LLD `/app/*`). */
export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const session = await getAppSession();
  const scope = getAccessFromSession(session);
  if (scope?.mode === "portal") {
    redirect("/portal");
  }
  return <DashboardShell>{children}</DashboardShell>;
}
