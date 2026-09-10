"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { registerLenis } from "@/lib/lenis";

export function SmoothScroll() {
  const reduced = useReducedMotionSafe();

  useEffect(() => {
    // Reduced motion: Lenis is never constructed. Damping the scroll is
    // exactly the vestibular effect the setting asks us to drop, and a
    // "faster" smooth scroll is still a smooth scroll — the only correct
    // version is the browser's own.
    if (reduced) return;
    // Re-read the query here as well: this effect can run once before the
    // hydration-safe hook has settled, and mounting Lenis for a frame is
    // enough to seize the first scroll of the session.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // ⚠️ Never on a touch device — it is pure cost there.
    //
    // The only thing this instance smooths is the WHEEL (`smoothWheel: true`,
    // and `syncTouch` is off, which since Lenis 1.x is what decides whether it
    // takes over touch at all). A phone has no wheel, so its scrolling was
    // already the browser's own — while the `raf` loop below ran 60 times a
    // second, forever, on every page. Measured on a phone viewport with the
    // page idle and untouched: 120 callbacks in 3 seconds at 120Hz, from a
    // driver with nothing to drive.
    //
    // Everything that reads the instance already handles its absence, because
    // that is the normal state under reduced motion: `ScrollToTop` falls back
    // to `window.scrollTo`, and `pauseSmoothScroll` / `resumeSmoothScroll` are
    // documented no-ops (`MobileMenu` contains scrolling in its own panel). Topic
    // links use native smooth scrolling on demand when this driver is absent.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
      // Hand in-page anchors to Lenis. Without this the browser's own instant
      // jump fires first and Lenis then eases from wherever the jump left the
      // page — so `href="#platform"` teleported and then drifted. Lenis owns
      // the scroll; every way of moving it has to go through Lenis.
      anchors: true,
    });
    registerLenis(lenis);

    let raf: number;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      registerLenis(null);
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}
