import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - API routes
    // - files with extensions (e.g. favicon.ico)
    // - _next (Next.js internals)
    // - _vercel (Vercel internals)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
