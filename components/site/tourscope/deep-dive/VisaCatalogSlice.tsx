"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { DIVIDE, Dot, SHEET } from "@/components/site/tourscope/slice-primitives";
import { FlagAE, FlagFR, FlagTR } from "@/components/site/tourscope/deep-dive/flags";

/**
 * The storefront's visa catalog, coded — the visas section's product view.
 *
 * ── What this is a drawing OF ───────────────────────────────────────────────
 * The cards are a structural miniature of the marketplace's real
 * `features/visa/components/VisaCard.tsx`, element for element: a VERTICAL card
 * (photo pane on top, then head, then body), a head row that pairs a circular
 * country flag with the country name and its sub line and pins a types-pill or a
 * type badge to the inline end, a three-column stats box inset into the body
 * with `border-s` dividers between its columns, and a footer that runs the
 * `From` label over the price at the inline start with the CTA at the end.
 *
 * ⚠️ The anatomy is VERTICAL, unlike the hotel and group cards in the two
 * sections above. That is not a stylistic choice here — the real product's visa
 * card genuinely is a portrait card in a grid, because a visa result has no
 * photo-plus-long-description shape to lay out sideways. Redrawing it as a
 * horizontal row to match its siblings would make this frame agree with the page
 * and disagree with the product, which is the wrong way round.
 *
 * The real card is LIGHT-themed; only its STRUCTURE is copied. Every colour is
 * re-expressed in this page's dark tokens — its `bg-neutral-50` /
 * `border-neutral-200` stats box becomes `bg-white/[0.04]` over a hairline, its
 * `bg-info-50 text-info-700` badge becomes the sky tint the groups slice already
 * established for the same `info` tone, and its `CardCtaPill` becomes the
 * `ts-purple` button the sibling slices use. Copying the light palette onto a
 * near-black page produces a bright rectangle, which is exactly why the captured
 * screenshots were dropped for coded slices.
 *
 * ── Why this one runs at nearly full size ───────────────────────────────────
 * The hotel and group slices shrink their card's text to roughly 0.7, because
 * one horizontal card spans the whole frame there and a full-size one would
 * dwarf the section. Here three PORTRAIT cards share that same width, so each
 * lands at ~300px on the desktop frame — which is the real card's own width. So
 * the stats box keeps the real 10px label over a 12.5px value, and the price
 * keeps its ~17px: shrinking them would be inventing a scale the product does
 * not use, and at 300px there is no reason to.
 *
 * ── The four slice rules (same contract as `ProductSlices.tsx`) ─────────────
 * 1. Every WORD comes from `messages` (`TourScope.deepDive.visas.slice`). Only
 *    the prices (`$95`, `$60`, `$140`) are literals — currency amounts are the
 *    one numeric run the sibling slices also leave in Latin digits, because a
 *    `$` figure is written that way in both locales.
 *
 *    Country names, the processing and stay figures, the badge labels AND the
 *    bare types count are all messages. The first three because in the real
 *    product every one of them is server-supplied per-locale content
 *    (`local_visas` carries the operator's own copy, `countries.names[locale]`
 *    the country), so an Arabic reader shown an English catalog would be shown
 *    the product misrepresented. The COUNT is a message for a narrower reason:
 *    every other numeral this frame prints is Arabic-Indic in `ar`, matching
 *    the three sibling slices, so a Latin `3` in the stats box sitting two
 *    inches from `٣ أنواع` in the pill above it would read as a rendering
 *    fault. Their Arabic is the marketplace's own — `visa.card.*` and
 *    `common.duration.*` out of its `ar.json`, matched plural form for plural
 *    form (`يومان` is the dual, `نوعان` the dual, `٩٠ يوماً` the `many`).
 * 2. The root is `aria-hidden` — the section copy beside it carries the
 *    meaning — so nothing inside is focusable and every button is a `span`.
 * 3. Logical properties only, so it mirrors under `dir="rtl"` unaided. The flag
 *    leads the head row, so it lands on the inline start in both directions; the
 *    pill/badge is the row's last child, so it lands on the inline end; the
 *    stats dividers are `border-s` + `ps`, so the rule moves to the other edge
 *    of each column under RTL with no second rule. Nothing here is a directional
 *    glyph, so unlike the flights slice there is no flip to carry — and see
 *    `flags.tsx` for the one thing that must NOT mirror.
 * 4. No motion at all. The sibling slices carry a live pulse dot in their header
 *    because a fare search really is streaming in; a visa catalog is a static
 *    list the operator publishes, so a "Live" indicator here would be a drawn
 *    claim the product does not make. The entrance belongs to the `FadeIn` the
 *    caller wraps this in.
 *
 * ── Why three cards, and why this trio ──────────────────────────────────────
 * Three, because the real catalog is a GRID and a grid needs a row — a pair
 * would read as two odd cards rather than as a catalog. The trio carries both
 * of the head row's mutually exclusive end elements (two multi-type pills and
 * one single-type badge, which is the branch the real card takes when a country
 * publishes exactly one visa) instead of three near-identical cards.
 *
 * ── What is deliberately NOT drawn ──────────────────────────────────────────
 * The real card's hover choreography — the photo's `group-hover:scale-[1.06]`,
 * the stats box tinting to `bg-primary/5`, the CTA pill filling from its
 * outlined rest state — is all absent, because a static drawing has no hover and
 * a pill drawn in its outlined rest state beside the siblings' filled purple
 * buttons reads as disabled rather than as a resting control. The CTA is
 * therefore the sibling slices' filled `ts-purple` treatment, which is what the
 * real pill BECOMES on hover.
 */

