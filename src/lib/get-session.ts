import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function getAppSession() {
  return getServerSession(authOptions);
}
