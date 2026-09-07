"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { AirplaneTilt, CalendarDot, MapPin } from "@phosphor-icons/react";
import {
  CARD,
  DIVIDE,
  Dot,
  PulseDot,
  SHEET,
} from "@/components/site/tourscope/slice-primitives";

/**
 * The storefront's group-tour results, coded — the groups section's product view.
 *
 * ── What this is a drawing OF ───────────────────────────────────────────────
 * The cards are a structural miniature of the marketplace's real
 * `features/group/components/GroupCard.tsx`, element for element: a horizontal
 * two-zone card (photo pane | info column), a photo pane carrying the real
 * card's own scrim and its country label pinned bottom-start, an info column
 * that splits into a TOP block (travel-style badges → title → duration →
 * itinerary cities) and a BOTTOM block (departure meta at the start, price
 * column at the end), and a price column that runs `from` prefix → amount →
 * `per person` caption → CTA, top to bottom.
 *
 * The real card is LIGHT-themed; only its STRUCTURE is copied. Every colour is
 * re-expressed in this page's dark tokens — its `bg-success-100` / `bg-info-100`
 * soft badges become tinted teal / sky / amber / purple pills, its `Button`
 * becomes the `ts-purple` bar the sibling slices use. Copying the light palette
 * onto a near-black page produces a bright rectangle, which is exactly why the
 * captured screenshots were dropped for coded slices.
 *
 * ── The four slice rules (same contract as `ProductSlices.tsx`) ─────────────
 * 1. Every WORD comes from `messages` (`TourScope.deepDive.groups.slice`).
 *    Currency amounts (`$1,250`, `$780`) are literals — identical in both
 *    locales. Tour titles, country names, city names and travel-style labels
 *    ARE messages, for the same reason the hotels slice localizes property
 *    names: in the real product every one of those is server-supplied,
 *    per-locale content (`local_group_templates` carries the operator's own
 *    title and its itinerary cities; the badge labels arrive as
 *    `travelStyles[].label`), so an Arabic reader shown an English tour card
 *    would be shown the product misrepresented.
 * 2. The root is `aria-hidden` — the section copy beside it carries the
 *    meaning — so nothing inside is focusable and every button is a `span`.
 * 3. Logical properties only, so it mirrors under `dir="rtl"` unaided. The
 *    photo pane is the flex row's FIRST child, so it lands on the inline start
 *    in both directions with no second rule; the price column is the bottom
 *    row's last child, so it lands on the inline end. The country label uses
 *    `start-*`, so it follows the pane's own inline start. Nothing here is a
 *    directional glyph — the plane is a MODE marker (which transport this
 *    departure uses), not a heading, exactly as the real card's `tripModeIcon`
 *    is — so unlike the flights slice there is no flip to carry.
 * 4. Motion is the shared pulse dot and nothing else; the entrance belongs to
 *    the `FadeIn` the caller wraps this in.
 *
 * ── What is deliberately NOT drawn ──────────────────────────────────────────
 * The real card's `CompanyPriceStrip` (retail price + the member's own margin)
 * renders for signed-in COMPANY members only — `showMargin` is gated on a
 * positive `companyCommission`. This frame is captioned as the storefront a
 * traveller sees, so drawing an agent-only strip in it would show a view the
 * captioned reader never gets. The country FLAG is dropped for a different
 * reason: the real card renders `CountryFlag`, and this site ships no flag
 * sprite — an emoji flag is the only zero-asset substitute and it renders as
 * two letters in a box on Windows, which is worse than the label alone.
 *
 * ── Why this pair of rows ───────────────────────────────────────────────────
 * Two tours, matching the hotels slice beside it: the group card is HORIZONTAL
 * and roughly twice a flight row's height, so three would push this frame past
 * both siblings above it and make the three sections read as competing rather
 * than as a series. The pair also carries the two shapes an operator's own
 * catalogue actually holds — a religious package and a leisure getaway — rather
 * than two near-identical cards.
 */

/**
 * One travel-style badge, the dark re-expression of the real card's
 * `<Badge variant="soft" color={…} rounded="full">`.
 *
 * BORDERLESS on purpose: the marketplace's `soft` badge variant is
 * `border-transparent` + a tinted ground + a saturated text colour, and that
 * borderlessness is what separates a content TAG from the bordered status
 * `Pill` the slice primitives draw. Keeping the distinction here keeps it in
 * the drawing.
 */
