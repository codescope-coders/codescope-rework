"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore, type CSSProperties } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import {
  CS_TEAL_GLOW,
  CS_TEAL_GLOW_CHANNELS,
  TS_PURPLE_GLOW,
  TS_PURPLE_GLOW_CHANNELS,
  tealGlow,
  tsPurpleGlow,
} from "@/lib/colors";

/**
 * A CTA treatment: a light travels the button's rim, and on hover the face
 * fills with a field of twinkling pixels.
 *
 * ── ⚠️ Why this is written here and not installed ──────────────────────────
 * The reference is Originkit's `starfield-button`, whose registry is sign-in
 * gated — so this is a rebuild from the measured technique rather than a copy
 * of their source, the same route `RollingLabel` took when the Motion+ registry
 * turned out to be paid. Their anatomy, read off the live demo:
 *
 *   • a static hairline ring — an absolutely positioned box with `padding:1px`
 *     whose mask XORs its own border box against its content box, so only the
 *     padding band paints;
 *   • the SAME xor ring again, one pixel wider, holding a single radial dot
 *     that is moved around inside it with `translate3d`. Everything of the dot
 *     outside the band is masked away, so a plain rectangular gradient reads as
 *     a light travelling a rounded rim;
 *   • on hover, a grid of ~4px squares at staggered random alphas, twinkling.
 *
 * No SVG, no conic gradient, no stroke-dashoffset. See `RING_MASK` below.
 *
 * ── What we changed, and why ───────────────────────────────────────────────
 * The effect was designed for a dark, hairline-bordered pill. Only our
 * `secondary` (ghost) CTA is that; `primary` is a solid teal or purple face, on
 * which a teal light is invisible and a teal starfield is worse. So primary
 * goes WHITE and quiet — it reads as a sheen crossing the rim, which is what a
 * confident filled CTA wants — and secondary gets the full-strength version the
 * effect was made for. ⚠️ Do not "unify" the two: the asymmetry is the point,
 * and it is what preserves the page's CTA hierarchy.
 *
 * ── Cost ───────────────────────────────────────────────────────────────────
 * ⚠️ The reference's travelling light runs continuously, hovered or not. Ours
 * does not. Ten permanently-animating buttons on a page is a real, permanent
 * cost for an effect nobody is looking at, and this site already spends its
 * canvas budget on `CodeFieldBackground` — which earned its place by idling at
 * exactly zero. Both loops here start on `pointerenter` and are cancelled after
 * the leave transition has finished easing out. At rest there is no rAF, the
 * canvas has no backing store, and nothing draws. On a coarse pointer, or under
 * reduced motion, none of it is built at all.
 */

/**
 * ⚠️ This is what makes the ring a ring — do not "simplify" it into a `border`.
 *
 * Two identical opaque mask layers, one clipped to the BORDER box and one to
 * the CONTENT box, composited with `xor`: the result paints only where exactly
 * one of them covers, i.e. the `padding` band — and that band follows the
 * element's own `border-radius` around every corner.
 *
 * It is also the only reason the travelling light works. The dot inside layer 2
 * is an ordinary rectangular radial gradient; everything of it outside the band
 * is masked away, so moving it anywhere in the box paints an arc ON the rim.
 * Replace this with a border and the ring still looks correct at rest while the
 * light disappears entirely, with nothing to say why.
 */
const RING_MASK: CSSProperties = {
  maskImage: "linear-gradient(#000 0, #000 0), linear-gradient(#000 0, #000 0)",
  maskClip: "border-box, content-box",
  maskComposite: "xor",
  WebkitMaskImage: "linear-gradient(#000 0, #000 0), linear-gradient(#000 0, #000 0)",
  WebkitMaskClip: "border-box, content-box",
  WebkitMaskComposite: "xor",
};

/**
 * The same gate `CodeFieldBackground` uses, minus its `min-width: 1024px`
 * clause. That clause is right for a full-page background — a phone-width
 * viewport does not want one — and wrong for a button, which is the same
 * button, hoverable, in a 900px-wide desktop window.
 */
const INTERACTIVE = "(hover: hover) and (pointer: fine)";

/**
 * Squares are `CELL` wide on a `PITCH` lattice, so ~25% of the face at most.
 *
 * ⚠️ These are deliberately small. At 4px on a 7px lattice the squares read as
 * a visible checker pattern on a ~46px-tall pill — the reference's numbers are
 * tuned for a button roughly three times this size, where the same lattice is a
 * fine grain. Scaled down, the field has to scale with it or the effect looks
 * like large blocks rather than a mosaic.
 */
