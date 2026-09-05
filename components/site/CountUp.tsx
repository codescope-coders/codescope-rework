"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

interface Props {
  value: string;
  className?: string;
}

function parseValue(raw: string): { num: number; suffix: string } {
  const match = raw.match(/^([\d.]+)(.*)$/);
  if (!match) return { num: 0, suffix: raw };
  return { num: parseFloat(match[1]), suffix: match[2] };
}

export function CountUp({ value, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotionSafe();
  const { num, suffix } = parseValue(value);
  const isFloat = num % 1 !== 0;

  const final = isFloat ? num.toFixed(1) : Math.round(num).toString();
  // Seeded with the FINAL value, not "0". The server has no viewport and no rAF,
  // so a "0" seed shipped `0+ Live supplier integrations` in the HTML — the
  // number is the claim, and that is the version a crawler, a reader-mode
  // parser and a JS-less visitor keep. The count starts from zero on the client
  // frame the animation actually begins (the first rAF tick renders progress 0),
  // so nothing is lost visually.
  const [display, setDisplay] = useState(final);

  useEffect(() => {
    // Reduced motion: nothing to run. The final value is substituted at render
    // time below rather than pushed through state here — a synchronous
    // setState in an effect body is a cascading render.
    if (reduced || !isInView) return;

    const duration = 1200;
    const start = performance.now();
    // Held so the loop can be cancelled: without this the rAF chain outlives
    // the component and calls setState on an unmounted node every frame.
    let frame = 0;

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = num * eased;
      setDisplay(isFloat ? current.toFixed(1) : Math.round(current).toString());
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame);
  }, [isInView, num, isFloat, reduced]);

  // The number IS the content, so under reduced motion it is shown outright —
  // never a "0" waiting on an animation that will not run.
  return (
    <span ref={ref} className={className}>
      {reduced ? final : display}
      {suffix}
    </span>
  );
}
