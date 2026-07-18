import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/dashboard/constants";

/** Each tone: a soft-tinted pill (bg + saturated text + hairline inset ring) led
 *  by a solid status dot — whitelabel-console's status colour system. Dark-mode
 *  aware (the scales invert so bg-*-50 / text-*-700 keep contrast). */
export const STATUS_TONE: Record<Tone, { dot: string; pill: string }> = {
  neutral: { dot: "bg-neutral-400", pill: "bg-neutral-100 text-neutral-600 ring-neutral-500/15" },
  primary: { dot: "bg-primary-500", pill: "bg-primary-50 text-primary-700 ring-primary-600/20" },
  teal: { dot: "bg-teal-500", pill: "bg-teal-50 text-teal-700 ring-teal-600/20" },
  success: { dot: "bg-success-500", pill: "bg-success-50 text-success-700 ring-success-600/20" },
  warning: { dot: "bg-warning-500", pill: "bg-warning-50 text-warning-700 ring-warning-600/25" },
  info: { dot: "bg-info-500", pill: "bg-info-50 text-info-700 ring-info-600/20" },
  danger: { dot: "bg-destructive-500", pill: "bg-destructive-50 text-destructive-700 ring-destructive-600/20" },
};

/** Retained for barrel compatibility — the pill classes per tone. */
export const TONE_CLASSES: Record<Tone, string> = {
  neutral: STATUS_TONE.neutral.pill,
  primary: STATUS_TONE.primary.pill,
  teal: STATUS_TONE.teal.pill,
  success: STATUS_TONE.success.pill,
  warning: STATUS_TONE.warning.pill,
  info: STATUS_TONE.info.pill,
  danger: STATUS_TONE.danger.pill,
};

export function StatusBadge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  const style = STATUS_TONE[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full py-0.5 pe-2 ps-1.5 text-[11px] font-semibold ring-1 ring-inset",
        style.pill,
        className,
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", style.dot)} />
      {children}
    </span>
  );
}
