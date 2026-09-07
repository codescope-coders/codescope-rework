"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { DIVIDE, Dot, SHEET } from "@/components/site/tourscope/slice-primitives";

/**
 * The operator console's Profit screen, coded — the financials section's product
 * view, and the third drawing on this page taken from the console rather than
 * the storefront.
 *
 * ── What this is a drawing OF ───────────────────────────────────────────────
 * A structural miniature of the console's real
 * `app/(dashboard)/financials/profit/page.tsx`, its
 * `_components/profit-insights.tsx` (the captioned tile bands) and its
 * `_components/profit-by-service-table.tsx` (the P&L), in their own order: a
 * page head that pairs the screen's name with the currency every figure on it
 * is denominated in, a CAPTIONED band of KPI tiles, a section sub-head that
 * counts its own rows, and the per-service P&L — a service mark and its booking
 * count, the revenue, the cost, and a `NetBadge` with its margin printed under
 * it.
 *
 * ── The console medium (§0b — the convention P16 set) ───────────────────────
 * The real screen is a LIGHT-mode dashboard; only its STRUCTURE is copied, with
 * every light tone re-expressed in this page's dark palette by `TONE` below.
 * That table is COPIED VERBATIM from `LiveBookingsSlice` / `CharterInventorySlice`
 * rather than derived again here, and deliberately keeps arms this slice never
 * uses: the console's status system is eight semantic hues, and three console
 * slices that each map only the hues they happen to need are three tables that
 * drift the first time a fourth slice needs a hue they disagree about.
 *
 * ── The four slice rules (same contract as `ProductSlices.tsx`) ─────────────
 * 1. Every WORD comes from `messages` (`TourScope.deepDive.financials.slice`).
 *    The literals are MONEY and the currency code — the same family the three
 *    slices before it fixed: `$38,900.00`, `+$7,180.00`, `20.3%`, `USD`. A
 *    figure a reader would reconcile against a bank statement is identical in
 *    both locales, and every one of them is pinned `dir="ltr"` because a `$` is
 *    a bidi terminator and a leading `+` is worse — unpinned, `+$12,480.00`
 *    resolves to `$12,480.00+` in Arabic, moving the one glyph on this frame
 *    that says the number is a gain.
 *
 *    Everything a person WROTE is a message, and its numerals follow the sibling
 *    slices: a figure that reads as PROSE takes the locale's own digits
 *    (`214 bookings` → `٢١٤ حجزاً`, `142` → `١٤٢`, the row count `3` → `٣`),
 *    while a token pinned `dir="ltr"` keeps Latin ones.
 *
 *    ⚠️ The MARGIN HINT is the one line that carries both, and it is not a
 *    style choice — it is the real screen's own message. The console stores it
 *    as `by_service.margin_of_revenue`: `"{percent}% of revenue"` in English and
 *    `"{percent}٪ من الإيراد"` in Arabic, where `{percent}` is `toFixed(1)` and
 *    therefore Latin in every locale. So the Arabic hint really does read
 *    `18.5٪ من الإيراد` — Latin digits, Arabic percent sign — and reproducing
 *    it any other way would be inventing a figure the product does not print.
 *
 *    It ships as ONE string per locale with the numeral inside it (so a
 *    translator owns the sign, the spacing and the words as a unit) and the
 *    percentage wrapped in a `<pct>` tag that renders a `dir="ltr"` island. Left
 *    alone, `18.5٪` is an unbroken EN run under bidi and resolves correctly on
 *    its own; the island is there for the day the figure goes negative, where a
 *    leading `−` WOULD move.
 *
 *    ⚠️ The SIGN GOES INSIDE THE TAG — `<pct>18.5٪</pct> من الإيراد`, never
 *    `<pct>18.5</pct>٪ من الإيراد`. This is the whole reason the tag wraps a
 *    percentage rather than a numeral, and it is not theoretical: with the sign
 *    outside, `٪` stops being an ET adjacent to a number (the island is an
 *    opaque neutral to the run around it), resolves to the paragraph direction
 *    instead, and lands on the FAR SIDE of the digits. Measured in `ar` at
 *    1440px, the characters ran `الإيراد · من · ٪@135.6 · 1@141.5 … 5@157` —
 *    the sign to the LEFT of the number it belongs to, where the real console
 *    (which islands nothing and lets `18.5٪` resolve as one EN run) puts it
 *    hard against the `5` on the right. Inside the tag the island IS the whole
 *    token, so it renders as the same contiguous left-to-right block the
 *    product does.
 *
 *    Status LABELS have no analogue here: the only badge on this screen is the
 *    net figure itself, which is money.
 * 2. The root is `aria-hidden` — the section copy beside it carries the meaning
 *    — so nothing inside is focusable. The real header carries an export button,
 *    the real table's rows are clickable and route to a per-service breakdown,
 *    and the real tiles sit inside a filter toolbar; here all of them are plain
 *    `div`s and `span`s.
 * 3. Logical properties only, so it mirrors under `dir="rtl"` unaided. The
 *    money columns are `justify-self-end`, the net cell stacks `items-end`, and
 *    the grid columns reverse for free.
 *
 *    ⚠️ Every `dir="ltr"` here sits on a LEAF inline span that carries no
 *    logical margin or padding. `margin-inline-start` resolves against the
 *    element's OWN direction, so pinning a span that also carries `ms-`/`ps-`
 *    silently turns that spacing into a physical left margin inside an RTL row.
 *    That is exactly why the net figure is pinned INSIDE `Badge` rather than on
 *    a wrapper around it: the pill itself is `ps-1.5 pe-2`, and an inherited
 *    `direction: ltr` would move its status dot to the left in Arabic while
 *    every other badge on this page keeps it on the inline start.
 * 4. No motion at all. The real page reveals its tiles (`Reveal`) and counts
 *    their figures up (`CountUp`); the entrance here belongs to the `FadeIn` the
 *    caller wraps this in, and a number that counts itself up inside a still
 *    drawing reads as a chart, not as a screen.
 *
 * ── Why FOUR columns when the real table has seven ──────────────────────────
 * The real P&L runs Service · Revenue · Cost · Earned · Refunded · Where it is ·
 * Net profit, and it says so: it sets `className="min-w-[62rem]"`, hides Revenue
 * and Cost below `xl`, hides Earned / Refunded / Where-it-is below `lg`, and
 * below `md` abandons the table entirely for a card. So even the product only
 * ever shows seven of them on a wide monitor. This frame is ~950px at its widest
 * and sits inside a page, so seven columns would be a horizontal scrollbar or
 * seven unreadable slivers.
 *
 * The four kept are the ones that make this a P&L rather than a list: WHAT was
 * sold, what it BROUGHT IN, what it COST, and what is LEFT. Earned and Refunded
 * are the two halves whose difference is already the Net badge; "Where it is"
 * answers a different question (which of the tenant's own accounts the surviving
 * profit currently sits in), and the section's claim is about the profit
 * existing and being derived from real cost, not about where it is parked.
 *
 * The real screen's SECOND tile band — "Where it came from": revenue, cost,
 * gross margin — is dropped for the same reason: all three are columns in the
 * table directly below it here, and a band that restates the table it sits on
 * top of is the one thing a miniature has no room for. The caption on the band
 * that survives is kept, because a caption reading "Result" is what tells a
 * reader these three figures are an OUTCOME rather than the top of a
 * subtraction chain — which is precisely the job the real captions do.
 *
 * ── Why the figures reconcile ───────────────────────────────────────────────
 * This is a finance drawing, and a reader who cares about a profit page is a
 * reader who adds it up. Every identity on the frame holds:
 *
 *   per row      revenue − cost = net      38,900 − 31,720 = 7,180
 *                                          14,200 − 11,540 = 2,660
 *                                           8,400 −  5,760 = 2,640
 *   the tile     Σ net = 12,480            7,180 + 2,660 + 2,640
 *   the margin   Σ net ÷ Σ revenue = 20.3% 12,480 ÷ 61,500
 *   per row      net ÷ revenue             18.5% · 18.7% · 31.4%
 *   the hint     Σ bookings = 214          142 + 48 + 24
 *
 * They are AUTHORED rather than derived, because the money strings are literals
 * shared by both locales and the percentages live inside translated messages —
 * so there is no single number to derive the rest from without either
 * re-formatting currency at render time or taking the percent sign away from
 * the translator. ⚠️ Do not change any figure here without re-checking all six.
 */