/**
 * The stats box's column label and the footer's `From` label, which are the same
 * thing in the real card (`text-[10px] font-bold uppercase tracking-wide
 * text-neutral-400`) and stay the same thing here.
 *
 * ⚠️ The size TRACKS THE CARD, which is a step function of the viewport rather
 * than a smooth one — so the label is one too, and the three steps are the three
 * widths the card actually takes:
 *
 *   below `sm`  cards STACK, so each is the column's full width (~300px at
 *               390px) — the real card's own width, so the real card's own
 *               10px.
 *   `sm`–`xl`   three cards share one column, and from `lg` the desktop rail
 *               eats 276px of it too: the card lands at 176–254px, 53–77% of
 *               the real one. It takes the shared `LABEL` primitive's 8.5px,
 *               which is the size every other slice on this page sets its chrome
 *               labels at.
 *   `xl` up     the region's grid finally leaves ~300px per card again, so the
 *               real 10px comes back.
 *
 * Holding 10px through the middle band is not fidelity — it drives the longest
 * Arabic label (`أقصى مدة إقامة`) into its column's ellipsis while the card
 * around it has shrunk by a third. Scaling the label with the card is what keeps
 * the PROPORTION faithful, which is what the drawing is of.
 *
 * `uppercase` is a no-op in Arabic, which is correct — the tracking carries the
 * chrome register there.
 */
const CHROME_LABEL =
  "text-[10px] sm:text-[8.5px] xl:text-[10px] font-bold uppercase tracking-wide text-zinc-500";

/* The three flags this catalog needs come from `deep-dive/flags.tsx`, which is
   also where the rule that they must NOT mirror under `dir="rtl"` is recorded.
   They were defined here until the eSIM slice needed two of the same four. */

/**
 * One column of the stats box, faithful to the real card's `Stat`: a 10px bold
 * uppercase label over a 12.5px extrabold value, centred, with columns 2 and 3
 * carrying the rule that separates them.
 *
 * `min-w-0` + `truncate` on the label is the one addition, and it is a backstop
 * rather than the plan: `CHROME_LABEL` already steps the label down with the
 * card (see its note), which keeps the longest Arabic string whole everywhere
 * except the narrowest band — 640–767px, where three portrait cards share 560px
 * and are 181px each. Without `min-w-0` a grid column's min-width is its
 * content, so the label would OVERFLOW the box there instead of shortening,
 * pushing the stats box past the card's edge.
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
      className={`flex min-w-0 flex-col gap-[3px] text-center ${
        divider ? "border-s border-white/[0.08] ps-1.5 xl:ps-2" : ""
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
 * The head row's end element when a country publishes SEVERAL visa types — the
 * real card's `bg-neutral-100 text-neutral-500` pill with its 5px `bg-primary`
 * dot, re-expressed on the dark ground. The dot is what stops the count reading
 * as a quantity badge; it is the accent that says "there is a choice here".
 */
function TypesPill({ children }: { children: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-[5px] whitespace-nowrap rounded-full bg-white/[0.07] px-2 py-[3px] text-[10px] font-bold leading-none text-zinc-400">
      <span className="block h-[5px] w-[5px] shrink-0 rounded-full bg-ts-purple-text" />
      {children}
    </span>
  );
}

/**
 * The head row's end element when a country publishes exactly ONE — the real
 * card's tone badge. `eVisa` is its `info` tone (`bg-info-50 text-info-700`),
 * which the groups slice already re-expressed as this sky tint for the same
 * tone; keeping one dark reading of `info` across the two frames is what stops
 * them looking like two products.
 */
