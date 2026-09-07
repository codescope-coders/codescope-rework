"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { DIVIDE, Dot, SHEET } from "@/components/site/tourscope/slice-primitives";

/**
 * The operator console's Flight Availabilities screen, coded — the inventory
 * section's product view, and the second drawing on this page taken from the
 * console rather than the storefront.
 *
 * ── What this is a drawing OF ───────────────────────────────────────────────
 * A structural miniature of the console's real
 * `app/(dashboard)/inventory/manual/local-flight-availabilities/page.tsx`, its
 * `_components/flight-availabilities-insights.tsx` (the KPI row) and its
 * `_components/availabilities-table.tsx` (the rows), in their own order: a page
 * head that pairs the screen's name with its one primary action, a row of KPI
 * tiles that answer "is this catalogue healthy?", and the inventory itself —
 * one card per (route, date) carrying the four elements that make this screen
 * a seat manager rather than a list:
 *
 *   `FlightSummary` → the carrier, the flight number, the auto-close timer and
 *                     the date, over a `RouteConnector` and a city line.
 *   `LoadCell`      → percentage + `booked/total` over a THREE-segment bar
 *                     (booked, held, allocated) and its legend.
 *   `ClassesCell`   → one `ClassChip` per fare class: cabin dot, class code,
 *                     price (or the amber `no price` state), `booked/total`,
 *                     and the class's own mini load bar.
 *   `StatusBadge`   → whether the flight is on sale at all.
 *
 * ── Why CARDS and not the console's `<table>` ───────────────────────────────
 * The real screen renders BOTH, from one `ResponsiveDataTable`: a six-column
 * table declared `min-w-[64rem]` above `lg`, and a `FlightCard` below it. This
 * frame is 997px at its widest and ~290px on a phone, so the table form would be
 * a horizontal scrollbar at every width this drawing is ever seen at. The card
 * is therefore the PRODUCT'S OWN answer for this width rather than an invention,
 * and it is the denser of the two — five stacked blocks per row against six
 * columns of one line each, which is the shape that makes the point that a
 * charter seat is counted, not listed.
 *
 * From `xl` the card's blocks fold into two columns — the real TABLE's own
 * grouping, applied because a card stretched to 940px draws every element inside
 * it several times the size the product ever draws it. The reasoning is at the
 * fold itself.
 *
 * ── The console medium (§0b — the convention P16 set) ───────────────────────
 * The real screen is a LIGHT-mode dashboard; only its STRUCTURE is copied, with
 * every light tone re-expressed in this page's dark palette by `TONE` below.
 * That table is COPIED VERBATIM from `LiveBookingsSlice` rather than derived
 * again here, and deliberately keeps arms this slice never uses: the console's
 * status system is eight semantic hues, and two console slices that each map
 * only the hues they happen to need are two tables that drift the first time a
 * third slice needs a hue they disagree about.
 *
 * ── The four slice rules (same contract as `ProductSlices.tsx`) ─────────────
 * 1. Every WORD comes from `messages` (`TourScope.deepDive.inventory.slice`).
 *    The literals are the same family the flights and bookings slices fixed —
 *    things a person reads back rather than reads:
 *
 *      airline names   `Iraqi Airways`, `Mahan Air` — brands, and the exact
 *                      strings `FlightResultsSlice` already draws.
 *      flight numbers  `IA 117`, `W5 071`
 *      airport codes   `BGW`, `IST`, `NJF`, `THR`
 *      clock times     `08:40`, `11:55`
 *      durations       `2h 15m` — and this one is literal because the REAL one
 *                      is: `formatDuration` builds `${h}h ${m}m` with no locale
 *                      lookup at all, so an Arabic operator sees `2h 15m` too.
 *      prices          `$220`, `$340`, `$180`
 *      seat fractions  `130/180`, `96/120`
 *
 *    Everything a person WROTE is a message, and its numerals follow the
 *    sibling slices: a figure that reads as PROSE takes the locale's own digits
 *    (`24` → `٢٤`, `12 held` → `١٢ محجوز مؤقتًا`, `72% load` → `إشغال ٧٢%`),
 *    while a token pinned `dir="ltr"` keeps Latin ones. Dates are prose — they
 *    name a month — so `12 Oct` becomes `١٢ تشرين الأول`.
 *
 *    ⚠️ The KPI row is where that seam is VISIBLE, and it is deliberate. Tile 1
 *    is a bare count (`٢٤`); tiles 2 and 3 are FRACTIONS (`288 / 360`,
 *    `17 / 18`) and stay Latin inside `dir="ltr"`. Not a style choice — under
 *    bidi a fraction written with Arabic-Indic digits and SPACES around the
 *    slash is two AN runs separated by neutrals, which resolve to the paragraph
 *    direction: the tile would silently render `٣٦٠ / ٢٨٨`, i.e. total over
 *    booked, which is the one thing a seat count must never do. Pinned, the
 *    Latin digits then also agree with the `130/180` in the rows below, so the
 *    two readings of the same measurement look like one measurement.
 *
 *    ⚠️ `font-mono` is reserved for tokens that are Latin in BOTH locales. The
 *    real screen puts it on the date chip and the close-timer chip too, but
 *    those hardcode `Intl.DateTimeFormat("en", …)` and `{hours}h`, where ours
 *    are `١٢ تشرين الأول` and `٦ س` — and a monospace stack has no business
 *    setting Arabic. They keep `tabular-nums` and drop the family.
 * 2. The root is `aria-hidden` — the section copy beside it carries the meaning
 *    — so nothing inside is focusable. The real rows carry a kebab menu opening
 *    five dialogs and the real header CTA opens the bulk-create dialog; here
 *    both are `span`s.
 * 3. Logical properties only, so it mirrors under `dir="rtl"` unaided. The
 *    route's two endpoints are flex SIBLINGS, so the origin sits on the inline
 *    start in both locales with no second rule — which is the real console's
 *    RTL behaviour, and the reason the codes are not drawn as one string.
 *
 *    ⚠️ The load bar's segments are positioned with `insetInlineStart`, NOT the
 *    real component's `left`. The real `LoadCell` is inconsistent about this
 *    (its booked segment uses the logical `inset-s-0` and the two after it use
 *    `left`), which under RTL stacks held and allocated from the wrong end of a
 *    bar that fills from the other. One logical property throughout is the fix,
 *    and it costs nothing since the offsets are inline styles either way.
 *
 *    ⚠️ Every `dir="ltr"` here sits on a LEAF inline span carrying no logical
 *    margin or padding. `margin-inline-start` resolves against the element's
 *    OWN direction, so pinning a span that also carries `ms-`/`ps-` silently
 *    turns that spacing into a physical left margin inside an RTL row.
 * 4. No motion at all. The real page animates its tiles in (`Reveal`) and
 *    counts their figures up (`CountUp`); the entrance here belongs to the
 *    `FadeIn` the caller wraps this in, and a number that counts itself up
 *    inside a static drawing reads as a chart, not as a screen.
 *
 * ── Why the seat numbers are numbers ────────────────────────────────────────
 * Every width on this frame is DERIVED from `seats`, exactly as the real
 * `LoadCell` and `ClassChip` derive theirs, and the fraction printed above each
 * bar is built from the same two integers. That is not tidiness: the header
 * line states `72% load` in words a translator owns, and a bar hand-set to some
 * other percentage would contradict the sentence directly above it. Deriving
 * makes the two agree by construction.
 */

