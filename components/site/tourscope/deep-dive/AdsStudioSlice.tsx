"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { DIVIDE, Dot, SHEET } from "@/components/site/tourscope/slice-primitives";

/**
 * The operator console's AdsView, coded — the marketplace section's product
 * view, the fifth drawing on this page taken from the console rather than the
 * storefront, and the last frame in the deep-dive region.
 *
 * ── What this is a drawing OF ───────────────────────────────────────────────
 * A structural miniature of the console's real
 * `app/(dashboard)/marketplace/ads/page.tsx` — its KPI strip, its `line`-variant
 * format tabs with count pills, its format-spec banner and its `AdCard` rows —
 * beside `_components/storefront-preview.tsx`, the in-console browser mock that
 * shows where a placement actually lands. `_components/ads-data.ts` supplies the
 * vocabulary (the `vertical` format's own `660 × 3240` recommendation and its
 * `220 / 1080` aspect, the `active` / `scheduled` status pair) and
 * `_components/ad-creative.tsx` the two states of a creative thumb: the image,
 * and the image-plus placeholder that stands in for one not yet uploaded.
 *
 * ── Why THIS screen closes the region ──────────────────────────────────────
 * It is the only console screen that draws the STOREFRONT inside itself. Every
 * other frame on this page is one or the other — five storefront slices, four
 * console slices — and the section's claim is precisely that the two are one
 * product: the console publishes the shop. A frame that carries a console pane
 * and a live picture of the shop it feeds makes that argument in one glance,
 * which no amount of section copy does.
 *
 * ── What was DROPPED, and why ──────────────────────────────────────────────
 * The real page has a full-width SERVING CONTROLS card between the KPI strip and
 * the two-column body — a master ads on/off switch, a Save button, and four
 * toggle rows (rotate shared, lazy load, hide for members, frequency cap). It is
 * not drawn here. It is a settings panel: eight controls whose entire meaning is
 * in their labels, so at this scale it would be a band of grey lozenges that
 * says "there are settings" and nothing else, while pushing the two things the
 * section is actually about — the placements and the preview — below the frame's
 * comfortable height. The FACT it carries (that serving is governed, not just
 * uploaded) is in the ledger's row 03 instead, where it costs one clause.
 *
 * The real KPI strip is FIVE tiles; three are drawn. Clicks and estimated
 * revenue are dropped for the reason `formatCompact` makes obvious — clicks is
 * the numerator of the CTR tile beside it, and revenue is derived from clicks
 * against a hard-coded CPC constant (`EST_CPC = 0.42`), i.e. a modelled figure
 * rather than a measured one, which is not a claim this page should make in a
 * frame captioned as the real product.
 *
 * ── The console medium (§0b — the convention P16 set) ───────────────────────
 * The real screen is a LIGHT-mode dashboard; only its STRUCTURE is copied, with
 * every light tone re-expressed in this page's dark palette by `TONE` below.
 * That table is COPIED VERBATIM from `LiveBookingsSlice` / `CharterInventorySlice`
 * / `ProfitSlice` / `SupportInboxSlice` rather than derived again here, and
 * deliberately keeps arms this slice never uses: the console's status system is
 * eight semantic hues, and five console slices that each map only the hues they
 * happen to need are five tables that drift the first time a sixth slice needs a
 * hue they disagree about.
 *
 * ⚠️ The storefront preview is the one place the medium inverts twice. The real
 * mock forces `data-theme="light"` on itself — it is a picture of the LIGHT
 * customer storefront sitting inside a dashboard that may be dark — so a
 * faithful port would be a white card inside our dark frame. It is drawn dark
 * instead, for the reason the whole medium exists: every storefront on this page
 * (the flight, hotel, group, visa and eSIM slices above) is drawn dark, and one
 * white rectangle here would read as a rendering fault rather than as a fidelity
 * choice. What survives the inversion is the STRUCTURE, which is the part that
 * carries the claim: chrome bar, results column, rail pinned to the trailing
 * edge.
 *
 * ── The four slice rules (same contract as `ProductSlices.tsx`) ─────────────
 * 1. Every WORD comes from `messages` (`TourScope.deepDive.marketplace.slice`).
 *    The literals are the figures that are identical in both locales and are
 *    read as a single left-to-right run: the compact impression count `421.9k`,
 *    the CTR `2.14%`, and the creative's recommended size `660 × 3240px`. Each
 *    is pinned `dir="ltr"`.
 *
 *    Everything else is a message, and its numerals follow the sibling slices: a
 *    figure that reads as PROSE takes the locale's own digits — the active-ads
 *    count (`4` → `٤`), the tab counts (`2` / `1` → `٢` / `١`), the KPI hints
 *    (`2 scheduled · 1 paused` → `٢ مجدول · ١ متوقف`, `all placements · 30d` →
 *    `كل المواضع · ٣٠ يوماً`) and the scheduled ad's start date (`Starts 20 Oct`
 *    → `يبدأ ٢٠ تشرين الأول`, the same month name the bookings feed prints).
 *
 *    ⚠️ The ad row's stats line is the one string here that interleaves Latin
 *    tokens with translated words, and it carries TWO of them rather than one.
 *    Both ride an `<n>` tag rather than sitting bare in the message, for the
 *    reason P18 measured on its margin hint and P19 on its bubbles: `%` and `k`
 *    are bidi-neutral trailing characters, so in an Arabic run a bare `2.8%`
 *    resolves with the sign on the far side of its digits. Islanding each token
 *    SEPARATELY (rather than wrapping the whole line) is what lets the Arabic
 *    words between them stay right-to-left while each figure stays a contiguous
 *    left-to-right block — and the tag is present in BOTH locale files, so a
 *    translator can move either token inside the sentence without touching this
 *    file.
 *
 *    Status labels are taken verbatim from the console's own
 *    `marketplace.ads.status_*` dictionary in both locales, so the badge here
 *    and the badge on the real row cannot drift apart.
 * 2. The root is `aria-hidden` — the section copy beside it carries the meaning
 *    — so nothing inside is focusable. The real tabs are Base UI `<TabsTrigger>`
 *    buttons, the real row's name opens an editor dialog, and the real toggle is
 *    a `<Switch>` that pauses a live placement; here every one of them is a
 *    `span` or a `div`. The switches in particular are DRAWN — a track with a
 *    knob parked at one end — because a focusable control inside a decorative
 *    frame is a tab stop that goes nowhere.
 * 3. Logical properties only, so it mirrors under `dir="rtl"` unaided. The
 *    header CTA and the row switches are `ms-auto`; the tab underline is
 *    `inset-x-0` under its own tab; the switch knob is `start-[3px]` /
 *    `end-[3px]`, which is exactly how the real `Switch` behaves (its thumb
 *    carries an explicit `rtl:` translate rule to achieve what a logical inset
 *    gives for free); and the preview's rail is the LAST flex item, so it lands
 *    on the mock's trailing edge — right in LTR, left in RTL — which is the real
 *    storefront's own placement and the thing its caption promises.
 *
 *    ⚠️ Every `dir="ltr"` here sits on a LEAF inline span that carries no
 *    logical margin or padding. `margin-inline-start` resolves against the
 *    element's OWN direction, so pinning a span that also carries `ms-`/`ps-`
 *    silently turns that spacing into a physical left margin inside an RTL row.
 * 4. No motion at all. The real page count-ups its KPI figures on mount and
 *    slides an indicator between tabs; a still drawing of a settled number is
 *    the number, and the entrance belongs to the `FadeIn` the caller wraps this
 *    in.
 *
 * ── The photograph ─────────────────────────────────────────────────────────
 * `public/tourscope/ad-rail-cappadocia.webp` — a 220×1080 crop of Unsplash
 * photo-1641128324972, under the Unsplash License (free for commercial use, no
 * attribution required). The same photograph the visas slice uses for its
 * Türkiye destination card, cropped to the vertical rail's own `220 / 1080`
 * aspect so the creative in the row's thumb and the creative in the preview are
 * literally the same file at two sizes — which is the point of the preview.
 */

