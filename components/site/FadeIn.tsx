"use client";

import { motion } from "motion/react";
import { useMemo, type ReactNode } from "react";
import { useLocale } from "next-intl";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import {
  DURATION,
  EASE,
  FADE_DISTANCE,
  VIEWPORT,
  isRtlLocale,
} from "@/lib/motion";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  /**
   * `left` / `right` are LOGICAL: they name the direction of travel in reading
   * order, so they mirror under RTL. A card that slides in from the inline
   * start does so on both sides of the site.
   */
  direction?: "up" | "down" | "left" | "right" | "none";
  /**
   * The element rendered. `div` covers nearly every call site; `li` exists so a
   * fading row can be a real list item — wrapping an `li` in a `div` is invalid
   * inside `ul` / `ol`, and this component is otherwise the thing that would
   * force it.
   */
  as?: "div" | "li";
}

/**
 * Fade-and-rise on scroll — the site's default entrance.
 *
 * ── Why this is variant-driven rather than `initial={{ opacity: 0 }}` ────────
 * Framer Motion serializes a resolvable `initial` into the server HTML. With
 * `initial` given as an object, every one of the ~37 wrappers on this site shipped
 * `style="opacity:0"` in the SSR markup — so the whole page was blank until
 * hydration ran, and stayed blank forever for a crawler, a reader-mode parser,
 * or anyone whose JS failed. That is the entire content of both pages hidden
 * behind an animation.
 *
 * The fix is to give Motion nothing it can resolve statically:
 *   - `initial` / `whileInView` are variant LABELS, never objects, so this is a
 *     variant node that controls its own variants;
 *   - there is deliberately NO `animate` prop. On the server the initial
 *     animation is blocked (the layout's `AnimatePresence initial={false}`),
 *     so Motion falls back to `animate` — which, being undefined, resolves to
 *     no styles at all. The server emits a plain, visible element.
 * On the client the `hidden` variant is applied before first paint, and the
 * viewport trigger releases it. Same animation, no blank SSR.
 *
 * ⚠️ Do not "simplify" this back to `initial={{…}} animate={…}`, and do not add
 * an `animate` prop: either one puts `opacity:0` back into the server HTML.
 * The guard is a curl of the built page — it must contain no `opacity:0` from
 * this component.
 */
export function FadeIn({
  children,
  delay = 0,
  className,
  direction = "up",
  as = "div",
}: FadeInProps) {
  const reduced = useReducedMotionSafe();
  const locale = useLocale();
  const rtl = isRtlLocale(locale);

  const variants = useMemo(() => {
    const y =
      direction === "up" ? FADE_DISTANCE : direction === "down" ? -FADE_DISTANCE : 0;
    const inlineOffset =
      direction === "left" ? FADE_DISTANCE : direction === "right" ? -FADE_DISTANCE : 0;
    const x = rtl ? -inlineOffset : inlineOffset;

    return {
      hidden: { opacity: 0, y, x },
      show: {
        opacity: 1,
        y: 0,
        x: 0,
        transition: { duration: DURATION.slow, delay, ease: EASE },
      },
    };
  }, [direction, rtl, delay]);

  // Reduced motion: render content in its final, visible state — no transform,
  // no opacity gate that could leave a section blank.
  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = as === "li" ? motion.li : motion.div;

  return (
    <MotionTag
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
