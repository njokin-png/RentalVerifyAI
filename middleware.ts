import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session-token";
import { isSameOriginRequest } from "@/lib/csrf";

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api/")) {
    // Stripe authenticates its server-to-server webhook with a signed raw body.
    if (
      req.nextUrl.pathname !== "/api/stripe/webhook" &&
      !isSameOriginRequest(req)
    ) {
      return NextResponse.json(
        { error: "Request origin could not be verified." },
        { status: 403 },
      );
    }
    return NextResponse.next();
  }

  const session = await verifySessionToken(
    req.cookies.get(SESSION_COOKIE_NAME)?.value,
  );
  if (!session)
    return NextResponse.redirect(
      new URL(
        `/login?next=${encodeURIComponent(req.nextUrl.pathname)}`,
        req.url,
      ),
    );
  return NextResponse.next();
}
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/history/:path*",
    "/account/:path*",
    "/api/:path*",
  ],
};
