import type { Tone } from "@/lib/dashboard/constants";
import type { WebsiteRequestStatus } from "@/services/website-requests";

/**
 * Enum ordering + tones for this module.
 *
 * These normally live in `lib/dashboard/constants.ts` beside every other
 * dashboard enum, and belong there the moment a second module renders a website
 * request. They are module-local for now because this phase is additive-only
 * against the existing dashboard — see `website-requests.i18n.ts` for the same
 * reasoning about labels.
 *
 * They are NOT in `page.tsx`: Next validates the exports of a route module, so
 * a page file is the wrong home for anything the modal has to import.
 */

/** Ordered as the request travels, so the tab strip reads as a funnel. */
export const REQUEST_STATUSES: WebsiteRequestStatus[] = [
  "NEW",
  "CONTACTED",
  "CONVERTED",
  "CLOSED",
];

/** `NEW` is warning-toned on purpose: it is the only status that means someone
 *  outside the company is waiting on us. */
export const REQUEST_STATUS_TONE: Record<WebsiteRequestStatus, Tone> = {
  NEW: "warning",
  CONTACTED: "info",
  CONVERTED: "success",
  CLOSED: "neutral",
};

/** Mirrors `PACKAGE_TONE` in `lib/dashboard/constants.ts` so a tier reads the
 *  same colour here as it does on the pipeline board. */
export const REQUEST_PACKAGE_TONE: Record<string, Tone> = {
  CHARTER: "neutral",
  STANDARD: "teal",
  ADVANCED: "primary",
};

/** ISO timestamp → `2026-09-05 · 14:32`. Latin digits in both locales, like the
 *  rest of this dashboard (see `lib/dashboard/format.ts`). */
export function fmtReceived(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} · ${p(d.getHours())}:${p(d.getMinutes())}`;
}
