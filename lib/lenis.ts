"use client";

import type Lenis from "lenis";

/**
 * A one-slot registry for the app's Lenis instance.
 *
 * Anything that opens a full-screen layer has to stop the smooth-scroll driver
 * while it is up — `overflow: hidden` on `<body>` does not, on its own, stop
 * Lenis from animating the page behind an overlay. Rather than thread the
 * instance through context for a single consumer, `SmoothScroll` parks it here
 * on mount and clears it on unmount.
 *
 * Both helpers are no-ops when Lenis is not mounted, which is the normal state
 * under `prefers-reduced-motion` — callers must still handle their own body
 * scroll lock.
 */
let instance: Lenis | null = null;

export function registerLenis(next: Lenis | null) {
  instance = next;
}

export function pauseSmoothScroll() {
  instance?.stop();
}

export function resumeSmoothScroll() {
  instance?.start();
}

/**
 * Pre-existing aliases kept so nothing that reached for the older two-function
 * shape breaks. They read and write the same slot as `registerLenis`, so the
 * two APIs cannot disagree about which instance is live.
 */
export function setLenis(next: Lenis) {
  instance = next;
}

export function getLenis() {
  return instance;
}
