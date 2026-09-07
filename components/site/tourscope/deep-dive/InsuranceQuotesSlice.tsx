"use client";

import { useTranslations } from "next-intl";
import { DIVIDE, Dot, SHEET } from "@/components/site/tourscope/slice-primitives";

/**
 * The storefront's live insurance quotes, coded — the insurance section's
 * product view.
 *
 * ── What this is a drawing OF ───────────────────────────────────────────────
 * The cards are a structural miniature of the marketplace's real
 * `features/insurance/components/InsurancePlanCard.tsx`, element for element and
 * in its order: a head that pairs a 40px tinted icon box holding a shield-check
 * with the plan title and its description, an INSET hairline (not a full-bleed
 * rule — the real card's `h-px bg-neutral-200 mx-[18px]`), a preview of the top
 * three covered benefits with the limit pinned to the inline end of each, a
 * `+N more benefits` line in the accent, and a footer that runs the
 * `Total premium` label over the exact premium at the inline start with the
 * `Get quote` button at the end.
 *
 * ⚠️ There is NO photograph here, and that is the real card's own anatomy rather
 * than an omission: an insurance plan is not a place, so the product leads with
 * a shield glyph and a benefit table instead. The three sections above this one
 * all lead with a photograph, so the temptation is to add one for the series —
 * which would make this frame agree with the page and disagree with the product,
 * the wrong way round.
 *
 * The real card is LIGHT-themed; only its STRUCTURE is copied. Every colour is
 * re-expressed in this page's dark tokens — its `bg-primary-50 border-primary-100`
 * icon box becomes `bg-ts-purple/15` over a `ts-purple/25` hairline (the exact
 * pair `IconTile`'s purple tone uses, at the real card's rounder 12px radius),
 * its `text-primary` glyph becomes `ts-purple-text`, and its `bg-primary` button
 * becomes the filled `ts-purple` pill the sibling slices established. Copying the
 * light palette onto a near-black page produces a bright rectangle, which is
 * exactly why the captured screenshots were dropped for coded slices.
 *
 * The one colour with no sibling precedent is the benefit check. The real card
 * paints it `text-success-600` — a green deliberately distinct from its primary,
 * because "included" is not "branded". Nothing else on this page has ever needed
 * a positive green (`cs-teal` is the LIVE indicator and means something else), so
 * this frame introduces one: `emerald-400`, the dark-ground reading of that
 * `success` tone. Reusing `cs-teal` here would quietly claim these rows are
 * streaming.
 *
 * ── Why this one runs at nearly full size ───────────────────────────────────
 * Two cards share the frame's width, so each lands at 276–460px depending on the
 * breakpoint — against the real card's ~390px in its `lg:grid-cols-3` results
 * grid. That is 71–118% of the real thing, i.e. essentially real size, so the
 * type keeps the real card's own scale (12px benefit rows, 12px limits, 10px
 * footer label) rather than the 0.7 shrink the hotel and group slices apply to a
 * single card spanning the whole frame. Only the title (16 → 15px), the premium
 * (24 → 17px, matching the visas slice's price) and the 18px paddings step down,
 * because those are the three places the real card is loudest and a frame inside
 * a frame should not shout.
 *
 * ── The four slice rules (same contract as `ProductSlices.tsx`) ─────────────
 * 1. Every WORD comes from `messages` (`TourScope.deepDive.insurance.slice`).
 *    The literals are the money and the `+N` count, and both belong to the same
 *    family: a token that needs `dir="ltr"` keeps LATIN digits, a numeral that
 *    reads as prose takes the locale's own. So `$22.50`, `$30,000` and `+9` are
 *    Latin literals pinned LTR, while the header's `10 days` is a message and
 *    renders `١٠ أيام` in Arabic — matching the three sibling slices, whose
 *    counts and durations are all Arabic-Indic. `2 travellers` needs no numeral
 *    in Arabic at all (`مسافران` is the dual), which is why it is a message too.
 *
 *    Plan TITLES stay Latin in both locales except for their region suffix:
 *    `Travel Solution` is the insurer's product name, and the same rule the
 *    flights section applies to carrier names applies here — a translated
 *    product name is a product the customer cannot find on their certificate.
 * 2. The root is `aria-hidden` — the section copy beside it carries the meaning
 *    — so nothing inside is focusable and the CTA is a `span`.
 * 3. Logical properties only, so it mirrors under `dir="rtl"` unaided. The icon
 *    box leads the head row and the check leads each benefit row, so both land
 *    on the inline start in both directions; the limit and the CTA are their
 *    rows' last children, so both land on the inline end. The ONE directional
 *    glyph is the CTA's chevron, which carries `rtl:-scale-x-100` — the real
 *    card's own handling, character for character.
 * 4. No motion at all. The sibling flight/hotel/group slices carry a live pulse
 *    dot because a fare search really is streaming in; an insurance results page
 *    renders one settled response to one submitted form, so a "Live" indicator
 *    here would be a drawn claim the product does not make. That the premiums
 *    are quoted live is said in words, in the footer, where it is a fact rather
 *    than an animation. The entrance belongs to the `FadeIn` the caller wraps
 *    this in.
 *
 * ── Why two cards, and why this pair ────────────────────────────────────────
 * Two, because the point of the results page is a CHOICE and two plans is the
 * smallest thing that is one. The pair is deliberately a ladder rather than two
 * alternatives: same three benefit families at different limits, one priced at
 * $22.50 and one at $37.50, so the frame shows what a customer actually compares
 * — cover against premium — instead of two unrelated products.
 *
 * ── What is deliberately NOT drawn ──────────────────────────────────────────
 * The real card's hover choreography (`hover:-translate-y-[3px]`,
 * `hover:border-primary/40`, `hover:shadow-md`) is absent, because a static
 * drawing has no hover. Its `empty_benefits` fallback is absent because both
 * cards have benefits. Its whole-card `role="button"` is absent by rule 2.
 */

