import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/site/FadeIn";
import { ProductFrame } from "@/components/site/tourscope/ProductFrame";
import { ProfitSlice } from "@/components/site/tourscope/deep-dive/ProfitSlice";

/**
 * The deep dive's ninth section, and the third of the console group:
 * financials.
 *
 * Three movements, in the order a reader needs them — the claim, the product
 * making it, and the facts the product cannot draw. Deliberately the SAME
 * anatomy as the eight sections above it: by this point the repetition is the
 * argument. A reader who has scrolled from flights through to inventory has
 * learned the shape (claim → framed exhibit → ledger), and a section that broke
 * it here would read as a different KIND of thing rather than as the reference
 * continuing.
 *
 * ── Why this section follows inventory ──────────────────────────────────────
 * The order is the order the money moves. Booking management answers "what came
 * in"; inventory answers "what were they buying"; financials answers "what was
 * left". Putting it third is what lets its exhibit be a P&L rather than a
 * primer: the reader has already met a booking with a total on it and a charter
 * seat with a per-class price, so a table whose columns are revenue and cost is
 * a conclusion drawn from two things they have seen rather than an assertion
 * about a system they have not.
 *
 * ── Why the exhibit is Profit and not a ledger ──────────────────────────────
 * The section's claim has two halves — that profit is computed from real cost,
 * and that every balance is a walkable ledger — and only one of them can have
 * the frame. Profit wins, for the reason a ledger screenshot always loses: a
 * ledger is a list of movements, and a still picture of one proves only that
 * rows exist. Nothing in a frozen ledger shows that the entries are append-only,
 * that each carries a note, or that the balance above it is a projection over
 * them rather than a column — which is the entire claim. The P&L is the
 * opposite: revenue beside cost beside what survived, per service, is a figure a
 * reader can check by subtracting, and it says "this came from somewhere real"
 * in a way no list of rows can.
 *
 * So the ledger claim goes in words (fact 02), where it can say the part that
 * matters, and the slice's footer names the four account surfaces the frame has
 * no room to draw — which is the job a footer can actually do.
 *
 * ── Why a ledger and not cards ──────────────────────────────────────────────
 * Same reason the three sections before it give. The section already spends its
 * visual budget on a dense framed exhibit, and a 2×2 of bordered cards under it
 * would compete with that frame for the same attention while saying less. And
 * what these four facts are FOR is the part of the console the frame cannot
 * show: a still picture can draw a margin, but not that the cost behind it was
 * snapshotted at booking time, not that a balance is a projection you can walk
 * entry by entry, not that a statement leaves the building as a PDF, and not
 * that a markup rule set once binds every quote on the storefront. Those are
 * claims in words because they are claims about behaviour over time.
 *
 * ── Why the row ordinals are muted and not purple ───────────────────────────
 * The SECTION's own ordinal is already a purple two-digit index a few hundred
 * pixels above, and a second purple `09` inside the same section reads as the
 * same kind of thing — a section marker — rather than as a list ordinal. The
 * accent stays with the section; the rows take the muted register.
 */

export async function ConsoleFinancialsSection({ num }: { num: string }) {
  const t = await getTranslations("TourScope.deepDive.financials");

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
          <ProfitSlice />
        </ProductFrame>
      </FadeIn>

      {/* ── 3. What financials ships ───────────────────────────────────── */}
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