/* ── Tone map (§0b) ─────────────────────────────────────────────────────────
   Copied verbatim from `LiveBookingsSlice` — see the module note above for why
   it is copied rather than re-derived.

   `pill` is the badge surface (tint + text + ring colour — the element supplies
   `ring-1 ring-inset`), `dot` the badge's solid status dot AND a cabin dot,
   `chip` a tile's icon square.

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
 * The cabin dot on a class chip — the real `CABIN_DOT` map, through `TONE`.
 *
 * `premium_economy` is deliberately absent rather than guessed: the real map
 * sends it to the console's `secondary` scale, which this site has no token
 * for, and a chip is a 6px dot — the wrong colour there is indistinguishable
 * from the right one until somebody trusts it.
 */
const CABIN_DOT = {
  economy: TONE.neutral.dot,
  business: TONE.primary.dot,
  first: TONE.warning.dot,
} as const;

type Cabin = keyof typeof CABIN_DOT;

/**
 * A tile's uppercase label. Three tiles rather than the bookings slice's five,
 * so the label has ~130px at its tightest (a 640px viewport, where the tiles
 * are already three across) and the real tile's own 10.5px reads at every step
 * without a size ladder. `truncate` is the backstop.
 *
 * `uppercase` is a no-op in Arabic, which is correct — the tracking carries the
 * chrome register there.
 */
