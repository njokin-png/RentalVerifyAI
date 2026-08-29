import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
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
  matcher: ["/dashboard/:path*", "/history/:path*", "/account/:path*"],
};
