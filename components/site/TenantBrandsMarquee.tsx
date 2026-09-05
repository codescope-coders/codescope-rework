"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { useMemo } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { PARTNER_BRANDS, brandName, type PartnerBrand } from "@/data/partners";

/* ── Mark geometry ──────────────────────────────────────────────────────────
 * There are no tiles: the marks float on the section ground, so the only thing
 * holding the wall together is that they read as the same SIZE. That is not the
 * same as being the same height.
 *
 * The lockups run from 2:1 (Musafer) to 10:1 (Dawalsahat). Set to a flat 40px
 * cap-height, the 10:1 mark is 400px of ink beside a 2:1 mark's 80px and the row
 * reads as one banner and a scatter of stamps. Holding the optical MASS constant
 * instead — `sqrt(w × h)` near `MASS` — gives heights of 25–48px around a ~40px
 * centre and widths of 95–250px, which is what makes 28 unrelated lockups read
 * as one family of objects.
 */
const MASS = 80;
const MIN_H = 24;
const MAX_H = 48;
const MAX_W = 250;
/** Generous, because it is the only separator left once the boxes are gone. */
const GAP = 72;

/** Physical pixels per second. A loop is one copy width, so this sets the
 *  loop time — held inside the 45–60s band by the clamp below. */
const SPEED = 70;

/** House curve (`EASE` in lib/motion.ts), spelled for the CSS transition. */
const EASE = "cubic-bezier(0.21,0.47,0.32,0.98)";

interface Box {
  brand: PartnerBrand;
  w: number;
  h: number;
}

function measure(brand: PartnerBrand): Box {
  const ar = brand.w / brand.h;
  let h = Math.min(MAX_H, Math.max(MIN_H, MASS / Math.sqrt(ar)));
  let w = h * ar;
  if (w > MAX_W) {
    w = MAX_W;
    h = w / ar;
  }
  return { brand, w: Math.round(w), h: Math.round(h) };
}

/**
 * Every dimension is multiplied by `--brand-scale`, which globals.css steps
 * down at the two small breakpoints.
 *
 * Scaling in CSS rather than recomputing in JS keeps the geometry identical
 * between server and client (no hydration branch, no layout shift), and leaves
 * the loop exact: both copies scale together, so the -50% translate still lands
 * on a mark boundary at every breakpoint.
 */
const s = (px: number) => `calc(var(--brand-scale, 1) * ${px}px)`;

/**
 * One mark: the tonal version at rest, the brand's own colours on hover.
 *
 * Both files are stacked and crossfaded rather than swapped, so the colour
 * arrives without a reflow and without the mark ever being absent. The colour
 * copy is `aria-hidden` with an empty alt — it is the same brand, and announcing
 * it twice is the accessibility cost of a purely visual affordance.
 */
function Mark({ box, locale }: { box: Box; locale: string }) {
  const { brand, w, h } = box;
  const common = "absolute inset-0 h-full w-full select-none object-contain transition-opacity duration-300";
  return (
    <div
      className="group relative shrink-0"
      style={{ width: s(w), height: s(h), transitionTimingFunction: EASE }}
    >
      <Image
        src={`/partners/${brand.slug}-mono.webp`}
        alt={brandName(brand, locale)}
        width={brand.w}
        height={brand.h}
        // Already trimmed and emitted at 2x the render ceiling; see the header
        // comment in `data/partners.ts` for why the optimizer is bypassed.
        unoptimized
        className={`${common} opacity-70 group-hover:opacity-0`}
        style={{ transitionTimingFunction: EASE }}
      />
      <Image
        src={`/partners/${brand.slug}.webp`}
        alt=""
        aria-hidden
        width={brand.w}
        height={brand.h}
        unoptimized
        className={`${common} opacity-0 group-hover:opacity-100`}
        style={{ transitionTimingFunction: EASE }}
      />
    </div>
  );
}

function Row({
  boxes,
  locale,
  reverse,
}: {
  boxes: Box[];
  locale: string;
  reverse: boolean;
}) {
  // One copy's width INCLUDING its trailing gap. The keyframe translates the
  // track by exactly -50%, so the two copies must be byte-identical in width —
  // which is why the gap is a trailing margin on every mark rather than a flex
  // `gap`. With `gap`, a copy is N marks + (N-1) gaps, -50% lands half a gap
  // off, and the loop shows a visible hitch once per cycle.
  const copyW = boxes.reduce((sum, b) => sum + b.w + GAP, 0);
  const seconds = Math.min(60, Math.max(45, copyW / SPEED));

  return (
    // `dir="ltr"` is load-bearing, not cosmetic. In an RTL flex row the copies
    // lay out right-to-left, so the leftward translate walks the track off the
    // side that has nothing behind it and the row empties. Pinning the track to
    // LTR keeps the drift identical in both locales; the section around it still
    // mirrors, and the marks hold images only, so nothing inside needs to flip.
    <div dir="ltr" className="brand-wall relative overflow-hidden">
      <div
        className={`brand-track flex w-max items-center ${reverse ? "brand-track-reverse" : ""}`}
        style={{ animationDuration: `${seconds.toFixed(1)}s` }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center" aria-hidden={copy === 1 || undefined}>
            {boxes.map((box) => (
              <div key={box.brand.slug} style={{ marginRight: s(GAP) }}>
                <Mark box={box} locale={locale} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * The client wall — two rows of real agency lockups drifting in opposite
 * directions, on the section ground with no frame around them.
 *
 * ── Why the marks are tonally unified rather than shown as-is ──────────────
 * Measured across all 28: twelve sit below 2.0:1 contrast against `#09090b`,
 * and two — Alpha4All's and Amedia Fly's wordmarks — are pure `#000`. These
 * lockups were drawn for light grounds, which is the normal case for a travel
 * agency's brand book, and a wall of 28 unrelated palettes on a dark section
 * reads as a clip-art dump even where each one is legible. The mono pass fixes
 * both at once: grayscale, polarity flipped where the mark is dark-leaning,
 * levels normalized to one brightness band. It is tonal mapping, not
 * silhouetting, so mascots, calligraphy and gradients keep their interior
 * detail — and the brand's own colours are one hover away.
 */
export function TenantBrandsMarquee() {
  const locale = useLocale();
  const reduced = useReducedMotionSafe();

  const [rowA, rowB] = useMemo(() => {
    const boxes = PARTNER_BRANDS.map(measure);
    const half = Math.ceil(boxes.length / 2);
    return [boxes.slice(0, half), boxes.slice(half)];
  }, []);

  // Reduced motion: a static grid of every mark, exactly once. Pausing the
  // drift instead would leave the clipped rows showing whichever handful of
  // brands happened to be under the mask — the overflow is the point of the
  // row, so there is nothing to freeze it into that still shows the wall.
  if (reduced) {
    return (
      // Inline-start aligned in the same `max-w-7xl px-6` column as the heading
      // above it. Centred, it read as a free-floating cloud that had lost its
      // own heading.
      <div className="brand-grid mx-auto flex max-w-7xl flex-wrap items-center gap-x-14 gap-y-10 px-6">
        {[...rowA, ...rowB].map((box) => (
          <Mark key={box.brand.slug} box={box} locale={locale} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <Row boxes={rowA} locale={locale} reverse={false} />
      <Row boxes={rowB} locale={locale} reverse />
    </div>
  );
}