/* ── Tone map (§0b) ─────────────────────────────────────────────────────────
   Copied verbatim from `LiveBookingsSlice` — see the module note above for why
   it is copied rather than re-derived.

   `pill` is the badge surface (tint + text + ring colour — the element supplies
   `ring-1 ring-inset`), `dot` the badge's solid status dot, `chip` a tile's icon
   square.

   ⚠️ Written as whole literal class strings, never interpolated. Tailwind v4
   scans source text for candidates STATICALLY, so a `bg-${tone}-500/10`
   template generates no rule at all — and the failure is silent: the pill loses
   its tint and reads as unstyled text. */
const TONE = {
  success: {
    pill: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20",
    dot: "bg-emerald-400",
    chip: "bg-emerald-500/10 text-emerald-300",
  },
  warning: {
    pill: "bg-amber-500/10 text-amber-300 ring-amber-400/20",
    dot: "bg-amber-400",
    chip: "bg-amber-500/10 text-amber-300",
  },
  info: {
    pill: "bg-sky-500/10 text-sky-300 ring-sky-400/20",
    dot: "bg-sky-400",
    chip: "bg-sky-500/10 text-sky-300",
  },
  destructive: {
    pill: "bg-red-500/10 text-red-300 ring-red-400/20",
    dot: "bg-red-400",
    chip: "bg-red-500/10 text-red-300",
  },
  teal: {
    pill: "bg-teal-500/10 text-teal-300 ring-teal-400/20",
    dot: "bg-teal-400",
    chip: "bg-teal-500/10 text-teal-300",
  },
  orange: {
    pill: "bg-orange-500/10 text-orange-300 ring-orange-400/20",
    dot: "bg-orange-400",
    chip: "bg-orange-500/10 text-orange-300",
  },
  /* The console's `primary`. On this page the brand is the site's purple, and
     the pair below is the exact one `slice-primitives`' `Pill` already uses for
     its purple tone — so a status badge here and a pill in the storefront
     slices above read as one system. */
  primary: {
    pill: "bg-ts-purple/15 text-ts-purple-text ring-ts-purple/30",
    dot: "bg-ts-purple-text",
    chip: "bg-ts-purple/15 text-ts-purple-text",
  },
  neutral: {
    pill: "bg-white/[0.06] text-zinc-400 ring-white/10",
    dot: "bg-zinc-500",
    chip: "bg-white/[0.06] text-zinc-400",
  },
} as const;

