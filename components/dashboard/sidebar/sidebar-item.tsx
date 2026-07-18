"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import type { SidebarItem as SidebarItemType } from "@/lib/rbac/permissions";

/** Resolve a nav item's visible label: the i18n key under `dash` when present,
 *  otherwise the literal English `title` carried in the config. */
function useItemLabel() {
  const t = useTranslations("dash");
  return (item: SidebarItemType) =>
    item.i18nKey && t.has(item.i18nKey) ? t(item.i18nKey) : item.title;
}

interface SidebarItemProps {
  item: SidebarItemType;
  collapsed: boolean;
  depth?: number;
  isOpen?: boolean;
  onToggle?: () => void;
}

const ActiveHrefContext = createContext<string | null>(null);
export const ActiveHrefProvider = ActiveHrefContext.Provider;
export function useActiveHref(): string | null {
  return useContext(ActiveHrefContext);
}

/** Current URL query string (no leading "?"), so items that differ only by
 *  query (e.g. finance ?tab=payroll) can resolve their own active state. */
const ActiveSearchContext = createContext<string>("");
export const ActiveSearchProvider = ActiveSearchContext.Provider;
export function useActiveSearch(): string {
  return useContext(ActiveSearchContext);
}

/** Siblings that share a pathname but differ by query (the finance sub-tabs)
 *  must not all light up at once. An href with a query is active only when every
 *  param it names matches the current URL; an href without a query is unaffected
 *  (its pathname match alone decides). */
function hrefSearchMatches(
  href: string | undefined,
  currentSearch: string,
): boolean {
  if (!href) return false;
  const q = href.indexOf("?");
  if (q === -1) return true;
  const wanted = new URLSearchParams(href.slice(q + 1));
  const current = new URLSearchParams(currentSearch);
  for (const [k, v] of wanted) {
    if (current.get(k) !== v) return false;
  }
  return true;
}

/** A leaf/link is active when its pathname is the resolved active path AND its
 *  query (if any) matches the current URL. */
function isHrefActive(
  href: string | undefined,
  activeHref: string | null,
  activeSearch: string,
): boolean {
  return (
    href != null &&
    hrefPath(href) === activeHref &&
    hrefSearchMatches(href, activeSearch)
  );
}

/** Accordion controller: only one expandable sibling open at a time. */
export function useAccordionState(
  items: SidebarItemType[] | undefined,
  activeHref: string | null,
) {
  const activeId = useMemo(
    () =>
      items?.find((it) =>
        it.children?.some((child) => subtreeHasHref(child, activeHref)),
      )?.id ?? null,
    [items, activeHref],
  );

  const [openId, setOpenId] = useState<string | null>(activeId);
  useEffect(() => {
    setOpenId(activeId);
  }, [activeId]);

  const toggle = useCallback(
    (id: string) => setOpenId((prev) => (prev === id ? null : id)),
    [],
  );

  return { openId, toggle };
}

