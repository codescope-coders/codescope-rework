"use client";

import { useLocale } from "next-intl";

/**
 * Pick the active-language slice of a co-located bilingual dictionary. Each
 * dashboard module ships its own `{ en, ar }` dict and reads it with this hook,
 * so module strings stay local to the module (no contention on the shared
 * next-intl message files). The shell keeps using next-intl for nav/common/roles.
 */
export function useDict<T>(dict: { en: T; ar: T }): T {
  const locale = useLocale();
  return locale === "ar" ? dict.ar : dict.en;
}
