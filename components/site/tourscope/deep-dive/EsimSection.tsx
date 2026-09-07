import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/site/FadeIn";
import { ProductFrame } from "@/components/site/tourscope/ProductFrame";
import { EsimStoreSlice } from "@/components/site/tourscope/deep-dive/EsimStoreSlice";

/**
 * The deep dive's sixth and last vertical section: eSIMs.
 *
 * Three movements, in the order a reader needs them — the claim, the product
 * making it, and the facts the product cannot draw. Same anatomy as the five
 * sections above it, deliberately: by the sixth section the shape itself is the
 * signal that these are chapters of one reference rather than six pitches, and a
 * section that broke the pattern here — at the point a reader is deciding
 * whether the list has ended — would read as a different kind of thing rather
 * than as the last one.
 *
 * ── Why a ledger and not cards ──────────────────────────────────────────────
 * The flights section ends in two walls of carrier logos, because there the
 * inventory IS the evidence — 45 marks a reader recognises. eSIMs have no such
 * wall available, and for a sharper reason than insurance's: the supplier behind
 * an eSIM catalog is deliberately invisible to the traveller, who buys a plan
 * for a country rather than a brand. A supplier wall here would name the one
 * party the product is designed not to put in front of anyone. The only honest
 * closing movement is four written facts about what the vertical actually does.
 *
 * They are hairline ROWS, not a card grid, for the reason the hotels section
 * gives: this section already spends its visual budget on a big framed exhibit,
 * and a 2×2 of bordered cards under it would compete with that frame for the
 * same attention while saying less.
 *
 * ── Why the row ordinals are muted and not purple ───────────────────────────
 * The SECTION's own ordinal is already a purple two-digit index a few hundred
 * pixels above, and a second purple `06` inside the same section reads as the
 * same kind of thing — a section marker — rather than as a list ordinal. The
 * accent stays with the section; the rows take the muted register.
 */

export async function EsimSection({ num }: { num: string }) {
  const t = await getTranslations("TourScope.deepDive.esim");

  const facts = [
    { num: "01", title: t("f1Title"), body: t("f1Body") },
    { num: "02", title: t("f2Title"), body: t("f2Body") },
    { num: "03", title: t("f3Title"), body: t("f3Body") },
    { num: "04", title: t("f4Title"), body: t("f4Body") },
  ];

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      {/* ── 1. The claim ───────────────────────────────────────────────── */}
      <FadeIn>
        <span
          aria-hidden
          className="mb-4 block text-[11px] font-semibold tabular-nums tracking-widest text-ts-purple-text"
        >
          {num}
        </span>
        <h3 className="mb-4 text-2xl font-bold leading-snug tracking-tight text-white text-balance sm:text-3xl">
          {t("headline")}
        </h3>
        <p className="max-w-[52ch] text-[17px] leading-relaxed text-zinc-300">{t("body")}</p>
      </FadeIn>

      {/* ── 2. The product doing it ────────────────────────────────────── */}
      <FadeIn delay={0.05}>
        <ProductFrame caption={t("sliceCaption")}>
          <EsimStoreSlice />
        </ProductFrame>
      </FadeIn>

      {/* ── 3. What the vertical ships ─────────────────────────────────── */}
      <FadeIn delay={0.05}>
        <h4 className="mb-2 text-sm font-semibold text-white">{t("factsTitle")}</h4>
        {/* The rule sits on each row's block START, so the list needs no
            dividers of its own and the closing `border-b` finishes it — the
            same ledger mechanism the page's own lists use. */}
        <ul className="border-b border-white/[0.07]">
          {facts.map((fact) => (
            <li key={fact.num} className="border-t border-white/[0.07] py-5 sm:py-6">
              <div className="flex gap-4 sm:gap-5">
                <span
                  aria-hidden
                  className="shrink-0 pt-[3px] text-[11px] font-semibold tabular-nums tracking-widest text-zinc-600"
                >
                  {fact.num}
                </span>
                <div className="min-w-0">
                  <h5 className="mb-1.5 text-[15px] font-semibold leading-snug text-white">
                    {fact.title}
                  </h5>
                  <p className="max-w-[60ch] text-sm leading-relaxed text-zinc-400">{fact.body}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </FadeIn>
    </div>
  );
}
