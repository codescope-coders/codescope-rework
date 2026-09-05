"use client";

import { useRef, useState } from "react";
import {
  motion,
  useIsomorphicLayoutEffect,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type UseScrollOptions,
} from "motion/react";
import { useLocale } from "next-intl";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { useMounted } from "@/lib/useMounted";
import { isRtlLocale } from "@/lib/motion";
import { CS_TEAL_GLOW, tealGlow } from "@/lib/colors";

/**
 * The site's spoken-statement reveal: a band of light travelling along a
 * paragraph as it is scrolled through, leaving the words lit behind it.
 *
 * This is the ENGINE, defined once. It was extracted from `ManifestoSection`,
 * which is now a thin layout wrapper around it, so the three-stage values, the
 * token windows, the spring, the mounted gate, the reduced-motion branch and
 * the per-word Arabic tokenisation exist in exactly one place. A second copy of
 * any of them is how two "identical" reveals end up subtly different.
 *
 * ── Where this belongs ─────────────────────────────────────────────────────
 * ONE per page, on a first-person narrative paragraph — the moment the page
 * speaks in its own voice. Deliberately NOT on section headings (it makes an
 * ordinary heading announce itself as the page's signature) and NOT on CTA
 * copy (a button's supporting line is an instruction, not a statement).
 */

const TEAL       = CS_TEAL_GLOW;
// 0.30, not the 0.62 this used to be. At 0.62 the unrevealed tail was so close
// to the revealed head that the whole reveal read as nothing happening — the
// effect existed and was invisible, which is the worst of both. The dim state
// is only reachable once JS has mounted (see `useMounted` below): the server
// HTML renders this paragraph at REVEALED, so nothing is ever gated on a
// script, and that is what buys the licence to dim this far.
const UNREVEALED = "rgba(255,255,255,0.30)";
const REVEALED   = "rgba(255,255,255,1)";
// TWO shadow layers, not one and not three. One tight bright core plus one wide
// soft halo is what makes the frontier read as a lit cursor rather than a
// slightly bolder letter; a single mid-radius layer (what this was) is too
// diffuse to be bright and too tight to bloom. Three was the earlier extreme
// and is still refused — every token interpolates its own `text-shadow` on the
// largest text on the site, re-rasterised per scroll frame, and the third layer
// bought nothing the second doesn't. All keyframe lists must stay two layers
// long or Motion cannot interpolate between them.
const GLOW_ON    = `0 0 8px ${tealGlow(0.9)}, 0 0 26px ${tealGlow(0.45)}`;
const GLOW_OFF   = `0 0 0px ${tealGlow(0)}, 0 0 0px ${tealGlow(0)}`;
const GLOW_REST  = `0 0 6px ${tealGlow(0.32)}, 0 0 16px ${tealGlow(0.16)}`;

/**
 * The manifesto's own tuning, and the default for everything else.
 *
 * Both edges are measured from the target's CENTRE, so the sweep always spans
 * exactly (85 − 20) = 65% of the viewport height no matter how tall or short
 * the paragraph is — which is what stops a two-line statement from being over
 * in half a wheel-tick. Anything shorter than ~45vh starts to feel snatched.
 */
const DEFAULT_OFFSET: UseScrollOptions["offset"] = ["center 85%", "center 20%"];

// ── Highlight map ──────────────────────────────────────────────────────────────

function buildHighlightMap(text: string, highlights: string[]): boolean[] {
  const lower = text.toLowerCase();
  const map   = new Array(text.length).fill(false);
  for (const phrase of highlights) {
    const pl = phrase.toLowerCase();
    let pos  = lower.indexOf(pl);
    while (pos !== -1) {
      for (let i = pos; i < pos + phrase.length; i++) map[i] = true;
      pos = lower.indexOf(pl, pos + 1);
    }
  }
  return map;
}

// ── Tokenisation ───────────────────────────────────────────────────────────────

interface RevealToken {
  text: string;
  isHighlighted: boolean;
  animatable: boolean;
}

