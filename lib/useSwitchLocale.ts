"use client";

import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { useLocale } from "next-intl";
import { LOCALE_COOKIE } from "@/i18n/config";
import { localizedPath, unlocalizedPath } from "@/lib/site-urls";
import { getLenis } from "@/lib/lenis";

/** A year. The locale is a preference, not a session. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Where the reader was, expressed so it survives the page being re-rendered in
 * another language.
 *
 * A raw pixel offset is the obvious record and the weakest one: the same page
 * is not the same height in English and Arabic (measured on /tourscope,
 * 26,467px vs 25,867px), so restoring the number lands the reader ~600px from
 * what they were reading — most of a viewport, and worse the deeper they were.
 * So we anchor on the ELEMENT they were looking at plus its offset inside the
 * viewport, and fall back to the pixel only when nothing on screen carries an
 * id.
 */
type ScrollAnchor = { id: string; viewportTop: number } | { y: number };

/**
 * Where to look for what the reader is reading, in viewport pixels.
 *
 * Several points, not one: on a phone the deep-dive's sticky chip bar sits
 * directly under the fixed navbar, so a single probe at 96px hits the CHROME
 * and resolves to the region wrapper (`#explore`, ~20,000px tall) — an anchor
 * so coarse it restored 216px off. Probing further down as well reaches real
 * content in every layout.
 */
const PROBE_YS = [96, 160, 240, 340];

/** A switch is a click and a server round trip; anything older is not ours. */
const ANCHOR_TTL_MS = 8000;

/**
 * The pending restore lives OUTSIDE React, and it has to.
 *
 * Switching locale unmounts and remounts this hook's host component — measured,
 * twice — because next-intl's middleware rewrites the bare URL onto the
 * internal `/[locale]/…` path, so the refreshed payload is a different route as
 * far as the App Router is concerned. A `useRef` is destroyed with the first
 * unmount, and the remounted copy reads `null` (which is exactly what the first
 * version of this did: it captured the anchor and then never saw it again).
 */
let pendingRestore: {
  anchor: ScrollAnchor;
  toLocale: string;
  capturedAt: number;
} | null = null;

function captureAnchor(): ScrollAnchor {
  const y = window.scrollY;
  if (y <= 0) return { y: 0 };

  const x = window.innerWidth / 2;
  let best: { el: Element; height: number } | null = null;

  for (const probeY of PROBE_YS) {
    let el = document.elementFromPoint(x, probeY);
    while (el && !el.id) el = el.parentElement;
    if (!el?.id) continue;

    // The SMALLEST id'd element wins — it is the most specific thing on
    // screen, and restoring it puts the reader back on the same paragraph
    // rather than the same 20,000px region.
    const height = el.getBoundingClientRect().height;
    if (!best || height < best.height) best = { el, height };
  }

  return best
    ? { id: best.el.id, viewportTop: best.el.getBoundingClientRect().top }
    : { y };
}

function resolveTarget(anchor: ScrollAnchor): number {
  if ("y" in anchor) return anchor.y;
  const el = document.getElementById(anchor.id);
  if (!el) return 0;
  // `scrollY` is 0 by the time this runs (Next has already reset it), so the
  // element's rect top IS its absolute document offset — but read `scrollY`
  // rather than assume it, in case that ordering ever changes.
  return Math.max(
    0,
    window.scrollY + el.getBoundingClientRect().top - anchor.viewportTop,
  );
}

function restore(anchor: ScrollAnchor) {
  const target = resolveTarget(anchor);
  if (target <= 0) return;

  // Lenis owns the scroll while it is mounted; a bare `window.scrollTo` is
  // overwritten by its next rAF tick. `immediate` skips the easing (this is a
  // restore, not a journey) and `force` applies even while it is stopped.
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(target, { immediate: true, force: true });
  else window.scrollTo(0, target);
}

/** Preserve the reader’s place across public URL changes and internal cookie refreshes. */
export function useSwitchLocale(publicSite = false) {
  const router = useRouter();
  const activeLocale = useLocale();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const p = pendingRestore;
    if (!p) return;

    // Not the render that carries the new language yet — wait for it.
    if (p.toLocale !== activeLocale) return;

    // A switch that never completed (navigated away mid-flight, an aborted
    // refresh); do not yank a later page to a stale offset.
    if (Date.now() - p.capturedAt > ANCHOR_TTL_MS) {
      pendingRestore = null;
      return;
    }

    const raf = requestAnimationFrame(() => {
      pendingRestore = null;
      restore(p.anchor);
    });
    // Cancel the frame, keep the pending record: this component is remounted
    // during the switch, and the mount that survives has to be able to finish
    // the job.
    return () => cancelAnimationFrame(raf);
  }, [activeLocale]);

  function switchLocale(nextLocale: string) {
    if (nextLocale === activeLocale) return;

    pendingRestore = {
      anchor: captureAnchor(),
      toLocale: nextLocale,
      capturedAt: Date.now(),
    };
    document.cookie = `${LOCALE_COOKIE}=${nextLocale};path=/;max-age=${COOKIE_MAX_AGE};samesite=lax`;

    startTransition(() => {
      if (publicSite) {
        const path = unlocalizedPath(window.location.pathname);
        router.replace(localizedPath(path, nextLocale) + window.location.search + window.location.hash, { scroll: false });
      } else {
        router.refresh();
      }
    });
  }

  return { switchLocale, isPending, activeLocale };
}
