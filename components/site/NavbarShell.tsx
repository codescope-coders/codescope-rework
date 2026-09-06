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
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center">
          <CodeScopeLogo className="h-6 w-auto" />
        </Link>

        {/* Desktop nav links with active indicator */}
        <ul className="hidden md:flex items-center gap-6 flex-1 justify-center">
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
            className="hidden md:inline-flex items-center px-2 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200"
          >
            {loginLabel}
          </Link>
          {/* "Request a demo" is a demo request, so it goes to the flow built
              for one. The nav's own Contact link still points at /contact. */}
          <Link
            href="/get-started"
            className="hidden md:inline-flex items-center px-4 py-2 text-sm font-semibold bg-cs-teal text-white rounded-lg hover:bg-cs-teal-hover transition-colors duration-200"
          >
            {ctaLabel}
          </Link>
          <MobileMenu items={navItems} ctaLabel={ctaLabel} loginLabel={loginLabel} />
        </div>
      </nav>
    </header>
  );
}
