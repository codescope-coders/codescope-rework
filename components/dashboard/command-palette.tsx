"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import {
  filterSidebarConfig,
  type SidebarItem,
} from "@/lib/rbac/permissions";
import { useCan } from "@/lib/rbac/use-permissions";
import { NAV_GROUPS } from "./nav-config";
import { useCommandPalette } from "@/stores/commandPalette";
import { cn } from "@/lib/utils";

interface Cmd {
  id: string;
  label: string;
  href: string;
  icon?: LucideIcon;
}

export function CommandPalette() {
  const t = useTranslations("dash");
  const can = useCan();
  const router = useRouter();
  const { open, query, highlighted, closePalette, setQuery, setHighlighted } =
    useCommandPalette();
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Cmd[] = useMemo(() => {
    const cfg = filterSidebarConfig({ groups: NAV_GROUPS }, can);
    const out: Cmd[] = [];
    const label = (i: SidebarItem) =>
      i.i18nKey && t.has(i.i18nKey) ? t(i.i18nKey) : i.title;
    for (const g of cfg.groups) {
      for (const item of g.items) {
        if (item.href)
          out.push({ id: item.id, label: label(item), href: item.href, icon: item.icon });
        for (const child of item.children ?? []) {
          if (child.href)
            out.push({
              id: child.id,
              label: `${label(item)} · ${label(child)}`,
              href: child.href,
              icon: child.icon,
            });
        }
      }
    }
    return out;
  }, [can, t]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    if (open) {
      const id = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(id);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePalette();
      else if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlighted(Math.min(highlighted + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlighted(Math.max(highlighted - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const c = filtered[highlighted];
        if (c) {
          router.push(c.href);
          closePalette();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, highlighted, filtered, closePalette, setHighlighted, router]);

  if (!open) return null;

  const tf = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 p-4 pt-[12vh]"
      onClick={closePalette}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-overlay shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tf("common.command_placeholder", "ابحث عن صفحة...")}
          className="w-full border-b border-border bg-transparent px-4 py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <div className="scrollbar-thin max-h-80 overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              {tf("common.no_results", "لا توجد نتائج")}
            </div>
          ) : (
            filtered.map((c, i) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.id}
                  type="button"
                  onMouseEnter={() => setHighlighted(i)}
                  onClick={() => {
                    router.push(c.href);
                    closePalette();
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start text-sm transition-colors",
                    i === highlighted
                      ? "bg-primary/12 text-primary"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  {Icon && <Icon className="size-4 shrink-0" />}
                  <span className="truncate">{c.label}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
