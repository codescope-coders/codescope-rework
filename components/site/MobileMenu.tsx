"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { List, X } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import Image from "next/image";
import { PRODUCT_NAV_HREF, productPillClass } from "@/lib/nav-product-pill";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { pauseSmoothScroll, resumeSmoothScroll } from "@/lib/lenis";
import { DURATION, EASE, EASE_OUT, STAGGER } from "@/lib/motion";

type NavItem = { href: string; label: string };

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Opacity only — no `scale`. The panel is a full-screen `backdrop-blur-xl`
// surface, and scaling it forces the browser to re-sample the blur of
// everything behind it on every frame of the open and close: the most expensive
// thing on the page, animated, on the device least able to afford it. The
// children's y-stagger already reads as the menu assembling.
const overlay = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: DURATION.fast,
      ease: EASE_OUT,
      when: "beforeChildren",
      staggerChildren: STAGGER.tight,
    },
  },
  exit: { opacity: 0, transition: { duration: 0.18, ease: "easeIn" as const } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.fast, ease: EASE } },
  exit: { opacity: 0, y: 8 },
};

export default function MobileMenu({ items, ctaLabel, loginLabel }: { items: NavItem[]; ctaLabel: string; loginLabel: string }) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotionSafe();
  const t = useTranslations("Nav");
  // Only the product pill reads this — the plain rows carry no active state in
  // this menu, and adding one to them is a separate design decision.
  const pathname = usePathname();
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    // Lock the page behind the overlay. Both halves are needed: Lenis animates
    // the window itself and ignores `overflow: hidden`, and under reduced
    // motion Lenis is never mounted so only the CSS lock applies.
    pauseSmoothScroll();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Captured now: by cleanup time the ref may already point elsewhere.
    const trigger = triggerRef.current;

    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;

      // Trap: the overlay covers the page, so Tab must not walk into the
      // content behind it.
      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      resumeSmoothScroll();
      // Send focus back where it came from, so closing with Escape doesn't
      // drop the caret at the top of the document.
      trigger?.focus();
    };
  }, [open]);

  const navLinks = items.map((navItem) => {
    // TourScope gets the same product pill as the desktop nav. The ROW keeps
    // its height, divider and pitch — the pill is the label, not the row —
    // because a full-width purple bar in a list of plain links would read as a
    // second CTA rather than as "this one is the product".
    if (navItem.href === PRODUCT_NAV_HREF) {
      const isActive = pathname === navItem.href;
      return (
        <Link
          key={navItem.href}
          href={navItem.href}
          onClick={() => setOpen(false)}
          aria-current={isActive ? "page" : undefined}
          // `py-[9px]`, not the neighbours' `py-4`: the pill is 42px tall
          // (28px line + 2×6px padding + 2×1px border) against a plain row's
          // 28px line, so keeping `py-4` here made this row 74px in a list of
          // 60px rows — a visible stutter in the menu's pitch. 2×9 + 42 = 60
          // restores it exactly. Measured, not guessed; re-measure if the
          // pill's padding or the row's type size changes.
          className="flex py-[9px] border-b border-white/5 last:border-none"
        >
          <span className={`group/pill ${productPillClass(isActive, "mobile")}`}>
            {/* Same wordmark-in-pill as the desktop nav — see NavbarShell. */}
            <Image
              src="/Branding/tourscope.svg"
              alt={navItem.label}
              width={507}
              height={54}
              className="h-[11px] w-auto brightness-0 invert transition-[filter] duration-300 group-hover/pill:brightness-100 group-hover/pill:invert-0"
            />
          </span>
        </Link>
      );
    }

    return (
      <Link
        key={navItem.href}
        href={navItem.href}
        onClick={() => setOpen(false)}
        className="block text-zinc-300 hover:text-white py-4 border-b border-white/5 text-xl font-medium transition-colors last:border-none"
      >
        {navItem.label}
      </Link>
    );
  });

  const cta = (
    // Same target as the desktop nav CTA in NavbarShell — the two must not
    // drift, or the same button means two different things per viewport.
    <Link
      href="/get-started"
      onClick={() => setOpen(false)}
      className="w-full text-center py-3.5 px-6 bg-cs-teal text-white text-sm font-semibold rounded-xl hover:bg-cs-teal-hover transition-colors block"
    >
      {ctaLabel}
    </Link>
  );

  // Login — same port as the desktop link (see NavbarShell): quiet, under the
  // CTA, closing the menu on tap like every other item.
  const loginCta = (
    <Link
      href="/login"
      onClick={() => setOpen(false)}
      className="w-full text-center py-3 px-6 text-sm font-medium text-zinc-400 hover:text-white transition-colors block"
    >
      {loginLabel}
    </Link>
  );

  const panelBody = (
    <nav className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-1">
      {reduced
        ? navLinks.map((link) => <div key={link.key}>{link}</div>)
        : navLinks.map((link) => (
            <motion.div key={link.key} variants={item}>
              {link}
            </motion.div>
          ))}
      {reduced ? (
        <div className="mt-6">{cta}{loginCta}</div>
      ) : (
        <motion.div variants={item} className="mt-6">
          {cta}
          {loginCta}
        </motion.div>
      )}
    </nav>
  );

  // ⚠️ `h-[calc(100dvh-4rem)]`, NOT `bottom-0`.
  //
  // This panel is `position: fixed`, but it is NOT laid out against the
  // viewport: `NavbarShell`'s `<header>` always declares a `backdrop-filter`
  // (at `blur(0px)` when idle, so the property can interpolate on scroll
  // instead of snapping), and any `backdrop-filter` other than `none` makes an
  // element the containing block for its fixed descendants. So `top-16` and
  // `bottom-0` both resolved against the header's own 64px box and the panel
  // computed to `height: 0` — open, focus-trapped, body scroll locked, and
  // invisible. Measured on both this build and the design source it was ported
  // from: `getBoundingClientRect().height === 0` at every width below `md`,
  // i.e. the mobile menu could never be seen on a phone.
  //
  // Pinning the height sidesteps the containing block entirely while leaving
  // the design untouched: `top-16` already puts the panel's top edge at the
  // header's bottom (the header sits at viewport y=0), and `inset-x-0` is
  // correct because the header is full-bleed. 4rem is the same `h-16` the
  // header and `top-16` already assume — one number, three call sites, so it
  // stays consistent if the bar is ever resized.
  const panelClassName =
    "md:hidden fixed top-16 inset-x-0 h-[calc(100dvh-4rem)] bg-zinc-950/98 backdrop-blur-xl z-40 overflow-y-auto";

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
        aria-label={open ? t("closeMenu") : t("openMenu")}
        aria-expanded={open}
        aria-controls={panelId}
      >
        {reduced ? (
          open ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: DURATION.instant }}>
                <X size={20} weight="bold" />
              </motion.span>
            ) : (
              <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: DURATION.instant }}>
                <List size={20} weight="bold" />
              </motion.span>
            )}
          </AnimatePresence>
        )}
      </button>

      {reduced ? (
        // Reduced motion: the panel is simply there, or not.
        open && (
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label={t("menuLabel")}
            data-lenis-prevent
            className={panelClassName}
          >
            {panelBody}
          </div>
        )
      ) : (
        <AnimatePresence>
          {open && (
            <motion.div
              key="mobile-menu"
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-label={t("menuLabel")}
              // The panel outlives `open` by the length of its exit animation.
              // The focus trap is torn down the instant `open` flips, so for
              // those ~180ms a Tab or a screen-reader cursor could walk into a
              // closing dialog that still covers the page. `inert` takes it out
              // of the accessibility tree and the tab order for exactly that
              // window.
              inert={!open}
              // Lenis leaves elements marked this way alone, so a long menu can
              // still be scrolled natively while the page behind it is pinned.
              data-lenis-prevent
              variants={overlay}
              initial="hidden"
              animate="show"
              exit="exit"
              className={panelClassName}
            >
              {panelBody}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
}
