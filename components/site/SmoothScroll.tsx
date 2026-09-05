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
