import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/site/FadeIn";
import { ProductFrame } from "@/components/site/tourscope/ProductFrame";
import { CharterInventorySlice } from "@/components/site/tourscope/deep-dive/CharterInventorySlice";

/**
 * The deep dive's eighth section, and the second of the console group:
 * inventory.
 *
 * Three movements, in the order a reader needs them — the claim, the product
 * making it, and the facts the product cannot draw. Deliberately the SAME
 * anatomy as the seven sections above it: by this point the repetition is the
 * argument. A reader who has scrolled from flights through to booking
 * management has learned the shape (claim → framed exhibit → ledger), and a
 * section that broke it here would read as a different KIND of thing rather
 * than as the reference continuing.
 *
 * ── Why this section follows booking management ─────────────────────────────
 * The order is not alphabetical and not arbitrary. Booking management answers
 * "what came in"; inventory answers "what were they buying". Putting the feed
 * first and the shelf second is the order an operator actually meets them —
 * you look at your bookings every morning and at your charter allotment when
 * you are building next month — and it means the reader arrives here already
 * knowing that a booking exists on the other side of these seats.
 *
 * ── Why the exhibit is charter flights and not a grid of four ───────────────
 * The section's claim is about four inventory kinds — charter flights, own
 * properties, group departures, visa products — and the honest way to draw four
 * things is usually to draw four things. Not here. What the claim is really
 * about is DEPTH: that this console does not merely list a thing you own but
 * counts it, prices it per class, and protects it once it has sold. Four
 * shallow tiles would say "there are four of these" and prove none of it; one
 * charter row, with its three-segment load bar and its per-class prices, proves
 * all of it at once — and the footer names the other three, which is the job a
 * footer can actually do.
 *
 * Charter is also the right one of the four to spend the frame on. It is the
 * inventory kind a reseller cannot get from a web service at any price, so it
 * is the part of the console that is genuinely about what the agency owns
 * rather than about what it resells — which is the section's headline.
 *
 * ── Why a ledger and not cards ──────────────────────────────────────────────
 * Same reason the two sections before it give. The section already spends its
 * visual budget on a dense framed exhibit, and a 2×2 of bordered cards under it
 * would compete with that frame for the same attention while saying less. And
 * what these four facts are FOR is the part of the console the frame cannot
 * show: a still picture can draw a load bar, but not that it counts itself, not
 * that a season is created in one transaction, not that an edit is refused when
 * it would strand a sold seat, and not that a reserved seat is invisible to
 * everybody else's search. Those are claims in words because they are claims
 * about behaviour over time.
 *
 * ── Why the row ordinals are muted and not purple ───────────────────────────
 * The SECTION's own ordinal is already a purple two-digit index a few hundred
 * pixels above, and a second purple `08` inside the same section reads as the
 * same kind of thing — a section marker — rather than as a list ordinal. The
 * accent stays with the section; the rows take the muted register.
 */

export async function ConsoleInventorySection({ num }: { num: string }) {
  const t = await getTranslations("TourScope.deepDive.inventory");

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
          <CharterInventorySlice />
        </ProductFrame>
      </FadeIn>

      {/* ── 3. What inventory ships ────────────────────────────────────── */}
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
