"use client";

import { useScroll, useSpring, motion } from "motion/react";
import { useLocale } from "next-intl";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { isRtlLocale } from "@/lib/motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  // Both values are created unconditionally — hooks cannot be called behind a
  // branch — and the reduced-motion case simply picks the raw one.
  const smoothed = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const reduced = useReducedMotionSafe();
  const locale = useLocale();

  // Reduced motion: track the scroll position exactly. The spring lags the real
  // position and settles with a slight overshoot, which is the one thing a
  // progress indicator must not do for someone who asked for no motion.
  const scaleX = reduced ? scrollYProgress : smoothed;

  return (
    <motion.div
      // Decorative: it restates the scrollbar the browser already exposes, so
      // it is not announced.
      aria-hidden="true"
      className="fixed top-0 inset-x-0 h-[2px] bg-cs-teal z-[60]"
      // The bar grows from the inline START of the page — the left edge in
      // English, the right edge in Arabic. Pinned to `origin-left` it filled
      // backwards against the reading direction on every RTL page.
      style={{ scaleX, transformOrigin: isRtlLocale(locale) ? "right" : "left" }}
    />
  );
}