/* ── Tone map (§0b) ─────────────────────────────────────────────────────────
   Copied verbatim from `LiveBookingsSlice` — see the module note above for why
   it is copied rather than re-derived.

   `pill` is the badge surface (tint + text + ring colour — the element supplies
   `ring-1 ring-inset`), `dot` the badge's solid status dot, `chip` a tile's or a
   row's icon square.

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
 * A KPI tile's uppercase label. Three tiles rather than the bookings slice's
 * five, so the label has ~110px at its tightest and the real tile's own 10.5px
 * reads at every step without a size ladder — the same call `ProfitSlice` makes
 * for the same reason. `truncate` is the backstop.
 *
 * `uppercase` is a no-op in Arabic, which is correct — the tracking carries the
 * chrome register there.
 */
const TILE_LABEL =
  "min-w-0 truncate text-[10px] font-semibold uppercase tracking-wider text-zinc-500";

/* ── Glyphs ─────────────────────────────────────────────────────────────────
   The real screen draws lucide icons — `Megaphone`, `Eye` and `Percent` on the
   KPI tiles, `Plus` on the New-ad button, `RectangleVertical` on the format-spec
   banner, and `ImagePlus` inside `AdCreative` when no creative has been
   uploaded. This site's icon set is Phosphor, whose equivalents differ enough in
   weight and construction to be visibly a different family, so rather than
   substitute symbols into a drawing whose whole claim is fidelity, they are
   inlined here with lucide's own geometry (lucide-react, ISC): same 24-unit
   viewBox, same round caps and joins, same 2-unit stroke.

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
 * ⚠️ No `rtl:rotate-180`. A megaphone points somewhere, but the real console
 * does not flip it, and neither does any other icon in this family: a mirrored
 * megaphone reads as a different object rather than as the same one facing the
 * other way. The GLYPH stays put; what mirrors is the tile it sits in.
 */