const TAG_TONES = {
  /* success */ teal: "bg-cs-teal/12 text-cs-teal",
  /* info    */ sky: "bg-sky-400/12 text-sky-300",
  /* warning */ amber: "bg-amber-400/12 text-amber-300",
  /* primary */ purple: "bg-ts-purple/18 text-ts-purple-text",
} as const;

type TagTone = keyof typeof TAG_TONES;

/**
 * The real card cycles `["success", "info", "warning", "primary"]` by badge
 * INDEX, restarting at every card — so two two-tag cards would both draw
 * teal + sky and half the palette would never appear in this drawing.
 *
 * The cycle therefore CONTINUES across the pair (card A takes 0–1, card B
 * takes 2–3). Same four sanctioned tones in the same order; the only thing
 * changed is where the second card picks the sequence up, which is what lets
 * the frame exhibit the full badge palette exactly once — the same reasoning
 * the hotels slice gives for carrying each of its optional states once.
 */
const TAG_CYCLE: readonly TagTone[] = ["teal", "sky", "amber", "purple"];

function TagPill({ tone, children }: { tone: TagTone; children: string }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-[6px] py-[2px] text-[8px] font-semibold leading-none ${TAG_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

/** One meta row of the bottom-start column: a glyph and its label. */
function MetaRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex min-w-0 items-center gap-[5px]">
      {icon}
      <span className="min-w-0 truncate text-[8px] font-medium leading-none text-zinc-400">
        {label}
      </span>
    </span>
  );
}

interface Tour {
  title: string;
  /** The scrim label, bottom-start of the photo pane. */
  country: string;
  tags: string[];
  /** `10 days` and `9 nights` as the real card's two plural-formatted halves. */
  days: string;
  nights: string;
  /** The itinerary cities, already joined — the real card's `.join(" · ")`. */
  cities: string;
  /** Departure points, one row each, exactly as the real card lists them. */
  departures: string[];
  /** The next open departure date. */
  nextDate: string;
  /**
   * The pane's photograph. The real card's image pane is the trait that makes
   * a group result read as a group result at a glance, so this one carries a
   * real photo rather than the colour field the other coded slices use.
   *
   * Both files: Unsplash, under the Unsplash License (free for commercial use,
   * no attribution required). Square 640px WebP, sized down to the pane.
   * A — Al-Masjid an-Nabawi, Madinah. B — Sultan Ahmed Mosque, Istanbul.
   */
  photo: string;
  /**
   * The dark ground painted BEHIND the photo. `next/image` is lazy, so without
   * it the pane is a transparent hole on the card until the file decodes —
   * and a hue per card keeps the pair distinguishable while they load. Each is
   * sampled from its own photograph's two dominant bands.
   */
  band: string;
  /** Lowest per-person fare across the tour's departures. */
  price: string;
}

