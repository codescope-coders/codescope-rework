import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export type supportedlocales = "en" | "ar";

/**
 * The locale never appears in the URL.
 *
 * ── Why `never` and not `as-needed` ─────────────────────────────────────────
 * Under `as-needed` the default locale is bare (`/tourscope`) and every other
 * one carries a prefix (`/ar/tourscope`), which makes the same page two URLs
 * and puts the site's language in the address bar. `never` keeps ONE URL per
 * page and moves the locale into the `NEXT_LOCALE` cookie, which the
 * middleware reads on each request and rewrites to the internal
 * `/[locale]/…` segment — so `app/[locale]/` keeps working untouched and
 * `params.locale` is still populated in every layout and page.
 *
 * ⚠️ Existing `/ar/...` links are not broken: next-intl's middleware redirects
 * a prefixed URL to its bare form and sets the cookie from the prefix, so an
 * old bookmark still lands on the right page in the right language.
 *
 * ⚠️ Cost, stated once: with no per-language URL there is nothing for a search
 * engine to index separately — an Arabic page cannot rank on its own and
 * `hreflang` has no second URL to point at. Nothing in the repo emits a
 * sitemap, canonical or `alternates` today, so this changes no existing SEO
 * wiring; it does close that door until a locale is expressible in a URL
 * again.
 */
export const routing = defineRouting({
  locales: ["en", "ar"] as supportedlocales[],
  defaultLocale: "en",
  localePrefix: {
    mode: "never",
  },
});

/**
 * The cookie next-intl resolves the locale from. Named here rather than
 * inlined at the call sites, because the switcher writes it BY HAND (see
 * `useSwitchLocale`) and a drifted name would silently stop switching the
 * language while still looking like it worked.
 */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const { Link, usePathname, redirect, useRouter } =
  createNavigation(routing);
