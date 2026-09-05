"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * `false` on the server and for the first client render, `true` after hydration.
 *
 * The point is to let a component ship one set of markup to the server and a
 * different one to the browser without a hydration mismatch — specifically, so
 * a scroll-driven reveal can render its text READABLE in the server HTML and
 * only then hand it over to the dimmed, scroll-linked state. Without JS the
 * text simply stays readable, which is what PRODUCT.md means by "reveal
 * animations must enhance already-visible content, never gate visibility".
 *
 * `useSyncExternalStore` rather than `useState` + `useEffect`, for the same
 * reason `useReducedMotionSafe` uses it: the server snapshot is what React
 * hydrates against, so the swap happens in React's own post-hydration pass
 * instead of a `setState` fired from an effect.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
