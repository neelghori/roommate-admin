import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";

function isProtectedPath(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

function isAuthPagePath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/forgot-password/") ||
    pathname === "/reset-password" ||
    pathname.startsWith("/reset-password/")
  );
}

function hasSession(request: NextRequest): boolean {
  const raw = request.cookies.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  if (!raw) return false;
  try {
    return decodeURIComponent(raw).length > 0;
  } catch {
    return raw.length > 0;
  }
}

function isRootPath(pathname: string): boolean {
  return pathname === "/" || pathname === "";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = hasSession(request);

  if (isRootPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = authed ? "/dashboard" : "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isProtectedPath(pathname) && !authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPagePath(pathname) && authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/dashboard/:path*",
    "/login",
    "/login/:path*",
    "/forgot-password",
    "/forgot-password/:path*",
    "/reset-password",
    "/reset-password/:path*",
  ],
};
