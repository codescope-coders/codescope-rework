"use client";

import { motion } from "motion/react";
import { useLocale } from "next-intl";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { DURATION, EASE, STAGGER, isRtlLocale } from "@/lib/motion";

export interface EngineCluster {
  index: string;
  title: string;
  thesis: string;
  items: string[];
}

/**
 * The business engine, rendered as a spec sheet rather than an icon-card grid:
 * four clusters, each a ledger block of capability lines. Deliberately
 * typographic — the page already spends its card budget on the six verticals.
 *
 * This is the page's one earned motion moment. Each block waits until it is
 * genuinely on screen, then writes itself out like a ledger: the hairline rule
 * draws across first, the line of text settles in behind it, and the next row
 * follows. Everything animated is `transform` or `opacity` — the rules are
 * scaled, never grown, so nothing here triggers layout.
 *
 * Layout is logical-property only (no left/right, no col-span placement) so the
 * Arabic mirror is a straight flip, and the rules draw from the text-start edge
 * on both sides.
 */

/**
 * The whole card: ONE trigger for the whole cascade.
 *
 * Each cluster used to carry its own `whileInView`, which reads as four
 * independent cascades — and on a tall viewport two or three of them cross the
 * threshold in the same frame and fire together, so the ledger-being-written
 * effect collapsed into a blur exactly on the screens with room to see it. The
 * card enters view once and releases its clusters in order.
 */
const card = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

/** A cluster: released by the card, releases its own rows in turn. */
const block = {
  hidden: {},
  show: { transition: { staggerChildren: STAGGER.base } },
};

/** A hairline rule drawing across from the text-start edge. */
const rule = {
  hidden: { scaleX: 0, opacity: 0 },
  show: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: DURATION.slow, ease: EASE },
  },
};

/** A line of text arriving under the rule that was just drawn. */
const line = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE },
  },
};

const VIEWPORT_ONCE = { once: true, margin: "-80px" } as const;

export function BusinessEngine({ clusters }: { clusters: EngineCluster[] }) {
  const reduced = useReducedMotionSafe();
  const locale = useLocale();
  // The rules are written in reading order, so they start at the inline edge
  // the text starts at.
  const transformOrigin = isRtlLocale(locale) ? "right" : "left";

  return (
    <motion.div
      className="rounded-2xl border border-white/[0.07] bg-cs-panel overflow-hidden"
      variants={reduced ? undefined : card}
      initial={reduced ? undefined : "hidden"}
      whileInView={reduced ? undefined : "show"}
      viewport={VIEWPORT_ONCE}
    >
      {clusters.map((cluster, i) => (
        <motion.div
          key={cluster.title}
          className="relative"
          variants={reduced ? undefined : block}
        >
          {/* Separator between clusters. Drawn, not faded — it is the first
              stroke of the block being written. */}
          {i > 0 &&
            (reduced ? (
              <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-white/[0.07]" />
            ) : (
              <motion.span
                aria-hidden
                variants={rule}
                style={{ transformOrigin }}
                className="absolute inset-x-0 top-0 h-px bg-white/[0.07]"
              />
            ))}

          <div className="grid gap-x-12 gap-y-6 px-6 py-9 sm:px-9 lg:grid-cols-[minmax(0,19rem)_1fr]">
            {/* Cluster heading */}
            <motion.div variants={reduced ? undefined : line}>
              <span
                aria-hidden
                className="block text-[11px] font-semibold tabular-nums tracking-widest text-ts-purple-text mb-3"
              >
                {cluster.index}
              </span>
              <h3 className="text-xl font-bold text-white leading-snug mb-2">
                {cluster.title}
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed text-balance">
                {cluster.thesis}
              </p>
            </motion.div>

            {/* Capability lines */}
            <ul className="flex flex-col">
              {cluster.items.map((item, j) => (
                // The row's variant rides the `li` itself. It used to ride an
                // inner `motion.span` wrapping a `<p>` — a paragraph inside a
                // span is invalid, and the browser's parser fixes it by closing
                // the span early, which puts the text outside the element that
                // was animating it. It also meant the two branches below built
                // different DOM for the same row.
                // `last:pb-0` mirrors the `lg:pt-0` above it. Without it the
                // final row adds its own 14px under the last line of the
                // cluster, on top of the block's 36px — so the card measured
                // 37px of padding at the top and 51px at the bottom, and the
                // last cluster's trailing space leaked into the gap before the
                // next section, making that one boundary read ~20px wider than
                // every other on the page. It also centres each cluster
                // separator, which previously had 50px above it and 36 below.
                <motion.li
                  key={item}
                  variants={reduced ? undefined : line}
                  className={`relative flex gap-4 py-3.5 last:pb-0 ${j === 0 ? "lg:pt-0" : ""}`}
                >
                  {/* Row rule */}
                  {j > 0 &&
                    (reduced ? (
                      <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-white/[0.05]" />
                    ) : (
                      <motion.span
                        aria-hidden
                        variants={rule}
                        style={{ transformOrigin }}
                        className="absolute inset-x-0 top-0 h-px bg-white/[0.05]"
                      />
                    ))}

                  <span aria-hidden className="mt-[0.7em] h-px w-5 shrink-0 bg-ts-purple/50" />
                  <p className="text-[15px] text-zinc-300 leading-relaxed">{item}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
