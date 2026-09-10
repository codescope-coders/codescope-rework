"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/routing";
import { Link as InternalLink } from "@/i18n/internal-routing";
import { PRODUCT_NAV_HREF } from "@/lib/nav-product-pill";
import { pauseSmoothScroll, resumeSmoothScroll } from "@/lib/lenis";
import { NavigationPending } from "./NavigationPending";
import "./mobile-menu.css";

type NavItem = { href: string; label: string };
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex="0"]';

export default function MobileMenu({ items, ctaLabel, loginLabel }: {
  items: NavItem[];
  ctaLabel: string;
  loginLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    pauseSmoothScroll();
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", onDesktop);
    const content = document.querySelector<HTMLElement>('[data-site="public"] main');
    const footer = document.querySelector<HTMLElement>('[data-site="public"] footer');
    const previousInert = [content?.inert, footer?.inert];
    if (content) content.inert = true;
    if (footer) footer.inert = true;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const trigger = triggerRef.current;

    // Touch users keep their place; keyboard users start inside the dialog.
    // Prevent focus from scrolling the page or forcing the menu to its first row.
    if (trigger?.matches(":focus-visible")) {
      panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true });
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes?.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === trigger)) {
        event.preventDefault();
        (active === trigger ? last : trigger)?.focus({ preventScroll: true });
      } else if (!event.shiftKey && (active === last || active === trigger)) {
        event.preventDefault();
        (active === last ? trigger : first)?.focus({ preventScroll: true });
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onDesktop);
      if (content) content.inert = previousInert[0] ?? false;
      if (footer) footer.inert = previousInert[1] ?? false;
      document.body.style.overflow = previousOverflow;
      resumeSmoothScroll();
      trigger?.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="site-menu-trigger lg:hidden inline-flex h-11 w-11 shrink-0 items-center justify-center p-2 text-zinc-400 hover:text-white"
        aria-label={open ? t("closeMenu") : t("openMenu")}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span aria-hidden="true" className="site-menu-glyph">
          <span /><span /><span />
        </span>
      </button>

      {/* Keep the small menu tree mounted: taps only change CSS state, without
          mounting Motion controllers or waiting for an exit lifecycle. */}
      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-modal={open ? true : undefined}
        aria-label={t("menuLabel")}
        aria-hidden={!open}
        inert={!open}
        data-open={open}
        data-lenis-prevent
        className="site-menu-panel lg:hidden fixed top-16 inset-x-0 bottom-0 z-40 overflow-y-auto overscroll-contain bg-zinc-950"
      >
        <nav className="site-mobile-menu-body max-w-2xl mx-auto px-6 py-4 sm:py-8 flex flex-col gap-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={pathname === item.href ? "page" : undefined}
              className={`site-menu-row flex items-center min-h-14 py-4 sm:py-5 border-b border-white/5 text-2xl font-medium transition-colors ${pathname === item.href ? "text-cs-teal" : "text-zinc-300 hover:text-white"}`}
            >
              {item.href === PRODUCT_NAV_HREF ? (
                <span className="flex h-8 items-center">
                  <Image src="/Branding/tourscope.svg" alt={item.label} width={507} height={54} className="h-[15px] w-auto brightness-0 invert" />
                </span>
              ) : item.label}
              <NavigationPending />
            </Link>
          ))}
          <div className="site-menu-row mt-6">
            <Link href="/get-started" onClick={() => setOpen(false)} className="block w-full text-center py-3.5 px-6 bg-[#0a1c1a] text-white text-sm font-semibold rounded-full hover:bg-[#0f2a27] transition-colors">
              {ctaLabel}
              <NavigationPending />
            </Link>
            <InternalLink href="/login" onClick={() => setOpen(false)} className="block w-full text-center py-3 px-6 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              {loginLabel}
              <NavigationPending />
            </InternalLink>
          </div>
        </nav>
      </div>
    </>
  );
}
