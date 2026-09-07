"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import {
  DEEP_DIVE_SECTION_IDS,
  groupedDeepDiveSections,
  type DeepDiveGroup,
} from "@/components/site/tourscope/deep-dive/sections";

/**
 * The deep-dive region's topic nav — a sticky rail on desktop, a sticky chip
 * bar on a phone.
 *
 * ── Lenis owns the scroll ───────────────────────────────────────────────────
 * Every item is a plain `<a href="#dd-…">`. `SmoothScroll` constructs Lenis
 * with `anchors: true`, so an in-page anchor is eased for free — and under
 * `prefers-reduced-motion` Lenis is never constructed at all, so the browser's
 * own instant jump takes over, which is the correct behaviour there.
 *
 * ⚠️ Do NOT add `preventDefault` + `scrollIntoView` here, and do NOT add
 * `scroll-behavior: smooth` in CSS. Either one takes the scroll away from Lenis
 * and the two then fight: the native jump lands first and Lenis eases from
 * wherever it was left, which is the teleport-then-drift the `anchors: true`
 * flag exists to prevent.
 *
 * ── Active tracking ─────────────────────────────────────────────────────────
 * One IntersectionObserver over the section elements, with a `rootMargin` that
 * narrows the root to a band across the upper-middle of the viewport. The
 * active item is the intersecting section nearest the top, in document order.
 * When nothing intersects (between sections, or scrolled past the region) the
 * last active item is KEPT — blanking the rail mid-scroll reads as a fault, and
 * the rail is only on screen inside the region anyway.
 *
 * Observation is not motion, so it is deliberately ungated. The single thing
 * here that IS motion — the chip bar recentring itself — is gated below.
 */

const GROUP_LABEL_KEY: Record<DeepDiveGroup, string> = {
  verticals: "groupVerticals",
  console: "groupConsole",
};

export function DeepDiveRail() {
  const t = useTranslations("TourScope.deepDive");
  const reduced = useReducedMotionSafe();

  // Per the module note: seeded with the first section so the rail always
  // points somewhere, including before the observer's first callback.
  const [activeId, setActiveId] = useState<string>(DEEP_DIVE_SECTION_IDS[0] ?? "");

  const groups = groupedDeepDiveSections();

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const chipRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    const els = DEEP_DIVE_SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (els.length === 0) return;

    // A set rather than a "topmost entry in this batch": the callback only
    // carries the sections whose state CHANGED, so picking the winner from the
    // batch alone makes the active item depend on scroll velocity.
    const intersecting = new Set<string>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) intersecting.add(entry.target.id);
          else intersecting.delete(entry.target.id);
        }
        // Document order, so "nearest the top" needs no geometry.
        const next = DEEP_DIVE_SECTION_IDS.find((id) => intersecting.has(id));
        if (next) setActiveId(next);
      },
      // A ~10%-tall band sitting just above the vertical middle. Wider and two
      // adjacent sections are both "active" for most of the scroll; narrower
      // and a short section can cross it between two observer callbacks.
      { rootMargin: "-35% 0px -55% 0px" }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* Keep the active chip visible inside the bar — WITHOUT ever moving the page.
     `scrollIntoView` on the chip would scroll every scrollable ancestor,
     including the document, which mid-scroll means the bar fights the reader.
     `scrollBy` on the scroller cannot: it is relative, it is on one element,
     and being relative it needs no `scrollLeft` origin — which is what makes it
     correct under `dir="rtl"`, where the origin differs across engines. */
  useEffect(() => {
    const scroller = scrollerRef.current;
    const chip = chipRefs.current[activeId];
    if (!scroller || !chip) return;

    const scrollerBox = scroller.getBoundingClientRect();
    const chipBox = chip.getBoundingClientRect();
    const delta =
      chipBox.left + chipBox.width / 2 - (scrollerBox.left + scrollerBox.width / 2);

    // Sub-pixel deltas are noise; scrolling on them jitters the bar.
    if (Math.abs(delta) < 4) return;
    scroller.scrollBy({ left: delta, behavior: reduced ? "auto" : "smooth" });
  }, [activeId, reduced]);

  const railLabel = t("railLabel");

  return (
    <>
      {/* ── Phone: sticky chip bar ─────────────────────────────────────────
          `-mx-6` cancels the region's own `px-6`, so the bar's ground runs to
          the viewport edge while its chips stay on the text grid. `top-16` is
          the navbar's real height (`h-16` in NavbarShell), measured rather than
          guessed. */}
      {/* `/95`, not a lighter tint: this bar has section headings and 44px
          carrier tiles passing directly under it, and at 85% the heading behind
          it stayed legible enough to read as a rendering fault rather than as a
          bar. The blur alone does not carry it. */}
      <div className="sticky top-16 z-30 -mx-6 border-y border-white/[0.06] bg-cs-ink/95 px-6 py-2.5 backdrop-blur-xl lg:hidden">
        <nav aria-label={railLabel}>
          <div
            ref={scrollerRef}
            // Arbitrary variants rather than a `.scrollbar-*` utility: the only
            // scrollbar helper in globals.css lives inside the dashboard block,
            // which this page may not reach into.
            className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {groups.flatMap((entry) =>
              entry.sections.map((section) => {
                const active = section.id === activeId;
                return (
                  <a
                    key={section.id}
                    ref={(node) => {
                      chipRefs.current[section.id] = node;
                    }}
                    href={`#${section.id}`}
                    aria-current={active ? "true" : undefined}
                    data-active={active ? "true" : "false"}
                    data-dd-chip={section.id}
                    className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-200 ${
                      active
                        ? "border-ts-purple/40 bg-ts-purple/15 text-white"
                        : "border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {t(`nav.${section.navKey}`)}
                  </a>
                );
              })
            )}
          </div>
        </nav>
      </div>

      {/* ── Desktop: sticky vertical rail ──────────────────────────────────
          `self-start` is load-bearing: a grid item stretches to its row's full
          height by default, which leaves `sticky` nothing to travel within. */}
      <nav
        aria-label={railLabel}
        className="sticky top-24 hidden self-start lg:block"
      >
        <div className="flex flex-col gap-7">
          {groups.map((entry) => (
            <div key={entry.group}>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-600">
                {t(GROUP_LABEL_KEY[entry.group])}
              </p>
              <ul className="flex flex-col gap-0.5">
                {entry.sections.map((section) => {
                  const active = section.id === activeId;
                  return (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        aria-current={active ? "true" : undefined}
                        data-active={active ? "true" : "false"}
                        data-dd-rail={section.id}
                        className={`group flex items-center gap-2.5 py-1.5 text-sm transition-colors duration-200 ${
                          active ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {/* The indicator is a flex sibling, not an absolute
                            offset, so it sits on the inline START and mirrors
                            under RTL with no second rule. Always rendered —
                            hiding it would shift the label 10px on activation. */}
                        <span
                          aria-hidden
                          className={`block h-4 w-[2px] shrink-0 rounded-full transition-colors duration-200 ${
                            active ? "bg-ts-purple-text" : "bg-white/10"
                          }`}
                        />
                        {t(`nav.${section.navKey}`)}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </>
  );
}
