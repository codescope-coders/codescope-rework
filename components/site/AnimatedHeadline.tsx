"use client";

import { motion } from "motion/react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { STAGGER, fadeUpChild, staggerContainer } from "@/lib/motion";

interface Props {
  text: string;
  accent: string;
  className?: string;
  accentClassName?: string;
}

// Words, not characters — the headline is rendered in Arabic too, where
// splitting a word severs the letter joins. Opacity + transform only: the
// per-word `filter: blur()` this used to animate forced a full-screen
// repaint per frame on the largest text on the page.
const container = staggerContainer(STAGGER.base + 0.01);

export function AnimatedHeadline({
  text,
  accent,
  className = "",
  accentClassName = "",
}: Props) {
  const reduced = useReducedMotionSafe();
  const mainWords = text.split(" ");
  const accentWords = accent.split(" ");

  // Reduced motion: the finished headline, immediately.
  if (reduced) {
    return (
      <h1 className={className}>
        {text}
        <br />
        <span className={accentClassName}>{accent}</span>
      </h1>
    );
  }

  return (
    <motion.h1
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      {/* REAL spaces between the word spans, not margins. A margin-separated
          headline reads and copies as one glued string ("وكالاتالسفركانت…"),
          which is exactly what shipped — margins are paint, spaces are text. */}
      {mainWords.map((w, i) => (
        <span key={`m-${i}`}>
          <motion.span variants={fadeUpChild} className="inline-block">
            {w}
          </motion.span>
          {i < mainWords.length - 1 ? " " : null}
        </span>
      ))}
      <br />
      {accentWords.map((w, i) => (
        <span key={`a-${i}`}>
          <motion.span
            variants={fadeUpChild}
            className={`inline-block ${accentClassName}`}
          >
            {w}
          </motion.span>
          {i < accentWords.length - 1 ? " " : null}
        </span>
      ))}
    </motion.h1>
  );
}
