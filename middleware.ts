import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

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
