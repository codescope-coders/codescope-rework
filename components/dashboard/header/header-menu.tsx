"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight header dropdown matching whitelabel-console's DropdownMenu look
 * (rounded panel, hairline border, soft shadow) without the @base-ui dependency.
 * Closes on outside-click / Escape. The panel is in-flow (inherits the shell's
 * [data-theme]).
 */
export function HeaderMenu({
  trigger,
  children,
  width = 240,
  align = "end",
  className,
}: {
  trigger: (state: { open: boolean; toggle: () => void }) => ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  width?: number;
  align?: "start" | "end";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => setOpen((o) => !o);
  const close = () => setOpen(false);

  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle })}
      {open && (
        <div
          style={{ width }}
          className={cn(
            "animate-in fade-in-0 zoom-in-95 absolute top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-border bg-overlay text-foreground shadow-[0_12px_32px_-8px_rgba(17,17,17,0.22)] duration-100",
            align === "end" ? "end-0" : "start-0",
            className,
          )}
        >
          {typeof children === "function" ? children(close) : children}
        </div>
      )}
    </div>
  );
}
