"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Airplane, Armchair, CaretRight } from "@phosphor-icons/react";
import {
  CARD,
  DIVIDE,
  Dot,
  LABEL,
  PulseDot,
  Route,
  SHEET,
} from "@/components/site/tourscope/slice-primitives";
import { airlineLogoSrc } from "@/components/site/tourscope/deep-dive/airlines";

/**
 * The storefront's flight results, coded — the flights section's product view.
 *
 * ── What this is a drawing OF ───────────────────────────────────────────────
 * The cards are a structural miniature of the marketplace's real
 * `features/flight/components/FlightCard.tsx`, element for element: a
 * two-zone card (flight info | tinted pricing rail), a leg row of
 * airline-block → timeline → nothing else, and a rail that runs scarcity →
 * fare → total → fare-ladder hint → CTA, top to bottom.
 *
 * The real card is LIGHT-themed; only its STRUCTURE is copied. Every colour is
 * re-expressed in this page's dark tokens — its `bg-neutral-50` rail becomes
 * one step up off the card ground, its `text-success-600` "Direct" becomes
 * `cs-teal`, its `primary` fare-ladder pill becomes `ts-purple`. Copying the
 * light palette onto a near-black page produces a bright rectangle, which is
 * exactly why the captured screenshots were dropped for coded slices.
 *
 * ── The four slice rules (same contract as `ProductSlices.tsx`) ─────────────
 * 1. Every WORD comes from `messages` (`TourScope.deepDive.flights.slice`).
 *    Numerals, currency, carrier codes and times (`$233`, `TK 731`, `BGW`,
 *    `08:35`, `THR`) are literals — identical in both locales, because a Latin
 *    flight number beside an Arabic-Indic time on the same row reads as two
 *    different rows. Airline NAMES come from the manifest: proper nouns are
 *    data, not copy. `2h 35m` is a literal too, and not by omission — the API's
 *    `formatDuration` ships that exact English string on the wire in every
 *    locale (see `wire-shape.ts`), so the real storefront prints `2h 35m` in
 *    Arabic as well. Drawing it any other way would be drawing a product we do
 *    not ship.
 * 2. The root is `aria-hidden` — the section copy beside it carries the
 *    meaning — so nothing inside is focusable and every button is a `span`.
 * 3. Logical properties only, so it mirrors under `dir="rtl"` unaided. The two
 *    directional glyphs (the rail's plane, the ladder pill's caret) carry
 *    explicit RTL flips.
 * 4. Motion is the shared pulse dot and nothing else; the entrance belongs to
 *    the `FadeIn` the caller wraps this in.
 *
 * ── Why this row set ────────────────────────────────────────────────────────
 * The cheapest fare is a global carrier and the third is an IRANIAN carrier
 * routing through its own hub — that contrast is the section's whole claim,
 * drawn rather than asserted. The featured row additionally carries the
 * fare-ladder hint and the third carries the scarcity badge, so all three of
 * the rail's optional states appear exactly once across the list instead of
 * three near-identical cards.
 */

/**
 * A leg endpoint: the row's largest figure over its airport code.
 *
 * `dir="ltr"` on the time is load-bearing. `08:35` is a Latin numeral run with
 * a neutral colon; in an Arabic paragraph the surrounding RTL context can
 * reorder the run's neighbours, and a departure that renders as `35:08` is a
 * different flight. The code above it is uppercase and letter-spaced exactly as
 * the real card sets it — that spacing is what makes an IATA code read as a
 * code rather than a word.
 */
function Endpoint({ time, code }: { time: string; code: string }) {
  return (
    <div className="w-[38px] shrink-0 text-center sm:w-[44px]">
      <span
        dir="ltr"
        className="block text-[14px] font-extrabold leading-none tracking-tight tabular-nums text-white"
      >
        {time}
      </span>
      <span className="mt-[3px] block text-[9px] font-semibold uppercase leading-none tracking-[0.12em] text-zinc-300">
        {code}
      </span>
    </div>
  );
}