const CELL = 2;
const PITCH = 4;
/** Cells whose hash lands above this are never drawn at all. */
const DENSITY = 0.5;
/** Hover fade, in ms. Snapping is what makes this kind of effect look cheap. */
const INTRO_MS = 260;

/**
 * How much the travelling light's speed varies around a lap, as a fraction of
 * its mean.
 *
 * ⚠️ A deliberate departure from the reference's literal `ease-in-out`. A lap
 * is a CLOSED path with no end to ease into: easing to zero velocity at `t = 1`
 * makes the light stop dead at the same corner once per lap, which reads as a
 * stutter rather than as easing. This modulates velocity smoothly and
 * periodically instead — `1 + A·cos(4πt)`, which is C¹ across the wrap and
 * never reaches zero — so the light breathes as it travels. Set to 0 for a
 * constant-speed sheen.
 */
const EASE_AMPLITUDE = 0.45;

interface VariantSpec {
  /** Diameter of the radial dot, in px, before the ring mask clips it. */
  dot: number;
  /** The dot's colour at full strength, and the same hue at zero alpha. */
  core: string;
  edge: string;
  /** One lap of the perimeter, in ms. */
  lapMs: number;
  /** `rgb()` channels the starfield squares are painted in. */
  starChannels: string;
  /** The brightest a single square ever gets. */
  starPeak: number;
  /** The always-on hairline, or null to leave the caller's own edge alone. */
  ring: string | null;
}

/**
 * The accent hue. Teal is CodeScope, purple is TourScope — the `/tourscope`
 * page's CTAs are purple-faced and a teal rim light on them would be wrong.
 */
type Accent = "teal" | "purple";

const ACCENT: Record<Accent, { glow: string; channels: string; alpha: (a: number) => string }> = {
  teal: { glow: CS_TEAL_GLOW, channels: CS_TEAL_GLOW_CHANNELS, alpha: tealGlow },
  purple: { glow: TS_PURPLE_GLOW, channels: TS_PURPLE_GLOW_CHANNELS, alpha: tsPurpleGlow },
};

/** Filled primary actions use a quiet white sheen; secondary actions carry
 * the brand-colored field. Face, text and border colors are theme tokens in
 * public-theme.css, shared across all public CTA callers. */
function resolveSpec(variant: "primary" | "secondary", accent: Accent): VariantSpec {
  const a = ACCENT[accent];
  return variant === "primary"
    ? {
        dot: 96,
        core: "rgba(255,255,255,.75)",
        edge: "rgba(255,255,255,0)",
        lapMs: 3200,
        starChannels: "255, 255, 255",
        starPeak: 0.08,
        ring: "rgba(255,255,255,.2)",
      }
    : {
        dot: 96,
        core: a.alpha(0.55),
        edge: a.alpha(0),
        lapMs: 4400,
        starChannels: a.channels,
        starPeak: 0.46,
        ring: "rgba(255, 255, 255, 0.14)",
      };
}

/**
 * Deterministic per-cell pseudo-random, the same shape `CodeFieldBackground`
 * uses. ⚠️ Not `Math.random()`: the field is rebuilt on resize, and a real
 * random would visibly reprint every button while a window edge is dragged.
 */
