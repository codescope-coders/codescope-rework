import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/dashboard/constants";

// Icon-chip tones mirror whitelabel-console's KpiCard: solid tint + saturated
// glyph. The scales invert per theme, so the chip stays a dark tint with a
// bright glyph in dark mode.
const CHIP: Record<Tone, string> = {
  neutral: "bg-neutral-100 text-neutral-500",
  primary: "bg-primary/10 text-primary",
  teal: "bg-teal-100 text-teal-700",
  success: "bg-success-100 text-success-700",
  warning: "bg-warning-100 text-warning-700",
  info: "bg-info-100 text-info-600",
  danger: "bg-destructive-100 text-destructive-600",
};

export function StatCard({
  value,
  label,
  tone = "primary",
  icon: Icon,
  onClick,
  className,
}: {
  value: React.ReactNode;
  label: React.ReactNode;
  tone?: Tone;
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
}) {
  const interactive = Boolean(onClick);
  return (
    <div
      onClick={onClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={cn(
        "surface-raised relative flex flex-col gap-2 overflow-hidden rounded-xl border border-border p-3.5 transition-all duration-200",
        interactive &&
          "cursor-pointer hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded-md",
            CHIP[tone],
          )}
        >
          {Icon ? (
            <Icon className="size-3.5" />
          ) : (
            <span className="size-1.5 rounded-full bg-current" />
          )}
        </span>
        <span className="truncate text-[10.5px] font-semibold uppercase tracking-wider text-neutral-500">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold leading-none tracking-tight text-foreground tabular-nums">
        {value}
      </div>
    </div>
  );
}