const TILE_LABEL =
  "min-w-0 truncate text-[10px] font-semibold uppercase tracking-wider text-zinc-500";

/* ── Glyphs ─────────────────────────────────────────────────────────────────
   The real screen draws lucide icons — `Plane`, `Users`, `AlertTriangle` on the
   tiles, `Plus` on the CTA and `Clock` on both the close-timer chip and the
   route connector. This site's icon set is Phosphor, whose equivalents differ
   enough in weight and construction to be visibly a different family, so rather
   than substitute symbols into a drawing whose whole claim is fidelity, they
   are inlined here with lucide's own geometry (lucide-react, ISC): same
   24-unit viewBox, same round caps and joins, same 2-unit stroke.

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

const PlaneGlyph = (
  <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
);

const UsersGlyph = (
  <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>
);

const AlertGlyph = (
  <>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </>
);

const ClockGlyph = (
  <>
    <path d="M12 6v6l4 2" />
    <circle cx="12" cy="12" r="10" />
  </>
);

const PlusGlyph = (
  <>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </>
);

/**
 * The console's `StatusBadge`, at this frame's scale — solid dot, tinted pill,
 * hairline inset ring, 11px semibold, `ps-1.5 pe-2`. Character for character the
 * real primitive's own class list, with `TONE` supplying the colours, and
 * identical to the bookings slice's copy so the two console frames carry one
 * badge rather than two.
 */
