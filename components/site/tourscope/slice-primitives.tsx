"use client";

import Image from "next/image";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * The one vocabulary every coded product view on this site draws from.
 *
 * ── Why it is a module and not two copies ───────────────────────────────────
 * `ProductSlices.tsx` (the six product screens) and `HeroProductPreview.tsx`
 * (the hero's platform scene) are drawings of the SAME product, and they were
 * each carrying their own `Pill`, `PulseDot`, `IconTile` and label constants.
 * Two copies of a design system is how a pill ends up 0.5px different in the
 * hero than in the section below it — which nobody notices as a bug and
 * everybody reads as "these are two different products".
 *
 * So: surfaces, labels, dividers, and every atom that appears in more than one
 * view live here, once. Anything used by a single view stays in that view's
 * file (`FlagDot`, `Field`, `Segments`, `Action`, `Stars` are slice-only).
 *
 * ── Rules for anything added here ───────────────────────────────────────────
 * 1. No copy. Every string is passed in by the caller, which gets it from
 *    `messages`. Punctuation, currency signs and the star glyph are the only
 *    literals allowed, because they are identical in both locales.
 * 2. Logical properties only (`ms`/`me`/`ps`/`pe`/`start`/`end`), so every
 *    consumer mirrors under `dir="rtl"` without a second set of rules.
 * 3. Motion is the pulse and the skeleton shimmer, both reduced-motion gated.
 *    Entrances belong to the caller — an atom that animates itself turns any
 *    list of atoms into a slideshow.
 * 4. Nothing focusable: consumers mount these inside `aria-hidden` subtrees,
 *    so every interactive-looking thing is a `span`.
 */

/* ── Surfaces ───────────────────────────────────────────────────────────────
   Four steps of elevation over `bg-cs-panel`. Consistency here is what makes
   six different screens read as one product rather than six pastiches. */

/** A window's own inner ground. Slightly lifted off `bg-cs-panel`. */
export const SHEET = "bg-white/[0.02]";
/** A raised surface inside a view — a card, a field, a table shell. */
export const CARD = "rounded-lg border border-white/[0.07] bg-white/[0.035]";
/** A quieter one, for rows that sit inside an already-raised surface. */
export const ROW = "rounded-lg border border-white/[0.05] bg-white/[0.02]";
/** Column headers and field labels: the small-caps chrome of real UI. */
export const LABEL = "text-[8.5px] font-semibold uppercase tracking-[0.11em] text-zinc-500";
/** Section dividers inside a view. */
export const DIVIDE = "border-white/[0.06]";

/**
 * A drawn dot, not a "·" character.
 *
 * Arabic-Indic ZERO (٠) is itself a raised dot, so a middot printed beside
 * "٤٫٨" reads as "٠٤٫٨" — the separator is silently absorbed into the number.
 */
export function Dot() {
  return <span className="block h-[3px] w-[3px] shrink-0 rounded-full bg-zinc-600" />;
}

/** The site's one perpetual motion, reduced-motion gated — a live indicator. */
export function PulseDot({ className = "" }: { className?: string }) {
  const reduced = useReducedMotionSafe();
  return (
    <motion.span
      className={`block h-[5px] w-[5px] shrink-0 rounded-full bg-cs-teal ${className}`}
      animate={reduced ? undefined : { opacity: [1, 0.35, 1] }}
      transition={reduced ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/**
 * One placeholder bar of a row still streaming in.
 *
 * Low amplitude on purpose: a hard 0 → 1 flash is a strobe next to the settled
 * rows above it, and the point is "this one hasn't arrived yet", not "look at
 * this one". Reduced motion parks it mid-loop rather than hiding it — a
 * skeleton that stops shimmering is still a skeleton.
 */
export function Shimmer({ className, delay = 0 }: { className: string; delay?: number }) {
  const reduced = useReducedMotionSafe();
  return (
    <motion.span
      className={`block bg-white/[0.14] ${className}`}
      style={reduced ? { opacity: 0.6 } : undefined}
      animate={reduced ? undefined : { opacity: [0.35, 0.8, 0.35] }}
      transition={
        reduced ? undefined : { duration: 1.6, delay, repeat: Infinity, ease: "easeInOut" }
      }
    />
  );
}

/**
 * `BGW → IST`, as three elements so the flex row — not bidi — does the
 * mirroring.
 *
 * The arrow is an ICON with `rtl:rotate-180`, never a `→` in the message:
 * airport codes are Latin runs, and a neutral arrow between two of them does
 * not reorder under bidi, so a mirrored string would point the wrong way.
 * (A route written in Arabic city names can use a glyph, and Slice A does.)
 */
export function Route({
  from,
  to,
  className = "",
  arrow = 12,
}: {
  from: string;
  to: string;
  className?: string;
  arrow?: number;
}) {
  return (
    <span className={`flex items-center gap-1.5 ${className}`}>
      <span>{from}</span>
      <ArrowRight size={arrow} weight="bold" className="shrink-0 text-zinc-500 rtl:rotate-180" />
      <span>{to}</span>
    </span>
  );
}

/** Status pill. `teal` = live/positive, `purple` = pooled/attention, `zinc` = neutral. */
export function Pill({
  tone = "zinc",
  dot = false,
  children,
  className = "",
}: {
  tone?: "teal" | "purple" | "zinc";
  dot?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    teal: "border-cs-teal/25 bg-cs-teal/10 text-cs-teal",
    purple: "border-ts-purple/30 bg-ts-purple/15 text-ts-purple-text",
    zinc: "border-white/10 bg-white/[0.04] text-zinc-400",
  } as const;
  const dots = { teal: "bg-cs-teal", purple: "bg-ts-purple-text", zinc: "bg-zinc-500" } as const;

  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-1.5 py-[2px] text-[9px] font-semibold leading-none ${tones[tone]} ${className}`}
    >
      {dot && <span className={`block h-[4px] w-[4px] rounded-full ${dots[tone]}`} />}
      {children}
    </span>
  );
}

/** The square icon tile a console page-head and every table row leads with. */
export function IconTile({
  children,
  tone = "zinc",
  size = "h-6 w-6",
}: {
  children: ReactNode;
  tone?: "purple" | "teal" | "zinc";
  size?: string;
}) {
  const tones = {
    purple: "border-ts-purple/25 bg-ts-purple/15 text-ts-purple-text",
    teal: "border-cs-teal/25 bg-cs-teal/12 text-cs-teal",
    zinc: "border-white/[0.07] bg-white/[0.05] text-zinc-400",
  } as const;
  return (
    <span
      className={`flex ${size} shrink-0 items-center justify-center rounded-md border ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/** The two-letter carrier tile every flight results row leads with. */
export function AirlineTile({ code, tone }: { code: string; tone: "purple" | "zinc" }) {
  const tones = {
    purple: "border-ts-purple/25 bg-ts-purple/15 text-ts-purple-text",
    zinc: "border-white/[0.07] bg-white/[0.05] text-zinc-400",
  } as const;
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-[10px] font-bold tracking-tight ${tones[tone]}`}
    >
      {code}
    </span>
  );
}

/**
 * A count beside a page title — `Visa markups · 52`, rendered as the product
 * does it. A chip, not "· 52": a bare middot beside a numeral reorders under
 * bidi and reads as part of the number in Arabic.
 */
export function CountChip({ children }: { children: ReactNode }) {
  return (
    <span className="shrink-0 rounded-full bg-white/[0.06] px-1.5 py-[2px] text-[9px] font-semibold tabular-nums text-zinc-400">
      {children}
    </span>
  );
}

/** The Tourscope wordmark, at whatever height the view needs. */
export function Wordmark({ className = "h-3.5" }: { className?: string }) {
  return (
    <Image
      src="/Branding/tourscope.svg"
      alt=""
      width={507}
      height={54}
      className={`${className} w-auto`}
    />
  );
}