/**
 * The route rail: dot — hairline — plane — hairline — dot.
 *
 * The real card draws this one stretch at a time so a leg that is part flown
 * and part driven can say so; a marketing drawing has no mixed-mode leg, so it
 * renders that component's all-flown case — the single solid plane it produces
 * for an ordinary itinerary.
 *
 * The plane is nose-UP at rest (both Phosphor's `Airplane` and the glyph the
 * real card uses), so `rotate-90` points it at the destination and
 * `rtl:-rotate-90` flips it back when the row mirrors. Same intent as the
 * `rtl:rotate-180` the `Route` primitive puts on its arrow: a directional glyph
 * must follow the reading direction, or it points at the origin.
 */
/** A sort control. A `span`: nothing in an aria-hidden subtree is focusable. */
function SortChip({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-medium leading-none ${
        active
          ? "bg-ts-purple/20 text-ts-purple-text ring-1 ring-inset ring-ts-purple/30"
          : "text-zinc-500"
      }`}
    >
      {children}
    </span>
  );
}

function LegRail() {
  return (
    <span className="flex w-full items-center">
      <Dot />
      <span className="h-px flex-1 bg-white/[0.12]" />
      <span className="px-[4px] text-zinc-500">
        <Airplane size={9} weight="fill" className="block rotate-90 rtl:-rotate-90" />
      </span>
      <span className="h-px flex-1 bg-white/[0.12]" />
      <Dot />
    </span>
  );
}

interface Offer {
  slug: string;
  name: string;
  flightNo: string;
  depart: string;
  arrive: string;
  duration: string;
  origin: string;
  destination: string;
  /** Layover airport code, or `null` for a direct flight. */
  stop: string | null;
  /** Per-adult fare — the rail's hero figure. */
  price: string;
  /** Trip total for the searched party. */
  total: string;
  /** Renders the "+2 more options" fare-ladder hint. */
  more?: true;
  /** Renders the amber scarcity badge. */
  scarce?: true;
  /** Accent border on the card shell. */
  featured?: true;
}

export function FlightResultsSlice() {
  const t = useTranslations("TourScope.deepDive.flights.slice");

  /* Carrier names come from the manifest by slug so a row and the wall below it
     can never disagree about what a carrier is called. Everything else here is
     a literal — see rule 1 above.

     The durations are internally consistent under one implied offset (clock
     time minus an hour), and the one-stop row is the longest of the three. A
     reader who checks the arithmetic should find it holds; a drawing that
     contradicts itself is worse than no drawing. */
  const offers: Offer[] = [
    {
      slug: "turkish-airlines",
      name: "Turkish Airlines",
      flightNo: "TK 731",
      depart: "08:35",
      arrive: "12:10",
      duration: "2h 35m",
      origin: "BGW",
      destination: "IST",
      stop: null,
      price: "$233",
      total: "$466",
      more: true,
      featured: true,
    },
    {
      slug: "iraqi-airways",
      name: "Iraqi Airways",
      flightNo: "IA 117",
      depart: "10:05",
      arrive: "13:45",
      duration: "2h 40m",
      origin: "BGW",
      destination: "IST",
      stop: null,
      price: "$189",
      total: "$378",
    },
    {
      slug: "qeshm-air",
      name: "Qeshm Air",
      flightNo: "QB 212",
      depart: "15:20",
      arrive: "19:55",
      duration: "3h 35m",
      origin: "BGW",
      destination: "IST",
      stop: "THR",
      price: "$204",
      total: "$408",
      scarce: true,
    },
  ];

  return (
    <div aria-hidden="true" className={`select-none text-zinc-300 antialiased ${SHEET}`}>
      {/* ── Search context bar ─────────────────────────────────────────── */}
      <div
        className={`flex flex-wrap items-center gap-x-2.5 gap-y-1.5 border-b ${DIVIDE} px-3 py-2.5 sm:px-4`}
      >
        <Route from="BGW" to="IST" className="text-[12.5px] font-bold text-white" arrow={11} />
        <Dot />
        <span className="text-[10.5px] text-zinc-400">{t("depart")}</span>
        <Dot />
        <span className="text-[10.5px] text-zinc-400">{t("pax")}</span>
        <Dot />
        <span className="text-[10.5px] text-zinc-400">{t("cabin")}</span>
        <span className="ms-auto flex items-center gap-1.5">
          <PulseDot />
          <span className="text-[9.5px] font-medium text-zinc-400">{t("live")}</span>
        </span>
      </div>

      {/* ── Sort row ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 pt-2.5 sm:px-4">
        <span className={LABEL}>{t("sortLabel")}</span>
        <span className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.03] p-1">
          <SortChip active>{t("sortCheapest")}</SortChip>
          <SortChip>{t("sortFastest")}</SortChip>
        </span>
      </div>

      {/* ── Offer cards ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 px-3 pb-2.5 pt-2.5 sm:px-4">
        {offers.map((o) => (
          <div
            key={o.flightNo}
            /* `overflow-hidden` is what lets the rail's tinted ground reach the
               card's rounded corners without a second radius on the rail —
               the real card's own mechanism. */
            className={`overflow-hidden rounded-xl border ${
              o.featured
                ? "border-ts-purple/35 bg-ts-purple/[0.05]"
                : "border-white/[0.07] bg-white/[0.015]"
            }`}
          >
            <div className="flex">
              {/* ── Flight info zone ───────────────────────────────────── */}
              <div className="flex min-w-0 flex-1 flex-col justify-center p-2.5 sm:p-3">
                {/* The leg row stacks below `sm` exactly as the real one does:
                    at phone width the airline block and the timeline cannot
                    share a line without crushing the rail to nothing. */}
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-start sm:gap-2.5">
                  {/* 1. Airline block — mark, name, and cabin · flight no. */}
                  <div className="flex w-full min-w-0 items-center gap-2 sm:w-[104px] sm:shrink-0 lg:w-[124px]">
                    {/* The carrier's own square mark. These are designed
                        colourful tiles — no mono/blend treatment, which would
                        make a wall of brands look like one grey texture. */}
                    <Image
                      src={airlineLogoSrc(o.slug)}
                      alt=""
                      width={96}
                      height={96}
                      className="block h-[22px] w-[22px] shrink-0 rounded-md"
                    />
                    <div className="min-w-0">
                      <span className="block truncate text-[10.5px] font-semibold leading-tight text-zinc-100">
                        {o.name}
                      </span>
                      {/* A drawn dot, not a "·": Arabic-Indic zero is itself a
                          raised dot, so a middot beside a numeral is absorbed
                          into it. Same reason the primitive exists. */}
                      <span className="mt-[2px] flex items-center gap-1 text-[8.5px] font-medium leading-none text-zinc-500">
                        <span className="truncate">{t("cabin")}</span>
                        <Dot />
                        <span className="shrink-0 tabular-nums">{o.flightNo}</span>
                      </span>
                    </div>
                  </div>

                  {/* 2. Timeline — departure, route rail, arrival. The flex row
                      mirrors under RTL, which puts departure first in reading
                      order on both sides without a second set of rules.

                      Capped and centred in whatever room is left. The real card
                      lives in a ~700px results column beside a filter sidebar;
                      this slice is a full-bleed browser frame, so an uncapped
                      `flex-1` stretched the hairline to ~580px under 14px type
                      — the same drawing, at a proportion the product never
                      renders. `max-w` restores the real card's ratio and the
                      auto margins hand the surplus back as symmetric breathing
                      room rather than a gap stranded against the pricing rail.
                      (Auto margins, not a centring wrapper: a flex item that
                      cannot consume its free space gives it to `margin: auto`
                      first, so this needs no extra element.) */}
                  <div className="flex w-full min-w-0 flex-1 items-center gap-1.5 sm:mx-auto sm:max-w-[440px] sm:gap-2.5">
                    <Endpoint time={o.depart} code={o.origin} />

                    <div className="flex min-w-0 flex-1 flex-col items-center gap-[3px]">
                      <span className="text-[8.5px] font-medium leading-none text-zinc-500">
                        {o.duration}
                      </span>
                      <LegRail />
                      {/* Stops sit UNDER the rail, where the real card puts
                          them — not as a chip beside the airline, which is
                          what this slice drew before. Direct takes the site's
                          positive tone; a stop stays muted and names the
                          layover, because "1 stop" without the airport is the
                          half of the fact nobody can act on. */}
                      {o.stop ? (
                        <span className="flex items-center gap-1 text-[8.5px] font-medium leading-none text-zinc-400">
                          <span>{t("oneStop")}</span>
                          <Dot />
                          <span className="font-semibold tracking-[0.06em] text-zinc-300">
                            {o.stop}
                          </span>
                        </span>
                      ) : (
                        <span className="text-[8.5px] font-medium leading-none text-cs-teal">
                          {t("direct")}
                        </span>
                      )}
                    </div>

                    <Endpoint time={o.arrive} code={o.destination} />
                  </div>
                </div>
              </div>

              {/* ── Pricing rail ───────────────────────────────────────────
                  A fixed-width inline-END column on its own ground, one step
                  up off the card, divided by a hairline. This tinted side rail
                  is the real card's most recognisable trait — it is what makes
                  a flight result look like a flight result at a glance. */}
              <div className="flex w-[96px] shrink-0 flex-col items-center justify-between gap-1.5 border-s border-white/10 bg-white/[0.08] px-2 py-2.5 sm:w-[112px] sm:px-2.5">
                {/* Top: scarcity. The slot is ALWAYS rendered, even empty —
                    that is what keeps the fare on one baseline across cards
                    that do and don't have a badge (the real rail's own trick,
                    and the reason it is a `justify-between` column). */}
                <span className="flex w-full justify-center">
                  {o.scarce && (
                    <span className="inline-flex items-center gap-1 rounded-[5px] border border-amber-400/25 bg-amber-400/10 px-1.5 py-[2px] text-center text-[7.5px] font-medium leading-[1.35] text-amber-300">
                      <Armchair size={9} weight="fill" className="shrink-0" />
                      {t("seatsLeft")}
                    </span>
                  )}
                </span>

                {/* Centre: the per-adult fare as the hero figure, the trip
                    total as a quiet pill under it, then the fare-ladder hint. */}
                <span className="block text-center">
                  <span className="block text-[15px] font-bold leading-none tabular-nums text-white">
                    {o.price}
                  </span>
                  <span className="mt-1.5 inline-flex items-center gap-1 rounded-[5px] bg-white/[0.07] px-1.5 py-[2px]">
                    <span className={LABEL}>{t("total")}</span>
                    <span className="text-[9px] font-bold leading-none tabular-nums text-zinc-200">
                      {o.total}
                    </span>
                  </span>
                  {o.more && (
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-ts-purple/30 bg-ts-purple/[0.08] py-[3px] pe-1 ps-1.5 text-center text-[8px] font-semibold leading-[1.3] text-ts-purple-text">
                      {t("moreOptions")}
                      <CaretRight size={8} weight="bold" className="shrink-0 rtl:rotate-180" />
                    </span>
                  )}
                </span>

                {/* Bottom: the conversion CTA, drawn as the product's primary
                    button. A `span` — nothing in an aria-hidden subtree is
                    focusable. */}
                <span className="flex w-full items-center justify-center rounded-md bg-ts-purple px-2 py-[5px] text-[9px] font-semibold leading-none text-white shadow-[0_4px_12px_rgba(111,0,255,0.28)]">
                  {t("selectFare")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer chrome ──────────────────────────────────────────────── */}
      <div
        className={`flex flex-wrap items-center gap-2 border-t ${DIVIDE} px-3 py-2 sm:px-4`}
      >
        <span className="text-[10px] text-zinc-400">{t("fareCount")}</span>
        <Dot />
        <span className="text-[10px] text-zinc-400">{t("airlineCount")}</span>
        <span className={`ms-auto rounded-md px-2 py-1 text-[9.5px] font-medium ${CARD}`}>
          {t("supplierNote")}
        </span>
      </div>
    </div>
  );
}
