"use client";

import { createPortal } from "react-dom";
import { useLinkStatus } from "next/link";
import { useLocale } from "next-intl";

/** Link-owned pending state survives the menu closing, including cold routes.
 * No navigation timer or manual router state that can get stuck after an error.
 */
export function NavigationPending() {
  const { pending } = useLinkStatus();
  const locale = useLocale();
  if (!pending) return null;
  const publicRoot = document.querySelector('[data-site="public"]');
  if (!publicRoot) return null;
  return createPortal(
    <div role="status" className="pointer-events-none fixed inset-x-0 top-16 z-[70] flex items-center justify-center gap-2 border-b border-white/10 bg-zinc-950 px-4 py-2 text-xs text-zinc-300">
      <span aria-hidden="true" className="size-3 animate-spin rounded-full border-2 border-white/20 border-t-cs-teal" />
      {locale === "ar" ? "جارٍ تحميل الصفحة…" : "Loading page…"}
    </div>,
    publicRoot,
  );
}
