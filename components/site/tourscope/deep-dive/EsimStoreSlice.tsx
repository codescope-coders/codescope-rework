"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { DIVIDE, Dot, SHEET } from "@/components/site/tourscope/slice-primitives";
import { FlagAE, FlagJO, FlagTR } from "@/components/site/tourscope/deep-dive/flags";

/**
 * The storefront's eSIM destination catalog, coded — the eSIM section's product
 * view.
 *
 * ── What this is a drawing OF ───────────────────────────────────────────────
 * The cards are a structural miniature of the marketplace's real
 * `features/esim/components/EsimDestinationCard.tsx`, element for element and in
 * its order: an INSET photo pane (card padding around a rounded pane, not a
 * full-bleed one) carrying a badge on its top inline-start, then a BODY row
 * pairing the country flag — or a stacked coverage cluster — with the
 * destination name and a `From` price pinned to the inline end, and finally a
 * three-column stats grid that IS the card's footer.
 *
 * ⚠️ Three details separate it from the visa card two sections up, and all
 * three are the real product's own anatomy rather than variation for its own
 * sake. The visa card's photo is FLUSH to the card edge; this one is inset with
 * a radius of its own. The visa card's price sits in a FOOTER under a stats box;
 * here the price is in the body row and the stats grid is the footer. And the
 * visa card always has a photograph; here a destination may have none at all,
 * and the gradient behind it is the intended fallback rather than a loading
 * ground — which is exactly what the third card draws.
 *
 * The real card is LIGHT-themed; only its STRUCTURE is copied. Every colour is
 * re-expressed in this page's dark tokens — its `bg-overlay border-neutral-200`
 * card becomes the sibling slices' `bg-white/[0.015]` over a hairline, its
 * `bg-primary/90` badge becomes a `ts-purple` tint and its `bg-info-600/90` one
 * the sky tint the groups and visas slices already established for that same
 * `info` tone, and its `text-neutral-400` chrome becomes `zinc-500`. Copying the
 * light palette onto a near-black page produces a bright rectangle, which is
 * exactly why the captured screenshots were dropped for coded slices.
 *
 * ── Why this one runs at nearly full size ───────────────────────────────────
 * Three PORTRAIT cards share the frame's width, so each lands at ~300px on the
 * desktop frame — which is the real card's own width in its catalog grid. So the
 * stats keep the real 10px label over a ~12.5px value and the price keeps its
 * ~17px: shrinking them would be inventing a scale the product does not use. The
 * same reasoning the visas slice records, for the same reason.
 *
 * ── The four slice rules (same contract as `ProductSlices.tsx`) ─────────────
 * 1. Every WORD comes from `messages` (`TourScope.deepDive.esim.slice`). The
 *    literals are the money (`$4.50`, `$5.50`, `$9.00`), the `+9` coverage
 *    overflow and the network generation (`5G`), and they split into the two
 *    families the sibling slices established:
 *
 *      · a token pinned `dir="ltr"` keeps LATIN digits, because a `$` sign and a
 *        `+` sign are bidi terminators and the run must travel as one thing —
 *        so `$4.50` and `+9` are Latin in both locales;
 *      · a numeral that reads as PROSE takes the locale's own, so `6 plans`
 *        renders `٦ خطط` in Arabic. It is a message for that reason, and the
 *        plural form is matched per figure against the marketplace's own
 *        `esim.card.plans_count` — five, six and eight all take `خطط`.
 *
 *    `5G` belongs to neither: it is the name of a network generation, written
 *    `5G` in Arabic technical prose exactly as it is in English, and the real
 *    card emits it as a code literal rather than a translated string. It is one
 *    unambiguous LTR run (a digit followed by a letter, no neutrals), so it
 *    needs no `dir` pinning either.
 *
 *    Destination names ARE messages: in the real product they are server-supplied
 *    per-locale content, so an Arabic reader shown an English catalog would be
 *    shown the product misrepresented.
 * 2. The root is `aria-hidden` — the section copy beside it carries the meaning
 *    — so nothing inside is focusable. The real card is a whole-card
 *    `role="button"`; here it is a plain `div`.
 * 3. Logical properties only, so it mirrors under `dir="rtl"` unaided. The flag
 *    leads the body row and the badge is pinned `start-`, so both land on the
 *    inline start in both directions; the price is the row's last child, so it
 *    lands on the inline end; the stats dividers are `border-s` + `ps`, so the
 *    rule moves to the other edge of each column under RTL with no second rule;
 *    and the coverage cluster overlaps with `-ms-2`, so it stacks the other way
 *    round under RTL exactly as the flights section's carrier cluster does.
 *    Nothing here is a directional glyph, so there is no flip to carry — and see
 *    `flags.tsx` for the one thing that must NOT mirror.
 * 4. No motion at all. The flight, hotel and group slices carry a live pulse dot
 *    because a fare search really is streaming in; an eSIM catalog is a synced
 *    list the operator publishes, so a "Live" indicator here would be a drawn
 *    claim the product does not make. The entrance belongs to the `FadeIn` the
 *    caller wraps this in.
 *
 * ── Why three cards, and why this trio ──────────────────────────────────────
 * Three, because the real catalog is a GRID and a grid needs a row. The trio is
 * chosen to carry every branch the real card has rather than three near-identical
 * cards: a photographed country WITH a badge, a photographed country with NONE,
 * and a REGIONAL pack — which is the branch that has no photo, no single flag and
 * no single country, and is therefore the one a reader would otherwise never
 * learn the product supports.
 *
 * ── What is deliberately NOT drawn ──────────────────────────────────────────
 * The real card's hover choreography (`hover:-translate-y-[3px]`,
 * `hover:border-primary/40`, the photo's `group-hover:scale-105`) is absent,
 * because a static drawing has no hover. Its `translateZ(0)` compositing hint is
 * absent because the flicker it prevents belongs to a modal this page has no
 * equivalent of. Its `onError` photo fallback is absent because nothing here can
 * fail — but the STATE that fallback produces is drawn, as the third card.
 */

