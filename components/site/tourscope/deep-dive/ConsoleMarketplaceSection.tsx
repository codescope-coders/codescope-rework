import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/site/FadeIn";
import { ProductFrame } from "@/components/site/tourscope/ProductFrame";
import { AdsStudioSlice } from "@/components/site/tourscope/deep-dive/AdsStudioSlice";

/**
 * The deep dive's eleventh section, the fifth of the console group — and the
 * LAST section of the region.
 *
 * Three movements, in the order a reader needs them — the claim, the product
 * making it, and the facts the product cannot draw. Deliberately the SAME
 * anatomy as the ten sections above it: by this point the repetition is the
 * argument. A reader who has scrolled from flights through to support has
 * learned the shape (claim → framed exhibit → ledger), and a section that broke
 * it here — of all places, at the end — would read as an appendix rather than as
 * the reference finishing.
 *
 * ── Why marketplace closes the region ───────────────────────────────────────
 * The console group has run forward through the life of a sale: bookings is what
 * came in, inventory is what they were buying, financials is what was left, and
 * support is what happened afterwards. Marketplace is the one that runs BEFORE
 * all of them — it is the shop the customer walked into — so putting it last is
 * a deliberate loop rather than a chronology. The region opened on six things an
 * agency SELLS; it closes on the storefront it sells them from, which sends the
 * reader back to the top with the six verticals reframed as inventory for a shop
 * that is theirs.
 *
 * It also puts the region's most ownership-flavoured claim where a reader is
 * most likely to still be holding the question that brought them: whose product
 * is this? The last thing the deep dive says is that the storefront carries no
 * brand but theirs, and that they can sell space on it.
 *
 * ── Why the exhibit is ADS and not branding ─────────────────────────────────
 * "Your logo and your colors" is the easiest half of the claim to believe and
 * the hardest to draw — a branded storefront looks like a storefront, and the
 * five slices above already show one. Ads is the half nobody expects: an
 * operator does not merely dress their marketplace, they monetise it, with
 * targeting, scheduling and impressions of their own. And it is the one screen
 * on the console that draws the storefront INSIDE itself, so a single frame
 * carries both the console and the shop it publishes to — which is exactly the
 * section's subject.
 *
 * ── Why a ledger and not cards ──────────────────────────────────────────────
 * Same reason the ten sections before it give. The section already spends its
 * visual budget on a dense framed exhibit, and a 2×2 of bordered cards under it
 * would compete with that frame for the same attention while saying less. And
 * what these four facts are FOR is the part of the storefront the frame cannot
 * show: a still picture of an ads screen can draw a placement, but not that the
 * domain and the favicon are the operator's, not that an article is written per
 * language with an AI assistant beside the editor, not that a placement is
 * targeted and scheduled, and not that what the preview shows is what a customer
 * will see. Those are claims about a whole product, not about one screen.
 *
 * ── Why the row ordinals are muted and not purple ───────────────────────────
 * The SECTION's own ordinal is already a purple two-digit index a few hundred
 * pixels above, and a second purple `11` inside the same section reads as the
 * same kind of thing — a section marker — rather than as a list ordinal. The
 * accent stays with the section; the rows take the muted register.
 */

export async function ConsoleMarketplaceSection({ num }: { num: string }) {
  const t = await getTranslations("TourScope.deepDive.marketplace");

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
          <AdsStudioSlice />
        </ProductFrame>
      </FadeIn>

      {/* ── 3. What marketplace ships ──────────────────────────────────── */}
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
