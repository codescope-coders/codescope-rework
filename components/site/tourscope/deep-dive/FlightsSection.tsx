import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/site/FadeIn";
import { ProductFrame } from "@/components/site/tourscope/ProductFrame";
import { FlightResultsSlice } from "@/components/site/tourscope/deep-dive/FlightResultsSlice";
import {
  AIRLINE_COMMISSIONS,
  GLOBAL_AIRLINES,
  IRANIAN_AIRLINES,
  airlineLogoSrc,
  type Airline,
  type CommissionRate,
  type CommissionRow,
} from "@/components/site/tourscope/deep-dive/airlines";

/**
 * The deep dive's first section: flights.
 *
 * Four movements, in the order a reader needs them — the claim, the commercial
 * fact that backs it, the product doing it, and the inventory behind it.
 *
 * ── Why the commissions are a ledger and not cards ──────────────────────────
 * This was four bordered cards, one per rate, and that stopped working the
 * moment the founder handed over his real list: seventeen rows, whose rates are
 * not even the same KIND of thing — percentages, flat fees in two currencies,
 * "whatever the airline's own system charges", and a band. Seventeen cards is
 * three screens of chrome to carry a table, and each rate shape would need its
 * own card layout to keep from reading as a broken number.
 *
 * A ledger takes all seventeen at one weight: carrier at the inline start, rate
 * at the inline end, a hairline between. It is the site's own anatomy for a
 * list of facts — the hotels section's four facts, the business engine, "more
 * than a booking tool" — one step denser, because these rows are one line each
 * rather than a heading and a paragraph.
 *
 * ── Why the words are teal and the figures are white ────────────────────────
 * "Official system fare" is a real answer, not a missing number. Set in the
 * same white as `13%` it reads as a placeholder somebody forgot to fill in, so
 * the accent marks it as deliberate copy instead. Same for the `by airline`
 * suffix on the Iranian band: it QUALIFIES the figure, and must not look like
 * part of it.
 *
 * ── Why Iranian carriers come first ─────────────────────────────────────────
 * Founder-directed, and it is the honest order: the global wall is table stakes
 * every competitor also has, and the Iranian charter wall is the thing few can
 * sell online. Leading with the differentiator is the whole reason the two
 * walls are split rather than merged into one alphabetical grid.
 */

/**
 * The four ledger words, resolved once by the section and handed down — the
 * row renderers are plain sync components, and threading next-intl's translator
 * through them would buy nothing but a harder type.
 */
interface RateWords {
  official: string;
  byAirline: string;
  iqd15k: string;
  iranianGroup: string;
}

/** A rate that IS a figure. */
const FIGURE = "text-[15px] font-semibold tabular-nums text-white";
/** A rate that is WORDS. See the accent note at the top of the file. */
const WORDS = "text-[13px] font-medium text-cs-teal";

/**
 * One rate, rendered from its shape.
 *
 * `dir="ltr"` goes on the pure Latin/numeric tokens only — `13%`, `$10`,
 * `5–7%`. In an Arabic paragraph those are neutral-and-digit runs the bidi
 * algorithm is free to re-order around, which is how `$10` becomes `10$`. The
 * two message-backed rates get NO override: each locale writes them in its own
 * natural direction already, and forcing LTR onto "15 ألف دينار" would scramble
 * the Arabic words to fix a problem they do not have.
 */
function CommissionRateValue({ rate, words }: { rate: CommissionRate; words: RateWords }) {
  switch (rate.kind) {
    case "percent":
      return (
        <span dir="ltr" className={FIGURE}>
          {rate.value}%
        </span>
      );
    case "flatUsd":
      return (
        <span dir="ltr" className={FIGURE}>
          ${rate.value}
        </span>
      );
    case "flatIqd":
      // The figure is the MESSAGE, not `rate.value` — see the union's own note
      // in airlines.ts for why the two are coupled by hand.
      return <span className={FIGURE}>{words.iqd15k}</span>;
    case "official":
      return <span className={WORDS}>{words.official}</span>;
    case "percentRange":
      return (
        <span className="flex items-baseline gap-1.5">
          <span dir="ltr" className={FIGURE}>
            {rate.from}–{rate.to}%
          </span>
          <span className={WORDS}>{words.byAirline}</span>
        </span>
      );
  }
}

/**
 * The group row's mark: three member tiles overlapped into one lockup, so a row
 * standing for the whole Iranian wall does not sit under a single logo that
 * would name one of those carriers and silently promote it above the rest.
 *
 * The ring is the page's own ground (`zinc-950` IS `#09090b`, the public site
 * background) rather than a translucent white — a ring that lets the tile below
 * bleed through turns the overlap into mud at 24px.
 */
function CarrierCluster({ slugs }: { slugs: readonly string[] }) {
  return (
    <span className="flex shrink-0 items-center">
      {slugs.map((slug, i) => (
        <Image
          key={slug}
          src={airlineLogoSrc(slug)}
          alt=""
          width={96}
          height={96}
          className={`block h-6 w-6 select-none rounded-md ring-2 ring-zinc-950 ${
            i > 0 ? "-ms-2" : ""
          }`}
        />
      ))}
    </span>
  );
}

/**
 * One column of the ledger. `edge` carries the closing rule, which differs by
 * column — see the call site.
 */
