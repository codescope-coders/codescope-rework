import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/dashboard/constants";

// Semantic icon chips retain their meaning in both dashboard themes.
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
      onKeyDown={interactive ? (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      } : undefined}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={cn(
        "surface-raised relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border p-4 sm:p-5 transition-colors duration-200",
        interactive &&
          "cursor-pointer hover:border-primary/40 hover:bg-primary/[0.03] focus-visible:outline-none",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-lg",
            CHIP[tone],
          )}
        >
          {Icon ? (
            <Icon className="size-4" />
          ) : (
            <span className="size-1.5 rounded-full bg-current" />
          )}
        </span>
        <span className="min-w-0 text-xs font-medium leading-relaxed text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="break-words text-[clamp(1rem,5vw,1.5rem)] font-semibold leading-tight tracking-tight sm:text-3xl text-foreground tabular-nums">
        {value}
      </div>
    </div>
  );
}