/* ── Glyphs ─────────────────────────────────────────────────────────────────
   The real card draws three lucide icons — `ShieldCheck`, `Check`,
   `ChevronRight` — and this site's icon set is Phosphor, which has no
   shield-with-a-tick at all. Rather than substitute a different symbol into a
   drawing whose whole claim is fidelity, the three are inlined here with
   lucide's own geometry (lucide-react 0.562.0, ISC): same 24-unit viewBox, same
   round caps and joins, same stroke weights the card sets on each.

   `aria-hidden` on all three — the whole slice is aria-hidden already, and each
   sits immediately beside the words it decorates. */

/** The head's shield. Real: 20px, `strokeWidth={1.8}`. */
function ShieldCheckGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-ts-purple-text"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

/**
 * One benefit's tick. Real: 14px, `strokeWidth={2.5}`, `mt-[1px]` so it sits on
 * the first line's cap height rather than centred against a wrapped row.
 */
function CheckGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-px h-3.5 w-3.5 shrink-0 text-emerald-400"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/**
 * The CTA's chevron. Real: 12px with `rtl:-scale-x-100`.
 *
 * ⚠️ It is a DIRECTIONAL glyph — it points the way the reader is going — so it
 * must flip under RTL. The flip is a mirror rather than a `rotate-180` because a
 * chevron rotated a half-turn is the same shape as its mirror only while it is
 * perfectly symmetric about its own centre; the mirror is what the real card
 * does and is correct regardless.
 */
function ChevronGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3 shrink-0 rtl:-scale-x-100"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

interface Benefit {
  title: string;
  /** The cover ceiling, e.g. `$30,000`. A pure `$`+digits token; see rule 1. */
  limit: string;
}

interface Plan {
  title: string;
  description: string;
  /** The top three included benefits — the real card's `included.slice(0, 3)`. */
  benefits: Benefit[];
  /**
   * The `+N` of the more-benefits line, as a Latin literal pinned LTR. The
   * WORDS beside it are a message, and they are per-card rather than shared
   * because Arabic counts differently either side of ten: nine takes the plural
   * (`منافع`), eleven the singular accusative (`منفعة`). One shared key would
   * be wrong on one of the two cards, and the sibling visas slice already sets
   * the precedent of matching the plural form per figure.
   */
  moreCount: string;
  moreLabel: string;
  /**
   * The EXACT premium, cents included. The real card carries a comment on
   * precisely this: its `Price` is deliberately NOT given `truncate`, because
   * flooring turned `$22.50` into `$22` and this is not a "from" headline — it
   * is the amount the customer is charged. Drawing it floored here would
   * misrepresent the one number on the card that must not be approximate.
   */
  premium: string;
}