function CommissionColumn({
  rows,
  words,
  edge,
}: {
  rows: readonly CommissionRow[];
  words: RateWords;
  edge: string;
}) {
  return (
    <ul className={`border-white/[0.07] ${edge}`}>
      {rows.map((row) => (
        <li
          key={row.row === "carrier" ? row.slug : "iranian-group"}
          className="flex items-center gap-3 border-t border-white/[0.07] py-2.5"
        >
          {row.row === "carrier" ? (
            // Empty alt: the carrier's name is the very next node, so a filled
            // one makes a screen reader say it twice.
            <Image
              src={airlineLogoSrc(row.slug)}
              alt=""
              width={96}
              height={96}
              className="block h-7 w-7 shrink-0 select-none rounded-lg"
            />
          ) : (
            <CarrierCluster slugs={row.slugs} />
          )}
          <span className="min-w-0 text-sm font-medium text-zinc-200">
            {row.row === "carrier" ? row.name : words.iranianGroup}
          </span>
          {/* `ms-auto` pushes the rate to the inline END, which mirrors under
              `dir="rtl"` with no second rule. `ps-3` keeps a long carrier name
              from touching its own rate when the column is narrow. */}
          <span className="ms-auto shrink-0 ps-3">
            <CommissionRateValue rate={row.rate} words={words} />
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * One carrier wall. The SVGs are self-contained rounded tiles in the carriers'
 * own colours, so they are NOT boxed in bordered squares and get no mono/blend
 * treatment — that is the marquee's vocabulary for ambient lockups, and this is
 * evidence, meant to be read as a set of real brands.
 */
async function CarrierWall({
  title,
  sub,
  airlines,
  more,
}: {
  title: string;
  sub: string;
  airlines: readonly Airline[];
  /** Trailing long-tail marker ("+600 more airlines") — global wall only. */
  more?: string;
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-white">{title}</h4>
      <p className="mt-1 text-sm text-zinc-500">{sub}</p>
      {/* A real list: 40-odd tiles announce as "list, 28 items" rather than as
          28 loose images. `cursor-default` because nothing here is clickable —
          a pointer over a logo promises a carrier page that does not exist. */}
      <ul className="mt-4 flex flex-wrap gap-2.5">
        {airlines.map((a) => (
          <li key={a.slug}>
            <Image
              src={airlineLogoSrc(a.slug)}
              alt={a.name}
              title={a.name}
              width={96}
              height={96}
              // Transform-only hover, so nothing competes with a background
              // shorthand; `motion-safe:` keeps it off under reduced motion
              // without a hook, since it is pure CSS.
              className="block h-11 w-11 cursor-default select-none rounded-[10px] motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:-translate-y-0.5"
            />
          </li>
        ))}
        {more && (
          /* The long tail, as a ghost tile in the same row — dashed and
             tile-height so it reads as "the wall continues", not as a button.
             Founder-supplied figure; the wall above it is the sample. */
          <li className="flex h-11 items-center rounded-[10px] border border-dashed border-white/15 px-3.5 text-xs font-semibold text-zinc-400">
            {more}
          </li>
        )}
      </ul>
    </div>
  );
}

/**
 * Where the ledger breaks into two columns. 9 then 8, so the taller column is
 * the first one — reading order fills the inline-start column top to bottom,
 * then the second, which is how the founder's numbering runs.
 */
const LEDGER_SPLIT = 9;

export async function FlightsSection({ num }: { num: string }) {
  const t = await getTranslations("TourScope.deepDive.flights");

  const words: RateWords = {
    official: t("commissionOfficial"),
    byAirline: t("commissionByAirline"),
    iqd15k: t("commissionIqd15k"),
    iranianGroup: t("commissionIranianGroup"),
  };
  const firstColumn = AIRLINE_COMMISSIONS.slice(0, LEDGER_SPLIT);
  const secondColumn = AIRLINE_COMMISSIONS.slice(LEDGER_SPLIT);

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

      {/* ── 2. The commissions ledger ──────────────────────────────────── */}
      <FadeIn delay={0.05}>
        <h4 className="mb-3 text-sm font-semibold text-white">{t("commissionsTitle")}</h4>
        {/* Two columns from `lg` only. The rows are name-plus-rate, so at tablet
            width a second column would leave each rate about 90px from the name
            it belongs to — near enough to a middle column of nothing. */}
        <div className="grid lg:grid-cols-2 lg:gap-x-10 xl:gap-x-14">
          {/* On a phone the two lists stack flush, so the FIRST one closes
              itself only from `lg`: the second column's opening `border-t`
              already draws that seam, and a `border-b` here would double it
              into a 2px rule exactly halfway down the ledger. */}
          <CommissionColumn rows={firstColumn} words={words} edge="lg:border-b" />
          <CommissionColumn rows={secondColumn} words={words} edge="border-b" />
        </div>
        <p className="mt-4 text-sm text-zinc-500">{t("commissionsNote")}</p>
      </FadeIn>

      {/* ── 3. The product doing it ────────────────────────────────────── */}
      <FadeIn delay={0.05}>
        <ProductFrame caption={t("sliceCaption")}>
          <FlightResultsSlice />
        </ProductFrame>
      </FadeIn>

      {/* ── 4. The inventory behind it ─────────────────────────────────── */}
      <FadeIn delay={0.05}>
        <CarrierWall
          title={t("iranianTitle")}
          sub={t("iranianSub")}
          airlines={IRANIAN_AIRLINES}
        />
        <div className="mt-10">
          <CarrierWall
            title={t("globalTitle")}
            sub={t("globalSub")}
            airlines={GLOBAL_AIRLINES}
            more={t("globalMore")}
          />
        </div>
      </FadeIn>
    </div>
  );
}
