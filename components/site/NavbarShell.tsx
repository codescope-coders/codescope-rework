"use client";

import { useScroll, useMotionValueEvent, motion } from "motion/react";
import { useState } from "react";
import { usePathname } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { CodeScopeLogo } from "@/components/site/CodeScopeLogo";
import Image from "next/image";
import LanguageSwitcher from "@/components/site/LanguageSwitcher";
import MobileMenu from "@/components/site/MobileMenu";
import { PRODUCT_NAV_HREF, productPillClass } from "@/lib/nav-product-pill";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { StarfieldButton } from "@/components/site/StarfieldButton";

type NavItem = { href: string; label: string };

interface Props {
  loginLabel: string;
  navItems: NavItem[];
  ctaLabel: string;
}

export function NavbarShell({ navItems, ctaLabel, loginLabel }: Props) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const reduced = useReducedMotionSafe();

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Functional, and returning the SAME value when nothing changed: this fires
    // on every scroll frame, and `setScrolled(latest > 40)` re-entered React's
    // scheduler ~60 times a second to store a boolean that flips twice a page.
    const next = latest > 40;
    setScrolled((prev) => (prev === next ? prev : next));
  });

  return (
    <header
      // Only the two interpolatable properties transition. `transition-all` also
      // named `backdrop-filter`, which cannot interpolate from the keyword
      // `none` — the browser simply snapped it, so the blur popped in while the
      // background faded. The filter is now always declared, at 0px when idle,
      // which IS interpolatable.
      className="fixed top-0 inset-x-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300"
      style={{
        backgroundColor: scrolled ? "rgba(9,9,11,0.85)" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "blur(0px) saturate(100%)",
        WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "blur(0px) saturate(100%)",
      }}
    >
      {/* ⚠️ Two DIFFERENT breakpoints live on this bar, deliberately.
          The gutter, the gap and the wordmark switch at `md` — they answer
          "is this bar cramped?", and at 768px it is not. The nav MODE (the
          link list, Login, the CTA, and `MobileMenu`'s own trigger and panel)
          switches at `lg`, because it answers a different question: "does the
          desktop nav fit?" Measured, it does not until 983px — at 768 the row
          needed 983 and pushed "Request a demo" to x=834, off the right edge of
          every iPad in portrait, which is the same defect the CTA wrapper below
          documents, one breakpoint up. Keep the two apart; collapsing them onto
          one number re-cramps the phone bar or re-breaks the tablet.

          ⚠️ The gutter and the gap are TIGHTER below `md`, and that is
          load-bearing rather than cosmetic. The wordmark alone measures 194px
          at `h-6`; with `px-6` and `gap-8` the bar's content came to 405px,
          which does not fit a 360px Android or a 375px iPhone SE — the trailing
          control (the menu button) simply sat outside the viewport. Measured at
          360px: 194 + 32 + 131 + 48 = 405 against 360 available.

          `px-4`/`gap-4` and a `h-5` wordmark bring it to 341px, which clears a
          360px screen with 19px to spare and is unchanged from `md` upward.
          Anything narrower than ~340px will overflow again; re-measure before
          adding a third control to this row. */}
      <nav className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center">
          <CodeScopeLogo className="h-5 md:h-6 w-auto" />
        </Link>

        {/* Desktop nav links with active indicator */}
        <ul className="hidden lg:flex items-center gap-6 flex-1 justify-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isProduct = item.href === PRODUCT_NAV_HREF;

            // TourScope reads as a pill (see `lib/nav-product-pill.ts`) and
            // owns its own current-page state — the purple ground. The sliding
            // teal hairline stays the mechanism for every OTHER item; running
            // it under the pill as well would put a teal underline on a purple
            // chip, which reads as two indicators disagreeing.
            if (isProduct) {
              return (
                <li key={item.href} className="relative">
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`group/pill ${productPillClass(isActive, "desktop")}`}
                  >
                    {/* The wordmark, not the word (founder, 2026-09-06) — the
                        pill frames the product's own mark. `alt` carries the
                        name so the link still announces as "TourScope"; height
                        pinned to the neighbours' cap height so the nav rhythm
                        doesn't move. */}
                    <Image
                      src="/Branding/tourscope.svg"
                      alt={item.label}
                      width={507}
                      height={54}
                      className="h-[11px] w-auto brightness-0 invert transition-[filter] duration-300 group-hover/pill:brightness-100 group-hover/pill:invert-0"
                    />
                  </Link>
                </li>
              );
            }

            return (
              <li key={item.href} className="relative">
                <Link
                  href={item.href}
                  className={`text-sm transition-colors duration-200 ${
                    isActive ? "text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-0.5 inset-x-0 h-px bg-cs-teal"
                    // The indicator slides between nav items on every route
                    // change; under reduced motion it simply appears under the
                    // active one.
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 380, damping: 30 }
                    }
                  />
                )}
              </li>
            );
          })}
        </ul>

        {/* Right controls */}
        <div className="flex items-center gap-3 shrink-0">
          <LanguageSwitcher />
          {/* Login — ported from a teammate's concurrent change to the OLD
              header ("Login button added", merged 2026-09-05): the door to the
              Follow-up console. A quiet text link, deliberately junior to the
              demo CTA — the header carries one filled button only. */}
          <Link
            href="/login"
            className="hidden lg:inline-flex items-center px-2 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200"
          >
            {loginLabel}
          </Link>
          {/* "Request a demo" is a demo request, so it goes to the flow built
              for one. The nav's own Contact link still points at /contact. */}
          {/* The header CTA carries the same treatment as the page CTAs. It is
              the smallest button that gets it — at 36px tall the field is only
              five cells deep — but it is also the most-seen button on the site,
              and leaving it flat made the header read as a different design
              system from everything under it. */}
          {/* ⚠️ The responsive visibility lives on THIS wrapper, never on the
              StarfieldButton's own `className`.

              `StarfieldButton` hardcodes `relative inline-flex` on its host and
              appends the caller's classes to that same string, so a
              caller-supplied `hidden` collides with an `inline-flex` of equal
              specificity — and Tailwind emits `.inline-flex` AFTER `.hidden`,
              so the later rule wins and the element is never hidden at all.

              Measured at a 390px viewport before this wrapper existed: the CTA
              computed `display: flex`, ran 103px past the right edge, and
              shoved the `lg:hidden` hamburger to x=505 — 115px outside the
              viewport. The mobile menu was in the DOM, correct, and physically
              unreachable, so the site had no navigation on a phone. A wrapper
              carries exactly one display utility per breakpoint, so there is
              nothing for the emission order to decide. */}
          <span className="hidden lg:inline-flex">
            <StarfieldButton variant="primary">
              <Link
                href="/get-started"
                className="inline-flex items-center px-5 py-2 text-sm font-semibold bg-[#0a1c1a] text-white rounded-full hover:bg-[#0f2a27] transition-colors duration-200"
              >
                {ctaLabel}
              </Link>
            </StarfieldButton>
          </span>
          <MobileMenu items={navItems} ctaLabel={ctaLabel} loginLabel={loginLabel} />
        </div>
      </nav>
    </header>
  );
}
