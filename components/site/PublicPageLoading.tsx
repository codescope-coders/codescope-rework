"use client";

import { useLocale } from "next-intl";

/** Prefetchable route fallback keeps the header responsive while a page renders. */
export default function PublicPageLoading() {
  const locale = useLocale();
  return (
    <div className="mx-auto min-h-[65dvh] max-w-7xl px-6 pb-16 pt-28" role="status" aria-live="polite">
      <p className="mb-8 flex items-center gap-3 text-sm text-zinc-400">
        <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-white/15 border-t-cs-teal" />
        {locale === "ar" ? "جارٍ تحميل الصفحة…" : "Loading page…"}
      </p>
      <div aria-hidden="true" className="space-y-4">
        <div className="h-10 w-3/4 max-w-xl rounded-lg bg-white/[0.06]" />
        <div className="h-4 w-full max-w-2xl rounded bg-white/[0.04]" />
        <div className="h-4 w-2/3 max-w-lg rounded bg-white/[0.04]" />
      </div>
    </div>
  );
}
