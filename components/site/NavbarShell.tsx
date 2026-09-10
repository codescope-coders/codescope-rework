"use client";

import { Link as InternalLink } from "@/i18n/internal-routing";

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
    <header className="fixed top-0 inset-x-0 z-50">
      {/* Keep the filtered paint layer separate from fixed menu descendants.
          Even blur(0px) makes a containing block in Safari/WebKit. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 transition-[background-color,border-color] duration-200"
        style={{
          backgroundColor: scrolled ? "rgba(9,9,11,0.85)" : "transparent",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        }}
      />
      {/* Navigation switches at lg, when all desktop links fit. The logo
          scales down below 360px to leave two full 44px touch controls. */}
      <nav className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-2 md:gap-8">
        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center">
          <CodeScopeLogo className="h-auto w-[132px] min-[360px]:w-[160px] md:w-auto md:h-6" />
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
                  aria-current={isActive ? "page" : undefined}
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
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <LanguageSwitcher />
          {/* Login — ported from a teammate's concurrent change to the OLD
              header ("Login button added", merged 2026-09-05): the door to the
              Follow-up console. A quiet text link, deliberately junior to the
              demo CTA — the header carries one filled button only. */}
          <InternalLink
            href="/login"
            className="hidden lg:inline-flex items-center px-2 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200"
          >
            {loginLabel}
          </InternalLink>
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
