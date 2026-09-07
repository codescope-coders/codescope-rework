"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import {
  CalendarCheck,
  Coffee,
  MapPin,
  SwimmingPool,
  WifiHigh,
} from "@phosphor-icons/react";
import {
  DIVIDE,
  Dot,
  LABEL,
  Pill,
  PulseDot,
  SHEET,
} from "@/components/site/tourscope/slice-primitives";

/**
 * The storefront's hotel results, coded — the hotels section's product view.
 *
 * ── What this is a drawing OF ───────────────────────────────────────────────
 * The cards are a structural miniature of the marketplace's real
 * `features/hotel/components/HotelCard.tsx`, element for element: a horizontal
 * two-zone card (photo pane | info column), an info column that splits into a
 * TOP block (name + star row, then the location line) and a BOTTOM block
 * (signal chips at the start, price column at the end), and a price column that
 * runs per-night fare → total pill → rooms · nights caption → CTA, top to
 * bottom.
 *
 * The real card is LIGHT-themed; only its STRUCTURE is copied. Every colour is
 * re-expressed in this page's dark tokens — its `bg-success-50` refundable chip
 * becomes the site's `cs-teal` positive tone, its `text-primary` distance pill
 * and primary button become `ts-purple`. Copying the light palette onto a
 * near-black page produces a bright rectangle, which is exactly why the
 * captured screenshots were dropped for coded slices.
 *
 * ── The four slice rules (same contract as `ProductSlices.tsx`) ─────────────
 * 1. Every WORD comes from `messages` (`TourScope.deepDive.hotels.slice`).
 *    Numerals and currency (`$128`, `$384`) are literals — identical in both
 *    locales.
 *
 *    ⚠️ Hotel NAMES and ADDRESSES are messages here, which is the one place
 *    this slice departs from its flights sibling (where carrier names are
 *    manifest DATA, rendered identically in both locales). Airline names are
 *    global brand marks that do not localize; hotel names in THIS product
 *    demonstrably do — `hotel_name_translations` holds hand-curated Arabic per
 *    property, and the section's own body copy directly above this frame claims
 *    "Names, descriptions and guest reviews arrive in your customer's language,
 *    Arabic included." An Arabic reader shown a wall of English property names
 *    beside that sentence is being shown the claim being broken.
 *
 * 2. The root is `aria-hidden` — the section copy beside it carries the
 *    meaning — so nothing inside is focusable and every button is a `span`.
 * 3. Logical properties only, so it mirrors under `dir="rtl"` unaided. The
 *    photo pane is the flex row's FIRST child, so it lands on the inline start
 *    in both directions with no second rule; the price column is the bottom
 *    row's last child, so it lands on the inline end. Nothing here is a
 *    directional glyph, so unlike the flights slice there is no flip to carry.
 * 4. Motion is the shared pulse dot and nothing else; the entrance belongs to
 *    the `FadeIn` the caller wraps this in.
 *
 * ── Why this pair of rows ───────────────────────────────────────────────────
 * Two properties, not three: the hotel card is HORIZONTAL and roughly twice a
 * flight row's height, so three would push the frame past the flights slice
 * above it and make the two sections read as competing rather than as a series.
 * The pair carries every optional state of the real card exactly once — five
 * stars vs four (so the star row's empty slot is visible), a distance pill vs
 * none, a full amenity run vs a short one — instead of two near-identical
 * cards.
 */

/**
 * The star row, faithful to the real `StarView`: FIVE slots always, the
 * remainder drawn empty rather than dropped. That is what makes a four-star
 * property read as four-out-of-five instead of as a shorter row somebody might
 * take for a rendering glitch.
 *
 * `★` is a literal by the primitives' rule 1 (punctuation, currency signs and
 * the star glyph are identical in both locales), and this is the same amber
 * glyph row `ProductSlices` already draws. The real card fills its stars with
 * the tenant's `--theme-primary`; amber is the dark-theme re-expression, and
 * the universal convention for a hotel class rating.
 */
