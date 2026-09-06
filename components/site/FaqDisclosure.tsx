"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";
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
 * ── The choreography ───────────────────────────────────────────────────────
 * Open: set `open` first (content becomes measurable), then animate the
 * details' height summary→full while the body fades and rises 4px. Close: the
 * same in reverse, and `open` is only removed when the animation FINISHES —
 * remove it first and the content vanishes before the height starts moving.
 * A toggle mid-flight cancels the running animation and starts from the
 * current measured height, so hammering the question can't strand it half
 * open. `overflow: clip` lives only for the duration of the animation; at
 * rest the element is untouched.
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
  const bodyRef = useRef<HTMLDivElement>(null);
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

  function onClick(e: MouseEvent<HTMLElement>) {
    const el = detailsRef.current;
    const head = summaryRef.current;
    if (!el || !head || reduced) return; // native instant toggle

    e.preventDefault();

    const startHeight = el.getBoundingClientRect().height;
    const headHeight = head.getBoundingClientRect().height;
    // Mid-flight, `el.open` is not the visual truth — the measured height is.
    // "More than the summary tall" means visually opening/open, so close.
    const visuallyOpen = el.open && startHeight > headHeight + 1;

    if (visuallyOpen) {
      bodyRef.current?.animate(
        { opacity: [1, 0], transform: ["translateY(0)", "translateY(-4px)"] },
        { duration: 180, easing: "ease-out", fill: "forwards" },
      );
      animateHeight(el, startHeight, headHeight, () => {
        el.open = false;
      });
    } else {
      el.open = true;
      const fullHeight = el.getBoundingClientRect().height;
      animateHeight(el, Math.max(startHeight, headHeight), fullHeight);
      bodyRef.current?.animate(
        { opacity: [0, 1], transform: ["translateY(-4px)", "translateY(0)"] },
        { duration: 300, delay: 60, easing: EASE, fill: "backwards" },
      );
    }
  }

  return (
    <details ref={detailsRef} className="group">
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions --
          <summary> is the platform's own disclosure button; the click handler
          only re-times what the element already does. */}
      <summary
        ref={summaryRef}
        onClick={onClick}
        className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden"
      >
        {summary}
      </summary>
      <div
        ref={bodyRef}
        className="flex max-w-[68ch] flex-col gap-3 pb-6 text-sm leading-relaxed text-zinc-400"
      >
        {children}
      </div>
    </details>
  );
}
