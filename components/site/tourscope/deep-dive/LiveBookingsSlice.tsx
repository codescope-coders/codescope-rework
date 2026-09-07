"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { DIVIDE, Dot, SHEET } from "@/components/site/tourscope/slice-primitives";

/**
 * The operator console's Live Bookings screen, coded — the booking-management
 * section's product view, and the FIRST drawing on this page taken from the
 * console rather than the storefront.
 *
 * ── What this is a drawing OF ───────────────────────────────────────────────
 * A structural miniature of the console's real
 * `app/(dashboard)/booking-management/live/page.tsx` and its
 * `_components/live-bookings-table.tsx`, in their own order: a page head that
 * pairs the screen's name with a live-connection pill, a row of five queue
 * tiles that ARE the table's filters (so one of them is shown selected), and
 * the feed itself — column heads over rows that lead with a coloured attention
 * rail at the row's leading edge, and a `HealthyDivider` marking where the
 * needs-action run ends and the healthy tail begins.
 *
 * ── The console medium (§0b — the convention P17–P20 reuse) ─────────────────
 * The real screen is a LIGHT-mode dashboard; only its STRUCTURE is copied. Every
 * light tone is re-expressed in this page's dark palette by `TONE` below, and
 * the mapping is deliberately a single table rather than per-element choices:
 * the console's whole status system is eight semantic hues (see its
 * `components/ui/status-badge.tsx`), and re-deriving them view by view is how
 * "Refunding" ends up teal on one console slice and green on the next.
 *
 * Copying the light palette straight onto a near-black page produces a bright
 * rectangle, which is exactly why the captured screenshots were dropped for
 * coded slices in the first place.
 *
 * ⚠️ The badge ANATOMY is kept exactly: a solid dot, a tinted pill, and a
 * hairline INSET ring. The ring is what separates a status pill from the page's
 * own translucent chrome on a dark ground — drop it and eight tinted pills read
 * as eight smudges. Same for the tiles: hairline card → tiny toned icon chip +
 * 10px uppercase label → one big tabular figure.
 *
 * ── The four slice rules (same contract as `ProductSlices.tsx`) ─────────────
 * 1. Every WORD comes from `messages` (`TourScope.deepDive.bookings.slice`).
 *    The literals are the booking REFERENCES (`FL-8C21F4`), the clock times
 *    (`09:41`), the money (`$466.00`) and the flight identifiers (`BGW`, `IST`,
 *    `TK 731`) — the same family the flights slice fixed: a record locator is a
 *    code a customer reads back over the phone, so it is identical in both
 *    locales, and a Latin flight number beside an Arabic-Indic time on one row
 *    reads as two different rows.
 *
 *    Everything a person WROTE is a message, and its numerals follow the
 *    sibling slices: a figure that reads as PROSE takes the locale's own digits
 *    (`128` → `١٢٨`, `4 applicants` → `٤ متقدمين`, `3 nights` → `٣ ليالٍ`),
 *    while a token pinned `dir="ltr"` keeps Latin ones. DATES are prose — they
 *    name a month — so `12 Oct` becomes `١٢ تشرين الأول`, matching the group
 *    slice's `الخميس ٢٠ آذار`.
 *
 *    ⚠️ That leaves ONE line carrying both systems: `١٢ تشرين الأول · 09:41`.
 *    It is deliberate rather than an oversight — the two are different KINDS of
 *    value (a written date and a clock reading), they are separated by a DRAWN
 *    dot rather than run together, and the alternative in each direction is
 *    worse: Arabic-Indic digits in the time would break the pinning that keeps
 *    `09:41` from reordering, and Latin digits in the date would put a bare `12`
 *    next to an Arabic month name.
 *
 *    Status LABELS are messages taken verbatim from the console's own
 *    `components.status.*` dictionary in both locales, keyed semantically
 *    (`stPayPaid`) rather than per row, so the three "Paid" badges cannot drift
 *    apart between the two files.
 * 2. The root is `aria-hidden` — the section copy beside it carries the meaning
 *    — so nothing inside is focusable. The real tiles are `role="button"` queue
 *    toggles and the real rows are clickable `<tr role="button">`; here both are
 *    plain `div`s.
 * 3. Logical properties only, so it mirrors under `dir="rtl"` unaided. The
 *    attention rail is `start-0` + `rounded-e-full` and the row reserves its
 *    space with `ps-3`, so the rail sits on the inline start in both locales;
 *    the badge is `ps-1.5 pe-2`; the total is `justify-self-end`; the grid
 *    columns reverse for free. The one directional glyph is the route's
 *    swap arrow, which is symmetric and needs no flip.
 *
 *    ⚠️ Every `dir="ltr"` here sits on a LEAF inline span that carries no
 *    logical margin or padding. `margin-inline-start` resolves against the
 *    element's OWN direction, so pinning a span that also carries `ms-`/`ps-`
 *    silently turns that spacing into a physical left margin inside an RTL row.
 * 4. No motion except the live pill's dot, which is the real screen's own
 *    `animate-pulse` and is gated by the `motion-safe:` variant — the CSS twin
 *    of the `useReducedMotionSafe` hook the sibling slices use, and the right
 *    tool here because nothing about the pill needs to know the answer in JS.
 *    The entrance belongs to the `FadeIn` the caller wraps this in.
 *
 * ── Why FOUR columns when the real table has ten ────────────────────────────
 * The real feed runs Booking · Supplier · Details · Travel · PNR · Status ·
 * Total · Travellers · Booked by · actions, and it says so: it sets
 * `className="min-w-[88rem]"` and hides six of those columns below `xl`, so
 * even the product only ever shows ten of them on a wide monitor. This frame is
 * ~950px at its widest and sits inside a page, so ten columns would be a
 * horizontal scrollbar or ten unreadable slivers.
 *
 * The four kept are the ones that carry the section's claim — that one feed
 * answers "what came in, and what needs me?": WHICH booking (service + ref +
 * when), WHAT it is, WHERE it stands, and HOW MUCH. The payment badge is folded
 * up from the real Total column into Status beside the process badge, because
 * the pair IS the answer to "where does this stand" and separating them across
 * two columns only makes sense when there are ten.
 */

