"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useTransition, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GlobeHemisphereWestIcon, CaretDownIcon, CheckIcon } from "@phosphor-icons/react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { DURATION, EASE_OUT, isRtlLocale } from "@/lib/motion";

const LOCALES = [
  { code: "en", label: "English", short: "EN" },
  { code: "ar", label: "العربية", short: "AR" },
] as const;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionSafe();
  const rtl = isRtlLocale(locale);

  const current = LOCALES.find((l) => l.code === locale)!;

  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    // Escape closes AND returns focus to the trigger — without the focus
    // restore, keyboard users land on <body> and lose their place. Focus
    // leaving the widget (Tab-away) closes it too.
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    function onFocusOut(e: FocusEvent) {
      if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
        setOpen(false);
      }
    }
    const el = containerRef.current;
    if (open) {
      document.addEventListener("mousedown", onClickOutside);
      document.addEventListener("keydown", onKeyDown);
      el?.addEventListener("focusout", onFocusOut);
    }
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
      el?.removeEventListener("focusout", onFocusOut);
    };
  }, [open]);

  function switchTo(code: string) {
    if (code === locale) { setOpen(false); return; }
    setOpen(false);
    startTransition(() => {
      router.replace(pathname, { locale: code });
    });
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        // A DISCLOSURE, not a menu — so `aria-expanded` alone, and deliberately
        // NO `aria-haspopup`. That attribute promises a `role="menu"` whose
        // items are `role="menuitem"`, and a real menu owes the user arrow-key
        // roaming, Home/End, and a single tab stop. Announcing a menu and then
        // handing back two ordinary buttons is a worse contract than not
        // claiming one: the keyboard user is told to press Down and nothing
        // moves. The popup below is two plain <button>s in the tab order,
        // which is exactly what a disclosure should contain.
        //
        // aria-busy, not disabled: disabling mid-transition drops keyboard
        // focus to <body> the moment a locale switch starts.
        aria-busy={isPending}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-colors duration-150 text-sm font-medium ${isPending ? "opacity-40 pointer-events-none" : ""}`}
      >
        <GlobeHemisphereWestIcon size={15} weight="bold" className="text-zinc-400" />
        <span>{current.short}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: reduced ? 0 : DURATION.fast, ease: EASE_OUT }}
          className="flex items-center text-zinc-500"
        >
          <CaretDownIcon size={11} weight="bold" />
        </motion.span>
      </button>

      {/* Dropdown.

          `end-0`, not `right-0`: the menu aligns with the trigger's END edge
          in reading order. Pinned to the physical right it stayed anchored to
          the trigger's START under RTL and hung outward, toward the viewport
          edge, instead of back over the page. `transform-origin` has no
          logical keyword, so the corner it grows from is resolved from the
          locale — same approach as the business-engine rules. */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: reduced ? 0 : DURATION.instant, ease: EASE_OUT }}
            style={{ transformOrigin: rtl ? "top left" : "top right" }}
            className="absolute end-0 top-full mt-2 w-36 rounded-xl border border-white/[0.08] bg-zinc-950/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden z-50"
          >
            {LOCALES.map(({ code, label }) => {
              const isActive = locale === code;
              return (
                <button
                  key={code}
                  onClick={() => switchTo(code)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors duration-100 ${
                    isActive
                      ? "text-white bg-white/[0.06]"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <span>{label}</span>
                  {isActive && <CheckIcon size={13} weight="bold" className="text-cs-teal-glow" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