// Arabic is a cursive, contextually-joined script: splitting a word into
// per-character spans severs letter joining (initial / medial / final forms),
// so RTL locales reveal whole WORDS — each word stays a single text run.
// Latin keeps the per-character reveal. Same strategy as ScrollRevealHeading.
function buildTokens(text: string, highlights: string[], rtl: boolean): RevealToken[] {
  const map = buildHighlightMap(text, highlights);

  if (!rtl) {
    return Array.from(text, (char, i) => ({
      text:          char,
      isHighlighted: map[i],
      animatable:    char.trim() !== "",
    }));
  }

  const tokens: RevealToken[] = [];
  let offset = 0;
  for (const part of text.split(/(\s+)/)) {
    if (part === "") continue;
    const isSpace = part.trim() === "";
    let isHighlighted = false;
    for (let i = offset; i < offset + part.length; i++) {
      if (map[i]) isHighlighted = true;
    }
    tokens.push({ text: part, isHighlighted: isHighlighted && !isSpace, animatable: !isSpace });
    offset += part.length;
  }
  return tokens;
}

// ── Per-token reveal ───────────────────────────────────────────────────────────

/**
 * `static`  — server HTML and the first client render: plain, readable white.
 * `settled` — the finished paragraph, highlights lit. What a reader who can
 *             already see the whole thing gets (see `RevealPhase` below).
 * `live`    — scroll-linked.
 */
type RevealPhase = "static" | "settled" | "live";