/* ── Tone map (§0b) ─────────────────────────────────────────────────────────
   The console's eight semantic hues, re-expressed for this page's ground.

   `pill` is the badge surface (tint + text + ring colour — the element supplies
   `ring-1 ring-inset`), `dot` the badge's solid status dot AND the row's
   attention rail, `chip` a tile's icon square.

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
 * A tile's uppercase label.
 *
 * ⚠️ The size TRACKS THE TILE, which is a step function of the viewport — the
 * same reasoning (and the same three steps) the eSIM and visa slices record for
 * their stats labels:
 *
 *   below `sm`  the tiles are TWO across, so each is ~155px and the label has
 *               ~103px — the real tile's own 10.5px reads fine.
 *   `sm`–`xl`   five tiles share one column, and from `lg` the desktop rail eats
 *               276px of it too: a tile lands at ~103–150px, so the longest
 *               label (`Awaiting payment` / `في انتظار الدفع`) steps down with
 *               it rather than being cut to two words.
 *   `xl` up     the region's grid leaves ~176px per tile again, so 10px returns.
 *
 * `truncate` is the backstop, not the plan. `uppercase` is a no-op in Arabic,
 * which is correct — the tracking carries the chrome register there.
 */
const TILE_LABEL =
  "min-w-0 truncate text-[10px] sm:text-[8.5px] xl:text-[10px] font-semibold uppercase tracking-wider text-zinc-500";

/** The table's column heads: the real 10px bold uppercase chrome. */
const COL_HEAD = "truncate text-[10px] font-bold uppercase tracking-wider text-zinc-500";

