/**
 * The site's single motion vocabulary.
 *
 * Every animated component imports its easing, duration, stagger and shared
 * variants from here — a per-file copy of the house curve is how two sections
 * end up 30ms apart for no reason. The import path is `motion/react`
 * everywhere; the library's older package alias is deliberately not a
 * dependency, since two entry points for one library ship the same code twice.
 */

export type Ease = [number, number, number, number];

/** House curve. Slow out, confident settle — used for nearly everything. */
export const EASE: Ease = [0.21, 0.47, 0.32, 0.98];

/** Sharper out-curve for UI that must feel immediate (menus, toggles). */
export const EASE_OUT: Ease = [0.32, 0, 0.16, 1];

/** Seconds. Named by intent, not by number, so timings stay comparable. */
export const DURATION = {
  /** Icon swaps, state flips. */
  instant: 0.15,
  /** Menus, small overlays. */
  fast: 0.22,
  /** Default for a discrete element entering. */
  base: 0.35,
  /** Section content arriving on scroll. */
  slow: 0.55,
  /** Hero-scale entrances only. */
  slower: 0.75,
} as const;

/** Seconds between siblings in a staggered group. */
export const STAGGER = {
  tight: 0.04,
  base: 0.06,
  loose: 0.08,
} as const;

/**
 * Shared `useInView` options. The negative margin means "fire once the element
 * is genuinely on screen", not the instant its first pixel crosses the fold.
 */
export const VIEWPORT = { once: true, margin: "-80px" } as const;

/** Distance, in px, an element travels on a fade-up entrance. */
export const FADE_DISTANCE = 24;

/**
 * The locales that read right-to-left.
 *
 * Direction is a property of the LANGUAGE, so it belongs in one place: five
 * components used to each carry their own `locale === "ar"`, which is a list
 * that silently goes stale the day a second RTL locale ships. Everything that
 * mirrors a transform, a transform-origin or a drawing direction asks here.
 */
const RTL_LOCALES = new Set(["ar", "fa", "he", "ur", "ckb", "kmr"]);

export function isRtlLocale(locale: string): boolean {
  return RTL_LOCALES.has(locale);
}

/**
 * A parent that releases its children in sequence. The parent itself animates
 * nothing — it only owns the timing.
 */
export function staggerContainer(stagger: number = STAGGER.base) {
  return {
    hidden: {},
    show: { transition: { staggerChildren: stagger } },
  };
}

/** The child half of `staggerContainer`. Opacity + transform only. */
export const fadeUpChild = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE },
  },
};
