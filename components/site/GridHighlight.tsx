"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useMotionTemplate } from "motion/react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { tealGlow } from "@/lib/colors";

// Grid cell size matches the existing .grid-bg in globals.css (64 × 64 px).
const CELL = "64px 64px";

// Base grid line — white, very faint (matches existing .grid-bg tone).
const BASE_LINE = "rgba(255,255,255,0.025)";

// Highlighted line — brand teal, revealed near the cursor.
const GLOW_LINE = tealGlow(0.18);

const GRID_IMG = (color: string) =>
  `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`;

/**
 * Where the cursor glow is worth its cost — the JS half of `.cursor-glow-layer`
 * in `globals.css`, which hides the layer itself. The two must agree: the CSS
 * decides whether the layer is painted, this decides whether anything drives it.
 */
const GLOW_MEDIA = "(hover: hover) and (pointer: fine) and (min-width: 1024px)";

export function GridHighlight() {
  const mx = useMotionValue(-9999);
  const my = useMotionValue(-9999);
  const reduced = useReducedMotionSafe();

  // Tight spotlight — the teal glow is "very little", appearing just near the cursor.
  const mask = useMotionTemplate`radial-gradient(circle 200px at ${mx}px ${my}px, black 45%, transparent 100%)`;

  useEffect(() => {
    // Reduced motion: the glow layer is not rendered, so tracking the pointer
    // across every page would drive nothing.
    if (reduced) return;
    // Same gate as the layer below. A touch device has no hovering pointer, so
    // the glow can never be seen there — but the listener still fired on every
    // tap-drag and rewrote a viewport-sized mask gradient for it. The media
    // query is read once here rather than per move; a device does not change
    // its pointer type mid-session.
    if (!window.matchMedia(GLOW_MEDIA).matches) return;

    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my, reduced]);

  return (
    // Fixed → covers the full viewport on every page as you scroll.
    // -z-10 → sits behind all page content without blocking interactions.
    <div className="fixed inset-0 pointer-events-none -z-10" aria-hidden="true">

      {/* Base grid — barely visible silhouette of the net at rest. This layer
          is static and stays on under reduced motion: it is texture, not
          motion. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: GRID_IMG(BASE_LINE),
          backgroundSize: CELL,
        }}
      />

      {/* Teal-highlighted grid — revealed only near the cursor. The class gate
          mirrors GLOW_MEDIA: the CSS hides the layer, the effect above skips the
          listener that would drive it. */}
      {!reduced && (
        <motion.div
          className="cursor-glow-layer absolute inset-0"
          style={{
            backgroundImage: GRID_IMG(GLOW_LINE),
            backgroundSize: CELL,
            WebkitMaskImage: mask,
            maskImage: mask,
          }}
        />
      )}
    </div>
  );
}
