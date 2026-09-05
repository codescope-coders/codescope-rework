"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import { motion, useSpring } from "motion/react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

interface Props {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export function MagneticButton({ children, className = "", strength = 0.12 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 200, damping: 25, mass: 0.1 });
  const y = useSpring(0, { stiffness: 200, damping: 25, mass: 0.1 });
  const reduced = useReducedMotionSafe();

  // The button's centre, measured once when the pointer arrives. Reading it
  // per pointermove forces a layout flush on every frame of the hover.
  const centre = useRef<{ cx: number; cy: number } | null>(null);

  // The page keeps scrolling under a hovering pointer (Lenis, a trackpad, a
  // wheel), which moves the button but not the cached centre — so the pull
  // grew with the scroll distance and the button drifted off toward a point it
  // had long since left. Scrolling drops the measurement; the next move
  // re-takes it.
  useEffect(() => {
    if (reduced) return;
    const invalidate = () => { centre.current = null; };
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate);
    return () => {
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
    };
  }, [reduced]);

  function measure() {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    centre.current = {
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2,
    };
  }

  function handlePointerEnter(e: PointerEvent<HTMLDivElement>) {
    // Mouse only. A touch "hover" is the tap itself, so on a phone the button
    // lurched toward the finger at the moment of pressing it — the one time it
    // must stay exactly where the user aimed. Pens are excluded for the same
    // reason.
    if (e.pointerType !== "mouse") return;
    measure();
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    if (!centre.current) measure();
    const c = centre.current;
    if (!c) return;
    x.set((e.clientX - c.cx) * strength);
    y.set((e.clientY - c.cy) * strength);
  }

  function handlePointerLeave() {
    centre.current = null;
    x.set(0);
    y.set(0);
  }

  // Reduced motion: a plain passthrough. No springs, no listeners — the
  // wrapper keeps its layout role and nothing chases the cursor.
  if (reduced) {
    return (
      <div className={className} style={{ display: "inline-flex" }}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ x, y, display: "inline-flex" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
