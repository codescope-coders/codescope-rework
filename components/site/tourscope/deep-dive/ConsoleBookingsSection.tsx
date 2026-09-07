import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/site/FadeIn";
import { ProductFrame } from "@/components/site/tourscope/ProductFrame";
import { LiveBookingsSlice } from "@/components/site/tourscope/deep-dive/LiveBookingsSlice";

/**
 * The deep dive's seventh section, and the FIRST of the console group: booking
 * management.
 *
 * Three movements, in the order a reader needs them — the claim, the product
 * making it, and the facts the product cannot draw. Deliberately the SAME
 * anatomy as the six vertical sections above it, and that sameness is doing
 * real work at exactly this point in the page: the rail has just grown a second
 * group header, so the reader is being told they have crossed from "what an
 * agency sells" to "what it runs the selling from". A section that also changed
 * shape here would read as a different KIND of thing rather than as the same
 * reference continuing into its second half — and the whole argument of this
 * region is that the storefront and the console are one product.
 *
 * ── What changes at the group boundary, and what does not ───────────────────
 * The one thing that does change is the frame's CAPTION. The six above it open
 * "The storefront — …", because they draw what a traveller sees; this one opens
 * "The operator console — …", because it draws what the agency sees. That
 * prefix is the only signal inside a framed exhibit that the audience has
 * flipped, and it is a convention the four console sections after this one
 * inherit.
 *
 * ── Why a ledger and not cards ──────────────────────────────────────────────
 * Same reason the eSIM section gives, and one more of its own. The section
 * already spends its visual budget on a big framed exhibit dense with tiles,
 * badges and rows, and a 2×2 of bordered cards under it would compete with that
 * frame for the same attention while saying less. And what these four facts are
 * FOR is the part of the console the frame cannot show: a still picture can
 * draw a feed, but not that the feed updates itself, that the tiles are
 * filters, that a booking can be acted on from where it sits, or that every one
 * of them carries an auditable history. Those are claims in words because they
 * are claims about time.
 *
 * ── Why the row ordinals are muted and not purple ───────────────────────────
 * The SECTION's own ordinal is already a purple two-digit index a few hundred
 * pixels above, and a second purple `07` inside the same section reads as the
 * same kind of thing — a section marker — rather than as a list ordinal. The
 * accent stays with the section; the rows take the muted register.
 */

export async function ConsoleBookingsSection({ num }: { num: string }) {
  const t = await getTranslations("TourScope.deepDive.bookings");

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
          <LiveBookingsSlice />
        </ProductFrame>
      </FadeIn>

      {/* ── 3. What booking management ships ───────────────────────────── */}
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
