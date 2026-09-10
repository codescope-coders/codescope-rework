import createMiddleware from "next-intl/middleware";
import { routing, internalRouting } from "./i18n/config";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const intlMiddleware = createMiddleware(routing);
const internalMiddleware = createMiddleware(internalRouting);

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

  // The Follow-up dashboard (/dashboard) — including Careers, now a module at
  // /dashboard/careers — requires a valid session.
  const isProtected = pathnameWithoutLocale.startsWith("/dashboard");

  if (!token && isProtected) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (token && (isProtected || pathnameWithoutLocale === "/login")) {
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

  const internal = isProtected || pathnameWithoutLocale === "/login";
  const wwwPublic = !internal && request.headers.get("host")?.split(":")[0] === "www.codescope.dev";
  const redundantEnglishPrefix = !internal && (pathname === "/en" || pathname.startsWith("/en/"));
  if (wwwPublic || redundantEnglishPrefix) {
    const url = request.nextUrl.clone();
    if (redundantEnglishPrefix) url.pathname = pathnameWithoutLocale;
    if (wwwPublic) {
      url.hostname = "codescope.dev";
      url.protocol = "https:";
      url.port = "";
    }
    return NextResponse.redirect(url, 308);
  }
  const response = internal ? internalMiddleware(request) : intlMiddleware(request);
  if (internal) response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