function ToneBadge({ children }: { children: string }) {
  return (
    <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-sky-400/12 px-2 py-[3px] text-[10px] font-bold uppercase leading-none tracking-wide text-sky-300">
      {children}
    </span>
  );
}

interface Destination {
  country: string;
  /** The line under the name: a type count, or the single type's own name. */
  sub: string;
  /** The head row's end element — the two branches are mutually exclusive. */
  end: { kind: "pill"; label: string } | { kind: "badge"; label: string };
  /** Stats box, in reading order. */
  types: string;
  fastest: string;
  maxStay: string;
  /**
   * The destination photograph. The real card leads with one, and it is the
   * trait that makes a visa result read as a destination rather than as a row
   * in a price list.
   *
   * All three: Unsplash, under the Unsplash License (free for commercial use,
   * no attribution required). Square 640px WebP, sized down to the pane.
   * dest-dubai = Unsplash photo-1512453979798, dest-cappadocia =
   * photo-1641128324972, dest-paris = photo-1502602898657.
   */
  photo: string;
  /**
   * The dark ground painted BEHIND the photo. `next/image` is lazy, so without
   * it the pane is a transparent hole on the card until the file decodes — and
   * a hue per card keeps the trio distinguishable while they load. Each is
   * sampled from its own photograph's upper and lower halves.
   */
  band: string;
  price: string;
  cta: string;
  flag: ReactNode;
}