const MegaphoneGlyph = (
  <>
    <path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
    <path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14" />
    <path d="M8 6v8" />
  </>
);

const EyeGlyph = (
  <>
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </>
);

const PercentGlyph = (
  <>
    <line x1="19" x2="5" y1="5" y2="19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </>
);

const PlusGlyph = (
  <>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </>
);

/** The `vertical` format's own mark — a portrait rectangle, which IS the spec. */
const RectangleVerticalGlyph = <rect width="12" height="20" x="6" y="2" rx="2" />;

const ImagePlusGlyph = (
  <>
    <path d="M16 5h6" />
    <path d="M19 2v6" />
    <path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    <circle cx="9" cy="9" r="2" />
  </>
);

/**
 * The console's `StatusBadge`, at this frame's scale — solid dot, tinted pill,
 * hairline inset ring, 11px semibold, `ps-1.5 pe-2`. Character for character the
 * real primitive's own class list, with `TONE` supplying the colours, and
 * identical to the four sibling console slices' copies so the five frames carry
 * one badge rather than five.
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

/**
 * The real `CountPill` beside a tab label — a rounded-full count that goes brand
 * on the ACTIVE tab and stays neutral on the rest (`in-data-[active]:` in the
 * real component, resolved here by the caller because these tabs have no state).
 */
function CountPill({ active, children }: { active?: boolean; children: ReactNode }) {
  return (
    <span
      className={`shrink-0 rounded-full px-1.5 text-[10px] font-semibold leading-[1.35] tabular-nums ${
        active ? "bg-ts-purple/15 text-ts-purple-text" : "bg-white/[0.06] text-zinc-500"
      }`}
    >
      {children}
    </span>
  );
}

/**
 * The row's on/off `Switch`, DRAWN — a track with the knob parked at one end.
 *
 * `start-[3px]` / `end-[3px]` rather than a translate: the real thumb needs an
 * explicit `rtl:-translate-x-…` rule to sit on the trailing edge under RTL,
 * and a logical inset gives the same result with no second rule. The ON track
 * takes `bg-emerald-400/80` — a FILLED surface carrying a white knob, so what is
 * read is the knob against the fill rather than the fill against the page.
 */
