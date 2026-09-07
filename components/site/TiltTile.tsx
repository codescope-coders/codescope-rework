"use client";

import { useId, useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { useSpotlightGroup } from "@/components/site/SpotlightGroup";

/**
 * The card grids' tilt-and-recede, for something that is NOT a card.
 *
 * The app-icon wall is sixteen 88px squircles with no surface of their own —
 * they are the artwork. So this is `SpotlightCard`'s motion without any of its
 * chrome: no ground, no hairline, no cursor wash, no shimmer, no accent rule.
 * Layering those onto an app icon would put our card on top of a client's
 * identity, which is the one thing that exhibit must not do.
 *
 * ⚠️ The tilt is stronger here (10° against the cards' 6°) and that is not an
 * inconsistency. The cards carry body copy, which resamples visibly past ~6°;
 * an icon is a picture and reads as a physical tile being pushed — the same
 * angle that blurs a paragraph is what makes a 88px square feel touchable.
 */
const TILT_MAX = 10;
const TILT_SPRING = { stiffness: 300, damping: 28 } as const;

export function TiltTile({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionSafe();
  const id = useId();
  const { dimmed, enter, leave } = useSpotlightGroup(id);

  const normX = useMotionValue(0.5);
  const normY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(normY, [0, 1], [TILT_MAX, -TILT_MAX]), TILT_SPRING);
  const rotateY = useSpring(useTransform(normX, [0, 1], [-TILT_MAX, TILT_MAX]), TILT_SPRING);

  if (reduced) return <>{children}</>;

  return (
    <motion.div
      ref={ref}
      onPointerEnter={enter}
      onPointerMove={(e) => {
        // Measured per move rather than cached: a tile is 88px, the wall wraps
        // to four rows on a phone, and the read is cheap at this size — the
        // caching dance `SpotlightCard` needs is for cards that fill a column.
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        normX.set((e.clientX - r.left) / r.width);
        normY.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        leave();
        normX.set(0.5);
        normY.set(0.5);
      }}
      // Icons recede a little further than the cards do (0.94 / 0.55 against
      // 0.985 / 0.72): there is no text to keep legible here, and sixteen tiles
      // need a stronger signal than six cards for the hovered one to stand out.
      animate={{ scale: dimmed ? 0.94 : 1, opacity: dimmed ? 0.55 : 1 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      style={{ rotateX, rotateY, transformPerspective: 600 }}
    >
      {children}
    </motion.div>
  );
}