/**
 * The stats grid's column label and the body row's `From` label.
 *
 * ⚠️ The size TRACKS THE CARD, which is a step function of the viewport rather
 * than a smooth one — the same three widths the visas slice's identical label
 * steps through, because the two slices lay three portrait cards across the same
 * column:
 *
 *   below `sm`  cards STACK, so each is the column's full width (~300px at
 *               390px) — the real card's own width, so the real card's own 10px.
 *   `sm`–`xl`   three cards share one column, and from `lg` the desktop rail
 *               eats 276px of it too: the card lands at 176–254px, 53–77% of the
 *               real one, so the label steps down with it.
 *   `xl` up     the region's grid leaves ~300px per card again, so 10px returns.
 *
 * Holding 10px through the middle band is not fidelity — it drives the longest
 * Arabic label into its column's ellipsis while the card around it has shrunk by
 * a third. `uppercase` is a no-op in Arabic, which is correct: the tracking
 * carries the chrome register there.
 *
 * The visas slice declares the same string. It is deliberately NOT hoisted into
 * `slice-primitives`: these are two independent drawings of two different real
 * cards that happen to share a chrome scale today, and a shared constant would
 * mean re-tuning one card's label silently re-tunes the other's.
 */
const CHROME_LABEL =
  "text-[10px] sm:text-[8.5px] xl:text-[10px] font-bold uppercase tracking-wide text-zinc-500";

/**
 * The card's own ground, resolved to an opaque colour.
 *
 * The stacked coverage flags need a ring in the surface BEHIND them — that ring
 * is what keeps three overlapping discs three discs instead of mud, and the real
 * card sets it to `ring-overlay`, its own card colour. Here the card's paint is
 * three translucent layers deep (`bg-cs-panel` → `SHEET`'s white/2% →
 * white/1.5%), and a translucent ring would let the flag underneath bleed
 * through the gap it is supposed to cut. So it is flattened once, here:
 *
 *   #0a0711 → over white 2% → rgb(15, 12, 22) → over white 1.5% → rgb(19, 16, 25)
 *
 * ⚠️ Written as a whole literal class, never interpolated from a hex constant.
 * Tailwind v4 scans source text for candidates STATICALLY, so a
 * `ring-[${HEX}]` template would generate no rule at all — and the failure is
 * silent: the ring simply is not there, and three flags merge into one blob.
 */
const GROUND_RING = "ring-[#131019]";

/** One flag in the coverage cluster: the real card's 32px, drawn at 28px. */
const CLUSTER_FLAG = `h-7 w-7 shrink-0 rounded-full ring-2 ${GROUND_RING}`;