function Switch({ on }: { on: boolean }) {
  return (
    <span
      className={`relative block h-4 w-7 shrink-0 rounded-full ${
        on ? "bg-emerald-400/80" : "bg-white/[0.10]"
      }`}
    >
      <span
        className={`absolute top-1/2 block size-2.5 -translate-y-1/2 rounded-full bg-white ${
          on ? "end-[3px]" : "start-[3px]"
        }`}
      />
    </span>
  );
}

/**
 * A Latin token inside translated prose, as a `dir="ltr"` island.
 *
 * A module-level constant rather than an inline object literal, so the two
 * tokens on the stats line cannot drift into two slightly different islands —
 * the same reason `ProfitSlice` holds its `PCT_ISLAND` and `SupportInboxSlice`
 * its `LTR_ISLAND` at module scope. The span carries `tabular-nums` and
 * `whitespace-nowrap` and NOTHING logical, which is what makes pinning it safe.
 *
 * ⚠️ What the tag wraps is decided in the message files and is load-bearing: it
 * must contain the trailing unit (`k`, `%`) as well as the digits, or the unit
 * is left outside the island to be reordered on its own. See the module note.
 */
const NUM_ISLAND = {
  n: (chunks: ReactNode) => (
    <span dir="ltr" className="whitespace-nowrap tabular-nums">
      {chunks}
    </span>
  ),
};

interface Tile {
  label: string;
  value: ReactNode;
  hint: string;
  /**
   * The second half of a two-part hint, drawn after a `Dot`.
   *
   * ⚠️ TWO messages and a drawn dot, never one string with a `·` in it — and
   * this is the `Dot` primitive's own reason for existing, measured on this
   * frame. Arabic-Indic ZERO (`٠`) IS a raised dot, so a middot printed beside
   * an Arabic-Indic numeral is silently absorbed into it: `· ١ متوقف` rendered
   * as `١٠ متوقف` ("10 paused") and `· ٣٠ يوماً` as `٣٠٠ يوماً` ("300 days").
   * Both are wrong FACTS on a frame whose whole claim is that it is the real
   * product — and neither is visible in the DOM text, which still reads `·`.
   *
   * The CTR tile has no second half (`clicks ÷ impressions` is one clause), so
   * the field is optional and the dot is drawn only where there are two things
   * to separate.
   */
  hint2?: string;
  glyph: ReactNode;
  tone: ConsoleTone;
}

interface AdRow {
  /** The row's React key — and, for row 1, the creative's own file. */
  key: string;
  /** `null` is the real `AdCreative`'s no-image branch, not an oversight. */
  photo: string | null;
  name: string;
  status: { label: string; tone: ConsoleTone };
  /** The 11px sub-line: measured stats, or a campaign window not yet open. */
  sub: ReactNode;
  /** The quick-action toggle's state — i.e. whether this placement is serving. */
  on: boolean;
}

