"use client";

import { usePathname } from "@/i18n/routing";

/** Show loading/new content immediately; never wait for the old route to exit. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <div key={pathname} className="site-page-enter">{children}</div>;
}