/**
 * One column of the stats grid, faithful to the real card's `Stat`: a 10px bold
 * uppercase label over an extrabold value, with columns 2 and 3 carrying the
 * rule that separates them.
 *
 * ⚠️ START-aligned, not centred like the visas card's otherwise-identical stat.
 * That is the real card's own alignment (`flex flex-col gap-[3px]` with no text
 * alignment at all), and the two real cards genuinely differ here — matching the
 * sibling slice instead would make this frame agree with the page and disagree
 * with the product, which is the wrong way round.
 *
 * `min-w-0` + `truncate` is a backstop rather than the plan: `CHROME_LABEL`
 * already steps the label down with the card. Without `min-w-0` a grid column's
 * min-width is its content, so a long label would OVERFLOW the card rather than
 * shorten.
 */
function Stat({
  label,
  value,
  divider,
}: {
  label: string;
  value: string;
  divider?: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 flex-col gap-[3px] ${
        divider ? "border-s border-white/[0.08] ps-2 xl:ps-2.5" : ""
      }`}
    >
      <span className={`truncate ${CHROME_LABEL}`}>{label}</span>
      <span className="truncate text-[12.5px] font-extrabold leading-tight text-white">
        {value}
      </span>
    </div>
  );
}

/**
 * The badge that sits ON the photo pane — the real card's `top-[10px]
 * start-[10px]` pill, at this frame's scale.
 *
 * It keeps the real 11px bold white over a translucent tint with a backdrop
 * blur, because that combination is what makes one label legible over both a
 * photograph and a flat gradient without a second treatment for each. The tints
 * are this page's readings of the real card's two: `bg-primary/90` for the
 * popular badge, `bg-info-600/90` for the regional one.
 */
function PaneBadge({ tone, children }: { tone: "popular" | "regional"; children: string }) {
  const tones = {
    popular: "bg-ts-purple/85",
    regional: "bg-sky-600/85",
  } as const;
  return (
    <span
      className={`absolute start-[8px] top-[8px] inline-flex items-center whitespace-nowrap rounded-full px-2 py-[3px] text-[11px] font-bold leading-none text-white backdrop-blur-sm ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/**
 * A regional pack's coverage, as the real card draws it: the first three member
 * flags overlapped into one lockup, then a `+N` disc for the rest.
 *
 * Same overlap anatomy as the flights section's `CarrierCluster` — a negative
 * inline-start margin on every child after the first, and an opaque ring in the
 * ground colour. `-ms-2` is the real card's own `marginInlineStart: -8`, written
 * as a logical utility so the stack reverses under RTL rather than needing a
 * second rule.
 */
function CoverageCluster({ extra }: { extra: string }) {
  return (
    <span className="flex shrink-0 items-center">
      <FlagTR className={CLUSTER_FLAG} />
      <FlagAE className={`${CLUSTER_FLAG} -ms-2`} />
      <FlagJO className={`${CLUSTER_FLAG} -ms-2`} />
      {/* The overflow count.
          ⚠️ `dir="ltr"` sits on an INNER span, never on the disc itself. The
          disc carries `-ms-2`, and `margin-inline-start` resolves against the
          ELEMENT'S OWN direction — so pinning the disc LTR turns that margin
          into a `margin-left` inside an RTL row, where it pulls away from the
          flag instead of over it. Measured: the overlap silently became a 0px
          butt-join in Arabic while staying correct in English, which is the
          kind of fault that only shows up in one locale's screenshot.

          The pin itself is still required, for the reason the insurance slice
          records: unpinned, the `+` is a neutral between the span start and a
          digit, so bidi resolves it to the paragraph direction and parks it to
          the RIGHT of the number in Arabic — `9+`, which reads as a rendering
          fault. */}
      <span
        className={`-ms-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-[10px] font-extrabold leading-none text-zinc-400 ring-2 ${GROUND_RING}`}
      >
        <span dir="ltr">{extra}</span>
      </span>
    </span>
  );
}

interface Destination {
  name: string;
  /**
   * The pane's gradient pair, exactly as the real card composes it:
   * `linear-gradient(135deg, from, to)`.
   *
   * On the two photographed cards it is the ground the lazy `next/image` paints
   * over, and each pair is sampled from that photograph's own dominant bands —
   * the same values the visas and groups slices use for the same two files, so
   * one photo never loads behind two different holding colours on one page.
   *
   * On the regional card there IS no photograph, and the gradient is the
   * finished surface rather than a placeholder. Its teal → deep-blue is chosen
   * to sit on this page's near-black ground while staying clearly a different
   * object from the two photographs beside it.
   */
  gradient: [string, string];
  /** The destination photograph, or `null` for the gradient-only branch. */
  photo: string | null;
  badge: { tone: "popular" | "regional"; label: string } | null;
  /** A single country flag, or the regional pack's coverage cluster. */
  flag: ReactNode;
  /** Stats grid, in reading order. `network` and `recharge` are shared. */
  options: string;
  /** The cheapest plan, cents included — see the note at the call site. */
  price: string;
}

export function EsimStoreSlice() {
  const t = useTranslations("TourScope.deepDive.esim.slice");

  const destinations: Destination[] = [
    {
      name: t("aName"),
      gradient: ["#33203a", "#1c2740"],
      photo: "/tourscope/group-istanbul.webp",
      badge: { tone: "popular", label: t("badgePopular") },
      flag: <FlagTR />,
      options: t("aOptions"),
      price: "$4.50",
    },
    {
      name: t("bName"),
      gradient: ["#443b38", "#221c18"],
      photo: "/tourscope/dest-dubai.webp",
      badge: null,
      flag: <FlagAE />,
      options: t("bOptions"),
      price: "$5.50",
    },
    {
      name: t("cName"),
      gradient: ["#0E7C7B", "#1E3A8A"],
      photo: null,
      badge: { tone: "regional", label: t("badgeRegional") },
      flag: <CoverageCluster extra="+9" />,
      options: t("cOptions"),
      price: "$9.00",
    },
  ];

  return (
    <div aria-hidden="true" className={`select-none text-zinc-300 antialiased ${SHEET}`}>
      {/* ── Store context bar ──────────────────────────────────────────────
          The sibling slices' header anatomy — one fact per slot with a drawn dot
          between — minus their live indicator. What this view IS, and then the
          one thing that separates an eSIM from every other product on this page:
          there is nothing to ship and nothing to collect, so the delivery is the
          headline fact rather than a footnote. */}
      <div
        className={`flex flex-wrap items-center gap-x-2.5 gap-y-1.5 border-b ${DIVIDE} px-3 py-2.5 sm:px-4`}
      >
        <span className="text-[12.5px] font-bold text-white">{t("title")}</span>
        <Dot />
        <span className="text-[10.5px] text-zinc-400">{t("delivery")}</span>
      </div>

      {/* ── Destination cards ──────────────────────────────────────────────
          A grid, because the real catalog is a grid. It stacks below `sm` so the
          phone gets three full-width cards rather than three 100px slivers — the
          card is portrait, so stacking keeps its proportions rather than
          breaking them. */}
      <div className="grid grid-cols-1 gap-2 px-3 py-2.5 sm:grid-cols-3 sm:px-4">
        {destinations.map((d) => (
          <div
            key={d.name}
            /* `flex-col` + the stats footer's `mt-auto` is what keeps the three
               footers on one line when one card's name wraps and its neighbours'
               do not — the real card's own mechanism. No `overflow-hidden` is
               needed here, unlike the visa card: the pane is INSET, so it clips
               itself and never reaches the card's corners. */
            className="flex flex-col rounded-xl border border-white/[0.07] bg-white/[0.015]"
          >
            {/* ── Photo pane ───────────────────────────────────────────────
                ⚠️ INSET, not flush. The real card wraps the pane in `p-[8px]
                pb-0` and gives the pane its own `rounded-[12px]`, so the
                photograph reads as a picture ON a card rather than as the card's
                own top edge — which is the single clearest difference between
                this card and the visa one two sections up.

                The gradient is on the PANE, always, and the image is a child
                over it: on the two photographed cards it is the ground a lazy
                `next/image` paints over, and on the third it is the whole
                surface. That is one code path with two outcomes, exactly as the
                real card has it. */}
            <div className="p-[7px] pb-0">
              <div
                className="relative h-[110px] overflow-hidden rounded-xl"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${d.gradient[0]}, ${d.gradient[1]})`,
                }}
              >
                {d.photo && (
                  <Image
                    src={d.photo}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 300px, (min-width: 640px) 33vw, 100vw"
                    className="object-cover"
                  />
                )}
                {d.badge && <PaneBadge tone={d.badge.tone}>{d.badge.label}</PaneBadge>}
              </div>
            </div>

            {/* ── Body row ─────────────────────────────────────────────────
                Flag (or coverage cluster) + name at the start, the `From` price
                at the end. `items-center`, as the real card sets it: both sides
                are single-line, so centring is what keeps a 36px flag optically
                level with a two-line price stack. */}
            <div className="flex items-center justify-between gap-2 px-2.5 pb-2 pt-2.5 xl:px-3">
              <div className="flex min-w-0 items-center gap-2.5">
                {d.flag}
                {/* The card's largest text after the price, as in the real one.
                    Truncated, because a destination name is supplier content of
                    unbounded length and the real card truncates it too. */}
                <span className="truncate text-[15px] font-extrabold leading-tight tracking-tight text-white">
                  {d.name}
                </span>
              </div>

              {/* The real card's `<Price align="end" prefix="From" />`: the
                  label above, the amount below, both aligned to the inline end.
                  `items-end` shrink-wraps the stack, so the `dir="ltr"` on the
                  amount governs its glyphs and nothing else. */}
              <div className="flex shrink-0 flex-col items-end">
                {/* 10px `font-medium` and NOT uppercase — the real `Price`
                    label, which is a different primitive from the visa card's
                    `From`. Upper-casing it here would invent a chrome register
                    the product does not use, and the insurance slice already
                    settled the same question the same way. */}
                <span className="text-[10px] font-medium leading-4 text-zinc-500">
                  {t("from")}
                </span>
                {/* ⚠️ The amount keeps its CENTS. The real card carries a
                    comment on exactly this: its `Price` is deliberately NOT
                    given `truncate`, because flooring is a harmless tidy-up at
                    flight prices ($342.90 → $342) and destroys an eSIM one —
                    these plans run $1–$25, so $4.50 shown as $4 is 11% under,
                    and the plan modal the card opens shows the real figure, so
                    the card would contradict itself on click. A "from" price
                    must never read LOWER than anything a customer can buy.

                    `dir="ltr"` on the pure `$`+digits token, the same rule the
                    flights, visas and insurance slices apply: a currency sign is
                    a bidi terminator, and pinning the run removes any doubt
                    about which side of the digits it lands on in Arabic. */}
                <span
                  dir="ltr"
                  className="mt-[1px] text-[17px] font-extrabold leading-none tabular-nums text-white"
                >
                  {d.price}
                </span>
              </div>
            </div>

            {/* ── Stats footer ─────────────────────────────────────────────
                ⚠️ The stats grid IS the footer here — there is no separate
                price row under it, unlike the visa card. `mt-auto` pins it to
                the card's floor, which is what keeps the three grids on one line
                across the row.

                `Network` and `Recharge` carry the same value on all three cards,
                and that is the real catalog's own shape rather than filler: the
                supplier's packs are uniformly 5G and uniformly rechargeable, so
                three different values would be an invented difference. What the
                columns are FOR is the third one. */}
            <div
              className={`mt-auto grid grid-cols-3 border-t ${DIVIDE} px-2.5 py-2.5 xl:px-3`}
            >
              {/* `5G` is a literal: see rule 1. */}
              <Stat label={t("statNetwork")} value="5G" />
              <Stat label={t("statOptions")} value={d.options} divider />
              <Stat label={t("statRecharge")} value={t("rechargeYes")} divider />
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer chrome ──────────────────────────────────────────────────
          The eSIM twin of "48 fares · 12 airlines" and "12 destinations · Only
          visas your passport can apply for". Neither slot is a count: what is
          worth stating about this catalog is its SHAPE (country packs and
          regional ones, which is why the third card exists) and where it comes
          from — nobody typed it, and nobody has to keep typing it. */}
      <div className={`flex flex-wrap items-center gap-2 border-t ${DIVIDE} px-3 py-2 sm:px-4`}>
        <span className="text-[10px] text-zinc-400">{t("packTypes")}</span>
        <Dot />
        <span className="text-[10px] text-zinc-400">{t("syncedFrom")}</span>
      </div>
    </div>
  );
}
