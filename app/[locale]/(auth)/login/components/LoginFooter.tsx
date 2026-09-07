"use client";

import { useTranslations } from "next-intl";
import { useSwitchLocale } from "@/lib/useSwitchLocale";
import { cn } from "@/lib/utils";

const LANGS: { code: "en" | "ar"; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
];

export function LoginFooter() {
  const t = useTranslations("auth");
  // Same locale switch the marketing header uses — a cookie write plus a
  // server refresh, so the URL stays bare and the page does not jump.
  const { switchLocale, isPending, activeLocale: locale } = useSwitchLocale();

  const setLang = (code: "en" | "ar") => switchLocale(code);

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-center text-xs text-subtitle-color sm:text-start">
        {t("copyright")}
      </p>

      <div className="flex shrink-0 items-center gap-1">
        {LANGS.map((l, i) => (
          <span key={l.code} className="flex items-center gap-1">
            {i > 0 && (
              <span className="text-border" aria-hidden>
                ·
              </span>
            )}
            <button
              type="button"
              disabled={isPending}
              onClick={() => setLang(l.code)}
              className={cn(
                "cursor-pointer rounded-md px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50",
                locale === l.code
                  ? "text-primary"
                  : "text-subtitle-color hover:text-foreground",
              )}
            >
              {l.label}
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