export function GroupToursSlice() {
  const t = useTranslations("TourScope.deepDive.groups.slice");

  const tours: Tour[] = [
    {
      title: t("aTitle"),
      country: t("aCountry"),
      tags: [t("aTag1"), t("aTag2")],
      days: t("aDays"),
      nights: t("aNights"),
      cities: t("aCities"),
      departures: [t("aDep1"), t("aDep2")],
      nextDate: t("aNextDate"),
      photo: "/tourscope/group-madinah.webp",
      band: "from-[#2c2418] to-[#1b2333]",
      price: "$1,250",
    },
    {
      title: t("bTitle"),
      country: t("bCountry"),
      tags: [t("bTag1"), t("bTag2")],
      days: t("bDays"),
      nights: t("bNights"),
      cities: t("bCities"),
      departures: [t("bDep1"), t("bDep2")],
      nextDate: t("bNextDate"),
      photo: "/tourscope/group-istanbul.webp",
      band: "from-[#33203a] to-[#1c2740]",
      price: "$780",
    },
  ];

  return (
    <div aria-hidden="true" className={`select-none text-zinc-300 antialiased ${SHEET}`}>
      {/* ── Catalogue context bar ──────────────────────────────────────────
          Same vocabulary as the two sibling slices' headers: one fact per slot
          with a drawn dot between, and the live indicator pinned to the inline
          end. What this view IS, how many dated departures it is showing, and
          the window they fall in. */}
      <div
        className={`flex flex-wrap items-center gap-x-2.5 gap-y-1.5 border-b ${DIVIDE} px-3 py-2.5 sm:px-4`}
      >
        <span className="text-[12.5px] font-bold text-white">{t("title")}</span>
        <Dot />
        <span className="text-[10.5px] text-zinc-400">{t("departureCount")}</span>
        <Dot />
        <span className="text-[10.5px] text-zinc-400">{t("window")}</span>
        <span className="ms-auto flex items-center gap-1.5">
          <PulseDot />
          <span className="text-[9.5px] font-medium text-zinc-400">{t("live")}</span>
        </span>
      </div>

      {/* ── Tour cards ─────────────────────────────────────────────────────
          No sort row above them, for the reason the hotels slice gives: nothing
          in this drawing sorts, so a "Cheapest" chip over a pair that is not in
          price order would be a drawn contradiction. */}
      <div className="flex flex-col gap-2 px-3 py-2.5 sm:px-4">
        {tours.map((tour, cardIndex) => (
          <div
            key={tour.title}
            /* `overflow-hidden` is what clips the photo pane to the card's
               rounded corners without a second radius on the pane or on the
               image — the real card's own mechanism. */
            className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.015]"
          >
            <div className="flex">
              {/* ── Photo pane ────────────────────────────────────────────
                  `self-stretch` is what makes it a full-height band rather than
                  a thumbnail floating in the card — the real card pins it with
                  `self-stretch min-h-[230px]` for the same reason. `relative`
                  is what the `fill` image below positions against; the gradient
                  is the ground it paints on top of while it loads.

                  Roughly a third of the card, which is the real one's ratio
                  (270px of a ~700px results card) and the same proportion the
                  hotels slice beside it uses — the two sections are a series,
                  and a pane at a different width would break that read. */}
              <div
                className={`relative w-[104px] shrink-0 self-stretch overflow-hidden bg-gradient-to-br ${tour.band} sm:w-[200px] lg:w-[290px]`}
              >
                <Image
                  src={tour.photo}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 290px, (min-width: 640px) 200px, 104px"
                  className="object-cover"
                />
                {/* The real card's own scrim, stop for stop
                    (`from-black/55 via-black/10 to-transparent`). It exists to
                    keep the white country label legible over a bright sky —
                    the same job it does there, and both photographs here are
                    bright-skied. */}
                <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                {/* The country, bottom-start on the scrim, in small semibold
                    white — exactly where and how the real card sets it
                    (`bottom-[12px] start-[12px] text-[11px] font-semibold
                    text-white`), at this slice's scale. No flag: see the module
                    note. */}
                <span className="absolute bottom-1.5 start-1.5 text-[8px] font-semibold leading-none text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                  {tour.country}
                </span>
              </div>

              {/* ── Info column ───────────────────────────────────────────── */}
              <div className="flex min-w-0 flex-1 flex-col">
                {/* Top: badges, then title + duration + cities — the real
                    card's `gap-[10px]` block, with the title group's own
                    tighter `gap-[2px]` preserved inside it. */}
                <div className="flex flex-col gap-1.5 px-2.5 pb-1.5 pt-2.5 sm:px-3 sm:pt-3">
                  <div className="flex flex-wrap items-center gap-1">
                    {tour.tags.map((tag, i) => (
                      <TagPill
                        key={tag}
                        tone={TAG_CYCLE[(cardIndex * 2 + i) % TAG_CYCLE.length]}
                      >
                        {tag}
                      </TagPill>
                    ))}
                  </div>

                  <div className="flex flex-col gap-[2px]">
                    {/* The card's largest text, as in the real one, and the
                        one place `font-extrabold` appears in this frame. */}
                    <span className="text-[11.5px] font-extrabold leading-tight tracking-tight text-white">
                      {tour.title}
                    </span>

                    {/* Duration. A drawn dot, not a "·": the Arabic-Indic zero
                        is itself a raised dot, so a middot beside a numeral is
                        absorbed into it — and both halves of this line START
                        with a numeral. (The cities line below is one joined
                        string with a literal middot, faithful to the real
                        card's `.join(" · ")`, because no numeral touches it.) */}
                    <span className="flex items-center gap-1 text-[8.5px] font-medium leading-none text-zinc-400">
                      <span>{tour.days}</span>
                      <Dot />
                      <span>{tour.nights}</span>
                    </span>

                    <span className="mt-[3px] flex min-w-0 items-center gap-1">
                      <MapPin size={9} weight="fill" className="shrink-0 text-zinc-500" />
                      {/* Clamped to one line for the reason the real card
                          gives: a long itinerary runs to a dozen cities, and
                          letting it wrap gives the cards ragged heights. */}
                      <span className="min-w-0 truncate text-[8.5px] font-medium text-zinc-400">
                        {tour.cities}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Bottom: departure meta at the start, price column at the
                    end — `items-end`, so both sit on the card's floor however
                    many departure rows the tour carries. The real card's own
                    `flex-1 … flex items-end` block. */}
                <div className="flex flex-1 items-end gap-2 px-2.5 pb-2.5 pt-1.5 sm:gap-3 sm:px-3 sm:pb-3">
                  <div className="flex min-w-0 flex-1 flex-col justify-end gap-[5px]">
                    {/* Departure points, one row each. The real card draws the
                        trip's MODE glyph here (`tripModeIcon`) — a plane for a
                        flight departure, which is what both of these are. */}
                    {tour.departures.map((label) => (
                      <MetaRow
                        key={label}
                        icon={
                          <AirplaneTilt
                            size={9}
                            weight="fill"
                            className="shrink-0 text-zinc-500"
                          />
                        }
                        label={label}
                      />
                    ))}

                    {/* The next open departure — the real card's
                        `CalendarClock` row, with its label and date on one
                        line. */}
                    <MetaRow
                      icon={
                        <CalendarDot size={9} weight="fill" className="shrink-0 text-zinc-500" />
                      }
                      label={`${t("nextDeparture")} ${tour.nextDate}`}
                    />
                  </div>

                  {/* ── Price column ───────────────────────────────────────
                      The real card's `<Price prefix caption align="end">` with
                      its default `captionPlacement="below"`: the `from` prefix
                      on its own line above the amount, the `per person`
                      caption on its own line under it. The caption is what
                      stops a per-head fare being read as the price of the
                      whole package. */}
                  <div className="flex w-[74px] shrink-0 flex-col items-end sm:w-[92px]">
                    <span className="text-[7.5px] font-medium leading-none text-zinc-500">
                      {t("priceFrom")}
                    </span>
                    <span className="mt-[3px] text-[14px] font-bold leading-none tabular-nums text-white">
                      {tour.price}
                    </span>
                    <span className="mt-[3px] text-[7.5px] font-medium leading-none text-zinc-500">
                      {t("perPerson")}
                    </span>

                    {/* The conversion CTA, drawn as the product's primary
                        button (the real card's full-width `<Button>` under the
                        price). A `span` — nothing in an aria-hidden subtree is
                        focusable. */}
                    <span className="mt-[6px] flex w-full items-center justify-center rounded-md bg-ts-purple px-2 py-[5px] text-[8.5px] font-semibold leading-none text-white shadow-[0_4px_12px_rgba(111,0,255,0.28)]">
                      {t("viewDetails")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer chrome ──────────────────────────────────────────────────
          How big the catalogue is and how many cities it departs from — the
          groups twin of "48 fares · 12 airlines" and "142 properties ·
          5 suppliers". Neither figure repeats the header's: stating one number
          twice inside a frame this small reads as a rendering fault.

          The end chip is where the flights slice puts its supplier count, and
          here it says the thing that makes this vertical different — a group
          tour has no wholesaler behind it. It is the operator's own package. */}
      <div className={`flex flex-wrap items-center gap-2 border-t ${DIVIDE} px-3 py-2 sm:px-4`}>
        <span className="text-[10px] text-zinc-400">{t("tourCount")}</span>
        <Dot />
        <span className="text-[10px] text-zinc-400">{t("cityCount")}</span>
        <span className={`ms-auto rounded-md px-2 py-1 text-[9.5px] font-medium ${CARD}`}>
          {t("ownInventory")}
        </span>
      </div>
    </div>
  );
}
