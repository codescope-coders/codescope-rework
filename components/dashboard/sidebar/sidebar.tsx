"use client";

import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/internal-routing";
import { cn } from "@/lib/utils";
import {
  filterSidebarConfig,
  type SidebarConfig,
  type SidebarGroup as SidebarGroupType,
} from "@/lib/rbac/permissions";
import { useCan } from "@/lib/rbac/use-permissions";
import { useSidebar } from "@/stores/sidebar";
import { useBranding } from "@/hooks/useBranding";
import { BrandMark } from "@/components/dashboard/brand-mark";
import { HeaderLogo } from "@/assets/logo/header-logo";
import { NAV_GROUPS } from "@/components/dashboard/nav-config";
import {
  ActiveHrefProvider,
  ActiveSearchProvider,
  resolveActiveHref,
  SidebarItem,
  useAccordionState,
  useActiveHref,
} from "./sidebar-item";

const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 68;

/** True at ≥lg — where the sidebar is a persistent rail, not a mobile drawer. */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return isDesktop;
}

export function Sidebar() {
  const t = useTranslations("dash");
  const tf = (k: string, fb: string) => (t.has(k) ? t(k) : fb);
  const can = useCan();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchStr = searchParams.toString();
  const collapsed = useSidebar((s) => s.collapsed);
  const toggle = useSidebar((s) => s.toggle);
  const mobileOpen = useSidebar((s) => s.mobileOpen);
  const closeMobile = useSidebar((s) => s.closeMobile);
  const { data: brandingData } = useBranding();
  const brand = brandingData?.payload;

  const drawerRef = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (isDesktop) {
      closeMobile();
      return;
    }
    if (!mobileOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const drawer = drawerRef.current;
    const getFocusable = () => Array.from(drawer?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex="0"]',
    ) ?? []).filter((element) => element.getClientRects().length > 0);
    getFocusable()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobile();
      if (event.key !== "Tab") return;
      const elements = getFocusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previousFocus?.focus();
    };
  }, [isDesktop, mobileOpen, closeMobile]);
  const effectiveCollapsed = isDesktop ? collapsed : false;

  const config: SidebarConfig = useMemo(
    () => filterSidebarConfig({ groups: NAV_GROUPS }, can),
    [can],
  );

  const activeHref = useMemo(
    () => resolveActiveHref(config.groups.flatMap((g) => g.items), pathname ?? ""),
    [config, pathname],
  );

  return (
    <div
      ref={drawerRef}
      inert={!isDesktop && !mobileOpen}
      className={cn(
        "z-50 shrink-0",
        "fixed top-2 start-2 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        mobileOpen ? "translate-x-0" : "-translate-x-[130%] rtl:translate-x-[130%]",
        "lg:relative lg:inset-auto lg:z-40 lg:m-2 lg:me-0 lg:!translate-x-0 lg:transition-none",
      )}
    >
      <motion.aside
        animate={{ width: effectiveCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="flex h-[calc(100dvh-1rem)] flex-col rounded-[20px] border border-border bg-overlay shadow-[0_8px_24px_-12px_rgba(17,17,17,0.14)]"
      >
        {/* Brand row + collapse / close */}
        <div
          className={cn(
            "relative z-10 flex h-16 shrink-0 items-center border-b border-border/70",
            effectiveCollapsed ? "justify-center px-3" : "justify-between gap-2 px-5",
          )}
        >
          {effectiveCollapsed ? (
            <button
              onClick={toggle}
              aria-label={tf("common.expand", "توسيع القائمة")}
              className="grid size-8 place-items-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-foreground"
            >
              <PanelLeftOpen className="size-5 rtl:-scale-x-100" />
            </button>
          ) : (
            <>
              <Link
                href="/dashboard"
                onClick={isDesktop ? undefined : closeMobile}
                aria-label={brand?.name ?? "Codescope"}
                className="-mx-1 flex min-w-0 items-center gap-2.5 rounded-lg px-1 py-1 transition-opacity hover:opacity-80"
              >
                {brand?.logoUrl ? (
                  <>
                    <BrandMark size={30} />
                    <span className="truncate text-[15px] font-semibold tracking-tight text-foreground">
                      {brand?.name ?? "Codescope"}
                    </span>
                  </>
                ) : (
                  <HeaderLogo className="h-auto w-[150px] max-w-full text-[var(--dashboard-brand)]" />
                )}
              </Link>
              <button
                onClick={isDesktop ? toggle : closeMobile}
                aria-label={
                  isDesktop
                    ? tf("common.collapse_menu", "طيّ القائمة")
                    : tf("common.close", "إغلاق")
                }
                className="grid size-8 shrink-0 place-items-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-foreground"
              >
                {isDesktop ? (
                  <PanelLeftClose className="size-5 rtl:-scale-x-100" />
                ) : (
                  <X className="size-5" />
                )}
              </button>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="scrollbar-thin relative z-10 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
          <ActiveHrefProvider value={activeHref}>
            <ActiveSearchProvider value={searchStr}>
              <div className="flex flex-col gap-5">
                {config.groups.map((group, gIdx) => (
                  <SidebarNavGroup
                    key={group.id}
                    group={group}
                    gIdx={gIdx}
                    collapsed={effectiveCollapsed}
                  />
                ))}
              </div>
            </ActiveSearchProvider>
          </ActiveHrefProvider>
        </nav>
      </motion.aside>
    </div>
  );
}

function SidebarNavGroup({
  group,
  gIdx,
  collapsed,
}: {
  group: SidebarGroupType;
  gIdx: number;
  collapsed: boolean;
}) {
  const activeHref = useActiveHref();
  const { openId, toggle } = useAccordionState(group.items, activeHref);

  return (
    <div
      className="animate-nav-rise flex flex-col gap-0.5"
      style={{ animationDelay: `${gIdx * 60}ms` }}
    >
      {collapsed && gIdx > 0 && <div className="mx-auto mb-1 h-px w-5 bg-border" />}
      {group.items.map((item, iIdx) => (
        <div
          key={item.id}
          className="animate-nav-rise"
          style={{ animationDelay: `${gIdx * 60 + iIdx * 30}ms` }}
        >
          <SidebarItem
            item={item}
            collapsed={collapsed}
            isOpen={openId === item.id}
            onToggle={() => toggle(item.id)}
          />
        </div>
      ))}
    </div>
  );
}

export { EXPANDED_WIDTH, COLLAPSED_WIDTH };