export function InsuranceQuotesSlice() {
  const t = useTranslations("TourScope.deepDive.insurance.slice");

  const plans: Plan[] = [
    {
      title: t("aTitle"),
      description: t("aDesc"),
      benefits: [
        { title: t("aBenefit1"), limit: "$30,000" },
        { title: t("aBenefit2"), limit: "$2,000" },
        { title: t("aBenefit3"), limit: "$1,000" },
      ],
      moreCount: "+9",
      moreLabel: t("aMoreBenefits"),
      premium: "$22.50",
    },
    {
      title: t("bTitle"),
      description: t("bDesc"),
      benefits: [
        { title: t("bBenefit1"), limit: "$50,000" },
        { title: t("bBenefit2"), limit: "$3,000" },
        { title: t("bBenefit3"), limit: "$500" },
      ],
      moreCount: "+11",
      moreLabel: t("bMoreBenefits"),
      premium: "$37.50",
    },
  ];

  return (
    <div aria-hidden="true" className={`select-none text-zinc-300 antialiased ${SHEET}`}>
      {/* ── Quote context bar ──────────────────────────────────────────────
          The sibling slices' header anatomy — one fact per slot with a drawn dot
          between — minus their live indicator. What this view IS, and then the
          three facts that produced every figure below it: the real results page
          sits under a search form, and each card is a quote for exactly that
          area, that party and those dates. Without them the premiums are prices
          of nothing in particular, which is the opposite of what the section
          claims about them. */}
      <div
        className={`flex flex-wrap items-center gap-x-2.5 gap-y-1.5 border-b ${DIVIDE} px-3 py-2.5 sm:px-4`}
      >
        <span className="text-[12.5px] font-bold text-white">{t("title")}</span>
        <Dot />
        <span className="text-[10.5px] text-zinc-400">{t("area")}</span>
        <Dot />
        <span className="text-[10.5px] text-zinc-400">{t("travellers")}</span>
        <Dot />
        <span className="text-[10.5px] text-zinc-400">{t("duration")}</span>
      </div>

      {/* ── Quote cards ────────────────────────────────────────────────────
          A grid, because the real results page is a grid. It stacks below `sm`
          so the phone gets two full-width cards rather than two ~170px slivers
          — a benefit row is a check, a title and a limit on ONE line, and at
          that width the title would be three characters and an ellipsis. */}
      <div className="grid grid-cols-1 gap-2 px-3 py-2.5 sm:grid-cols-2 sm:px-4">
        {plans.map((plan) => (
          <div
            key={plan.title}
            /* `flex-col` + the footer's `mt-auto` is what keeps the two premiums
               on one line when one card's title wraps and the other's does not
               — which is exactly what happens in the narrow band, where
               `Travel Solution — Schengen` takes two lines and
               `Travel Plus — Worldwide` takes one. */
            className="flex flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.015]"
          >
            {/* ── Head ─────────────────────────────────────────────────────
                Icon box + title + description. `items-start` so a two-line
                title does not drag the icon down its side, exactly as the real
                card sets it. */}
            <div className="flex items-start gap-2.5 px-2.5 pb-2.5 pt-3 xl:px-3">
              {/* The real card's `w-[40px] h-[40px] rounded-[12px]` box, kept at
                  full size: it is the card's one landmark and the thing that
                  says "insurance" before a word is read. The tone values are
                  `IconTile`'s purple exactly; only the radius differs, because
                  the real box is a rounded square rather than the console
                  tiles' tighter `rounded-md`. */}
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ts-purple/25 bg-ts-purple/15">
                <ShieldCheckGlyph />
              </span>
              <div className="min-w-0">
                {/* The card's largest text after the premium, as in the real
                    one. Deliberately NOT truncated — the real card lets a long
                    plan name wrap, and a truncated insurance product name is
                    a product the customer cannot identify. */}
                <p className="text-[15px] font-extrabold leading-tight tracking-tight text-white">
                  {plan.title}
                </p>
                <p className="mt-[2px] line-clamp-2 text-[12px] font-medium leading-snug text-zinc-400">
                  {plan.description}
                </p>
              </div>
            </div>

            {/* ── Inset hairline ───────────────────────────────────────────
                ⚠️ INSET, not full-bleed: the real card's rule is
                `mx-[18px]`, and the inset is what makes it read as a divider
                inside one card rather than as the seam between two stacked
                panels. The margin tracks the card's own padding so the two
                stay aligned at every breakpoint. */}
            <div aria-hidden className="mx-2.5 h-px bg-white/[0.07] xl:mx-3" />

            {/* ── Benefit preview ──────────────────────────────────────────── */}
            <div className="flex flex-col gap-2 px-2.5 py-2.5 xl:px-3">
              {plan.benefits.map((benefit) => (
                <div key={benefit.title} className="flex items-start gap-2">
                  <CheckGlyph />
                  {/* `flex-1 min-w-0 truncate` is the real card's own handling:
                      a benefit title is supplier copy of unbounded length, and
                      one long one must shorten rather than push the limit off
                      the card's edge. */}
                  <span className="min-w-0 flex-1 truncate text-[12px] font-medium leading-snug text-zinc-400">
                    {benefit.title}
                  </span>
                  {/* The limit — the one number on the row, and the reason the
                      row exists. `dir="ltr"` on the pure `$`+digits token, the
                      same rule the flights and visas slices apply: a currency
                      sign is a bidi terminator, and pinning the run removes any
                      doubt about which side of the digits it lands on in
                      Arabic. */}
                  <span
                    dir="ltr"
                    className="shrink-0 text-[12px] font-extrabold leading-snug tabular-nums text-white"
                  >
                    {benefit.limit}
                  </span>
                </div>
              ))}

              {/* The rest of the table, named rather than hidden — the real
                  card's `+{moreCount} more benefits` in its primary accent.
                  It is what tells the reader the three rows above are a PREVIEW
                  of a benefit table and not the whole policy. */}
              <p className="text-[12px] font-semibold leading-snug text-ts-purple-text">
                {/* Its own LTR island. Unpinned, the `+` is a neutral between
                    the paragraph start and a number, so the bidi algorithm
                    resolves it to the paragraph direction and parks it to the
                    RIGHT of the digits in Arabic — `9+`, which reads as a
                    rendering fault. Isolated, the sign and its digits travel
                    together as one token, exactly like the `$` figures above. */}
                <span dir="ltr">{plan.moreCount}</span>{" "}
                {plan.moreLabel}
              </p>
            </div>

            {/* ── Foot ─────────────────────────────────────────────────────
                The premium at the inline start, the CTA at the end.
                `mt-auto` pins it to the card's floor, which is what keeps the
                two premiums on one line across the row. */}
            <div
              className={`mt-auto flex items-center justify-between gap-2 border-t ${DIVIDE} px-2.5 py-2.5 xl:px-3`}
            >
              {/* `items-start`, not stretch: the premium below carries
                  `dir="ltr"`, and on a stretched child that would left-align
                  the amount inside its own box — pushing it away from the
                  card's inline start under RTL. Shrink-wrapped, the direction
                  governs the glyphs and nothing else. */}
              <div className="flex min-w-0 flex-col items-start">
                {/* The real `Price` label: 10px, `font-medium`, and NOT
                    uppercase — unlike the visas card's `From`, which comes
                    from a different primitive. Kept lowercase-cased here
                    because it is a sentence-cased phrase in the product, and
                    upper-casing it would invent a chrome register the card
                    does not use. */}
                <span className="text-[10px] font-medium leading-4 text-zinc-500">
                  {t("totalPremium")}
                </span>
                <span
                  dir="ltr"
                  className="mt-[1px] text-[17px] font-extrabold leading-none tabular-nums text-white"
                >
                  {plan.premium}
                </span>
              </div>

              {/* The conversion CTA. A `span` — nothing in an aria-hidden
                  subtree is focusable — in the sibling slices' filled
                  `ts-purple` treatment, which is what the real card's
                  `bg-primary` button already is. */}
              <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md bg-ts-purple px-2.5 py-[6px] text-[10px] font-semibold leading-none text-white shadow-[0_4px_12px_rgba(111,0,255,0.28)]">
                {t("ctaQuote")}
                <ChevronGlyph />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer chrome ──────────────────────────────────────────────────
          The insurance twin of "48 fares · 12 airlines" and "12 destinations ·
          Only visas your passport can apply for". One slot rather than the
          siblings' two, because the fact worth stating about an insurance
          result is not how many plans came back but WHERE the numbers came
          from: these are the insurer's own figures for this exact party and
          these exact dates, not a rate card this site is quoting from. That is
          one sentence, and splitting it at its dash to fill a second slot would
          make the two halves read as two independent facts. */}
      <div className={`flex flex-wrap items-center gap-2 border-t ${DIVIDE} px-3 py-2 sm:px-4`}>
        <span className="text-[10px] text-zinc-400">{t("quotedLive")}</span>
      </div>
    </div>
  );
}
