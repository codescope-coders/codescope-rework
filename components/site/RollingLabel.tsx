import { getLocale } from "next-intl/server";
import { isRtlLocale } from "@/lib/motion";

/**
 * A button label that ROLLS on hover: the visible copy lifts out of the top of
 * the button while an identical copy rises into its place from below, one unit
 * at a time.
 *
 * ── Why this is CSS and not `motion/react` ─────────────────────────────────
 * The effect is two transforms and a per-unit delay. Written with motion it
 * would need `"use client"`, which would drag every CTA — and the pages that
 * hold them — across the server boundary for an animation that has no state,
 * no gesture beyond `:hover`, and nothing to orchestrate. As CSS it ships zero
 * JavaScript, survives hydration by not participating in it, and gets reduced
 * motion for free through Tailwind's `motion-safe:` variant rather than a hook
 * that has to guess before it settles.
 *
 * ⚠️ Under `prefers-reduced-motion` the transforms are simply never applied, so
 * the label sits still and legible. That is the correct behaviour here — a
 * rolling label is decoration, and the button works without it.
 *
 * ── ⚠️ Why the split is per WORD in Arabic and per CHARACTER in English ────
 * This is the whole reason the effect is written here rather than installed.
 * Arabic is a joined script: a letter's shape is chosen from its neighbours, so
 * cutting a word into one element per character severs the shaping context and
 * every letter falls back to its ISOLATED form — the word stops being the word.
 * Measured on `اطلب عرضاً تجريبياً` at 34px: the whole string renders 268px
 * wide, per-word renders 268px (identical, correctly joined), and per-character
 * renders 329px of disconnected letters. Latin has no such constraint, so it
 * keeps the finer per-character stagger the effect is named for.
 *
 * The stagger therefore runs per character in English and per word in Arabic.
 * Both read as the same gesture; only the grain differs.
 */

/** Milliseconds between one unit starting and the next. */
const STAGGER_MS = 22;
/* Travel time (380ms) and easing live in the utility string below rather than
   here: Tailwind needs them as literal text to emit the classes at all. */

/**
 * Split for animation. Spaces become non-breaking: every unit is an
 * `inline-block`, and an ordinary space between two of them collapses, which
 * would close up the gaps between words as soon as the label is split.
 */
function splitUnits(text: string, rtl: boolean): string[] {
  if (!rtl) return [...text].map((c) => (c === " " ? " " : c));

  // Arabic: words stay whole (see the note above), spaces ride as their own
  // units so the gaps still stagger with everything else.
  return text
    .split(" ")
    .flatMap((word, i) => (i === 0 ? [word] : [" ", word]))
    .filter((u) => u.length > 0);
}

interface Props {
  text: string;
  /**
   * Where the incoming copy starts and the outgoing copy goes. `up` (default)
   * lifts the label out of the top; the hero and footer CTAs both use it.
   */
  direction?: "up" | "down";
}

export async function RollingLabel({ text, direction = "up" }: Props) {
  const locale = await getLocale();
  const units = splitUnits(text, isRtlLocale(locale));

  /* ⚠️ Written out in full, never interpolated. Tailwind scans source for
     complete class strings, so a `group-hover:${direction === "up" ? …}` emits
     nothing at all — the classes simply never reach the stylesheet and the
     label sits still, with no error anywhere to say why. */
  const outgoing =
    direction === "up"
      ? "motion-safe:group-hover:-translate-y-full motion-safe:group-focus-visible:-translate-y-full"
      : "motion-safe:group-hover:translate-y-full motion-safe:group-focus-visible:translate-y-full";
  const incomingRest = direction === "up" ? "translate-y-full" : "-translate-y-full";
  const incomingHover =
    "motion-safe:group-hover:translate-y-0 motion-safe:group-focus-visible:translate-y-0";

  const unitClass =
    "inline-block motion-safe:transition-transform motion-safe:duration-[380ms] motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]";

  return (
    /* `overflow-hidden` is what makes this a roll rather than a slide.
       ⚠️ The clip box must stay at the button's OWN line-height. Tightening it
       to `leading-none` makes the box exactly one em — which is shorter than
       the script: Arabic tanween sit above the letters and Latin descenders
       below, so the box sheared both off. Measured on the Arabic CTA, the
       label rendered `عرضا` where the word is `عرضاً` — the effect was
       silently editing the copy. */
    <span className="relative inline-block overflow-hidden align-bottom">
      {/* Both layers are decoration: the real label is the one below, so a
          screen reader hears the text once rather than twice. */}
      <span aria-hidden className="flex">
        {units.map((u, i) => (
          <span
            key={`${u}-${i}`}
            style={{ transitionDelay: `${i * STAGGER_MS}ms` }}
            className={`${unitClass} ${outgoing}`}
          >
            {u}
          </span>
        ))}
      </span>

      <span aria-hidden className="absolute inset-0 flex">
        {units.map((u, i) => (
          <span
            key={`${u}-${i}`}
            style={{ transitionDelay: `${i * STAGGER_MS}ms` }}
            className={`${unitClass} ${incomingRest} ${incomingHover}`}
          >
            {u}
          </span>
        ))}
      </span>

      <span className="sr-only">{text}</span>
    </span>
  );
}
