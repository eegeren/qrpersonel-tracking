import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/stores", "/employees", "/qr"];

export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has("qr_session");
  const pathname = request.nextUrl.pathname;

  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/stores/:path*", "/employees/:path*", "/qr/:path*"]
};
