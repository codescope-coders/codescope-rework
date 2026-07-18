/**
 * Formatting + date helpers for the Follow-up dashboard. Pure and isomorphic.
 * Mirrors the source prototype's utilities (toEnDigits / fmtMoney / month keys).
 */

export type Currency = "IQD" | "USD";
export type Locale = "en" | "ar";

/** Normalize Arabic-Indic (٠-٩) and Persian (۰-۹) digits to Latin (0-9). */
export function toEnDigits(str: string): string {
  if (typeof str !== "string") return str;
  const map: Record<string, string> = {
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
    "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
    "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
    "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
  };
  return str.replace(/[٠-٩۰-۹]/g, (d) => map[d] || d);
}

const CURRENCY_SYMBOL: Record<Currency, { ar: string; en: string }> = {
  IQD: { ar: "د.ع", en: "IQD" },
  USD: { ar: "$", en: "$" },
};

/** `$1,234` for USD; `1,234 د.ع` / `1,234 IQD` for IQD. Digits stay Latin. */
export function fmtMoney(
  amount: number | string | null | undefined,
  currency: Currency = "IQD",
  locale: Locale = "ar",
): string {
  const n = Number(amount || 0).toLocaleString("en-US");
  const sym = CURRENCY_SYMBOL[currency]?.[locale] ?? CURRENCY_SYMBOL[currency]?.ar;
  return currency === "USD" ? `${sym}${n}` : `${n} ${sym}`;
}

/** Plain grouped number (no currency), always Latin digits. */
export function fmtNumber(amount: number | string | null | undefined): string {
  return Number(amount || 0).toLocaleString("en-US");
}

/** Local calendar date as YYYY-MM-DD (avoids the UTC off-by-one of toISOString). */
export function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function currentMonthKey(): string {
  return todayStr().slice(0, 7);
}

/** Whole days from today to `dateStr` (negative = past). null if no date. */
export function daysUntil(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / (24 * 3600 * 1000));
}

/** Inclusive day count for a leave range (min 1). */
export function leaveDays(start?: string | null, end?: string | null): number {
  if (!start || !end) return 0;
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  return Math.max(1, Math.round((e.getTime() - s.getTime()) / (24 * 3600 * 1000)) + 1);
}

const MONTHS: Record<Locale, string[]> = {
  ar: [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
  ],
  en: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
};

/** "يناير 2026" / "January 2026" from a "YYYY-MM" key. */
export function monthLabel(key: string | null | undefined, locale: Locale = "ar"): string {
  if (!key) return "";
  const [y, m] = key.split("-");
  return `${MONTHS[locale][Number(m) - 1] || ""} ${y}`.trim();
}

/** Net pay for a payroll sheet item. */
export function netPay(item: {
  salary: number | string;
  deduction?: number | string | null;
  bonus?: number | string | null;
}): number {
  return Number(item.salary || 0) - Number(item.deduction || 0) + Number(item.bonus || 0);
}
