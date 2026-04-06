import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ensureNextAuthUrlFromVercel } from "@/lib/vercel-env";
import { withAuth } from "next-auth/middleware";

ensureNextAuthUrlFromVercel();

export default withAuth(
  function middleware(req: NextRequest) {
    if (process.env.DEBUG === "true") {
      console.debug("[middleware]", req.nextUrl.pathname);
    }
    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/ask", "/onboard"],
};
