"use client";

import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "@/i18n/routing";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { EASE } from "@/lib/motion";

// `mode="wait"` means these are SEQUENTIAL, so the pair is the fixed cost of
// every navigation on the site — at 0.22s each it was ~0.44s of nothing before
// the new page began arriving, on top of the fetch. The exit is now barely more
// than a cut (it only has to hide a page the user has already left), and the
// enter carries the arrival.
const EXIT_DURATION = 0.1;
const ENTER_DURATION = 0.18;

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotionSafe();

  // Reduced motion: the new page, immediately. A cross-fade here delays every
  // navigation on the site for no information gained.
  if (reduced) return <>{children}</>;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6, transition: { duration: EXIT_DURATION, ease: EASE } }}
        transition={{ duration: ENTER_DURATION, ease: EASE }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
