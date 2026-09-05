"use client";

import { useEffect, useRef, useState, type PointerEvent, type CSSProperties } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { SPOTLIGHT_TEAL } from "@/lib/colors";

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
}

export function SpotlightCard({
  children,
  className = "",
  spotlightColor = SPOTLIGHT_TEAL,
  surfaceClassName = "glass-card",
  lift = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const rect = useRef<DOMRect | null>(null);
  const [hovering, setHovering] = useState(false);
  const reduced = useReducedMotionSafe();

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
    });
  }

  function handlePointerLeave() {
    setHovering(false);
    rect.current = null;
    pending.current = null;
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    ref.current?.style.setProperty("--mouse-x", "-999px");
    ref.current?.style.setProperty("--mouse-y", "-999px");
  }

  const card = (
    <div
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
        "group relative overflow-hidden rounded-2xl",
        surfaceClassName,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          "--mouse-x": "-999px",
          "--mouse-y": "-999px",
          "--spotlight-color": spotlightColor,
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
            background: `radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 70%)`,
          }}
        />
      )}
      {children}
    </div>
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
