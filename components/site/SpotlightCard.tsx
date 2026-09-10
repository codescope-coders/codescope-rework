"use client";

import { useEffect, useId, useRef, useState, type PointerEvent, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { SPOTLIGHT_TEAL, SPOTLIGHT_PURPLE, SPOTLIGHT_NEUTRAL, withAlpha } from "@/lib/colors";
import { useSpotlightGroup } from "@/components/site/SpotlightGroup";

/* Tilt is deliberately shallower than the 9° the technique is usually drawn
   with. These cards carry three lines of body copy, and past ~6° the text edges
   visibly resample on a non-retina display — the card reads as slightly out of
   focus rather than as tilted. */
const TILT_MAX = 6;
const TILT_SPRING = { stiffness: 300, damping: 28 } as const;

interface Props {
  children: React.ReactNode;
  className?: string;
  /** A raw color — the spotlight is composed in a CSS custom property, which a
   *  Tailwind class cannot reach. Prefer the named values in `lib/colors.ts`. */
  spotlightColor?: string;
  /**
   * The card's GROUND — background, hairline, resting shadow. Defaults to
   * `glass-card`, which is what every card on the site wanted until the pricing
   * page needed three registers (plain / featured / best-value) sharing one
   * hover behaviour. Pass a class, not utilities: the ground sets `border` and
   * `box-shadow` as shorthands, and so does `.glass-card`, from inside the same
   * layer Tailwind's own `border-*` / `shadow-*` utilities land in.
   */
  surfaceClassName?: string;
  /**
   * Opt-in hover lift. OFF by default so the cards already using this
   * component are untouched — a lift is a claim that the card is pickable, and
   * the about / services / tourscope cards are not.
   *
   * Suppressed under reduced motion along with the spotlight: a 4px jump on
   * hover is exactly the vestibular trigger the preference exists for.
   */
  lift?: boolean;
  /**
   * Magnetic 3D tilt toward the pointer, plus a shimmer sweep and an accent
   * rule that draws itself along the card's block end on hover.
   *
   * Opt-in for the same reason `lift` is: fifteen cards on this site use this
   * component, and only the grids the founder named are meant to move.
   */
  tilt?: boolean;
}

export function SpotlightCard({
  children,
  className = "",
  spotlightColor = SPOTLIGHT_TEAL,
  surfaceClassName = "glass-card",
  lift = false,
  tilt = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const rect = useRef<DOMRect | null>(null);
  const [hovering, setHovering] = useState(false);
  const reduced = useReducedMotionSafe();

  // A card outside a `SpotlightGroup` is never dimmed and its callbacks are
  // inert, so this stays a drop-in for the eleven cards that are not grouped.
  const id = useId();
  const { dimmed, enter, leave } = useSpotlightGroup(id);

  /* The tilt reads the SAME pointer position the spotlight already measures —
     one `getBoundingClientRect`, one rAF, two effects. Motion values are
     written outside React state on purpose: a tilt driven by `useState` would
     re-render the card, and everything inside it, on every frame of a hover. */
  const normX = useMotionValue(0.5);
  const normY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(normY, [0, 1], [TILT_MAX, -TILT_MAX]), TILT_SPRING);
  const rotateY = useSpring(useTransform(normX, [0, 1], [-TILT_MAX, TILT_MAX]), TILT_SPRING);

  const animated = tilt && !reduced;
  const accent = withAlpha(spotlightColor, 0.85);

  // Pending pointer position, flushed once per frame. Two `setProperty` calls
  // straight out of `pointermove` are two style writes per event, and the
  // browser can deliver several events per frame.
  const pending = useRef<{ x: number; y: number } | null>(null);
  const frame = useRef(0);

  // The card can move under a stationary pointer — Lenis keeps scrolling the
  // page. Scroll marks the cached box stale rather than re-measuring on the
  // spot: `getBoundingClientRect` is a layout read, and doing it inside a
  // scroll handler forced a synchronous reflow on every frame of every scroll
  // while any card was hovered. The next pointer move — at most one per frame —
  // pays for a single re-measure.
  const stale = useRef(true);

  useEffect(() => {
    if (!hovering) return;
    const invalidate = () => { stale.current = true; };
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate);
    return () => {
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
    };
  }, [hovering]);

  // Any in-flight frame dies with the component.
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  function handlePointerEnter() {
    stale.current = true;
    setHovering(true);
    if (animated) enter();
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;

    if (stale.current || !rect.current) {
      rect.current = el.getBoundingClientRect();
      stale.current = false;
    }
    const r = rect.current;
    pending.current = { x: e.clientX - r.left, y: e.clientY - r.top };

    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const p = pending.current;
      if (!p) return;
      el.style.setProperty("--mouse-x", `${p.x}px`);
      el.style.setProperty("--mouse-y", `${p.y}px`);
      if (animated && rect.current) {
        normX.set(p.x / rect.current.width);
        normY.set(p.y / rect.current.height);
      }
    });
  }

  function handlePointerLeave() {
    setHovering(false);
    if (animated) {
      leave();
      // Back to centre, so the card settles level instead of freezing at the
      // angle the pointer happened to leave it at.
      normX.set(0.5);
      normY.set(0.5);
    }
    rect.current = null;
    pending.current = null;
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    ref.current?.style.setProperty("--mouse-x", "-999px");
    ref.current?.style.setProperty("--mouse-y", "-999px");
  }

  const card = (
    <motion.div
      ref={ref}
      // Reduced motion: the spotlight layer is not rendered, so tracking the
      // pointer across the card would drive nothing.
      onPointerEnter={reduced ? undefined : handlePointerEnter}
      onPointerMove={reduced ? undefined : handlePointerMove}
      onPointerLeave={reduced ? undefined : handlePointerLeave}
      // `group` is owned here, not left to the caller: the spotlight layer
      // below gates itself on `group-hover`, so a consumer that forgot the
      // class would get a spotlight stuck on at full strength.
      className={[
        "site-spotlight-card group relative overflow-hidden rounded-2xl",
        surfaceClassName,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      /* Siblings recede rather than disappear: at kokonut's 0.5 the unhovered
         cards stopped being readable, which on a grid whose whole job is six
         comparable claims reads as the page breaking, not as focus. */
      animate={animated ? { scale: dimmed ? 0.985 : 1, opacity: dimmed ? 0.72 : 1 } : undefined}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      style={
        {
          "--mouse-x": "-999px",
          "--mouse-y": "-999px",
          "--spotlight-color": spotlightColor,
          "--spotlight-light-color": spotlightColor === SPOTLIGHT_PURPLE ? "rgba(111,0,255,.13)"
            : spotlightColor === SPOTLIGHT_TEAL ? "rgba(7,111,101,.14)"
            : spotlightColor === SPOTLIGHT_NEUTRAL ? "rgba(23,53,44,.10)" : spotlightColor,
          ...(animated ? { rotateX, rotateY, transformPerspective: 900 } : null),
        } as CSSProperties
      }
    >
      {/* Spotlight layer — fades in on hover. It previously carried an inline
          `opacity: 1`, which outranks the `opacity-0` class and defeated the
          whole hover gate. */}
      {!reduced && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          style={{
            background: `radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), var(--site-active-spotlight, var(--spotlight-color)), transparent 70%)`,
          }}
        />
      )}
      {animated && (
        <>
          {/* Shimmer sweep. `start-0` + the `rtl:` pair mirror it: in Arabic the
              light has to travel the way the reader does, or the card looks
              like it is being wiped backwards. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 start-0 w-[55%] -skew-x-12 -translate-x-full bg-linear-to-r from-transparent via-white/[0.055] to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[280%] rtl:translate-x-full rtl:group-hover:-translate-x-[280%]"
          />
          {/* Accent rule along the block end, drawn on hover. */}
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-0 start-0 h-px w-0 [--accent-to:right] transition-[width] duration-500 ease-out group-hover:w-full rtl:[--accent-to:left]"
            style={{ background: `linear-gradient(to var(--accent-to, right), ${accent}, transparent)` }}
          />
        </>
      )}
      {children}
    </motion.div>
  );

  if (!lift || reduced) return card;

  // ⚠️ The lift lives on a STATIC wrapper's `:hover`, and the wrapper is why.
  // Two founder-reported "not smooth" rounds traced here:
  //
  // 1. The lift used to be Tailwind's `transition-transform` + `hover:-translate-y-1`
  //    on the card itself — but the `.pkg-*` grounds set `transition` as an
  //    UNLAYERED shorthand in globals.css, which outranks any layered Tailwind
  //    utility, so the computed transition-property was `border-color, box-shadow`
  //    and the 4px rise was an instant SNAP. The translate transition now lives
  //    in the same globals shorthand as the border/shadow (one authority), and
  //    the `.lift-scope:hover` rule there is what actually moves the card.
  //
  // 2. Hover on the MOVING element oscillates: with the cursor in the bottom
  //    few pixels, the rise carries the card's edge off the cursor → :hover
  //    ends → the card drops back onto the cursor → repeat. The wrapper keeps
  //    the hover region stationary while the card moves inside it, so the
  //    state can never flap.
  //
  // Reduced motion returns the unwrapped card above — no scope class, no lift.
  return <div className="lift-scope relative h-full">{card}</div>;
}