export function SidebarItem({
  item,
  collapsed,
  depth = 0,
  isOpen,
  onToggle,
}: SidebarItemProps) {
  const activeHref = useActiveHref();
  const activeSearch = useActiveSearch();
  const label = useItemLabel();
  const isRoot = depth === 0;
  const hasChildren = item.children && item.children.length > 0;

  const isActive = isHrefActive(item.href, activeHref, activeSearch);
  const isChildActive = hasChildren
    ? item.children!.some((child) => subtreeHasHref(child, activeHref))
    : false;

  const childAccordion = useAccordionState(item.children, activeHref);
  const isExpanded = !!isOpen;
  const showActive = isActive || (hasChildren && isChildActive && !isExpanded);
  const paddingStart = collapsed ? 0 : 12;

  const content = (
    <>
      {item.icon && (
        <span
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded-md transition-all duration-150",
            showActive
              ? "bg-primary text-primary-foreground shadow-sm"
              : isChildActive
                ? "text-primary"
                : "text-neutral-500 group-hover/item:text-foreground",
          )}
        >
          <item.icon className={isRoot ? "size-4.5" : "size-4"} strokeWidth={2} />
        </span>
      )}

      {!collapsed && (
        <motion.span
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], delay: 0.04 }}
          className="flex-1 truncate text-start"
        >
          {label(item)}
        </motion.span>
      )}

      {!collapsed && hasChildren && (
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="shrink-0"
        >
          <ChevronDown
            className={cn(
              "size-3.5 transition-colors",
              showActive || isChildActive ? "text-neutral-500" : "text-neutral-400",
            )}
          />
        </motion.span>
      )}
    </>
  );

  if (collapsed && isRoot) {
    return <CollapsedFlyout item={item} active={showActive || isChildActive} />;
  }

  const sharedClasses = cn(
    "group/item relative flex w-full items-center gap-2.5 rounded-lg text-[13px] font-medium transition-colors duration-150",
    collapsed ? "mx-auto size-9 justify-center px-0" : "h-9 pe-2 ps-3",
    showActive
      ? "bg-neutral-100 text-foreground hover:bg-neutral-100"
      : "text-neutral-600 hover:bg-neutral-100 hover:text-foreground",
  );

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={onToggle}
          className={sharedClasses}
          style={!collapsed ? { paddingInlineStart: paddingStart } : undefined}
        >
          {content}
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div
                className="relative mt-1 flex flex-col gap-0.5"
                style={{ marginInlineStart: 16 }}
              >
                <div
                  className={cn(
                    "absolute inset-y-1 w-px transition-colors",
                    isChildActive ? "bg-neutral-300" : "bg-border",
                  )}
                  style={{ insetInlineStart: -8 }}
                />
                {item.children!.map((child) => (
                  <SidebarItem
                    key={child.id}
                    item={child}
                    collapsed={collapsed}
                    depth={depth + 1}
                    isOpen={childAccordion.openId === child.id}
                    onToggle={() => childAccordion.toggle(child.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={sharedClasses}
        style={!collapsed ? { paddingInlineStart: paddingStart } : undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={sharedClasses}
      style={!collapsed ? { paddingInlineStart: paddingStart } : undefined}
    >
      {content}
    </button>
  );
}

/** Collapsed-mode hover flyout, portaled to <body>, RTL-aware. */
function CollapsedFlyout({
  item,
  active,
}: {
  item: SidebarItemType;
  active: boolean;
}) {
  const label = useItemLabel();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left?: number; right?: number }>({
    top: 0,
  });
  const anchorRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasChildren = !!(item.children && item.children.length > 0);

  const show = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    const el = anchorRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      const rtl = document.documentElement.dir === "rtl";
      const top = Math.max(8, Math.min(r.top, window.innerHeight - 340));
      setPos(
        rtl
          ? { top, right: window.innerWidth - r.left + 8 }
          : { top, left: r.right + 8 },
      );
    }
    setOpen(true);
  };
  const scheduleHide = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  const icon = item.icon ? <item.icon className="size-4.5" strokeWidth={2} /> : null;
  const triggerClasses = cn(
    "group/item relative grid size-9 place-items-center rounded-lg transition-colors duration-150",
    active
      ? "bg-neutral-100 text-primary"
      : "text-neutral-500 hover:bg-neutral-100 hover:text-foreground",
  );

  return (
    <div
      ref={anchorRef}
      className="mx-auto w-fit"
      onMouseEnter={show}
      onMouseLeave={scheduleHide}
      onFocus={show}
      onBlur={scheduleHide}
    >
      {item.href ? (
        <Link href={item.href} className={triggerClasses} aria-label={label(item)}>
          {icon}
        </Link>
      ) : (
        <button type="button" className={triggerClasses} aria-label={label(item)}>
          {icon}
        </button>
      )}

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={{ position: "fixed", top: pos.top, left: pos.left, right: pos.right }}
            onMouseEnter={show}
            onMouseLeave={scheduleHide}
            data-theme={document.documentElement.dataset.theme}
            className="animate-in fade-in-0 zoom-in-95 z-[200] w-56 overflow-hidden rounded-xl border border-border bg-overlay text-foreground shadow-lg duration-100"
          >
            <div className="px-3 py-2 text-[13px] font-semibold text-foreground">
              {label(item)}
            </div>
            {hasChildren && (
              <div className="max-h-[60vh] overflow-y-auto border-t border-border/70 p-1.5">
                <FlyoutTree items={item.children!} />
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

function FlyoutTree({
  items,
  depth = 0,
}: {
  items: SidebarItemType[];
  depth?: number;
}) {
  const activeHref = useActiveHref();
  const activeSearch = useActiveSearch();
  const label = useItemLabel();
  return (
    <>
      {items.map((it) => {
        const hasKids = !!(it.children && it.children.length > 0);
        const active = isHrefActive(it.href, activeHref, activeSearch);
        const pad = 8 + depth * 12;

        if (hasKids) {
          return (
            <div key={it.id} className="mt-1 first:mt-0">
              <div
                className="py-1 pe-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-400"
                style={{ paddingInlineStart: pad }}
              >
                {label(it)}
              </div>
              <FlyoutTree items={it.children!} depth={depth + 1} />
            </div>
          );
        }

        if (it.href) {
          return (
            <Link
              key={it.id}
              href={it.href}
              className={cn(
                "flex items-center gap-2 rounded-md py-1.5 pe-2 text-[13px] transition-colors",
                active
                  ? "bg-neutral-100 font-medium text-foreground"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-foreground",
              )}
              style={{ paddingInlineStart: pad }}
            >
              {it.icon && (
                <it.icon
                  className={cn(
                    "size-4 shrink-0",
                    active ? "text-primary" : "text-neutral-500",
                  )}
                  strokeWidth={2}
                />
              )}
              <span className="truncate">{label(it)}</span>
            </Link>
          );
        }

        return (
          <span
            key={it.id}
            className="block py-1.5 pe-2 text-[13px] text-neutral-500"
            style={{ paddingInlineStart: pad }}
          >
            {label(it)}
          </span>
        );
      })}
    </>
  );
}

function subtreeHasHref(
  item: SidebarItemType,
  activeHref: string | null,
): boolean {
  if (!activeHref) return false;
  if (hrefPath(item.href) === activeHref) return true;
  return item.children?.some((child) => subtreeHasHref(child, activeHref)) ?? false;
}

function hrefPath(href: string | undefined): string | undefined {
  return href?.split(/[?#]/)[0];
}

/** Most-specific-match-wins active href across the whole config. */
export function resolveActiveHref(
  items: SidebarItemType[],
  pathname: string,
): string | null {
  let best: string | null = null;
  const visit = (list: SidebarItemType[]) => {
    for (const it of list) {
      const p = hrefPath(it.href);
      if (p && pathMatches(p, pathname) && (best === null || p.length > best.length)) {
        best = p;
      }
      if (it.children) visit(it.children);
    }
  };
  visit(items);
  return best;
}

function pathMatches(hrefP: string, pathname: string): boolean {
  if (hrefP === pathname) return true;
  if (hrefP === "/") return false;
  return pathname.startsWith(`${hrefP}/`);
}