export function AdsStudioSlice() {
  const t = useTranslations("TourScope.deepDive.marketplace.slice");

  /* Three of the real strip's five. Clicks and estimated revenue are dropped —
     see the module note. */
  const tiles: Tile[] = [
    {
      label: t("kpiActive"),
      value: t("kpiActiveValue"),
      hint: t("kpiActiveHintA"),
      hint2: t("kpiActiveHintB"),
      glyph: MegaphoneGlyph,
      tone: "success",
    },
    {
      label: t("kpiImpr"),
      /* A LITERAL: `formatCompact`'s own output, identical in both locales and
         read as one left-to-right run, so it is pinned rather than translated. */
      value: <span dir="ltr">421.9k</span>,
      hint: t("kpiImprHintA"),
      hint2: t("kpiImprHintB"),
      glyph: EyeGlyph,
      tone: "info",
    },
    {
      label: t("kpiCtr"),
      value: <span dir="ltr">2.14%</span>,
      hint: t("kpiCtrHint"),
      glyph: PercentGlyph,
      tone: "warning",
    },
  ];

  const ads: AdRow[] = [
    {
      key: "cappadocia",
      photo: "/tourscope/ad-rail-cappadocia.webp",
      name: t("ad1Name"),
      status: { label: t("ad1Status"), tone: "success" },
      sub: t.rich("ad1Stats", NUM_ISLAND),
      on: true,
    },
    {
      key: "istanbul",
      photo: null,
      name: t("ad2Name"),
      status: { label: t("ad2Status"), tone: "info" },
      sub: t("ad2Starts"),
      on: false,
    },
  ];

  return (
    <div aria-hidden="true" className={`select-none text-zinc-300 antialiased ${SHEET}`}>
      {/* ── A. Page head ───────────────────────────────────────────────────
          The screen's own product name — `AdsView` in both locale files, because
          it is what the console calls it in both — and the one action the header
          carries. Drawn as a ghost button rather than the real filled primary:
          a solid brand button is the loudest thing on a frame whose subject is
          the two panes below it, and every sibling console slice keeps its
          header chrome quiet for the same reason. */}
      <div
        className={`flex flex-wrap items-center gap-x-2.5 gap-y-1.5 border-b ${DIVIDE} px-3 py-2.5 sm:px-4`}
      >
        <span className="text-[12.5px] font-bold text-white">{t("title")}</span>
        <span className="ms-auto inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-white/15 px-2 py-[2px] text-[10px] font-semibold text-zinc-300">
          <Glyph className="size-2.5">{PlusGlyph}</Glyph>
          {t("newAd")}
        </span>
      </div>

      {/* ── B. KPI strip ───────────────────────────────────────────────────
          Three across from `sm`, stacked on a phone — `ProfitSlice`'s own
          shape, and for the reason it gives: three tiles across a 390px frame
          leave each ~103px, of which the HINT gets ~85. Measured there, every
          hint on this strip truncated to a stub (`٢ مج… • ١ مت…`,
          `كل الم… • ٣٠ …`), and three destroyed captions in a row read as a
          rendering fault rather than as a compressed layout. Stacking costs
          ~115px of height and returns all three to full text.

          (The real page goes `grid-cols-2 lg:grid-cols-5` for the same reason —
          it never shows five across a phone either.) */}
      <div className={`border-b ${DIVIDE} px-3 py-2.5 sm:px-4`}>
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
                  `valueTone`, and the ads page has none. So the emerald, the sky
                  and the amber live in the 20px squares, which is where the real
                  screen puts them. */}
              <span className="text-xl font-bold leading-none tracking-tight tabular-nums text-white">
                {tile.value}
              </span>
              {/* A flex row with a DRAWN dot, not a `·` inside one string —
                  see `Tile.hint2`. `overflow-hidden whitespace-nowrap` keeps
                  the two halves on one line and lets them clip at the narrowest
                  tile widths, which is the sibling slices' own backstop. */}
              <span className="flex min-w-0 items-center gap-1.5 overflow-hidden whitespace-nowrap text-[11px] text-zinc-500">
                <span className="min-w-0 truncate">{tile.hint}</span>
                {tile.hint2 && (
                  <>
                    <Dot />
                    <span className="min-w-0 truncate">{tile.hint2}</span>
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── C. Management + preview ────────────────────────────────────────
          The real page's own two-column body, at its own proportions. It stacks
          below `lg` with the PREVIEW second, which is the reading order the
          content wants on a phone: the placements are the subject and the mock
          is the evidence, so the evidence follows the claim rather than
          preceding it. (The real page's `xl:sticky` on the preview column is
          dropped — a drawing does not scroll.) */}
      <div className="px-3 py-3 sm:px-4">
        <div className="gap-4 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          {/* ── C1. Left: tabs, spec, rows ──────────────────────────────── */}
          <div className="flex min-w-0 flex-col gap-3">
            {/* The `line`-variant tab strip: a flat hairline rail with the
                active tab underlined. The real list draws a SLIDING indicator
                fed the active tab's box by Base UI; a still frame has one
                position to draw, so the bar sits under its own tab as an
                `inset-x-0` child — which also means it mirrors for free. */}
            <div className={`flex items-end gap-1.5 border-b ${DIVIDE}`}>
              {[
                { label: t("tabVertical"), count: t("tabVerticalCount"), active: true },
                { label: t("tabBanner"), count: t("tabBannerCount") },
                { label: t("tabCommission"), count: t("tabCommissionCount") },
              ].map((tab) => (
                <span
                  key={tab.label}
                  className={`relative flex min-w-0 items-center gap-1.5 whitespace-nowrap rounded-t-lg px-2 pb-2 pt-1.5 text-[11px] font-semibold ${
                    tab.active ? "bg-ts-purple/10 text-white" : "text-zinc-500"
                  }`}
                >
                  <span className="min-w-0 truncate">{tab.label}</span>
                  <CountPill active={tab.active}>{tab.count}</CountPill>
                  {/* ⚠️ `ts-purple-text`, not `ts-purple`. This is a 2px hairline
                      sitting on the frame's own ground, and the lighter of the
                      pair is the one that survives at that width — the same rule
                      the rail indicator and the unread dot follow, and the
                      inverse of the FILLED count pill above, which reads its
                      white glyphs against the fill. */}
                  {tab.active && (
                    <span className="absolute inset-x-0 -bottom-px block h-[2px] rounded-full bg-ts-purple-text" />
                  )}
                </span>
              ))}
            </div>

            {/* The format-spec banner. Its whole job on the real screen is to
                answer "what am I uploading?" before the operator opens the
                editor, so the dimension chip is the payload and the blurb is the
                caption — which is why the chip is monospace and the blurb is
                not. */}
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/[0.06] text-zinc-400">
                <Glyph className="size-4">{RectangleVerticalGlyph}</Glyph>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-[12px] font-semibold text-white">{t("specLabel")}</span>
                  {/* A LITERAL — `FORMAT_SPECS.vertical.recommended` plus the
                      real markup's own trailing `px`. Identical in both locales
                      and read as one left-to-right run, so it is pinned. */}
                  <span
                    dir="ltr"
                    className="shrink-0 rounded bg-white/[0.06] px-1.5 py-[1px] font-mono text-[10px] tabular-nums text-zinc-300"
                  >
                    660 × 3240px
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-zinc-500">{t("specBlurb")}</p>
              </div>
            </div>

            {/* The `AdCard` rows. Two, which is the count the active tab's own
                pill claims — the strip and the list agree, as they do on the
                real screen. */}
            {ads.map((ad) => (
              <div
                key={ad.key}
                className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-2.5"
              >
                {/* The creative thumb, at the real card's own `vertical`
                    dimensions (`h-12 w-[26px]`) — which is the format's 220:1080
                    aspect, so the thumb is a true miniature of what ships rather
                    than a square crop of it. */}
                <span className="relative block h-12 w-[26px] shrink-0 overflow-hidden rounded-md border border-white/10 bg-white/[0.05]">
                  {ad.photo ? (
                    <Image
                      src={ad.photo}
                      alt=""
                      fill
                      sizes="26px"
                      className="object-cover"
                    />
                  ) : (
                    /* `AdCreative`'s own null branch: a placeholder that says
                       "no creative uploaded yet", which is exactly what a
                       scheduled-but-unstarted campaign looks like in the real
                       list. */
                    <span className="grid h-full w-full place-items-center text-zinc-600">
                      <Glyph className="size-3.5">{ImagePlusGlyph}</Glyph>
                    </span>
                  )}
                </span>

                <div className="flex min-w-0 flex-1 flex-col gap-y-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="min-w-0 truncate text-[13px] font-semibold text-white">
                      {ad.name}
                    </span>
                    <Badge tone={ad.status.tone}>{ad.status.label}</Badge>
                  </div>
                  <span className="truncate text-[11px] text-zinc-500">{ad.sub}</span>
                </div>

                <span className="ms-auto flex shrink-0 items-center">
                  <Switch on={ad.on} />
                </span>
              </div>
            ))}
          </div>

          {/* ── C2. Right: the storefront preview ───────────────────────── */}
          <div className="mt-4 flex min-w-0 flex-col gap-2 lg:mt-0">
            <div className="flex items-center gap-2">
              <span className="min-w-0 truncate text-[12px] font-medium text-zinc-300">
                {t("previewTitle")}
              </span>
              <span className="ms-auto shrink-0 text-[11px] text-zinc-500">
                {t("previewFormat")}
              </span>
            </div>

            {/* The browser mock. Dark rather than the real component's forced
                `data-theme="light"` — see the module note on why the medium
                inverts here. */}
            <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02]">
              {/* Chrome bar. Three dots and nothing else: the real bar also
                  carries a URL pill reading `yourstore.com/hotels`, and a
                  hostname is the one thing on this frame that is neither the
                  operator's nor ours to invent. */}
              <div className={`flex items-center gap-1 border-b ${DIVIDE} px-2.5 py-1.5`}>
                <span className="block size-1.5 rounded-full bg-white/15" />
                <span className="block size-1.5 rounded-full bg-white/15" />
                <span className="block size-1.5 rounded-full bg-white/15" />
              </div>

              {/* Page body — the results column and the rail, exactly as the
                  real `vertical` branch composes them. */}
              <div className="flex gap-2 p-2.5">
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  {/* `FauxCard` ×5, stop for stop and count for count: a square
                      thumb, two bars of differing widths, and a price block at
                      the trailing end. Five is the real `vertical` branch's own
                      number, and it is what makes the rail beside it read as a
                      rail rather than as a banner — see the clamp note. */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-md border border-white/[0.05] bg-white/[0.03] p-1.5"
                    >
                      <span className="block size-8 shrink-0 rounded bg-white/[0.08]" />
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="block h-1.5 w-2/3 rounded-full bg-white/[0.08]" />
                        <span className="block h-1.5 w-1/3 rounded-full bg-white/[0.08]" />
                      </span>
                      {/* The price. `ts-purple/25` is the real mock's own
                          `bg-primary/20` — a solid block standing in for a
                          figure, which is what makes the card read as a RESULT
                          rather than as a generic list row. */}
                      <span className="block h-3 w-6 shrink-0 rounded bg-ts-purple/25" />
                    </div>
                  ))}
                </div>

                {/* The rail. LAST flex item, so it lands on the mock's trailing
                    edge — right in LTR, left in RTL — which is where the real
                    storefront pins it and what the caption underneath promises.
                    No `end-`/`start-` anywhere: source order is the whole rule. */}
                <div className="relative w-[26%] shrink-0">
                  {/* ⚠️ CROPPED to the results column, and the crop is the real
                      `Rail`'s own (`max-h-… overflow-hidden` wrapped around a
                      `220 / 1080` box) rather than a fudge. A skyscraper is
                      ~4.9× taller than it is wide, so drawn at its true aspect
                      beside a five-card column it stands about three times their
                      height — which is what a real one IS, and why the
                      storefront crops it to the column instead of stretching the
                      page to fit. Drawn uncropped, this mock rendered a ~200px
                      void beside the creative and read as a broken layout.

                      The frame is `absolute inset-0` rather than a `max-h-[…]`
                      literal, which is what makes it exact and keeps it exact:
                      out of flow, the rail contributes nothing to the row's
                      height, so the flex line is sized by the CARD COLUMN and
                      the stretched rail then matches it to the pixel — at every
                      frame width, and after any later change to the cards'
                      padding or count. A hard-coded clamp is the same value
                      until somebody edits a card, and then it is silently 10px
                      out (measured: 244 assumed vs 254 actual, the difference
                      being the cards' own hairline borders). */}
                  <span className="absolute inset-0 overflow-hidden rounded-md border border-white/10 bg-[#2d414e]">
                    <span className="relative block" style={{ aspectRatio: "220 / 1080" }}>
                      <Image
                        src="/tourscope/ad-rail-cappadocia.webp"
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 96px, 88px"
                        className="object-cover"
                      />
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[10.5px] leading-relaxed text-zinc-500">{t("previewNote")}</p>
          </div>
        </div>
      </div>

      {/* ── Footer chrome ──────────────────────────────────────────────────
          The console twin of the storefront slices' "48 fares · 12 airlines".
          The first slot names the five storefront surfaces this section's copy
          claims and the frame has room to draw only one of; the second is the
          claim they have in common — and the one the whole region has been
          building toward, which is why it is the last line inside the last
          frame. */}
      <div className={`flex flex-wrap items-center gap-2 border-t ${DIVIDE} px-3 py-2 sm:px-4`}>
        <span className="text-[10px] text-zinc-400">{t("footerStack")}</span>
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