/**
 * The feed's column track — four columns from `md` up, two below it.
 *
 * ⚠️ EVERY track is an `fr`, and not one of them is `auto`. That is the whole
 * point of this constant, because the header and each of the four rows are
 * SEPARATE grid containers: an `auto` track sizes to its own container's
 * content, so the header sized its last column to the word "Total" while the
 * rows sized theirs to `$466.00`, and each row sized its Status column to its
 * own badge. Measured, nothing lined up — the heads sat up to 135px off their
 * columns at 390px, and row 2's `Partially refunded` badge grew its column and
 * pushed that row's reference out of line with the three above it. Fractions
 * resolve identically in every container of the same width, so the five grids
 * agree by construction.
 *
 * (The alternative is one grid for the whole table, which this cannot be: each
 * row needs its own `relative` box to anchor an attention rail and its own
 * `border-t` to rule it off.)
 *
 * ⚠️ Booking is NOT the widest flexible column. It looks like the lead column
 * and wants to be sized like one, but its content is fixed by construction — a
 * 28px mark over a 9-character reference and a timestamp — while Details holds
 * the only unbounded string in the row. Given equal weights the reference ends
 * up marooned ~350px from the detail it belongs to, which reads as two tables
 * rather than one row.
 *
 * ── Below `md` ──────────────────────────────────────────────────────────────
 * Four columns genuinely do not fit a phone: the Arabic timestamp alone wants
 * ~118px, the widest badge ~111px and the total ~50px, against ~288px of track.
 * So Details drops out — exactly as the real table drops it (`hideBelow: "md"`)
 * — and Status and Total fold into ONE inline-end block, stacking the amount
 * over its badges. That is the shape the real product's own mobile card
 * (`LiveCard`) uses for the same three facts, so the collapse is the product's
 * answer rather than an invention. The column heads go with them: a header row
 * is a property of a table, and below `md` this is no longer one.
 */
/* ⚠️ Carries the TRACKS but not `display`. The header needs `hidden md:grid`
   and the rows need a plain `grid`, and folding `grid` in here would put both
   `hidden` and `grid` in the header's class list — two display utilities of
   equal specificity, settled by whichever Tailwind happens to emit last. */
const ROW_COLS =
  "grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] items-center gap-2 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.3fr)_minmax(0,0.8fr)_minmax(0,0.32fr)] md:gap-3";

/* ── Glyphs ─────────────────────────────────────────────────────────────────
   The real screen draws lucide icons — `Layers`, `AlertTriangle`, `Clock`,
   `CheckCircle2` on the tiles and `Plane`, `Stamp`, `BedDouble`, `Smartphone`
   as the per-service marks. This site's icon set is Phosphor, whose equivalents
   differ enough in weight and construction to be visibly a different family, so
   rather than substitute symbols into a drawing whose whole claim is fidelity,
   they are inlined here with lucide's own geometry (lucide-react, ISC): same
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

const LayersGlyph = (
  <>
    <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
    <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
    <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
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

const CheckGlyph = (
  <>
    <path d="M21.801 10A10 10 0 1 1 17 3.335" />
    <path d="m9 11 3 3L22 4" />
  </>
);

const PlaneGlyph = (
  <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
);

const StampGlyph = (
  <>
    <path d="M5 22h14" />
    <path d="M19.27 13.73A2.5 2.5 0 0 0 17.5 13h-11A2.5 2.5 0 0 0 4 15.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1.5c0-.66-.26-1.3-.73-1.77Z" />
    <path d="M14 13V8.5C14 7 15 7 15 5a3 3 0 0 0-3-3c-1.66 0-3 1-3 3s1 2 1 3.5V13" />
  </>
);

const BedGlyph = (
  <>
    <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
    <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
    <path d="M12 4v6" />
    <path d="M2 18h20" />
  </>
);

const PhoneGlyph = (
  <>
    <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
    <path d="M12 18h.01" />
  </>
);

/**
 * The route's swap arrow — lucide `ArrowRightLeft`, which is what the real
 * Details cell draws on a ROUND TRIP.
 *
 * No `rtl:rotate-180`, unlike `slice-primitives`' one-way `Route`: this glyph is
 * point-symmetric, so flipping it produces the identical picture. The order of
 * the two airport codes mirrors on its own, because they are flex siblings.
 */
const SwapGlyph = (
  <>
    <path d="m16 3 4 4-4 4" />
    <path d="M20 7H4" />
    <path d="m8 21-4-4 4-4" />
    <path d="M4 17h16" />
  </>
);

/**
 * The console's `StatusBadge`, at this frame's scale — solid dot, tinted pill,
 * hairline inset ring, 11px semibold, `ps-1.5 pe-2`. Character for character the
 * real primitive's own class list, with `TONE` supplying the colours.
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

interface Tile {
  label: string;
  value: string;
  glyph: ReactNode;
  tone: ConsoleTone;
  /** The queue this tile filters to is the one currently applied. */
  active?: boolean;
}