function hash(col: number, row: number): number {
  const n = Math.sin(col * 127.1 + row * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * The used corner radius of `el`, clamped to what the box can actually show.
 *
 * ⚠️ `rounded-full` is `calc(infinity * 1px)` in Tailwind v4, which comes back
 * from `getComputedStyle` as either an enormous number or something
 * `parseFloat` cannot read. Both land on the half-height clamp, which is the
 * right answer for a pill; a percentage is resolved against the shorter side,
 * which is right for the `50%` spelling of the same thing.
 */
function usedRadius(el: Element, w: number, h: number): number {
  const max = Math.min(w, h) / 2;
  const raw = getComputedStyle(el).borderTopLeftRadius;
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return max;
  if (raw.includes("%")) return Math.min((n / 100) * Math.min(w, h), max);
  return Math.min(n, max);
}

/**
 * The point at normalised distance `t` along that perimeter, walking clockwise
 * from the start of the top edge. Written out rather than approximated with an
 * ellipse so a pill and a `rounded-xl` both track their real edge.
 */
function pointAt(w: number, h: number, r: number, t: number): [number, number] {
  const straightX = Math.max(0, w - 2 * r);
  const straightY = Math.max(0, h - 2 * r);
  const arc = (Math.PI / 2) * r;
  let d = ((t % 1) + 1) % 1;
  d *= 2 * straightX + 2 * straightY + 4 * arc;

  if (d < straightX) return [r + d, 0];
  d -= straightX;
  if (d < arc) {
    const a = -Math.PI / 2 + (d / arc) * (Math.PI / 2);
    return [w - r + Math.cos(a) * r, r + Math.sin(a) * r];
  }
  d -= arc;
  if (d < straightY) return [w, r + d];
  d -= straightY;
  if (d < arc) {
    const a = (d / arc) * (Math.PI / 2);
    return [w - r + Math.cos(a) * r, h - r + Math.sin(a) * r];
  }
  d -= arc;
  if (d < straightX) return [w - r - d, h];
  d -= straightX;
  if (d < arc) {
    const a = Math.PI / 2 + (d / arc) * (Math.PI / 2);
    return [r + Math.cos(a) * r, h - r + Math.sin(a) * r];
  }
  d -= arc;
  if (d < straightY) return [0, h - r - d];
  d -= straightY;
  const a = Math.PI + (d / arc) * (Math.PI / 2);
  return [r + Math.cos(a) * r, r + Math.sin(a) * r];
}

function subscribeInteractive(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia(INTERACTIVE);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

/**
 * Hydration-safe `(hover: hover) and (pointer: fine)`, same shape as
 * `useReducedMotionSafe`: the server snapshot is `false`, so the layers are
 * simply absent from the SSR markup and appear after hydration on a machine
 * that can hover. No markup mismatch, and no `setState` in an effect.
 */
function useHoverCapable(): boolean {
  return useSyncExternalStore(
    subscribeInteractive,
    () => window.matchMedia(INTERACTIVE).matches,
    () => false,
  );
}

interface Cell {
  x: number;
  y: number;
  /** Per-cell ink variation, so the field has grain instead of looking printed. */
  base: number;
  phase: number;
  /** Radians per millisecond — each cell twinkles on its own clock. */
  rate: number;
}

interface Props {
  children: React.ReactNode;
  /**
   * Extra classes for the WRAPPER. The pill's own padding, font, radius and
   * sizing stay on the caller's `<Link>` / `<button>` inside — this component
   * introduces none of its own and reads the radius it needs off that child.
   *
   * ⚠️ Do NOT pass a `display` utility here — `hidden`, `flex`, `block`, or a
   * responsive spelling of one. The host below hardcodes `relative inline-flex`
   * and simply appends this string to it, so the two land at equal specificity
   * and the winner is decided by Tailwind's emission order, not by yours.
   * `.inline-flex` is emitted AFTER `.hidden`, so `className="hidden md:inline-flex"`
   * reads as intended and hides nothing. That shipped: it left the header CTA
   * visible on phones, which pushed the mobile menu button 115px off the right
   * edge of the viewport and removed the site's only mobile navigation. Put
   * responsive visibility on a wrapper element around this one — see the header
   * CTA in `NavbarShell`.
   */
  className?: string;
  variant?: "primary" | "secondary";
  /** Which brand hue the rim light and the field are painted in. */
  accent?: Accent;
  /**
   * Suppress the whole effect. A disabled `<button>` does not fire pointer
   * events, but the LISTENER is on this wrapper, not on the child — so without
   * this a disabled submit still lights its rim and filled with stars when the
   * cursor crossed it, advertising an action that cannot be taken.
   */
  disabled?: boolean;
  /** Wrapper element. A span so it is legal inside any inline context. */
  as?: "span";
}

export function StarfieldButton({
  children,
  className = "",
  variant = "primary",
  accent = "teal",
  disabled = false,
  as: Tag = "span",
}: Props) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const dotLayerRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotionSafe();
  const hoverCapable = useHoverCapable();

  // Under reduced motion, or on a coarse pointer, nothing below is built: no
  // canvas, no listener, no loop. The wrapper itself still renders so the DOM
  // shape — and therefore the layout — is identical in every state.
  const active = hoverCapable && !reduced && !disabled;
  const spec = useMemo(() => resolveSpec(variant, accent), [variant, accent]);

  useEffect(() => {
    const host = hostRef.current;
    const dotLayer = dotLayerRef.current;
    const dot = dotRef.current;
    const canvas = canvasRef.current;
    if (!active || !host || !dotLayer || !dot || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cells: Cell[] = [];
    let width = 0;
    let height = 0;
    /** The dot layer's own box: one pixel wider than the pill, per the reference. */
    let dotW = 0;
    let dotH = 0;
    let dotR = 0;
    let radius = 0;
    /** Both radii are known; the ring can be drawn. */
    let measured = false;
    /** The canvas is sized and the cell table matches the current box. */
    let fieldStale = true;

    let raf = 0;
    let hovering = false;
    /** 0 at rest, 1 fully faded in. Everything the effect paints multiplies by it. */
    let intro = 0;
    let ramp = 0;
    let last = 0;
    let elapsed = 0;

    const rtl =
      (host.closest("[dir]")?.getAttribute("dir") ??
        document.documentElement.dir) === "rtl";

    /**
     * Box + radius, and the two ring layers' corners.
     *
     * ⚠️ Runs at MOUNT, not on first hover. The static hairline is visible at
     * rest, so a radius resolved lazily leaves it painting a RECTANGLE around a
     * pill until someone hovers — which is exactly what shipped in the first
     * cut of this and is obvious in a screenshot. Everything expensive (the
     * canvas backing store, the cell table) still waits for a hover; this is
     * one `getBoundingClientRect` and one `getComputedStyle`.
     */
    function measure() {
      if (!host || !dotLayer) return;
      const rect = host.getBoundingClientRect();
      width = Math.round(rect.width);
      height = Math.round(rect.height);
      if (width < 2 || height < 2) return;

      // The pill's classes live on the CHILD; this wrapper deliberately carries
      // no radius of its own. Fall back to the wrapper for a caller that styles
      // the wrapper instead.
      const styled = host.firstElementChild ?? host;
      radius = usedRadius(styled, width, height);

      dotW = width + 1;
      dotH = height + 1;
      dotR = Math.min(radius + 0.5, Math.min(dotW, dotH) / 2);
      dotLayer.style.borderRadius = `${dotR}px`;
      // The static hairline shares the pill's own radius exactly; the light's
      // band is the half-pixel-wider one above.
      if (ringRef.current) ringRef.current.style.borderRadius = `${radius}px`;
      measured = true;
    }

    /** The canvas half — allocated on the first hover and never before. */
    function buildField() {
      if (!canvas || !ctx || !measured) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      // `restore` undoes the previous layout's clip — a no-op on the first run,
      // since restoring an empty stack is defined to do nothing.
      ctx.restore();
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Clip to the pill so the corners of the field follow the caller's radius
      // without an extra `overflow-hidden` element — which would also have
      // clipped the link's focus ring.
      ctx.beginPath();
      ctx.roundRect(0, 0, width, height, radius);
      ctx.clip();

      cells = [];
      for (let y = PITCH / 2, row = 0; y < height; y += PITCH, row++) {
        for (let x = PITCH / 2, col = 0; x < width; x += PITCH, col++) {
          if (hash(col, row) >= DENSITY) continue;
          cells.push({
            x: x - CELL / 2,
            y: y - CELL / 2,
            base: 0.35 + hash(row, col) * 0.65,
            phase: hash(col + 7.3, row + 2.1) * Math.PI * 2,
            rate: 0.0015 + hash(row + 3.7, col + 1.9) * 0.0035,
          });
        }
      }
      fieldStale = false;
    }

    function draw() {
      if (!ctx || !dot || !dotLayer) return;

      // ── The travelling light ──────────────────────────────────────────────
      const t = (elapsed / spec.lapMs) % 1;
      const dir = rtl ? -t : t;
      // Smooth periodic speed modulation — see EASE_AMPLITUDE.
      const eased =
        dir + (EASE_AMPLITUDE / (4 * Math.PI)) * Math.sin(4 * Math.PI * dir);
      const [px, py] = pointAt(dotW, dotH, dotR, eased);
      dot.style.transform = `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0)`;
      dotLayer.style.opacity = `${intro}`;

      // ── The starfield ─────────────────────────────────────────────────────
      ctx.clearRect(0, 0, width, height);
      if (intro <= 0) return;

      // One opaque `fillStyle`, alpha via `globalAlpha`, rather than a per-cell
      // `rgba()` template literal: that allocated and CSS-colour-parsed a fresh
      // string for every cell on every frame. Cheap either way at this cell
      // count — measured 40.3 -> 38.6ms median, i.e. inside the noise — so this
      // is hygiene, not a fix. ⚠️ The 25fps that prompted it was a HEADLESS
      // artifact: the page's bare rAF cadence with nothing hovered measured 50ms
      // in the same run, so the field was already tracking the environment's own
      // ceiling. Do not cite a frame-rate number from a headless capture.
      ctx.fillStyle = `rgb(${spec.starChannels})`;
      const peak = spec.starPeak * intro;
      for (const c of cells) {
        const twinkle = 0.5 + 0.5 * Math.sin(elapsed * c.rate + c.phase);
        const a = peak * c.base * twinkle;
        // Below this a square is indistinguishable from the face it sits on, so
        // the fill is pure cost.
        if (a < 0.02) continue;
        ctx.globalAlpha = a;
        ctx.fillRect(c.x, c.y, CELL, CELL);
      }
      ctx.globalAlpha = 1;
    }

    function tick(now: number) {
      const dt = Math.min(now - last, 64);
      last = now;
      elapsed += dt;

      ramp = Math.max(0, Math.min(1, ramp + (hovering ? dt : -dt) / INTRO_MS));
      // Smoothstep, so the field arrives and leaves without a corner.
      intro = ramp * ramp * (3 - 2 * ramp);

      draw();

      // Cancelled only once the leave transition has finished easing out — not
      // at `pointerleave`, which would snap the field off mid-fade.
      if (!hovering && ramp === 0) {
        raf = 0;
        intro = 0;
        if (dotLayer) {
          dotLayer.style.opacity = "0";
          dotLayer.style.willChange = "";
        }
        // ⚠️ Drop the backing store rather than `clearRect`-ing it. The context
        // is CLIPPED to the pill, and both the fills and the clear are
        // antialiased against that same curve — so clearing is not the exact
        // inverse of drawing and leaves a scatter of fractional-alpha pixels on
        // the rim (measured: 12 of them). Resizing to 0x0 also means a button
        // nobody is hovering holds no bitmap at all, which is the §1d claim
        // taken literally. The context state goes with it, so the field is
        // marked stale for the next hover to rebuild.
        if (canvas) {
          canvas.width = 0;
          canvas.height = 0;
        }
        fieldStale = true;
        return;
      }
      raf = requestAnimationFrame(tick);
    }

    function onEnter(e: PointerEvent) {
      // A touch "hover" is the tap itself. Hybrid machines match the media
      // query and can still be touched, so the guard is not redundant.
      if (e.pointerType !== "mouse") return;
      if (!measured) measure();
      if (!measured) return;
      if (fieldStale) buildField();
      hovering = true;
      if (dotLayer) dotLayer.style.willChange = "opacity";
      if (dot) dot.style.willChange = "transform";
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    }

    function onLeave() {
      hovering = false;
      if (dot) dot.style.willChange = "";
      // No `cancelAnimationFrame` here: `tick` stops itself once `ramp` is back
      // at 0, which is what turns the leave into a fade rather than a cut.
    }

    function onResize() {
      // The ring is on screen at rest, so its geometry is re-read; the canvas
      // is not, so it is only marked stale for the next hover to rebuild.
      measure();
      fieldStale = true;
      if (hovering) buildField();
    }

    measure();

    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [active, spec]);

  return (
    <Tag
      ref={hostRef}
      data-starfield={variant}
      data-accent={accent}
      className={`relative inline-flex ${className}`}
    >
      {children}

      {active && (
        <>
          {/* The field sits above the face. Filled primary actions use a
              quieter white shimmer to preserve the label's contrast. */}
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            width={0}
            height={0}
            className="pointer-events-none absolute inset-0 h-full w-full"
          />

          {spec.ring && (
            <span
              ref={ringRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ ...RING_MASK, padding: 1, background: "var(--site-button-ring, " + spec.ring + ")" }}
            />
          )}

          {/* One pixel wider than the pill and two pixels thick, per the
              reference: the light overlaps the hairline rather than sitting
              inside it, which is what makes it read as a glow ON the rim. */}
          <span
            ref={dotLayerRef}
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{
              ...RING_MASK,
              inset: -0.5,
              padding: 2,
              opacity: 0,
            }}
          >
            <span
              ref={dotRef}
              className="absolute left-0 top-0 block"
              style={{
                width: spec.dot,
                height: spec.dot,
                margin: `${-spec.dot / 2}px 0 0 ${-spec.dot / 2}px`,
                background: `radial-gradient(circle, ${spec.core} 0%, ${spec.core} 30%, ${spec.edge} 72%)`,
              }}
            />
          </span>
        </>
      )}
    </Tag>
  );
}