export function VisaCatalogSlice() {
  const t = useTranslations("TourScope.deepDive.visas.slice");

  const destinations: Destination[] = [
    {
      country: t("aCountry"),
      sub: t("aSub"),
      end: { kind: "pill", label: t("aPill") },
      types: t("aTypes"),
      fastest: t("aFastest"),
      maxStay: t("aMaxStay"),
      photo: "/tourscope/dest-dubai.webp",
      band: "from-[#443b38] to-[#221c18]",
      price: "$95",
      cta: t("ctaChoose"),
      flag: <FlagAE />,
    },
    {
      country: t("bCountry"),
      sub: t("bSub"),
      end: { kind: "badge", label: t("bBadge") },
      types: t("bTypes"),
      fastest: t("bFastest"),
      maxStay: t("bMaxStay"),
      photo: "/tourscope/dest-cappadocia.webp",
      band: "from-[#2d414e] to-[#442f1a]",
      price: "$60",
      cta: t("ctaApply"),
      flag: <FlagTR />,
    },
    {
      country: t("cCountry"),
      sub: t("cSub"),
      end: { kind: "pill", label: t("cPill") },
      types: t("cTypes"),
      fastest: t("cFastest"),
      maxStay: t("cMaxStay"),
      photo: "/tourscope/dest-paris.webp",
      band: "from-[#33313c] to-[#2a2528]",
      price: "$140",
      cta: t("ctaChoose"),
      flag: <FlagFR />,
    },
  ];

  return (
    <div aria-hidden="true" className={`select-none text-zinc-300 antialiased ${SHEET}`}>
      {/* ── Catalog context bar ────────────────────────────────────────────
          The sibling slices' header anatomy — one fact per slot with a drawn dot
          between — minus their live indicator. What this view IS, and the fact
          that decides everything in it: the visitor's passport. The real
          storefront filters the whole catalog by nationality before it renders a
          single card, so naming the passport here is naming the query. */}
      <div
        className={`flex flex-wrap items-center gap-x-2.5 gap-y-1.5 border-b ${DIVIDE} px-3 py-2.5 sm:px-4`}
      >
        <span className="text-[12.5px] font-bold text-white">{t("title")}</span>
        <Dot />
        <span className="text-[10.5px] text-zinc-400">{t("nationality")}</span>
      </div>

      {/* ── Destination cards ──────────────────────────────────────────────
          A grid, because the real catalog is a grid. It stacks below `sm` so the
          phone gets three full-width cards rather than three 100px slivers — the
          card is portrait, so stacking keeps its proportions rather than
          breaking them. */}
      <div className="grid grid-cols-1 gap-2 px-3 py-2.5 sm:grid-cols-3 sm:px-4">
        {destinations.map((d) => (
          <div
            key={d.country}
            /* `overflow-hidden` is what clips the photo pane to the card's
               rounded corners without a second radius on the pane or on the
               image — the real card's own mechanism. `flex-col` + the body's
               `mt-auto` footer is what keeps the three footers on one line when
               one card's sub or stats wrap and its neighbours' do not. */
            className="flex flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.015]"
          >
            {/* ── Photo pane ───────────────────────────────────────────────
                Full-bleed across the card's top, `shrink-0` so it keeps its
                height however tall the body grows — the real card's own
                `relative h-[132px] shrink-0 overflow-hidden`, at this frame's
                scale. `relative` is what the `fill` image positions against; the
                gradient is the ground it paints on top of while it loads.

                NO scrim and NO label: unlike the group card, the real visa card
                puts nothing at all on its photograph — the country is named in
                the head row directly under it, beside its flag, so a second name
                burned onto the image would be the same fact twice. */}
            <div
              className={`relative h-[110px] shrink-0 overflow-hidden bg-gradient-to-br ${d.band}`}
            >
              <Image
                src={d.photo}
                alt=""
                fill
                sizes="(min-width: 1280px) 300px, (min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
            </div>

            {/* ── Head ─────────────────────────────────────────────────────
                Flag + name + sub at the start, the pill or badge at the end.
                `items-start` so a two-line name does not drag the pill down with
                it, exactly as the real card sets it. */}
            <div
              className={`flex items-start justify-between gap-2 border-b ${DIVIDE} px-2.5 py-2.5 xl:px-3`}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                {d.flag}
                <div className="min-w-0">
                  {/* The card's largest text after the price, as in the real
                      one, and the one place `font-extrabold` appears up here. */}
                  <p className="truncate text-[15px] font-extrabold leading-tight tracking-tight text-white">
                    {d.country}
                  </p>
                  <p className="mt-[2px] truncate text-[11px] font-medium text-zinc-400">
                    {d.sub}
                  </p>
                </div>
              </div>

              {d.end.kind === "pill" ? (
                <TypesPill>{d.end.label}</TypesPill>
              ) : (
                <ToneBadge>{d.end.label}</ToneBadge>
              )}
            </div>

            {/* ── Body ─────────────────────────────────────────────────────── */}
            <div className="flex flex-1 flex-col px-2.5 pb-3 pt-2.5 xl:px-3">
              {/* The stats box: three columns inset into a soft panel, the dark
                  reading of the real card's `bg-neutral-50 border-neutral-200
                  rounded-[12px]`. The rule between columns is `border-s` on the
                  second and third, so it moves to the other edge under RTL and
                  the box mirrors with no second rule. */}
              <div className="grid grid-cols-3 rounded-xl border border-white/[0.07] bg-white/[0.04] py-2">
                <Stat label={t("statTypes")} value={d.types} />
                <Stat label={t("statFastest")} value={d.fastest} divider />
                <Stat label={t("statMaxStay")} value={d.maxStay} divider />
              </div>

              {/* Footer: the `From` label over the price at the start, the CTA
                  at the end. `mt-auto` pins it to the card's floor, which is
                  what keeps the three prices on one line across the row. */}
              <div
                className={`mt-auto flex items-center justify-between gap-2 border-t ${DIVIDE} pt-2.5`}
              >
                {/* `items-start`, not the real card's stretch: the price below
                    carries `dir="ltr"`, and on a stretched child that would
                    left-align the amount inside its own box — pushing it away
                    from the card's inline start under RTL. Shrink-wrapped, the
                    direction governs the glyphs and nothing else. */}
                <div className="flex min-w-0 flex-col items-start">
                  <span className={CHROME_LABEL}>{t("from")}</span>
                  {/* `dir="ltr"` on the pure `$`+digits token, the same rule the
                      flights section applies to `13%` and `$10`: a currency sign
                      is a bidi terminator, and pinning the run removes any doubt
                      about which side of the digits it lands on in Arabic. */}
                  <span
                    dir="ltr"
                    className="mt-[2px] text-[17px] font-extrabold leading-none tabular-nums text-white"
                  >
                    {d.price}
                  </span>
                </div>

                {/* The conversion CTA. A `span` — nothing in an aria-hidden
                    subtree is focusable. Filled rather than the real card's
                    outlined rest state: see the module note. */}
                <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md bg-ts-purple px-2.5 py-[6px] text-[10px] font-semibold leading-none text-white shadow-[0_4px_12px_rgba(111,0,255,0.28)]">
                  {d.cta}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer chrome ──────────────────────────────────────────────────
          How big the catalog is, and the rule that produced it — the visas twin
          of "48 fares · 12 airlines" and "142 properties · 5 suppliers". The
          second slot is not a count here on purpose: the fact worth stating
          about a visa catalog is not how many suppliers fed it but that the
          visitor is being shown a filtered set, which is the difference between
          this and a brochure. */}
      <div className={`flex flex-wrap items-center gap-2 border-t ${DIVIDE} px-3 py-2 sm:px-4`}>
        <span className="text-[10px] text-zinc-400">{t("destinationCount")}</span>
        <Dot />
        <span className="text-[10px] text-zinc-400">{t("passportFilter")}</span>
      </div>
    </div>
  );
}
