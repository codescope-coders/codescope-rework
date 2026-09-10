"use client";

import { usePathname } from "@/i18n/routing";
import { useEffect, useLayoutEffect, useRef } from "react";
import { cancelPageNavigation, revealMenuDestination } from "@/lib/menu-navigation";
import "./page-transition.css";

/** Menu and public CTA navigation share a vertical handoff. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => () => cancelPageNavigation(), []);
  useLayoutEffect(() => {
    const page = ref.current;
    if (!page || revealMenuDestination(pathname, page)) return;
    // Observe this route only while its actual loading boundary is present.
    // The menu stays interactive; no arbitrary delay is added to fast routes.
    const observer = new MutationObserver(() => {
      if (revealMenuDestination(pathname, page)) observer.disconnect();
    });
    observer.observe(page, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);
  return <div key={pathname} ref={ref} tabIndex={-1} className="site-page-enter">{children}</div>;
}
