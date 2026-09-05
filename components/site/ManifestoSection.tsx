"use client";

import { useRef } from "react";
import { ScrollRevealText } from "@/components/site/ScrollRevealText";
import { tealGlow } from "@/lib/colors";

/**
 * The home page's manifesto — the site's original spoken-statement moment.
 *
 * This file is LAYOUT only. The reveal itself (three-stage colour, token
 * windows, spring, mounted gate, reduced-motion branch, per-word Arabic
 * tokenisation) lives in `ScrollRevealText`, which every other placement on the
 * site shares. Anything you are tempted to tune here about how the wave BEHAVES
 * belongs there instead.
 */

const SECTION_BG: React.CSSProperties = {
  backgroundImage: `radial-gradient(ellipse at center, ${tealGlow(0.06)} 0%, transparent 65%)`,
};

const SECTION_CLASS = "border-t border-white/5 bg-cs-manifesto";

/**
 * The section's heading — an `h2`, not the `p` it used to be.
 *
 * The manifesto is a top-level section of the page and this line is what names
 * it, so it belongs in the document outline: without it the page jumped from
 * the `h1` straight to the platform section, and anyone navigating by headings
 * had no way to reach or even know about this one. Visually identical to the
 * eyebrow it replaces — bumped from zinc-500 (4.12:1) to zinc-400 (7.76:1),
 * which is the only change a sighted reader sees.
 */
const EYEBROW_CLASS =
  "text-xs font-normal uppercase tracking-[0.2em] text-zinc-400 mb-10";

interface Props {
  text: string;
  eyebrow: string;
  highlights: string[];
}

export function ManifestoSection({ text, eyebrow, highlights }: Props) {
  // The scroll target is the SECTION, not the paragraph: the eyebrow above the
  // text puts the section's centre ~29px higher, and the offsets in
  // `ScrollRevealText` were tuned against that. Handing the paragraph its own
  // ref here would shift the whole sweep by that much.
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className={SECTION_CLASS}
      style={{ ...SECTION_BG, position: "relative", padding: "clamp(48px,6vw,80px) clamp(16px,2.5vw,32px)" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <h2 className={EYEBROW_CLASS}>{eyebrow}</h2>
        <ScrollRevealText
          text={text}
          highlights={highlights}
          targetRef={sectionRef}
          className="font-medium leading-[1.5] tracking-tight"
          style={{ fontSize: "clamp(1.9rem,3.4vw,3.25rem)" }}
        />
      </div>
    </section>
  );
}
