import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const intlMiddleware = createMiddleware(routing);

function getPathnameWithoutLocale(pathname: string, locales: string[]) {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return pathname.slice(locale.length + 1) || "/";
    }
  }
  return pathname;
}

export default async function middleware(request: NextRequest) {
  const token = (await cookies()).get("token");
  const pathname = request.nextUrl.pathname;

  const pathnameWithoutLocale = getPathnameWithoutLocale(
    pathname,
    routing.locales,
  );

  if (!token && pathnameWithoutLocale.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (
    token &&
    (pathnameWithoutLocale.startsWith("/dashboard") ||
      pathnameWithoutLocale === "/login")
  ) {
    const url = new URL("/api/auth/checkAuth", "http://127.0.0.1:3000");

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.value}`,
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200 && pathnameWithoutLocale === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (response.status === 401) {
      (await cookies()).delete("token");
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