type ConsoleTone = keyof typeof TONE;

/**
 * A tile's uppercase label. Three tiles rather than the bookings slice's five,
 * so the label has ~130px at its tightest and the real tile's own 10.5px reads
 * at every step without a size ladder. `truncate` is the backstop.
 *
 * `uppercase` is a no-op in Arabic, which is correct — the tracking carries the
 * chrome register there.
 */
const TILE_LABEL =
  "min-w-0 truncate text-[10px] font-semibold uppercase tracking-wider text-zinc-500";

/** The table's column heads: the real 10px bold uppercase chrome. */
const COL_HEAD = "truncate text-[10px] font-bold uppercase tracking-wider text-zinc-500";

/**
 * The P&L's column track — four columns from `md` up, two below it.
 *
 * ⚠️ EVERY track is an `fr`, and not one of them is `auto`. That is the whole
 * point of this constant, because the header and each of the three rows are
 * SEPARATE grid containers: an `auto` track sizes to its own container's
 * content, so the header would size its Cost column to the word "Cost" while
 * the rows sized theirs to `$31,720.00`, and the visa row — whose figures are
 * two glyphs shorter than the flights row's — would sit on a different set of
 * columns again. Fractions resolve identically in every container of the same
 * width, so the four grids agree by construction.
 *
 * (The alternative is one grid for the whole table, which this cannot be: each
 * row needs its own `border-t` to rule it off.)
 *
 * ⚠️ Service is the widest flexible column and Revenue / Cost are the narrowest,
 * which is the opposite of the bookings feed's weighting and correct for the
 * same reason: there, the lead column's content was fixed and Details held the
 * only unbounded string. Here the lead column holds the only unbounded string —
 * a translated service name over a translated booking count — while a money cell
 * is a fixed ten glyphs of monospace. Net gets a full `1fr` because it is two
 * stacked elements, a pill and a hint, not one figure.
 *
 * ── Below `md` ──────────────────────────────────────────────────────────────
 * Four columns genuinely do not fit a phone: the two money cells alone want
 * ~85px each of a ~290px track. So Revenue and Cost drop out — the real table
 * drops exactly those two first (`hideBelow: "xl"` on both, while Net has no
 * `hideBelow` at all) — leaving the service and the outcome, which is the pair
 * the real product's own mobile card leads with. The column heads go with them:
 * a header row is a property of a table, and below `md` this is no longer one.
 */
