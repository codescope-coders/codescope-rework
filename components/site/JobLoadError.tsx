"use client";

import { useTranslations } from "next-intl";

/** A recoverable state when the careers service is unavailable. */
export function JobLoadError({
  onRetry,
  pending,
}: {
  onRetry: () => void;
  pending: boolean;
}) {
  const t = useTranslations("Jobs");
  return (
    <div role="alert" className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-zinc-900/40 px-6 py-10 text-center">
      <h2 className="text-xl font-semibold text-white">{t("errorTitle")}</h2>
      <p className="mt-3 text-base leading-relaxed text-zinc-300">{t("errorBody")}</p>
      <button
        type="button"
        onClick={onRetry}
        disabled={pending}
        className="mt-6 min-h-12 rounded-full border border-cs-teal/30 site-solid-action bg-[#0a1c1a] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#0f2a27] disabled:opacity-60"
      >
        {t(pending ? "retrying" : "retry")}
      </button>
    </div>
  );
}