function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex shrink-0 items-center gap-[1px] pt-[1px] text-[7.5px] leading-none">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "text-amber-400" : "text-white/15"}>
          ★
        </span>
      ))}
    </span>
  );
}

/** One signal chip: a glyph and its label, in the shared pill vocabulary. */
function Signal({
  icon,
  label,
  tone = "zinc",
}: {
  icon: ReactNode;
  label: string;
  tone?: "teal" | "zinc";
}) {
  return (
    <Pill tone={tone} className="text-[8px]">
      {icon}
      {label}
    </Pill>
  );
}

interface Property {
  name: string;
  address: string;
  /** Class rating, 1–5. Drives the filled count of a five-slot star row. */
  stars: number;
  /** The map-distance pill, or `null` when the search had no map point. */
  distance: string | null;
  /**
   * The pane's photograph. The real card's image pane is the trait that makes
   * a hotel result read as a hotel result at a glance, so this one carries a
   * real photo rather than the colour field the other coded slices use.
   *
   * Both files: Unsplash, under the Unsplash License (free for commercial use,
   * no attribution required). Square 640px WebP, sized down to the pane.
   */
  photo: string;
  /**
   * The dark ground painted BEHIND the photo. `next/image` is lazy, so without
   * it the pane is a transparent hole on the card until the file decodes —
   * and a hue per card keeps the pair distinguishable while they load.
   */
  band: string;
  signals: ReactNode;
  /** Per-night fare — the price column's hero figure. */
  price: string;
  /** Whole-stay total for every room and night. */
  total: string;
}