/* ⚠️ Carries the TRACKS but not `display`. The header needs `hidden md:grid`
   and the rows need a plain `grid`, and folding `grid` in here would put both
   `hidden` and `grid` in the header's class list — two display utilities of
   equal specificity, settled by whichever Tailwind happens to emit last. */
const ROW_COLS =
  "grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] items-center gap-2 md:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)_minmax(0,0.75fr)_minmax(0,1fr)] md:gap-3";

/**
 * The margin hint's PERCENTAGE — sign included — as a `dir="ltr"` island.
 *
 * A module-level constant rather than an inline object literal, so the three
 * rows cannot drift into three slightly different islands — the same reason
 * `PricingFaq` holds its `RICH` map at module scope. The span carries
 * `tabular-nums` and NOTHING logical, which is what makes pinning it safe.
 *
 * ⚠️ What the tag wraps is decided in the message files and is load-bearing;
 * see the module note. The tag must contain the sign as well as the digits.
 */
const PCT_ISLAND = {
  pct: (chunks: ReactNode) => (
    <span dir="ltr" className="tabular-nums">
      {chunks}
    </span>
  ),
};

/* ── Glyphs ─────────────────────────────────────────────────────────────────
   The real screen draws lucide icons — `TrendingUp`, `Percent` and `Undo2` on
   the tiles, `Layers` on the section head, and `Plane` / `Bed` / `FileText` as
   the per-service marks (`service-helpers.tsx`). This site's icon set is
   Phosphor, whose equivalents differ enough in weight and construction to be
   visibly a different family, so rather than substitute symbols into a drawing
   whose whole claim is fidelity, they are inlined here with lucide's own
   geometry (lucide-react, ISC): same 24-unit viewBox, same round caps and
   joins, same 2-unit stroke.

   `aria-hidden` on every one — the whole slice is aria-hidden already, and each
   sits immediately beside the words it decorates. */
