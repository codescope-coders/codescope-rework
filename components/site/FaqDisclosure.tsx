"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * A `<details>` that OPENS SMOOTHLY (founder request, 2026-09-06) without
 * giving up anything `<details>` was chosen for: no open/closed React state,
 * keyboard- and screen-reader-native, printable, and find-in-page can still
 * force one open (that path bypasses the click handler entirely and simply
 * snaps, which is correct — a browser jumping to a search hit should not wait
 * out an animation).
 *
 * ── Why Web Animations instead of CSS ──────────────────────────────────────
 * The honest CSS route (`interpolate-size` + `::details-content`) animates in
 * Chromium only today; everywhere else it silently snaps — which is exactly
 * the complaint this component exists to fix. Measuring real pixel heights
 * and driving them with `element.animate()` behaves identically in every
 * engine, and needs no height guesses (`max-height: 500px` truncates the two
 * long refund answers and animates at the wrong speed for the short ones).
 *
 * Animate only the disclosure height. Text remains readable during reversal;
 * there is no persistent opacity animation to hide a reopened answer.
 * A target ref records intent so rapid taps reverse the current transition.
 *
 * Reduced motion: the handler stands aside entirely and the platform's
 * instant toggle happens — instant IS the reduced-motion design.
 */
export function FaqDisclosure({
  summary,
  children,
}: {
  summary: ReactNode;
  children: ReactNode;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const targetOpen = useRef(false);
  const heightAnim = useRef<Animation | null>(null);
  const reduced = useReducedMotionSafe();

  const EASE = "cubic-bezier(0.21, 0.47, 0.32, 0.98)";

  function animateHeight(el: HTMLDetailsElement, from: number, to: number, onDone?: () => void) {
    heightAnim.current?.cancel();
    el.style.overflow = "clip";
    const a = el.animate(
      { height: [`${from}px`, `${to}px`] },
      { duration: 300, easing: EASE },
    );
    heightAnim.current = a;
    a.onfinish = () => {
      el.style.overflow = "";
      heightAnim.current = null;
      onDone?.();
    };
    // A cancel (rapid re-toggle) leaves the next animation in charge of
    // overflow; nothing to restore here.
  }

  useEffect(() => () => heightAnim.current?.cancel(), []);

  function onClick(e: MouseEvent<HTMLElement>) {
    const el = detailsRef.current;
    const head = summaryRef.current;
    if (!el || !head || reduced) return;
    e.preventDefault();

    const startHeight = el.getBoundingClientRect().height;
    const nextOpen = heightAnim.current ? !targetOpen.current : !el.open;
    targetOpen.current = nextOpen;
    // Cancel before measuring the natural height. A running animation would
    // otherwise return its intermediate height and strand a rapid re-toggle.
    heightAnim.current?.cancel();
    el.open = true;
    const endHeight = nextOpen
      ? el.getBoundingClientRect().height
      : head.getBoundingClientRect().height;
    animateHeight(el, startHeight, endHeight, () => {
      el.open = nextOpen;
    });
  }

  return (
    <details ref={detailsRef} className="group">
      <summary
        ref={summaryRef}
        onClick={onClick}
        className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden"
      >
        {summary}
      </summary>
      <div
        className="flex max-w-[68ch] flex-col gap-3 pb-6 text-sm leading-relaxed text-zinc-400"
      >
        {children}
      </div>
    </details>
  );
}