export function HotelResultsSlice() {
  const t = useTranslations("TourScope.deepDive.hotels.slice");

  const icon = "shrink-0";

  /* Arithmetic holds: 3 nights × $128 = $384, 3 nights × $95 = $285. A reader
     who checks the figures should find they add up; a drawing that contradicts
     itself is worse than no drawing. */
  const properties: Property[] = [
    {
      name: t("aName"),
      address: t("aAddress"),
      stars: 5,
      distance: t("aDistance"),
      photo: "/tourscope/hotel-marina.webp",
      band: "from-[#123037] to-[#1c2a4a]",
      signals: (
        <>
          <Signal
            tone="teal"
            icon={<CalendarCheck size={9} weight="bold" className={icon} />}
            label={t("freeCancellation")}
          />
          <Signal icon={<Coffee size={9} weight="bold" className={icon} />} label={t("breakfast")} />
          <Signal icon={<WifiHigh size={9} weight="bold" className={icon} />} label={t("wifi")} />
          <Signal
            icon={<SwimmingPool size={9} weight="bold" className={icon} />}
            label={t("pool")}
          />
        </>
      ),
      price: "$128",
      total: "$384",
    },
    {
      name: t("bName"),
      address: t("bAddress"),
      stars: 4,
      distance: null,
      photo: "/tourscope/hotel-palm.webp",
      band: "from-[#3a2a20] to-[#231d1a]",
      signals: (
        <>
          <Signal
            tone="teal"
            icon={<CalendarCheck size={9} weight="bold" className={icon} />}
            label={t("freeCancellation")}
          />
          <Signal icon={<WifiHigh size={9} weight="bold" className={icon} />} label={t("wifi")} />
        </>
      ),
      price: "$95",
      total: "$285",
    },
  ];

  return (
    <div aria-hidden="true" className={`select-none text-zinc-300 antialiased ${SHEET}`}>
      {/* ── Search context bar ─────────────────────────────────────────────
          Same vocabulary as the flights slice's header, one fact per slot with
          a drawn dot between: where, when, who, and how many rooms.

          The date range carries no `dir="ltr"`. It needs none: each locale
          writes its own string in its own numerals, and an en dash between two
          Arabic-Indic runs resolves to the paragraph direction, so `١٢ – ١٥ آذار`
          reads right-to-left in the right order. (The flights slice's TIMES do
          carry `dir`, because there the same Latin `08:35` is printed into both
          locales.) */}
      <div
        className={`flex flex-wrap items-center gap-x-2.5 gap-y-1.5 border-b ${DIVIDE} px-3 py-2.5 sm:px-4`}
      >
        <span className="text-[12.5px] font-bold text-white">{t("destination")}</span>
        <Dot />
        <span className="text-[10.5px] text-zinc-400">{t("dates")}</span>
        <Dot />
        <span className="text-[10.5px] text-zinc-400">{t("pax")}</span>
        <Dot />
        <span className="text-[10.5px] text-zinc-400">{t("rooms")}</span>
        <span className="ms-auto flex items-center gap-1.5">
          <PulseDot />
          <span className="text-[9.5px] font-medium text-zinc-400">{t("live")}</span>
        </span>
      </div>

      {/* ── Property cards ─────────────────────────────────────────────────
          No sort row above them, unlike the flights slice. Nothing in this
          drawing sorts (the pair is in recommended order, not price order), so
          a "Cheapest" chip over two cards priced $128 then $95 would be a
          drawn contradiction. */}
      <div className="flex flex-col gap-2 px-3 py-2.5 sm:px-4">
        {properties.map((p) => (
          <div
            key={p.name}
            /* `overflow-hidden` is what clips the photo pane to the card's
               rounded corners without a second radius on the pane or on the
               image — the real card's own mechanism. */
            className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.015]"
          >
            <div className="flex">
              {/* ── Photo pane ────────────────────────────────────────────
                  `self-stretch` is what makes it a full-height band rather than
                  a thumbnail floating in the card, which is the single trait
                  that makes a hotel result look like a hotel result. `relative`
                  is what the `fill` image below positions against; the gradient
                  is the ground it paints on top of while it loads. */}
              {/* Roughly a third of the card, which is the real one's ratio
                  (230px of a ~700px results card). It is a proportion, not a
                  thumbnail size: the pane is the first thing a reader's eye
                  lands on, and at a fixed ~116px it shrank to a stamp in this
                  slice's full-bleed frame while the info column's content
                  stranded itself across 850px of empty ground. */}
              <div
                className={`relative w-[104px] shrink-0 self-stretch overflow-hidden bg-gradient-to-br ${p.band} sm:w-[200px] lg:w-[290px]`}
              >
                {/* The property's photograph. `fill` + `object-cover` so the
                    pane's box decides the crop, exactly as the real card sets
                    its images; the card's own `overflow-hidden` does the
                    rounding, so the image needs no radius of its own. `alt=""`
                    because this whole subtree is `aria-hidden` — there is
                    nothing here for a screen reader to describe. */}
                <Image
                  src={p.photo}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 290px, (min-width: 640px) 200px, 104px"
                  className="object-cover"
                />
                {/* The real card's own scrim, stop for stop. It is what keeps
                    the white pager dots legible over a bright pool surface —
                    the same job it does there. */}
                <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                {/* Property type, on the block start — uppercase, tracked, on a
                    translucent blurred ground, exactly where the real card puts
                    it. `uppercase` is a no-op in Arabic, which is correct: the
                    tracking carries the badge on its own there. */}
                <span className="absolute start-1.5 top-1.5 inline-flex items-center rounded-full border border-white/15 bg-black/45 px-[5px] py-[1.5px] text-[6.5px] font-bold uppercase leading-none tracking-[0.12em] text-zinc-100 backdrop-blur-sm">
                  {t("propertyType")}
                </span>

                {/* The pager, bottom-centre. One elongated active dot and three
                    at rest — the real card's 16px / 5px treatment, at this
                    slice's scale (10px / 3px keeps the same 3.2 ratio). */}
                <span className="absolute inset-x-0 bottom-1.5 flex items-center justify-center gap-[3px]">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className={`block h-[3px] rounded-full ${
                        i === 0 ? "w-[10px] bg-white" : "w-[3px] bg-white/45"
                      }`}
                    />
                  ))}
                </span>
              </div>

              {/* ── Info column ───────────────────────────────────────────── */}
              <div className="flex min-w-0 flex-1 flex-col">
                {/* Top: name + stars, then the location line. */}
                <div className="flex flex-col gap-1.5 px-2.5 pb-1.5 pt-2.5 sm:px-3 sm:pt-3">
                  <div className="flex items-start justify-between gap-2">
                    {/* The card's largest text, as in the real one. */}
                    <span className="min-w-0 flex-1 text-[11.5px] font-extrabold leading-tight tracking-tight text-white">
                      {p.name}
                    </span>
                    <Stars rating={p.stars} />
                  </div>

                  <div className="flex min-w-0 items-center gap-1">
                    <MapPin size={9} weight="fill" className="shrink-0 text-zinc-500" />
                    {/* Clamped to one line for the reason the real card gives:
                        a supplier address runs to ~180 characters, and letting
                        it wrap gives the cards ragged heights down the list. */}
                    <span className="min-w-0 truncate text-[8.5px] font-medium text-zinc-400">
                      {p.address}
                    </span>
                    {p.distance && (
                      <span className="shrink-0 rounded-full bg-ts-purple/15 px-[5px] py-[1.5px] text-[7.5px] font-semibold leading-none text-ts-purple-text">
                        {p.distance}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom: signals at the start, price column at the end —
                    `items-end`, so both sit on the card's floor however tall
                    the chip run wraps. */}
                <div className="flex flex-1 items-end gap-2 px-2.5 pb-2.5 pt-1.5 sm:gap-3 sm:px-3 sm:pb-3">
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
                    {p.signals}
                  </div>

                  <div className="flex w-[74px] shrink-0 flex-col items-end sm:w-[92px]">
                    {/* The per-night fare with its caption INLINE, the way the
                        real card sets `Price … captionPlacement="inline"` —
                        the caption is what stops a nightly rate being read as
                        the price of the stay. */}
                    <span className="flex items-baseline gap-[3px]">
                      <span className="text-[14px] font-bold leading-none tabular-nums text-white">
                        {p.price}
                      </span>
                      <span className="text-[7.5px] font-medium leading-none text-zinc-500">
                        {t("perNight")}
                      </span>
                    </span>

                    {/* The stay total as a quiet pill under it — same pill
                        anatomy as the flights slice's. */}
                    <span className="mt-[5px] inline-flex items-center gap-1 rounded-[5px] bg-white/[0.07] px-1.5 py-[2px]">
                      <span className={LABEL}>{t("total")}</span>
                      <span className="text-[9px] font-bold leading-none tabular-nums text-zinc-200">
                        {p.total}
                      </span>
                    </span>

                    {/* What that total covers. A drawn dot, not a "·": the
                        Arabic-Indic zero is itself a raised dot, so a middot
                        beside a numeral is absorbed into it. */}
                    <span className="mt-[4px] flex items-center gap-1 text-[7.5px] font-medium leading-none text-zinc-500">
                      <span>{t("rooms")}</span>
                      <Dot />
                      <span>{t("nights")}</span>
                    </span>

                    {/* The conversion CTA, drawn as the product's primary
                        button. A `span` — nothing in an aria-hidden subtree is
                        focusable. */}
                    <span className="mt-[6px] flex w-full items-center justify-center rounded-md bg-ts-purple px-2 py-[5px] text-[8.5px] font-semibold leading-none text-white shadow-[0_4px_12px_rgba(111,0,255,0.28)]">
                      {t("checkAvailability")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer chrome ──────────────────────────────────────────────────
          How many properties the search found, and how many suppliers they came
          from — the hotels twin of the flights slice's "48 fares · 12 airlines".
          The count lives HERE and not also in the header: stating one figure
          twice inside a frame this small reads as a rendering fault, and the
          supplier count is the fact the header has no room for. */}
      <div className={`flex flex-wrap items-center gap-2 border-t ${DIVIDE} px-3 py-2 sm:px-4`}>
        <span className="text-[10px] text-zinc-400">{t("propertyCount")}</span>
        <Dot />
        <span className="text-[10px] text-zinc-400">{t("supplierCount")}</span>
      </div>
    </div>
  );
}
