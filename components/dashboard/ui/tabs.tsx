"use client";

import { cn } from "@/lib/utils";

export interface SubTab {
  id: string;
  label: React.ReactNode;
}

/** Geist-style segmented control (finance sub-tabs, status filters) — a
 *  neutral track with an elevated active segment. */
export function SubTabs({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: SubTab[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex max-w-full flex-wrap gap-1 rounded-xl border border-border bg-neutral-50 p-1",
        className,
      )}
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={cn(
            "rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-colors",
            value === t.id
              ? "bg-background text-foreground shadow-sm ring-1 ring-border"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
