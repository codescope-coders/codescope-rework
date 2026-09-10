"use client";

import { type CSSProperties, useCallback, useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { Link as InternalLink } from "@/i18n/internal-routing";
import { PRODUCT_NAV_HREF } from "@/lib/nav-product-pill";
import { pauseSmoothScroll, resumeSmoothScroll } from "@/lib/lenis";
import { installMenuDiagnostics } from "@/lib/menu-diagnostics";
import { beginMenuNavigation, cancelMenuNavigation, cancelPageNavigation } from "@/lib/menu-navigation";
import "./mobile-menu.css";

type NavItem = { href: string; label: string };
const FOCUSABLE = 'a[href], button:not([disabled]):not([tabindex="-1"]), [tabindex="0"]';

export default function MobileMenu({ items, ctaLabel, loginLabel }: {
  items: NavItem[];
  ctaLabel: string;
  loginLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const rtl = useLocale() === "ar";
  const primaryItems = items.filter(({ href }) => href !== "/" && href !== "/contact");
  const secondaryItems = items.filter(({ href }) => href === "/" || href === "/contact");
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const disclosureRef = useRef<HTMLDetailsElement>(null);
  const touchActivation = useRef(false);
  const navigated = useRef(false);
  const closeMenu = useCallback(() => {
    cancelMenuNavigation(panelRef.current);
    if (disclosureRef.current) disclosureRef.current.open = false;
    setOpen(false);
  }, []);

  const navigateTo = (to: string) => {
    const panel = panelRef.current;
    if (!panel || to === pathname || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      closeMenu();
      return;
    }
    beginMenuNavigation({ from: pathname, to, panel, complete: () => {
      navigated.current = true;
      closeMenu();
    } });
  };

  // The browser may have opened the disclosure before hydration completed.
  // Subscribe directly so React only enhances focus/scroll behavior; it never
  // owns the native open attribute or delays the visual response to a tap.
  useEffect(() => {
    const disclosure = disclosureRef.current;
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!disclosure || !trigger) return;
    const stopDiagnostics = process.env.NODE_ENV === "development"
      ? installMenuDiagnostics(disclosure, trigger, panel)
      : undefined;
    const sync = () => {
      if (disclosure.open) cancelPageNavigation();
      if (!disclosure.open) cancelMenuNavigation(panel);
      setOpen(disclosure.open);
    };

    // Activate on a completed tap, without waiting for Safari's compatibility
    // mouse/click sequence. Cancelling touchend prevents a second native toggle.
    // Dragging away, scrolling, multi-touch, and cancelled gestures do nothing;
    // mouse, keyboard, assistive technology, and no-JS use native <summary>.
    let touch: { id: number; x: number; y: number } | undefined;
    const onTouchStart = (event: TouchEvent) => {
      const first = event.touches[0];
      touch = event.touches.length === 1
        ? { id: first.identifier, x: first.clientX, y: first.clientY }
        : undefined;
    };
    const onTouchMove = (event: TouchEvent) => {
      const current = event.touches[0];
      if (!touch || event.touches.length !== 1 || current.identifier !== touch.id ||
          Math.hypot(current.clientX - touch.x, current.clientY - touch.y) > 10) touch = undefined;
    };
    const onTouchCancel = () => { touch = undefined; };
    const onTouchEnd = (event: TouchEvent) => {
      const end = event.changedTouches[0];
      const tapped = touch && !event.touches.length && end?.identifier === touch.id &&
        Math.hypot(end.clientX - touch.x, end.clientY - touch.y) <= 10;
      touch = undefined;
      if (!tapped || !event.cancelable) return;
      event.preventDefault();
      touchActivation.current = true;
      disclosure.open = !disclosure.open;
    };
    const onKeyboardActivation = () => { touchActivation.current = false; };
    sync();
    disclosure.addEventListener("toggle", sync);
    trigger.addEventListener("touchstart", onTouchStart, { passive: true });
    trigger.addEventListener("touchmove", onTouchMove, { passive: true });
    trigger.addEventListener("touchcancel", onTouchCancel);
    trigger.addEventListener("touchend", onTouchEnd, { passive: false });
    trigger.addEventListener("keydown", onKeyboardActivation);
    return () => {
      cancelMenuNavigation(panel);
      stopDiagnostics?.();
      disclosure.removeEventListener("toggle", sync);
      trigger.removeEventListener("touchstart", onTouchStart);
      trigger.removeEventListener("touchmove", onTouchMove);
      trigger.removeEventListener("touchcancel", onTouchCancel);
      trigger.removeEventListener("touchend", onTouchEnd);
      trigger.removeEventListener("keydown", onKeyboardActivation);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    navigated.current = false;
    pauseSmoothScroll();
    window.addEventListener("popstate", closeMenu);
    // The panel owns vertical scrolling and contains overscroll. Block gestures
    // on the header too, without changing root overflow/viewport geometry when
    // opening; that can resize and repaint the decorative canvases behind it.
    const preventBackgroundScroll = (event: TouchEvent | WheelEvent) => {
      if (!panelRef.current?.querySelector(".site-menu-scroll")?.contains(event.target as Node) && event.cancelable) event.preventDefault();
    };
    document.addEventListener("touchmove", preventBackgroundScroll, { passive: false });
    document.addEventListener("wheel", preventBackgroundScroll, { passive: false });
    const trigger = triggerRef.current;
    const keyboardOpened = !touchActivation.current && trigger?.matches(":focus-visible");

    // Touch users keep their place; keyboard users start inside the dialog.
    // Prevent focus from scrolling the page or forcing the menu to its first row.
    if (keyboardOpened) {
      panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true });
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        trigger?.focus({ preventScroll: true });
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
      window.removeEventListener("popstate", closeMenu);
      document.removeEventListener("touchmove", preventBackgroundScroll);
      document.removeEventListener("wheel", preventBackgroundScroll);
      resumeSmoothScroll();
      if (keyboardOpened && !navigated.current) trigger?.focus({ preventScroll: true });
    };
  }, [open, closeMenu]);

  return (
    <>
      <details
        ref={disclosureRef}
        suppressHydrationWarning
        className="site-menu-toggle shrink-0"
      >
        <summary
          ref={triggerRef}
          className="site-menu-trigger"
          aria-controls={panelId}
        >
          <span className="site-menu-label-open sr-only">{t("openMenu")}</span>
          <span className="site-menu-label-close sr-only">{t("closeMenu")}</span>
          <span aria-hidden="true" className="site-menu-caption">
            <span className="site-menu-label-open">{t("menuShort")}</span>
            <span className="site-menu-label-close">{t("closeShort")}</span>
          </span>
          {/* Familiar menu bars, with the logo's squared geometry and tapered
              cuts. Only rigid transforms and opacity change during the morph. */}
          <svg aria-hidden="true" focusable="false" className="site-menu-glyph" width="28" height="28" viewBox="0 0 28 28" fill="currentColor">
            <path className="site-menu-rail site-menu-rail-top" d="M2 5h24l-3 3H2Z" />
            <path className="site-menu-rail-middle" d="M2 12.5h19l-3 3H2Z" />
            <path className="site-menu-rail site-menu-rail-bottom" d="M2 20h24l-3 3H2Z" />
          </svg>
        </summary>
      </details>

      {/* This sibling stays mounted so native [open] can drive both directions
          of the CSS transition, even with JavaScript unavailable. */}
      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-modal={open ? true : undefined}
        aria-label={t("menuLabel")}
        data-lenis-prevent
        className="site-menu-panel"
      >
        <button type="button" tabIndex={-1} aria-hidden="true" aria-label={t("closeMenu")} className="site-menu-backdrop" onClick={closeMenu} />
        <div className="site-menu-sheet" aria-hidden="true" />
        <div className="site-menu-scroll">
          <nav className="site-mobile-menu-body site-menu-content">
            <div className="site-menu-primary">
              {primaryItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  onNavigate={() => navigateTo(item.href)}
                  style={{ "--menu-item-index": index } as CSSProperties}
                  aria-label={item.label}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="site-menu-link"
                >
                  <span className="site-menu-label" aria-hidden="true">
                    <span className="site-menu-text">
                      {item.href === PRODUCT_NAV_HREF ? (
                        <span className="site-menu-product" />
                      ) : rtl ? item.label : Array.from(item.label).map((letter, letterIndex) => (
                        <span key={letterIndex} className="site-menu-letter" style={{ "--letter-order": (letterIndex * 3) % item.label.length } as CSSProperties}>{letter}</span>
                      ))}
                    </span>
                  </span>
                  <svg className="site-menu-arrow" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              ))}
            </div>
            <div className="site-menu-footer">
              <div className="site-menu-secondary">
                {secondaryItems.map((item) => (
                  <Link key={item.href} href={item.href} prefetch={false} onNavigate={() => navigateTo(item.href)} aria-current={pathname === item.href ? "page" : undefined}>
                    {item.label}
                  </Link>
                ))}
                <InternalLink href="/login" prefetch={false} onClick={closeMenu}>
                  {loginLabel}
                </InternalLink>
              </div>
              <Link href="/get-started" prefetch={false} onNavigate={() => navigateTo("/get-started")} className="site-menu-cta">
                {ctaLabel}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
