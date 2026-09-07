"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "@/i18n/routing";
import { getLenis } from "@/lib/lenis";

/**
 * Puts every NAVIGATION at the top of the destination page.
 *
 * Next resets `scrollTop` itself on route commit, but Lenis is the scroll's
 * real owner here and its internal target still holds the OLD position — on
 * its next rAF it eases the fresh page right back down, which is how clicking
 * a link mid-page landed you mid-page on the destination. The reset therefore
 * goes THROUGH Lenis (`immediate` syncs its internal state, `force` overrides
 * any in-flight ease), with a plain `window.scrollTo` for the reduced-motion
 * session where Lenis is never constructed.
 *
 * ⚠️ Back/forward is deliberately exempt. The browser's history restoration —
 * returning to where you were on the page you left — is the one navigation
 * where "top of page" is wrong, so a popstate listener flags the next pathname
 * change and that one is left alone. The locale switcher is unaffected either
 * way: switching locales keeps the same pathname, so this effect never fires
 * for it and its own anchor-restore machinery stays the authority.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  const isPop = useRef(false);
  const lastPathname = useRef(pathname);

  useEffect(() => {
    const onPop = () => {
      isPop.current = true;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (pathname === lastPathname.current) return;
    lastPathname.current = pathname;
    if (isPop.current) {
      isPop.current = false;
      return;
    }
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
