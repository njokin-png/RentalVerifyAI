import { NextRequest, NextResponse } from "next/server";
export function middleware(req: NextRequest) {
  if (!req.cookies.get("rv_session"))
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
