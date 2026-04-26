import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withAuth, type NextRequestWithAuth } from "next-auth/middleware";
import { ensureNextAuthUrlFromVercel } from "@/lib/vercel-env";
import { isSupabaseAuthConfigured, updateSession } from "@/lib/supabase/middleware";

ensureNextAuthUrlFromVercel();

const nextAuthMiddleware = withAuth(
  function middleware(req: NextRequest) {
    if (process.env.DEBUG === "true") {
      console.debug("[middleware]", req.nextUrl.pathname);
    }
    const token = (req as NextRequest & { nextauth?: { token?: { accessMode?: string } } }).nextauth?.token;
    const path = req.nextUrl.pathname;
    if (token?.accessMode === "portal") {
      if (path.startsWith("/dashboard") || path.startsWith("/app")) {
        return NextResponse.redirect(new URL("/portal", req.url));
      }
    }
    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
  }
);

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  if (isSupabaseAuthConfigured()) {
    return updateSession(request);
  }
  return nextAuthMiddleware(request as NextRequestWithAuth, event);
}

export const config = {
  matcher: ["/app/:path*", "/dashboard/:path*", "/portal", "/portal/:path*", "/ask", "/onboard", "/auth/callback"],
};
