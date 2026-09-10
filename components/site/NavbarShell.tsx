"use client";

import { useScroll, useMotionValueEvent } from "motion/react";
import { useState } from "react";
import { Link } from "@/i18n/routing";
import { CodeScopeLogo } from "@/components/site/CodeScopeLogo";
import LanguageSwitcher from "@/components/site/LanguageSwitcher";
import MobileMenu from "@/components/site/MobileMenu";
import { PublicThemeToggle } from "./PublicTheme";
import { cancelPageNavigation } from "@/lib/menu-navigation";

type NavItem = { href: string; label: string };

interface Props {
  loginLabel: string;
  navItems: NavItem[];
  ctaLabel: string;
}

export function NavbarShell({ navItems, ctaLabel, loginLabel }: Props) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

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
          backgroundColor: scrolled ? "var(--site-header-ground)" : "transparent",
          borderBottom: scrolled ? "1px solid var(--site-line)" : "1px solid transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        }}
      />
      {/* One menu on every screen. Compact logo sizing preserves touch targets. */}
      <nav className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-2 md:gap-8">
        {/* Logo */}
        <Link href="/" className="site-brand-link shrink-0 flex items-center" onNavigate={() => {
          cancelPageNavigation();
          const menu = document.querySelector<HTMLDetailsElement>(".site-menu-toggle");
          if (menu) menu.open = false;
        }}>
          <CodeScopeLogo className="h-auto w-[112px] min-[360px]:w-[140px] min-[480px]:w-[160px] md:w-auto md:h-6" />
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-5 shrink-0">
          <PublicThemeToggle />
          <LanguageSwitcher />
          <MobileMenu items={navItems} ctaLabel={ctaLabel} loginLabel={loginLabel} />
        </div>
      </nav>
    </header>
  );
}
