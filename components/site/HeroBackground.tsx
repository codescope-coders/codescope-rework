"use client";

import { useRef, useEffect, useId } from "react";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useTransform,
  useSpring,
  animate,
} from "motion/react";
import { ScopeReticle } from "./ScopeReticle";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { tealGlow } from "@/lib/colors";
import "./hero-background.css";

interface Props {
  variant?: "teal" | "purple";
}

// Halved (0.16 -> 0.08) in the same pass that halved the token field's lit
// alpha: the two stack on every hero, and the COMPOUND is what read as a shine
// following the cursor around the site.
const CURSOR_GLOW = `radial-gradient(circle, ${tealGlow(0.08)} 0%, ${tealGlow(0.025)} 40%, transparent 70%)`;


export function HeroBackground({ variant = "teal" }: Props) {
  const isTeal = variant === "teal";
  const reduced = useReducedMotionSafe();

  // ── Mouse tracking ──────────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const primaryOrbRef = useRef<HTMLDivElement>(null);
  const secondaryOrbRef = useRef<HTMLDivElement>(null);
  const mx           = useMotionValue(-9999);
  const my           = useMotionValue(-9999);
  const maskRadius   = useMotionValue(0);

  // Lagged smooth position — scope follows cursor with a slight delay
  const SPRING = { stiffness: 55, damping: 18, mass: 0.6 } as const;
  const smoothX = useSpring(mx, SPRING);
  const smoothY = useSpring(my, SPRING);

  // Cursor glow bloom (300 px centred on cursor)
  const glowX       = useTransform(smoothX, (v) => v - 150);
  const glowY       = useTransform(smoothY, (v) => v - 150);
  const glowOpacity = useTransform(maskRadius, [0, 80], [0, 1]);

  // Circular spotlight mask: scope only visible near cursor
  // `black 25%`, not 50: the reveal used to hold full strength for half its
  // radius and then fall away, which cut the reticle lines off along a visible
  // circle. A quarter-radius core with a long feather lets them dissolve.
  const mask = useMotionTemplate`radial-gradient(circle ${maskRadius}px at ${smoothX}px ${smoothY}px, black 25%, transparent 92%)`;

  const pendingAnim = useRef<{ stop: () => void } | null>(null);
  const isOver      = useRef(false);

  // The noise filter is referenced by `url(#…)`, which is document-global: two
  // heroes on one page (or a hero plus any future consumer) would both point at
  // the first `hero-noise`. `useId` is per-instance; its React delimiters are
  // stripped because they are not valid in a CSS `url()` fragment.
  const noiseId = `hero-noise-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let visible = false;
    const update = () => {
      const covered = document.querySelector(".site-menu-toggle[open]") !== null;
      const state = visible && !document.hidden && !covered ? "running" : "paused";
      for (const orb of [primaryOrbRef.current, secondaryOrbRef.current]) {
        if (orb) orb.style.animationPlayState = state;
      }
    };
    const onToggle = (event: Event) => {
      if ((event.target as Element)?.matches?.(".site-menu-toggle")) update();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(container);
    document.addEventListener("toggle", onToggle, true);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("toggle", onToggle, true);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  useEffect(() => {
    // Reduced motion: no cursor tracking at all. The listener exists only to
    // drive the spotlight, so with the spotlight gone it is pure overhead.
    if (reduced) return;
    // iOS synthesizes mouse events for taps. Those must not start the desktop
    // spotlight's full-hero mask spring before a navigation click is delivered.
    // The ambient orbs, texture, and branding remain visible on touch screens.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    // The container's box, cached. `getBoundingClientRect` is a layout read;
    // doing it inside `mousemove` forces a synchronous reflow on every frame
    // the pointer is over the hero. Scroll and resize are the only things that
    // can move the box, so they mark the cache stale and the next move — at
    // most one per frame — pays for a single re-measure.
    const el = containerRef.current;
    if (!el) return;

    let rect: DOMRect | null = null;
    let stale = true;
    const invalidate = () => { stale = true; };

    const onMove = (e: MouseEvent) => {
      if (stale || !rect) {
        rect  = el.getBoundingClientRect();
        stale = false;
      }

      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const inside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;

      // Nothing to update: the pointer is outside the hero and the spotlight is
      // already fully closed. Writing `mx` / `my` anyway rebuilt the
      // full-viewport mask gradient on every frame the pointer moved anywhere
      // on the page, for a layer showing nothing.
      if (!inside && maskRadius.get() === 0) return;

      mx.set(x);
      my.set(y);

      if (inside && !isOver.current) {
        isOver.current = true;
        pendingAnim.current?.stop();
        pendingAnim.current = animate(maskRadius, 260, {
          type: "spring", stiffness: 85, damping: 20,
        });
      } else if (!inside && isOver.current) {
        isOver.current = false;
        pendingAnim.current?.stop();
        pendingAnim.current = animate(maskRadius, 0, {
          type: "spring", stiffness: 85, damping: 20,
        });
      }
    };

    // The hero is one screen of a long page, but the listeners were global and
    // permanent — so scrolling past it left every pointer move still rewriting a
    // mask nobody could see, on every route the component appears on. They are
    // attached only while the hero is actually in the viewport.
    let listening = false;
    const attach = () => {
      if (listening) return;
      listening = true;
      stale = true;
      window.addEventListener("mousemove", onMove);
      window.addEventListener("scroll", invalidate, { passive: true });
      window.addEventListener("resize", invalidate);
    };
    const detach = () => {
      if (!listening) return;
      listening = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
      // Leaving the spotlight open off-screen would have it still there on the
      // way back up, anchored to a stale pointer position.
      if (isOver.current) {
        isOver.current = false;
        pendingAnim.current?.stop();
        pendingAnim.current = animate(maskRadius, 0, { duration: 0 });
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? attach() : detach()),
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      detach();
      pendingAnim.current?.stop();
    };
  }, [mx, my, maskRadius, reduced]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Grid */}
      <div className="absolute inset-0 grid-bg opacity-60" />

      {/* ── Orbs ────────────────────────────────────────────────────────────
          Two slow, heavily-blurred washes. These predate the aurora beam that
          briefly replaced them and are back because the beam read as glare —
          at `/8` and `/5` over a `blur-3xl` these are atmosphere, not shine.

          CSS transform loops preserve the drift without JavaScript per frame.
          Pause at the current position while outside the viewport or covered
          by navigation; resume the decoration when the page is visible again. */}
      <div
        ref={primaryOrbRef}
        className={`site-hero-orb site-hero-orb-primary pointer-events-none absolute -top-32 ${isTeal ? "-start-32" : "-end-32"} h-[650px] w-[650px] rounded-full blur-3xl ${isTeal ? "bg-cs-teal/8" : "bg-ts-purple/8"}`}
      />

      <div
        ref={secondaryOrbRef}
        className={`site-hero-orb site-hero-orb-secondary pointer-events-none absolute -bottom-48 ${isTeal ? "-end-24" : "-start-24"} h-[500px] w-[500px] rounded-full blur-3xl ${isTeal ? "bg-ts-purple/5" : "bg-cs-teal/5"}`}
      />

      {/* ── Ghost scope — barely-visible silhouette at rest (desktop) ── */}
      <div className="hidden lg:flex absolute inset-0 items-center pointer-events-none opacity-[0.05]">
        <ScopeReticle className="w-full" />
      </div>

      {/* Noise texture */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
        <filter id={noiseId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${noiseId})`} />
      </svg>


      {/* ── Cursor-driven layers ───────────────────────────────────────
          Both are meaningless without a tracked pointer, so reduced motion
          drops them rather than freezing them somewhere arbitrary. */}
      {!reduced && (
        <>
          {/* Bright scope — revealed inside the cursor spotlight */}
          <motion.div
            className="hidden lg:flex absolute inset-0 items-center opacity-[0.6]"
            style={{ WebkitMaskImage: mask, maskImage: mask }}
          >
            <ScopeReticle className="w-full" />
          </motion.div>

          {/* Cursor glow bloom */}
          <motion.div
            className="hidden lg:block absolute pointer-events-none rounded-full"
            style={{
              width: 300,
              height: 300,
              x: glowX,
              y: glowY,
              opacity: glowOpacity,
              background: CURSOR_GLOW,
            }}
          />
        </>
      )}
    </div>
  );
}