interface Row {
  /** The attention rail's tone, or `null` for a healthy row (no rail at all). */
  rail: ConsoleTone | null;
  glyph: ReactNode;
  reference: string;
  date: string;
  time: string;
  /** Details main line — a node, because the flight row's is a drawn route. */
  detail: ReactNode;
  /** Details sub line. A node too: two of them pair a count with a place. */
  sub: ReactNode;
  /** The sub line takes the attention tint when it names the reason. */
  subTone?: ConsoleTone;
  status: { label: string; tone: ConsoleTone };
  payment: { label: string; tone: ConsoleTone };
  total: string;
}

export function LiveBookingsSlice() {
  const t = useTranslations("TourScope.deepDive.bookings.slice");

  const tiles: Tile[] = [
    /* `default` on the real page, which renders the BRAND tint rather than a
       grey one — the total is the feed itself, not one of the four queues. */
    { label: t("tileTotal"), value: t("tileTotalValue"), glyph: LayersGlyph, tone: "primary" },
    {
      label: t("tileAction"),
      value: t("tileActionValue"),
      glyph: AlertGlyph,
      tone: "destructive",
      active: true,
    },
    { label: t("tileRisk"), value: t("tileRiskValue"), glyph: AlertGlyph, tone: "warning" },
    {
      label: t("tileAwaiting"),
      value: t("tileAwaitingValue"),
      glyph: ClockGlyph,
      tone: "warning",
    },
    { label: t("tileSettled"), value: t("tileSettledValue"), glyph: CheckGlyph, tone: "success" },
  ];

  const rows: Row[] = [
    {
      rail: "destructive",
      glyph: PlaneGlyph,
      reference: "FL-8C21F4",
      date: t("dateOct12"),
      time: "09:41",
      /* The one details line built from parts rather than words: airport codes
         and a flight number are literals, and drawing them as flex siblings is
         what lets the pair mirror without a bidi question ever arising. */
      detail: (
        <span className="flex min-w-0 items-center gap-1.5">
          <span dir="ltr">BGW</span>
          <Glyph className="size-3 shrink-0 text-zinc-500">{SwapGlyph}</Glyph>
          <span dir="ltr">IST</span>
          <Dot />
          <span dir="ltr" className="min-w-0 truncate">
            TK 731
          </span>
        </span>
      ),
      sub: t("aSub"),
      subTone: "destructive",
      status: { label: t("stProcessInReview"), tone: "warning" },
      payment: { label: t("stPayPaid"), tone: "success" },
      total: "$466.00",
    },
    {
      rail: "warning",
      glyph: StampGlyph,
      reference: "VS-7A3F09",
      date: t("dateOct11"),
      time: "17:02",
      detail: (
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="min-w-0 truncate">{t("bDetail")}</span>
          <Dot />
          <span className="shrink-0">{t("bDetailType")}</span>
        </span>
      ),
      sub: t("bSub"),
      status: { label: t("stProcessRefunding"), tone: "teal" },
      payment: { label: t("stPayPartiallyRefunded"), tone: "primary" },
      total: "$380.00",
    },
    {
      rail: null,
      glyph: BedGlyph,
      reference: "HT-2F9A31",
      date: t("dateOct11"),
      time: "14:26",
      detail: <span className="block truncate">{t("cDetail")}</span>,
      sub: (
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="shrink-0">{t("cNights")}</span>
          <Dot />
          <span className="min-w-0 truncate">{t("cCity")}</span>
        </span>
      ),
      status: { label: t("stProcessConfirmed"), tone: "success" },
      payment: { label: t("stPayPaid"), tone: "success" },
      total: "$384.00",
    },
    {
      rail: null,
      glyph: PhoneGlyph,
      reference: "ES-6B10DD",
      date: t("dateOct11"),
      time: "13:58",
      detail: (
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="shrink-0">{t("dDetail")}</span>
          <Dot />
          <span className="min-w-0 truncate">{t("dPlan")}</span>
        </span>
      ),
      sub: t("dSub"),
      status: { label: t("stProcessCompleted"), tone: "success" },
      payment: { label: t("stPayPaid"), tone: "success" },
      total: "$8.50",
    },
  ];

  return (
    <div aria-hidden="true" className={`select-none text-zinc-300 antialiased ${SHEET}`}>
      {/* ── A. Page head ───────────────────────────────────────────────────
          The screen's name and the realtime connection pill, exactly as the
          real page pairs them. The pill is the one thing on this frame that
          moves, and it is the same claim the storefront's search slices make
          with their own pulse dot: this feed really is streaming. */}
      <div
        className={`flex flex-wrap items-center gap-x-2.5 gap-y-1.5 border-b ${DIVIDE} px-3 py-2.5 sm:px-4`}
      >
        <span className="text-[12.5px] font-bold text-white">{t("title")}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
          {/* `motion-safe:` rather than the `useReducedMotionSafe` hook: this is
              a pure CSS animation with no JS state to branch on, so the media
              query is the whole gate. Under `prefers-reduced-motion` the dot
              simply stands still, which is the correct still frame — a live
              indicator that stops pulsing is still a live indicator. */}
          <span className="block size-1.5 shrink-0 rounded-full bg-emerald-500 motion-safe:animate-pulse" />
          {t("live")}
        </span>
      </div>

      {/* ── B. Queue tiles ─────────────────────────────────────────────────
          Five, and on the real page they are not a summary — they are the
          table's FILTERS, which is why one carries the selected treatment. A
          row of five inert numbers would be a different product. */}
      <div className={`grid grid-cols-2 gap-2 border-b ${DIVIDE} px-3 py-2.5 sm:grid-cols-5 sm:px-4`}>
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className={`flex min-w-0 flex-col gap-2 rounded-xl border bg-white/[0.03] p-3 ${
              tile.active
                ? "border-ts-purple/40 ring-1 ring-ts-purple/30"
                : "border-white/[0.07]"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`grid size-5 shrink-0 place-items-center rounded-md ${TONE[tile.tone].chip}`}
              >
                <Glyph className="size-3">{tile.glyph}</Glyph>
              </span>
              <span className={TILE_LABEL}>{tile.label}</span>
            </div>
            <span className="text-xl font-bold leading-none tracking-tight tabular-nums text-white">
              {tile.value}
            </span>
          </div>
        ))}
      </div>

      {/* ── C. The feed ────────────────────────────────────────────────────
          Needs-action rows first, then the divider, then the healthy tail —
          the real page's "Most urgent" ordering, which is what a queue-driven
          table looks like once a tile is selected. */}
      <div className="px-3 pb-2.5 pt-3 sm:px-4">
        {/* Column heads exist only where there are columns — see `ROW_COLS`. */}
        <div className={`hidden ${ROW_COLS} border-b ${DIVIDE} pb-1.5 ps-3 md:grid`}>
          <span className={COL_HEAD}>{t("colBooking")}</span>
          <span className={COL_HEAD}>{t("colDetails")}</span>
          <span className={COL_HEAD}>{t("colStatus")}</span>
          <span className={`${COL_HEAD} justify-self-end`}>{t("colTotal")}</span>
        </div>

        {rows.map((row, index) => (
          <div key={row.reference}>
            {/* ── HealthyDivider ────────────────────────────────────────
                Hairlines flanking an emerald dot and the count of what
                follows. It marks the seam the real table draws once it is
                sorted by urgency — everything below it is fine, and saying so
                is what makes the two rows above it read as a short list of
                work rather than the top of a long one. */}
            {row.rail === null && rows[index - 1]?.rail != null && (
              <div className="flex items-center gap-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                <span className={`h-px flex-1 border-t ${DIVIDE}`} />
                <span className="inline-flex items-center gap-1.5">
                  <span className="block size-1.5 shrink-0 rounded-full bg-emerald-400" />
                  {t("healthy")}
                  {/* A drawn dot, not the real string's "·": the count that
                      follows is Arabic-Indic in `ar`, and a middot printed
                      immediately before `١١٥` is absorbed into the number —
                      Arabic-Indic ZERO is itself a raised dot. */}
                  <Dot />
                  <span className="tabular-nums">{t("healthyCount")}</span>
                </span>
                <span className={`h-px flex-1 border-t ${DIVIDE}`} />
              </div>
            )}

            <div className={`relative grid border-t ${DIVIDE} ${ROW_COLS} py-2.5 ps-3`}>
              {/* The attention rail. `start-0` + `rounded-e-full` puts it on
                  the row's leading edge in both locales, and the row's `ps-3`
                  is the space it sits in — so a healthy row, which has no rail
                  at all, still lines up with the ones that do. */}
              {row.rail && (
                <span
                  className={`absolute start-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-e-full ${TONE[row.rail].dot}`}
                />
              )}

              {/* Booking — service mark, reference, and when it landed. */}
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-ts-purple/10 text-ts-purple-text">
                  <Glyph className="size-3.5">{row.glyph}</Glyph>
                </span>
                <div className="flex min-w-0 flex-col gap-0.5">
                  {/* ⚠️ Pinned LTR. A reference mixes Latin letters and digits
                      around a hyphen, and in an Arabic paragraph that hyphen
                      resolves to the paragraph direction — which can move it,
                      and a record locator a customer reads back over the phone
                      is one of the few strings on this page that must be
                      character-for-character right. */}
                  <span
                    dir="ltr"
                    className="truncate font-mono text-[11px] font-semibold text-zinc-300"
                  >
                    {row.reference}
                  </span>
                  <span className="flex min-w-0 items-center gap-1.5 whitespace-nowrap text-[10.5px] text-zinc-500">
                    <span className="truncate">{row.date}</span>
                    <Dot />
                    <span dir="ltr" className="shrink-0 tabular-nums">
                      {row.time}
                    </span>
                  </span>
                </div>
              </div>

              {/* Details — dropped below `md`, exactly as the real table
                  drops it (`hideBelow: "md"`). */}
              <div className="hidden min-w-0 flex-col gap-0.5 md:flex">
                <span className="min-w-0 text-[12px] text-zinc-300">{row.detail}</span>
                <span
                  className={`min-w-0 truncate text-[11px] ${
                    row.subTone ? "text-red-300" : "text-zinc-500"
                  }`}
                >
                  {row.sub}
                </span>
              </div>

              {/* Status + Total.
                  ⚠️ `md:contents` is what makes ONE piece of markup serve both
                  layouts: below `md` this wrapper is a real flex block holding
                  the two cells at the row's inline end, and from `md` it stops
                  generating a box at all, so its children become grid items in
                  their own right and land in columns three and four.

                  `flex-col-reverse`, not `flex-col`: the DOM order has to stay
                  status-then-total for the grid, while the stacked phone layout
                  wants the amount on top — which is where the real mobile card
                  puts it. */}
              <div className="flex min-w-0 flex-col-reverse items-end gap-1 md:contents">
                {/* Stacked rather than side by side: `Partially refunded` and
                    its Arabic `مُسترَد جزئيًا` are the widest things in the
                    table, and a wrapping pair would change the row's height
                    from row to row. */}
                <div className="flex min-w-0 flex-col items-end gap-1 md:items-start">
                  <Badge tone={row.status.tone}>{row.status.label}</Badge>
                  <Badge tone={row.payment.tone}>{row.payment.label}</Badge>
                </div>

                {/* Total. `dir="ltr"` on the figure itself, the same rule every
                    sibling slice applies: a currency sign is a bidi terminator,
                    and pinning the run removes any doubt about which side of
                    the digits it lands on in Arabic. `justify-self-end` binds
                    from `md`, where this is a grid item; below it the wrapper's
                    `items-end` does the same job. */}
                <span className="justify-self-end whitespace-nowrap text-[12.5px] font-semibold tabular-nums text-white">
                  <span dir="ltr">{row.total}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer chrome ──────────────────────────────────────────────────
          The console twin of the storefront slices' "48 fares · 12 airlines".
          Neither slot is decoration: the first is the whole reason this screen
          exists rather than six of them, and the second is the ordering — a
          feed, not a report you run. */}
      <div className={`flex flex-wrap items-center gap-2 border-t ${DIVIDE} px-3 py-2 sm:px-4`}>
        <span className="text-[10px] text-zinc-400">{t("footerServices")}</span>
        <Dot />
        <span className="text-[10px] text-zinc-400">{t("footerFeed")}</span>
      </div>
    </div>
  );
}
