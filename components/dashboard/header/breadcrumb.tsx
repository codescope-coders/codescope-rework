"use client";

import { Fragment } from "react";
import { ChevronRight, Home } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";

/** Path segment → `dash.nav.*` key, so a crumb reads the same as the sidebar. */
const SEG_KEY: Record<string, string> = {
  pipeline: "nav.pipeline",
  projects: "nav.projects",
  servers: "nav.servers",
  reports: "nav.reports",
  support: "nav.support",
  leaves: "nav.leaves",
  finance: "nav.finance",
  partners: "nav.partners",
  careers: "nav.careers",
  users: "nav.users",
  settings: "nav.settings",
};

function titleCase(s: string) {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Navigation trail rendered inside the GlobalBar — never a page title (each
 *  page owns its own <h1>). Ancestors collapse on mobile; the root is a Home
 *  icon link. */
export function Breadcrumb() {
  const t = useTranslations("dash");
  const pathname = usePathname();
  const segs = pathname.split("/").filter(Boolean);
  const rest = segs[0] === "dashboard" ? segs.slice(1) : segs;

  const crumbs = [
    { label: t("nav.dashboard"), href: "/dashboard" },
    ...rest.map((s, i) => ({
      label: SEG_KEY[s] && t.has(SEG_KEY[s]) ? t(SEG_KEY[s]) : titleCase(s),
      href: "/dashboard/" + rest.slice(0, i + 1).join("/"),
    })),
  ];

  return (
    <nav className="flex min-w-0 items-center gap-0.5">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        const isFirst = i === 0;
        return (
          <Fragment key={crumb.href}>
            {!isFirst && (
              <ChevronRight className="hidden size-3.5 shrink-0 text-neutral-300 rtl:rotate-180 sm:block" />
            )}
            {isLast ? (
              <span
                aria-current="page"
                className="flex items-center gap-1.5 truncate text-[13px] font-semibold text-foreground"
              >
                {isFirst && <Home className="size-4 shrink-0 text-neutral-500" />}
                {crumb.label}
              </span>
            ) : isFirst ? (
              <Link
                href={crumb.href}
                aria-label={crumb.label}
                className="grid size-7 shrink-0 place-items-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-foreground"
              >
                <Home className="size-4" />
              </Link>
            ) : (
              <Link
                href={crumb.href}
                className="hidden shrink-0 truncate rounded-md px-1.5 py-1 text-[13px] font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-foreground sm:inline-flex"
              >
                {crumb.label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
