import { defineRouting } from "next-intl/routing";
export type supportedlocales = "en" | "ar";
export const LOCALE_COOKIE = "NEXT_LOCALE";
// Public locale is URL-driven; dashboard language remains a cookie preference.
export const routing = defineRouting({
  locales: ["en", "ar"] as supportedlocales[], defaultLocale: "en",
  localePrefix: "as-needed", localeDetection: false,
  alternateLinks: false, // Page metadata owns reciprocal hreflang.
});
export const internalRouting = defineRouting({
  locales: ["en", "ar"], defaultLocale: "en", localePrefix: "never",
});