function Badge({ tone, children }: { tone: ConsoleTone; children: string }) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full py-[2px] pe-2 ps-1.5 text-[11px] font-semibold ring-1 ring-inset ${TONE[tone].pill}`}
    >
      <span className={`block size-1.5 shrink-0 rounded-full ${TONE[tone].dot}`} />
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}

/** Seat counts for one availability or one fare class. Widths derive from these. */
interface Seats {
  total: number;
  booked: number;
  /** Paid-for-but-not-yet-ticketed. Sits inside the sold pool. */
  held?: number;
  /** Reserved for a company or a customer. Sits inside the available pool. */
  allocated?: number;
}

interface FareClass {
  /** The IATA booking designator — `Y`, `J`, `B`. A literal in both locales. */
  code: string;
  cabin: Cabin;
  /** `null` renders the real screen's amber `no price` state. */
  price: string | null;
  seats: Seats;
}

interface Availability {
  /** A brand name — a literal, and the same string `FlightResultsSlice` uses. */
  airline: string;
  flightNo: string;
  date: string;
  /** The `−Nh` auto-close chip. Absent on a flight with no timer configured. */
  closeTimer?: string;
  origin: { code: string; time: string; city: string };
  destination: { code: string; time: string; city: string };
  duration: string;
  load: string;
  seats: Seats;
  heldLabel?: string;
  allocatedLabel?: string;
  classes: FareClass[];
}

/** `booked/total` as a percentage, clamped — the real cells' own arithmetic. */
function pct(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, (part / total) * 100));
}

/**
 * One stacked segment of a load bar.
 *
 * ⚠️ `insetInlineStart`, never `left` — see the module note. The width is
 * clamped against what the segments before it already spent, exactly as the
 * real `LoadCell` clamps its own, so an over-sold flight can never draw a bar
 * that runs past its track.
 */
function Segment({ start, size, tone }: { start: number; size: number; tone: string }) {
  const width = Math.max(0, Math.min(100 - start, size));
  if (width <= 0) return null;
  return (
    <span
      className={`absolute inset-y-0 block rounded-full ${tone}`}
      style={{ insetInlineStart: `${start}%`, width: `${width}%` }}
    />
  );
}

/**
 * `booked` over `total`, with the slash in the real cell's own muted grey.
 *
 * Pinned `dir="ltr"` on the wrapper, which is safe here because its only
 * spacing is the slash's PHYSICAL `mx-0.5` — a logical `ms-`/`me-` would
 * resolve against this element's pinned direction and stop mirroring.
 */
function Fraction({ seats, className }: { seats: Seats; className: string }) {
  return (
    <span dir="ltr" className={className}>
      {seats.booked}
      <span className="mx-0.5 text-zinc-600">/</span>
      {seats.total}
    </span>
  );
}

export function CharterInventorySlice() {
  const t = useTranslations("TourScope.deepDive.inventory.slice");

  /* The three tiles the real `computeInsights` builds first, third and fourth.
     Its second — Date coverage — is dropped: it renders a date RANGE
     (`12 Oct → 30 Nov`), which at this scale is a second date format competing
     with the per-row date chips for no fact the section is claiming. */
  const tiles = [
    {
      label: t("tileTotal"),
      /* A bare count, so it takes the locale's own digits. */
      value: <span className="tabular-nums">{t("tileTotalValue")}</span>,
      hint: t("tileTotalHint"),
      glyph: PlaneGlyph,
      tone: "primary" as ConsoleTone,
    },
    {
      label: t("tileSeats"),
      /* A fraction, so it is pinned and stays Latin — see the module note. */
      value: (
        <span dir="ltr" className="tabular-nums">
          288 / 360
        </span>
      ),
      hint: t("tileSeatsHint"),
      glyph: UsersGlyph,
      tone: "primary" as ConsoleTone,
    },
    {
      label: t("tilePriced"),
      value: (
        <span dir="ltr" className="tabular-nums">
          17 / 18
        </span>
      ),
      hint: t("tilePricedHint"),
      glyph: AlertGlyph,
      tone: "warning" as ConsoleTone,
    },
  ];

  const rows: Availability[] = [
    {
      /* The deep-dive's own recurring route, and the exact carrier + flight
         number the flights section's results list already draws. */
      airline: "Iraqi Airways",
      flightNo: "IA 117",
      date: t("aDate"),
      closeTimer: t("closeTimer"),
      origin: { code: "BGW", time: "08:40", city: t("aOriginCity") },
      destination: { code: "IST", time: "11:55", city: t("aDestCity") },
      duration: "2h 15m",
      load: t("aLoad"),
      seats: { total: 180, booked: 130, held: 12, allocated: 12 },
      heldLabel: t("aHeld"),
      allocatedLabel: t("aAllocated"),
      classes: [
        { code: "Y", cabin: "economy", price: "$220", seats: { total: 120, booked: 96 } },
        { code: "J", cabin: "business", price: "$340", seats: { total: 60, booked: 34 } },
      ],
    },
    {
      /* The Najaf–Tehran charter corridor. No close timer: the real chip is
         absent on a flight with none configured, and drawing it on both rows
         would read as chrome rather than as a state. */
      airline: "Mahan Air",
      flightNo: "W5 071",
      date: t("bDate"),
      origin: { code: "NJF", time: "14:20", city: t("bOriginCity") },
      destination: { code: "THR", time: "16:10", city: t("bDestCity") },
      duration: "1h 50m",
      load: t("bLoad"),
      seats: { total: 180, booked: 158, held: 9 },
      heldLabel: t("bHeld"),
      classes: [
        { code: "Y", cabin: "economy", price: "$180", seats: { total: 150, booked: 140 } },
        /* The missing-price state tile 3 is counting. The coherence is the
           point: "1 active flight missing pricing" IS this class. */
        { code: "B", cabin: "economy", price: null, seats: { total: 30, booked: 18 } },
      ],
    },
  ];

  return (
    <div aria-hidden="true" className={`select-none text-zinc-300 antialiased ${SHEET}`}>
      {/* ── A. Page head ───────────────────────────────────────────────────
          The screen's name and its one primary action, as the real header
          pairs them. Drawn as a bordered ghost rather than the real filled
          primary button: this frame already spends its purple on the tile
          chips and the service marks, and a filled brand button in the corner
          of a still picture is the loudest thing on it — for the one element
          a reader can never press. */}
      <div
        className={`flex flex-wrap items-center gap-x-2.5 gap-y-1.5 border-b ${DIVIDE} px-3 py-2.5 sm:px-4`}
      >
        <span className="text-[12.5px] font-bold text-white">{t("title")}</span>
        <span className="ms-auto inline-flex shrink-0 items-center gap-1 rounded-md border border-white/[0.12] bg-white/[0.05] px-2 py-[5px] text-[10px] font-semibold leading-none text-zinc-200">
          <Glyph className="size-3">{PlusGlyph}</Glyph>
          {t("create")}
        </span>
      </div>

      {/* ── B. KPI row ─────────────────────────────────────────────────────
          The real tile anatomy: hairline card → tiny toned icon chip + 10px
          uppercase label → one big tabular figure → a muted hint line. The
          hint is the half that makes these tiles worth drawing — "24" is a
          number, "18 active · 6 inactive" is the state of a catalogue. */}
      <div className={`grid gap-2 border-b ${DIVIDE} px-3 py-2.5 sm:grid-cols-3 sm:px-4`}>
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
            {/* The real tile colours only the icon CHIP from `tone`; the figure
                stays foreground unless a call site opts in with `valueTone`,
                and this page has none. So the amber lives in the 20px square,
                which is where the real screen puts it. */}
            <span className="text-xl font-bold leading-none tracking-tight text-white">
              {tile.value}
            </span>
            <span className="min-w-0 truncate text-[11px] text-zinc-500">{tile.hint}</span>
          </div>
        ))}
      </div>

      {/* ── C. The inventory ───────────────────────────────────────────────
          One card per (route, date) — the real `FlightCard`, which is what the
          product itself renders at every width this frame is seen at. */}
      <div className="flex flex-col gap-2 px-3 py-3 sm:px-4">
        {rows.map((row) => {
          const bookedPct = pct(row.seats.booked, row.seats.total);
          const heldPct = pct(row.seats.held ?? 0, row.seats.total);
          const allocatedPct = pct(row.seats.allocated ?? 0, row.seats.total);

          return (
            <div
              key={row.flightNo}
              /* `CARD`'s tint and hairline at the tile family's radius, written
                 out rather than composed: `rounded-xl` layered over the
                 constant's own `rounded-lg` would be two utilities of equal
                 specificity settled by Tailwind's emission order. */
              className="rounded-xl border border-white/[0.07] bg-white/[0.035] p-3"
            >
              {/* ── The card's two halves ───────────────────────────────
                  Stacked, as the real `FlightCard` stacks them — except from
                  `xl`, where they sit side by side.

                  That fold is not a new layout: it is the real DESKTOP table's
                  own grouping (the Flight column, then the Load and Classes
                  columns) applied where there is room for it. Measured stacked
                  at this frame's widest, the card is ~940px across and the
                  elements inside it are drawn at 3–6× the size the product ever
                  draws them — a class chip at 467px against the real ~250, a
                  route connector at ~850px against the real ~150 — which is the
                  one thing a faithful miniature must not do. Folded, the same
                  chip lands at 225px.

                  Below `xl` the stack stands on its own: the region's rail
                  leaves this frame ~685px there, which is inside the range the
                  real card is built for (it is what the product renders at
                  every width under `lg`). */}
              <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] xl:items-start xl:gap-5">
                <div className="min-w-0">
                  {/* Head line — carrier, flight number, then the trailing group
                      the real `FlightSummary` pushes out with `ms-auto`. */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                    <span className="grid size-5 shrink-0 place-items-center rounded bg-ts-purple/10 text-ts-purple-text">
                      <Glyph className="size-3">{PlaneGlyph}</Glyph>
                    </span>
                    <span className="text-[13px] font-semibold text-white">{row.airline}</span>
                    <span dir="ltr" className="font-mono text-[11px] text-zinc-500">
                      {row.flightNo}
                    </span>

                    <span className="ms-auto flex shrink-0 items-center gap-1.5">
                      <Badge tone="success">{t("statusActive")}</Badge>
                      {/* CloseTimerChip — the amber chip surfacing an auto-close
                          timer, present only where one is configured. */}
                      {row.closeTimer && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-amber-300 ring-1 ring-inset ring-amber-400/20">
                          <Glyph className="size-2.5">{ClockGlyph}</Glyph>
                          {row.closeTimer}
                        </span>
                      )}
                      <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-zinc-400">
                        {row.date}
                      </span>
                    </span>
                  </div>

                  {/* RouteConnector — origin stack, a hairline with the duration
                      floating on it, destination stack. The two endpoints are flex
                      SIBLINGS, so the origin is on the inline start in both
                      locales and nothing about bidi ever arises. */}
                  <div className="mt-2.5 flex items-center gap-2 text-white">
                    <div className="flex shrink-0 flex-col leading-tight">
                      <span dir="ltr" className="text-[14px] font-bold tabular-nums">
                        {row.origin.code}
                      </span>
                      <span dir="ltr" className="font-mono text-[11px] text-zinc-500">
                        {row.origin.time}
                      </span>
                    </div>

                    <div className="relative flex min-w-0 flex-1 items-center px-1">
                      <span className="block h-px w-full bg-white/10" />
                      {/* Centred by a full-size flex wrapper rather than the real
                          component's `left-1/2 -translate-x-1/2`: that pair is
                          physical, and under RTL a `start-1/2` with a negative X
                          translate walks the pill the wrong way. Flex centring is
                          identical in both directions and needs no arithmetic. */}
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-zinc-950 px-1.5 py-px text-[10px] text-zinc-400">
                          <Glyph className="size-2.5">{ClockGlyph}</Glyph>
                          <span dir="ltr" className="font-mono tabular-nums">
                            {row.duration}
                          </span>
                        </span>
                      </span>
                    </div>

                    <div className="flex shrink-0 flex-col text-end leading-tight">
                      <span dir="ltr" className="text-[14px] font-bold tabular-nums">
                        {row.destination.code}
                      </span>
                      <span dir="ltr" className="font-mono text-[11px] text-zinc-500">
                        {row.destination.time}
                      </span>
                    </div>
                  </div>

                  {/* City line — the codes above are what an operator files, these
                      are what they mean. */}
                  <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-zinc-500">
                    <span className="min-w-0 truncate">{row.origin.city}</span>
                    <span className="min-w-0 truncate text-end">{row.destination.city}</span>
                  </div>
                </div>

                <div className="min-w-0">
                  {/* LoadCell — the screen's centre of gravity. Percentage and
                      `booked/total` over a bar that stacks booked → held →
                      allocated from the inline start, with a legend naming only the
                      two segments a reader cannot infer from the fraction. */}
                  <div className="mt-3 flex flex-col gap-1.5 xl:mt-0">
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="min-w-0 truncate text-zinc-500">{row.load}</span>
                      <Fraction
                        seats={row.seats}
                        className="shrink-0 font-mono tabular-nums text-zinc-300"
                      />
                    </div>

                    <div className="relative h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                      <Segment start={0} size={bookedPct} tone="bg-emerald-400" />
                      <Segment start={bookedPct} size={heldPct} tone="bg-amber-400" />
                      <Segment start={bookedPct + heldPct} size={allocatedPct} tone="bg-sky-400" />
                    </div>

                    {(row.heldLabel || row.allocatedLabel) && (
                      <div className="flex items-center justify-end gap-2.5 text-[10px] text-zinc-500">
                        {row.heldLabel && (
                          <span className="inline-flex items-center gap-1">
                            <span className="block size-1.5 shrink-0 rounded-full bg-amber-400" />
                            {row.heldLabel}
                          </span>
                        )}
                        {row.allocatedLabel && (
                          <span className="inline-flex items-center gap-1">
                            <span className="block size-1.5 shrink-0 rounded-full bg-sky-400" />
                            {row.allocatedLabel}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ClassesCell — one chip per fare class. Two across from `sm`,
                      as the real cell does from `lg`; the phone stacks them. */}
                  <div className="mt-2.5 grid gap-1.5 sm:grid-cols-2">
                    {row.classes.map((klass) => (
                      <div
                        key={klass.code}
                        className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-2 py-1.5"
                      >
                        <span
                          className={`block size-1.5 shrink-0 rounded-full ${CABIN_DOT[klass.cabin]}`}
                        />
                        <span className="grid size-5 shrink-0 place-items-center rounded bg-white/[0.06] font-mono text-[10px] font-bold tabular-nums text-zinc-300">
                          {klass.code}
                        </span>
                        {/* The price, or the real screen's amber `no price`. Amber
                            because an unpriced class is not an error — the flight
                            exists and sells its other classes — it is a thing the
                            operator has not finished, which is exactly what the
                            third tile is counting. */}
                        <span className="min-w-0 flex-1 truncate text-[11px]">
                          {klass.price ? (
                            <span dir="ltr" className="font-mono tabular-nums text-zinc-200">
                              {klass.price}
                            </span>
                          ) : (
                            <span className="text-amber-300">{t("noPrice")}</span>
                          )}
                        </span>
                        <Fraction
                          seats={klass.seats}
                          className="shrink-0 font-mono text-[10px] tabular-nums text-zinc-500"
                        />
                        {/* The class's own load, at 40px. Drawn at EVERY width,
                            where the real chip hides it below `sm` — the one
                            place this drawing does not follow. Our chip goes
                            full-width when it stacks, so hiding the bar there
                            leaves ~160px of empty chip and drops the second half
                            of what a class chip says: not just what a seat costs
                            but how many are left to sell at that price. */}
                        <span className="relative block h-1 w-10 shrink-0 overflow-hidden rounded-full bg-white/[0.08]">
                          <Segment
                            start={0}
                            size={pct(klass.seats.booked, klass.seats.total)}
                            tone="bg-emerald-400"
                          />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer chrome ──────────────────────────────────────────────────
          The console twin of the storefront slices' "48 fares · 12 airlines".
          The first slot is the point the section is making — this screen is one
          of four, and the other three are the same kind of thing — and the
          second is what they have in common. */}
      <div className={`flex flex-wrap items-center gap-2 border-t ${DIVIDE} px-3 py-2 sm:px-4`}>
        <span className="text-[10px] text-zinc-400">{t("footerKinds")}</span>
        <Dot />
        <span className="text-[10px] text-zinc-400">{t("footerNote")}</span>
      </div>
    </div>
  );
}
