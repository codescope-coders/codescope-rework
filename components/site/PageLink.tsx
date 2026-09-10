"use client";

import { type ComponentProps, useRef } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { beginPageNavigation } from "@/lib/menu-navigation";
import { isPublicPath, unlocalizedPath } from "@/lib/site-urls";

/** Public-page links retain normal Next/locale behavior. Only an actual,
 * same-tab route navigation can start the visual handoff. */
export function PageLink({ children, onNavigate, ...props }: Omit<ComponentProps<typeof Link>, "ref">) {
  const ref = useRef<HTMLAnchorElement>(null);
  const pathname = usePathname();
  return (
    <Link {...props} ref={ref} onNavigate={(event) => {
      let prevented = false;
      onNavigate?.({ preventDefault: () => { prevented = true; event.preventDefault(); } });
      if (prevented || !ref.current || props.scroll === false) return;
      const destination = new URL(ref.current.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.hash || !isPublicPath(destination.pathname)) return;
      beginPageNavigation(pathname, unlocalizedPath(destination.pathname), ref.current);
    }}>
      {children}
    </Link>
  );
}
