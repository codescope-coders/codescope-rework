"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

/**
 * Hydration-safe `prefers-reduced-motion`.
 *
 * The server can't know the user's setting, so a component that renders
 * different markup for reduced motion will mismatch on hydration. `useSync-
 * ExternalStore` returns the server snapshot (`false`) for SSR and the first
 * client render, then settles to the real value after hydration — no markup
 * mismatch, and (unlike a mount flag) no `setState`-in-effect.
 */
export function useReducedMotionSafe(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