function Glyph({ className = "size-3", children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

/**
 * ⚠️ No `rtl:rotate-180`, on this or on `UndoGlyph` below — and both are
 * deliberate rather than overlooked. A rising trend line is a CHART metaphor,
 * where the time axis runs left-to-right in Arabic financial reporting too, and
 * an undo arrow is a ROTATIONAL one, whose mirror image is the redo arrow. The
 * real console flips neither (it does flip its row chevrons, which are genuinely
 * directional), so flipping them here would be a drawing of a screen that does
 * not exist.
 */
const TrendingUpGlyph = (
  <>
    <path d="M16 7h6v6" />
    <path d="m22 7-8.5 8.5-5-5L2 17" />
  </>
);

const PercentGlyph = (
  <>
    <path d="M19 5 5 19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </>
);

const UndoGlyph = (
  <>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5 5.5 5.5 0 0 1-5.5 5.5H11" />
  </>
);

const LayersGlyph = (
  <>
    <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
    <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
    <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
  </>
);

const PlaneGlyph = (
  <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
);

const BedGlyph = (
  <>
    <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
    <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
    <path d="M12 4v6" />
    <path d="M2 18h20" />
  </>
);

/**
 * The visa mark. The real profit table sends `visa` to lucide's `FileText`; this
 * page sends it to `Stamp`, which is the mark the bookings feed two sections
 * above already draws on its visa row. Cross-section coherence wins over
 * per-screen fidelity for a 14px glyph: a reader who has just met the visa
 * booking should meet the same symbol on the visa's profit line.
 */
const StampGlyph = (
  <>
    <path d="M5 22h14" />
    <path d="M19.27 13.73A2.5 2.5 0 0 0 17.5 13h-11A2.5 2.5 0 0 0 4 15.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1.5c0-.66-.26-1.3-.73-1.77Z" />
    <path d="M14 13V8.5C14 7 15 7 15 5a3 3 0 0 0-3-3c-1.66 0-3 1-3 3s1 2 1 3.5V13" />
  </>
);

/**
 * The console's `StatusBadge`, at this frame's scale — solid dot, tinted pill,
 * hairline inset ring, 11px semibold, `ps-1.5 pe-2`. Character for character the
 * real primitive's own class list, with `TONE` supplying the colours, and
 * identical to the bookings and inventory slices' copies so the three console
 * frames carry one badge rather than three.
 *
 * ⚠️ ONE divergence from those two copies, and it is a type rather than a class:
 * `children` is a `ReactNode`, not a `string`. The only badge on this screen is
 * the real `NetBadge`, which is money — so its label needs `font-mono
 * tabular-nums` and a `dir="ltr"` pin, and neither can ride on the pill itself.
 * `font-mono` on the pill would also set the Arabic margin hint beside it, and
 * `dir="ltr"` on the pill would flip its own `ps-1.5 pe-2` and move the status
 * dot to the left in Arabic. Both belong on an inner leaf span, which is what a
 * `ReactNode` child buys. The rendered markup is byte-identical to the siblings'.
 */
function Badge({ tone, children }: { tone: ConsoleTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full py-[2px] pe-2 ps-1.5 text-[11px] font-semibold ring-1 ring-inset ${TONE[tone].pill}`}
    >
      <span className={`block size-1.5 shrink-0 rounded-full ${TONE[tone].dot}`} />
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}

interface Tile {
  label: string;
  /** A node, not a string: every value here is a pinned `dir="ltr"` island. */
  value: ReactNode;
  hint: string;
  glyph: ReactNode;
  tone: ConsoleTone;
}

interface ServiceRow {
  /** The vertical key — the row's React key and the mark it draws. */
  id: string;
  glyph: ReactNode;
  label: string;
  /** `142 bookings` — prose, so it takes the locale's own digits. */
  bookings: string;
  /** Money literals, identical in both locales. */
  revenue: string;
  cost: string;
  net: string;
  /** Message key of the `<pct>`-tagged margin hint. */
  marginKey: string;
}

export function ProfitSlice() {
  const t = useTranslations("TourScope.deepDive.financials.slice");

  /* The real Result band's first, second and third tiles. Its fourth and fifth
     — the agent-bonus expense and the margin-slice "Refunded" figure — are
     conditional on the real page too (both drop out when the server withholds
     them), and neither is a claim this section makes. */
  const tiles: Tile[] = [
    {
      label: t("tileNet"),
      /* ⚠️ ALWAYS signed. `signed()` on the real page prefixes `+` or `−`
         because net is the one figure that can legitimately go negative, and the
         sign is the whole reading — which is also why it is pinned: unpinned,
         Arabic moves it to the far end of the number. */
      value: (
        <span dir="ltr" className="tabular-nums">
          +$12,480.00
        </span>
      ),
      hint: t("tileNetHint"),
      glyph: TrendingUpGlyph,
      tone: "success",
    },
    {
      label: t("tileMargin"),
      value: (
        <span dir="ltr" className="tabular-nums">
          20.3%
        </span>
      ),
      hint: t("tileMarginHint"),
      glyph: PercentGlyph,
      tone: "success",
    },
    {
      label: t("tileRefunded"),
      value: (
        <span dir="ltr" className="tabular-nums">
          $1,240.00
        </span>
      ),
      hint: t("tileRefundedHint"),
      glyph: UndoGlyph,
      tone: "warning",
    },
  ];

  /* The three verticals the sections above this one have already drawn a
     booking for, in the real table's own order (net profit, descending). */
  const rows: ServiceRow[] = [
    {
      id: "flights",
      glyph: PlaneGlyph,
      label: t("flights"),
      bookings: t("flightsBookings"),
      revenue: "$38,900.00",
      cost: "$31,720.00",
      net: "+$7,180.00",
      marginKey: "flightsMargin",
    },
    {
      id: "hotels",
      glyph: BedGlyph,
      label: t("hotels"),
      bookings: t("hotelsBookings"),
      revenue: "$14,200.00",
      cost: "$11,540.00",
      net: "+$2,660.00",
      marginKey: "hotelsMargin",
    },
    {
      id: "visa",
      glyph: StampGlyph,
      label: t("visa"),
      bookings: t("visaBookings"),
      revenue: "$8,400.00",
      cost: "$5,760.00",
      net: "+$2,640.00",
      marginKey: "visaMargin",
    },
  ];

  return (
    <div aria-hidden="true" className={`select-none text-zinc-300 antialiased ${SHEET}`}>
      {/* ── A. Page head ───────────────────────────────────────────────────
          The screen's name and the currency every figure below it is stated in,
          exactly as the real header pairs them — including the `·`, which is
          the real markup's own separator rather than a chip. It is safe here
          precisely because what follows it is a Latin currency CODE and not a
          numeral: the reason `Dot` exists is that Arabic-Indic zero is itself a
          raised dot, and `USD` has no digits to be absorbed into. */}
      <div
        className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 border-b ${DIVIDE} px-3 py-2.5 sm:px-4`}
      >
        <span className="text-[12.5px] font-bold text-white">{t("title")}</span>
        <span className="font-mono text-[11px] uppercase tabular-nums text-zinc-500">· USD</span>
      </div>

      {/* ── B. The Result band ─────────────────────────────────────────────
          A captioned band, not a bare row of tiles. The caption is the real
          screen's own device and it is load-bearing: these three figures are an
          OUTCOME, and the moment they sit unlabelled beside a table of revenue
          and cost a reader starts trying to subtract one from the other. */}
      <div className={`border-b ${DIVIDE} px-3 py-2.5 sm:px-4`}>
        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          {t("bandResult")}
        </h4>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {tiles.map((tile) => (
            <div
              key={tile.label}
              className="flex min-w-0 flex-col gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`grid size-5 shrink-0 place-items-center rounded-md ${TONE[tile.tone].chip}`}
                >
                  <Glyph className="size-3">{tile.glyph}</Glyph>
                </span>
                <span className={TILE_LABEL}>{tile.label}</span>
              </div>
              {/* The real tile colours only the icon CHIP from `tone`; the
                  figure stays foreground unless a call site opts in with
                  `valueTone`, and the profit page has none. So the emerald and
                  the amber live in the 20px squares, which is where the real
                  screen puts them. */}
              <span className="text-xl font-bold leading-none tracking-tight text-white">
                {tile.value}
              </span>
              <span className="min-w-0 truncate text-[11px] text-zinc-500">{tile.hint}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── C + D. By service ──────────────────────────────────────────────
          The real page's second section: its own sub-head with a row count,
          then the P&L. */}
      <div className="px-3 py-3 sm:px-4">
        <div className="mb-2 flex items-center gap-2.5">
          <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-ts-purple/10 text-ts-purple-text">
            <Glyph className="size-3.5">{LayersGlyph}</Glyph>
          </span>
          <span className="text-[14px] font-semibold tracking-tight text-white">
            {t("byService")}
          </span>
          {/* A drawn dot, not the real string's "·": the count that follows is
              Arabic-Indic in `ar`, and a middot printed immediately before a
              numeral is read as part of it — Arabic-Indic ZERO is itself a
              raised dot. Same substitution the bookings slice makes on its
              HealthyDivider, and the reason `Dot` exists at all. */}
          <Dot />
          <span className="text-[11px] font-medium tabular-nums text-zinc-500">
            {t("byServiceCount")}
          </span>
        </div>

        {/* Column heads exist only where there are columns — see `ROW_COLS`. */}
        <div className={`hidden ${ROW_COLS} border-b ${DIVIDE} pb-1.5 md:grid`}>
          <span className={COL_HEAD}>{t("colService")}</span>
          <span className={`${COL_HEAD} justify-self-end`}>{t("colRevenue")}</span>
          <span className={`${COL_HEAD} justify-self-end`}>{t("colCost")}</span>
          <span className={`${COL_HEAD} justify-self-end`}>{t("colNet")}</span>
        </div>

        {rows.map((row) => (
          <div key={row.id} className={`grid border-t ${DIVIDE} ${ROW_COLS} py-3`}>
            {/* Service — the mark, the name, and how many bookings are behind
                the three figures beside it. */}
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-ts-purple/10 text-ts-purple-text">
                <Glyph className="size-3.5">{row.glyph}</Glyph>
              </span>
              <div className="flex min-w-0 flex-col gap-0.5 leading-tight">
                <span className="truncate text-[12.5px] font-semibold text-white">{row.label}</span>
                <span className="truncate text-[11px] tabular-nums text-zinc-500">
                  {row.bookings}
                </span>
              </div>
            </div>

            {/* Revenue and Cost — dropped below `md`, the same two the real
                table drops first. `font-mono` is right here and nowhere near
                the Arabic beside it: both cells are Latin in every locale. */}
            <span className="hidden justify-self-end whitespace-nowrap font-mono text-[12px] font-semibold tabular-nums text-white md:block">
              <span dir="ltr">{row.revenue}</span>
            </span>
            <span className="hidden justify-self-end whitespace-nowrap font-mono text-[12px] tabular-nums text-zinc-400 md:block">
              <span dir="ltr">{row.cost}</span>
            </span>

            {/* Net — the real `NetBadge` over the real `MarginHint`. The badge
                is the same StatusBadge anatomy as every other console pill on
                this page; what makes it a money badge is the monospace and the
                pin on its label, which is why both sit on that leaf span. */}
            <div className="flex min-w-0 flex-col items-end gap-1 leading-tight">
              <Badge tone="success">
                <span dir="ltr" className="font-mono tabular-nums">
                  {row.net}
                </span>
              </Badge>
              <span className="whitespace-nowrap text-[10.5px] text-zinc-500">
                {t.rich(row.marginKey, PCT_ISLAND)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer chrome ──────────────────────────────────────────────────
          The console twin of the storefront slices' "48 fares · 12 airlines".
          The first slot names the four account surfaces this section's copy
          claims and the frame has no room to draw; the second is the claim they
          have in common. The em-dash rather than a `Dot` between them is the
          spec's own punctuation and it carries the reading: the four are a list,
          and what follows is a statement ABOUT the list, not a fifth item. */}
      <div className={`flex flex-wrap items-center gap-2 border-t ${DIVIDE} px-3 py-2 sm:px-4`}>
        <span className="text-[10px] text-zinc-400">{t("footerAccounts")}</span>
        {/* The dash travels WITH the clause it introduces, as one flex item.
            Flat, the two are separate items and the phone's wrap lands between
            them — leaving an em-dash orphaned at the end of the first line,
            which reads as a hyphenated word break rather than as punctuation. */}
        <span className="flex items-center gap-2 text-[10px]">
          <span className="text-zinc-600">—</span>
          <span className="text-zinc-400">{t("footerNote")}</span>
        </span>
      </div>
    </div>
  );
}
