"use client";

import { motion } from "motion/react";
import { ArrowDown } from "lucide-react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

interface Props {
  label: string;
}

// Calm vertical drift. Smooth easeInOut — no spring, no elastic.
export function ScrollCue({ label }: Props) {
  const reduced = useReducedMotionSafe();

  return (
    // zinc-400, not zinc-600: the label is this component's only visible text,
    // and at 2.57:1 it was effectively invisible on the hero ground.
    <div className="flex flex-col items-center gap-2 text-zinc-400">
      <span className="text-[10px] uppercase tracking-widest">{label}</span>
      <motion.span
        animate={reduced ? undefined : { y: [0, 6, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ArrowDown size={14} />
      </motion.span>
    </div>
  );
}