function Token({
  char, progress, index, total, isHighlighted, phase,
}: {
  char: string;
  progress: MotionValue<number>;
  index: number;
  total: number;
  isHighlighted: boolean;
  phase: RevealPhase;
}) {
  // Word tokens are an order of magnitude fewer than character tokens, so the
  // per-token reveal window scales with the step instead of being a constant —
  // otherwise Arabic words flash individually with dead scroll between them.
  const step  = 0.85 / Math.max(total, 1);
  const start = index * step;
  // The window is deliberately several steps WIDE, so neighbouring tokens are
  // mid-flash at the same moment and the frontier reads as one travelling band
  // of light rather than a per-character blink. At 3.2 steps that is ~10 Latin
  // characters or ~3 Arabic words lit at once. It used to be `max(0.012, …)`,
  // i.e. barely wider than a single step on Latin, which is why the flash was
  // subliminal. The floor keeps the band visible on very short strings; the
  // ceiling stops a very short one from lighting the whole paragraph.
  const width = Math.min(Math.max(step * 3.2, 0.06), 0.16);
  // Peak early in the window: the token ignites fast and decays slowly, which
  // is how a light source behaves and reads as deliberate rather than as a
  // symmetrical pulse.
  const mid   = start + width * 0.32;
  const end   = Math.min(start + width, 0.96);

  // dim → flash → settled. A highlighted phrase settles lit (teal, faint glow)
  // instead of going white: those are the phrases the paragraph is built
  // around, and against a pure-white settled line they need to stay marked.
  const color = useTransform(
    progress, [start, mid, end],
    [UNREVEALED, TEAL, isHighlighted ? TEAL : REVEALED],
  );
  const textShadow = useTransform(
    progress, [start, mid, end],
    [GLOW_OFF, GLOW_ON, isHighlighted ? GLOW_REST : GLOW_OFF],
  );
  // NO per-token `y` rise, and the reason is layout, not taste. A transform is
  // ignored on an `inline` box, so riding one would mean `inline-block` on
  // every token — and an inline-block per CHARACTER gives the browser a line-
  // break opportunity between any two letters. Measured in the renders: the
  // paragraph wrapped as "fra / gmented" and "peo / ple". Keeping the rise
  // would mean re-grouping characters under per-word `white-space: nowrap`
  // wrappers — a second DOM layer on the largest text on the site — to buy 3px
  // of travel that the glow renders imperceptible anyway.

  // `static` (server, and the first client render) is the READABLE state: the
  // paragraph ships legible in the HTML and only becomes scroll-linked once JS
  // is running — so nothing is ever gated on a script.
  const style =
    phase === "live"
      ? { color, textShadow }
      : phase === "settled"
        ? {
            color:      isHighlighted ? TEAL : REVEALED,
            textShadow: isHighlighted ? GLOW_REST : GLOW_OFF,
          }
        : { color: REVEALED };

  return (
    <motion.span className="inline" style={style}>
      {char}
    </motion.span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface Props {
  text: string;
  /** Phrases that settle LIT rather than white. Must be exact substrings of
   *  `text` (matched case-insensitively, every occurrence). */
  highlights?: string[];
  className?: string;
  style?: React.CSSProperties;
  /**
   * The element whose scroll position drives the reveal. Defaults to the
   * paragraph itself, which is what any server-rendered caller gets — a ref
   * cannot cross the server/client boundary. `ManifestoSection` passes its own
   * section element because that is what the manifesto's offsets were tuned
   * against, and its eyebrow puts the section's centre ~29px above the
   * paragraph's.
   */
  targetRef?: React.RefObject<HTMLElement | null>;
  /** See `DEFAULT_OFFSET`. Keep both edges on `center` so the sweep distance
   *  stays independent of the paragraph's height. */
  offset?: UseScrollOptions["offset"];
}

export function ScrollRevealText({
  text,
  highlights = [],
  className,
  style,
  targetRef,
  offset = DEFAULT_OFFSET,
}: Props) {
  const selfRef = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotionSafe();
  const mounted = useMounted();
  const locale  = useLocale();

  const rtl = isRtlLocale(locale);
  let _ai = 0;
  const entries = buildTokens(text, highlights, rtl).map((token) => ({
    ...token,
    idx: token.animatable ? _ai++ : -1,
  }));
  const animatable = _ai;

  // A reveal only engages for text the reader has NOT already been shown.
  //
  // Every offset here is measured from the target's centre travelling up the
  // viewport, so a paragraph that is entirely on screen at load sits at
  // progress 0 — fully dimmed, above the fold, with a visible white→dim flip
  // the moment hydration runs. That is the exact failure `useMounted` exists to
  // avoid, and it is reachable: the About page's statement is the second thing
  // on that page and clears the fold on a tall monitor.
  //
  // So a paragraph that is FULLY visible at mount renders `settled` — the
  // finished line, highlights lit — instead of a wave for words the reader has
  // already read. Anything that extends past the fold (every placement on a
  // laptop, every placement on a phone, and both of the others at any size)
  // reveals as designed. Measured once, at mount: re-testing on resize would
  // flip live text between dim and lit mid-read.
  const [fullyVisibleAtMount, setFullyVisibleAtMount] = useState(false);
  useIsomorphicLayoutEffect(() => {
    const el = selfRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setFullyVisibleAtMount(rect.top >= 0 && rect.bottom <= window.innerHeight);
  }, []);

  const scrollTarget: React.RefObject<HTMLElement | null> = targetRef ?? selfRef;
  const { scrollYProgress } = useScroll({ target: scrollTarget, offset });
  // Stiff, because this spring is stacked on top of Lenis, which has already
  // smoothed the scroll. At 60/20 the two eased the same input twice and the
  // reveal visibly lagged the page — you scrolled, then the words caught up.
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });

  // ── Reduced-motion fallback ────────────────────────────────────────────────
  // The finished paragraph, as plain text. `color` inline rather than a
  // `text-white` class so a caller's `className` describes type only and never
  // has to know that one branch of this component needs a colour and the other
  // gets it per token.
  if (reduced) {
    return (
      <p ref={selfRef} className={className} style={{ color: REVEALED, ...style }}>
        {text}
      </p>
    );
  }

  const phase: RevealPhase = !mounted
    ? "static"
    : fullyVisibleAtMount
      ? "settled"
      : "live";

  return (
    <p ref={selfRef} className={className} style={style}>
      {entries.map(({ text: token, idx, isHighlighted }, i) =>
        idx === -1 ? (
          <span key={i}>{token}</span>
        ) : (
          <Token
            key={i}
            char={token}
            progress={smoothProgress}
            index={idx}
            total={animatable}
            isHighlighted={isHighlighted}
            phase={phase}
          />
        )
      )}
    </p>
  );
}
