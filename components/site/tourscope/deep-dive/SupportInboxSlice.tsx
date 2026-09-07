"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { DIVIDE, Dot, SHEET } from "@/components/site/tourscope/slice-primitives";

/**
 * The operator console's support INBOX, coded — the support section's product
 * view, and the fourth drawing on this page taken from the console rather than
 * the storefront.
 *
 * ── What this is a drawing OF ───────────────────────────────────────────────
 * A structural miniature of the console's real
 * `app/(dashboard)/support/_components/inbox/support-inbox-shell.tsx` and the
 * two panes it frames — `conversation-list.tsx` (queue switcher, one-row filter
 * bar, rows) and `conversation-pane.tsx` (header, meta chips, thread) — with
 * `conversation-row.tsx` supplying the row anatomy and `inbox-atoms.tsx` the
 * avatar and the CSAT chip.
 *
 * The real screen is a MESSENGER, and that is the whole claim: a list of
 * conversations beside the conversation itself, with the booking's own
 * references printed on both. So the shell is reproduced as the real one is
 * built — a `p-2 sm:p-3` gutter around a `rounded-2xl` hairline shell, with the
 * panes divided by a logical `border-e` rather than a gap — because a support
 * queue drawn as a table would be a drawing of a different product.
 *
 * ── Why TWO panes and not three ────────────────────────────────────────────
 * The real shell is list · conversation · CONTEXT, and the third pane is
 * dropped here. It is the only one the product itself drops: it is `hidden …
 * xl:flex` on the real screen and becomes a drawer below that, so on anything
 * narrower than a wide monitor the product shows exactly the two panes drawn
 * here. This frame is ~950px at its widest — narrower than the breakpoint at
 * which the real context pane appears at all — so drawing it would be drawing a
 * layout the product does not use at this width.
 *
 * It also costs the section nothing. The context pane holds the booking
 * dossier: the same PNR, money and timeline the fact ledger claims in words and
 * the bookings section two frames above already draws in full. What the frame
 * has that the ledger cannot is the CONVERSATION, so the conversation gets the
 * space.
 *
 * ── The console medium (§0b — the convention P16 set) ───────────────────────
 * The real screen is a LIGHT-mode dashboard; only its STRUCTURE is copied, with
 * every light tone re-expressed in this page's dark palette by `TONE` below.
 * That table is COPIED VERBATIM from `LiveBookingsSlice` / `CharterInventorySlice`
 * / `ProfitSlice` rather than derived again here, and deliberately keeps arms
 * this slice never uses: the console's status system is eight semantic hues, and
 * four console slices that each map only the hues they happen to need are four
 * tables that drift the first time a fifth slice needs a hue they disagree
 * about.
 *
 * ⚠️ The console draws TWO KINDS of pill and this frame carries both, so the
 * difference has to survive the port. A `StatusBadge` is dot + tint + inset
 * RING (`components/ui/status-badge.tsx`); a `PriorityPill` / `SlaPill` /
 * `DeptChip` / `CsatChip` is a SOFT pill — tint and text, no dot, no ring
 * (`SOFT_TONE` in `support-atoms.tsx`). Collapsing them into one pill would
 * flatten the header's chip row into four identical lozenges, when the real
 * screen's reading is "one of these is the ticket's STATE and the rest are
 * facts about it".
 *
 * That is why `Soft` below reuses `TONE[tone].pill` and simply omits
 * `ring-1 ring-inset`: the ring COLOUR class is inert without a ring width, so
 * one tone table serves both pill families and the two cannot drift apart.
 *
 * ── The four slice rules (same contract as `ProductSlices.tsx`) ─────────────
 * 1. Every WORD comes from `messages` (`TourScope.deepDive.support.slice`). The
 *    literals are the REFERENCES — `TKT-4F2A91`, `FL-8C21F4`, `VS-7A3F09`,
 *    `HT-2F9A31` — the clock time `09:40` and the money `$35.00` / `$35`: the
 *    same family every sibling slice fixed. A record locator is a code a
 *    customer reads back over the phone, and a fare difference is a figure they
 *    reconcile against a card statement, so both are identical in both locales
 *    and both are pinned `dir="ltr"`.
 *
 *    Everything a person WROTE is a message, and its numerals follow the sibling
 *    slices: a figure that reads as PROSE takes the locale's own digits — the
 *    queue counts (`3` → `٣`), the CSAT score (`5` → `٥`), the relative ages
 *    (`4m` → `٤ د`, `1h` → `١ س`, `2d` → `يومان`) and the SLA countdown
 *    (`2h 10m` → `٢ س ١٠ د`).
 *
 *    ⚠️ The two MESSAGE BUBBLES are the only prose on this page that carries a
 *    Latin token inside a translated sentence, and both tokens ride a `<ltr>`
 *    tag rather than sitting bare in the string. The reason is the one P18
 *    measured on its margin hint: a `$` is a bidi ET, so in an Arabic paragraph
 *    a bare `$35` resolves with the sign on the far side of its digits — and
 *    `$35` in the bubble beside `$35.00` on the charge card immediately under
 *    it, with the sign on opposite sides, reads as two different amounts.
 *    Wrapping the WHOLE token (sign included) makes the island the entire run,
 *    so it renders as the same contiguous left-to-right block the product
 *    prints. The clock reading takes the same treatment for the same reason,
 *    and both tags are present in BOTH locale files so a translator can move
 *    the token inside the sentence without touching this file.
 *
 *    Status / priority / department LABELS are taken verbatim from the console's
 *    own `support.labels.*` dictionary in both locales, so the badge on the row
 *    and the badge in the header cannot drift apart between the two files.
 * 2. The root is `aria-hidden` — the section copy beside it carries the meaning
 *    — so nothing inside is focusable. The real queue tabs are `<Link>`s, the
 *    real rows are `<button>`s, the search is a live `<input>` bound to a URL
 *    query param, and Resolve / Pay are mutating buttons; here every one of them
 *    is a `span` or a `div`. The search bar in particular is a DRAWING of an
 *    input — static text where the placeholder would be — because a focusable
 *    field inside a decorative frame is a tab stop that goes nowhere.
 * 3. Logical properties only, so it mirrors under `dir="rtl"` unaided. The two
 *    panes are grid columns with a `border-e` between them; the active rail is
 *    `start-0`; the search glyph is `start-2.5` and its field `ps-8`; the row's
 *    handle is `ms-auto`; the badges are `ps-1.5 pe-2`; and the bubbles take
 *    `self-start` / `self-end`, which in a flex COLUMN resolve against the
 *    inline axis — so the customer's bubble sits on the reader's start and the
 *    agent's on their end in both locales, with no second rule.
 *
 *    ⚠️ Every `dir="ltr"` here sits on a LEAF inline span that carries no
 *    logical margin or padding. `margin-inline-start` resolves against the
 *    element's OWN direction, so pinning a span that also carries `ms-`/`ps-`
 *    silently turns that spacing into a physical left margin inside an RTL row.
 *    That is exactly why the row's handle nests a pinned span inside its
 *    `ms-auto` wrapper rather than carrying both on one element.
 * 4. No motion at all. The real list re-sorts live off a `support:ticket:changed`
 *    socket frame and its countdowns tick every second; a still drawing of a
 *    ticking clock is a clock, and the entrance belongs to the `FadeIn` the
 *    caller wraps this in.
 *
 * ── Why no images ──────────────────────────────────────────────────────────
 * There are none to draw. `InboxAvatar` is initials-or-brand-glyph BY DESIGN —
 * "no image source exists on the support payload today", says its own doc — so
 * a photograph here would be an invention, not a simplification. The service
 * glyph in the row's avatar slot is the real screen's own choice too: identity
 * is already the name on line 1, so the slot carries the one fact the name does
 * not, which is what the ticket is ABOUT.
 */

/* ── Tone map (§0b) ─────────────────────────────────────────────────────────
   Copied verbatim from `LiveBookingsSlice` — see the module note above for why
   it is copied rather than re-derived.

   `pill` is the badge surface (tint + text + ring colour — the element supplies
   `ring-1 ring-inset`, or omits it for a SOFT pill), `dot` the badge's solid
   status dot, `chip` the row's service square.

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

/* ── Glyphs ─────────────────────────────────────────────────────────────────
   The real screen draws lucide icons — `Plane` / `Stamp` / `BedDouble` as the
   per-service marks in the row's avatar slot, `Search` in the filter bar,
   `CheckCircle2` on Resolve, `Clock` on the SLA pill, `CreditCard` on the
   charge card and its Pay button, and `Star` in the CSAT chip. This site's icon
   set is Phosphor, whose equivalents differ enough in weight and construction
   to be visibly a different family, so rather than substitute symbols into a
   drawing whose whole claim is fidelity, they are inlined here with lucide's
   own geometry (lucide-react, ISC): same 24-unit viewBox, same round caps and
   joins, same 2-unit stroke.

   `aria-hidden` on every one — the whole slice is aria-hidden already, and each
   sits immediately beside the words it decorates. */
/**
 * ⚠️ ONE divergence from the sibling slices' identical copies of this helper,
 * and it is a prop rather than a class: `filled`. Every glyph on the three
 * console frames before this one is a stroked outline, but lucide's `Star` is
 * drawn FILLED in the real `CsatChip` (`className="size-2.5 fill-current"`) —
 * and an outlined star at 10px is a smudge with a hole in it rather than a
 * rating mark. So the flag swaps the paint mode; everything else is byte-
 * identical to the copies in `LiveBookingsSlice` and `ProfitSlice`.
 */
function Glyph({
  className = "size-3",
  filled = false,
  children,
}: {
  className?: string;
  filled?: boolean;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
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

/**
 * ⚠️ No `rtl:rotate-180`. A magnifier is an OBJECT, not a direction: the real
 * console does not flip it (its `Search` icon carries no RTL rule), and a
 * mirrored magnifier reads as a different tool rather than as the same one
 * pointing the other way. The GLYPH stays put; what mirrors is the field it
 * sits in, via `start-2.5` / `ps-8`.
 */
const SearchGlyph = (
  <>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </>
);

const CheckGlyph = (
  <>
    <path d="M21.801 10A10 10 0 1 1 17 3.335" />
    <path d="m9 11 3 3L22 4" />
  </>
);

const ClockGlyph = (
  <>
    <path d="M12 6v6l4 2" />
    <circle cx="12" cy="12" r="10" />
  </>
);

const CardGlyph = (
  <>
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <path d="M2 10h20" />
  </>
);

const StarGlyph = (
  <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
);

/**
 * The console's `StatusBadge`, at this frame's scale — solid dot, tinted pill,
 * hairline inset ring, 11px semibold, `ps-1.5 pe-2`. Character for character the
 * real primitive's own class list, with `TONE` supplying the colours, and
 * identical to the three sibling console slices' copies so the four frames carry
 * one badge rather than four.
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
 * The console's SOFT pill — `PriorityPill`, `DeptChip`, `SlaPill` and
 * `CsatChip` are all this shape: tint and text, no dot, no ring, `px-2 py-0.5`
 * at 10px semibold.
 *
 * It reuses `TONE[tone].pill` and omits `ring-1 ring-inset`, so the ring COLOUR
 * class in that string is inert and one tone table serves both pill families —
 * see the module note.
 *
 * ⚠️ `caps` is opt-in, and the split is the real components' own: `PriorityPill`
 * and `DeptChip` carry `uppercase tracking-wide`; `SlaPill` and `CsatChip` do
 * NOT. Applying it to all four turned a countdown into `2H 10M LEFT`, which is
 * both louder than the priority beside it — inverting the emphasis the real
 * chip row is built on — and a unit notation nobody writes. In Arabic
 * `uppercase` is a no-op, which is correct: the tracking carries the chrome
 * register there.
 */
function Soft({
  tone,
  caps = false,
  children,
  className = "",
}: {
  tone: ConsoleTone;
  caps?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        caps ? "uppercase tracking-wide" : ""
      } ${TONE[tone].pill} ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * A Latin token inside translated prose, as a `dir="ltr"` island — sign
 * included.
 *
 * A module-level constant rather than an inline object literal, so the two
 * bubbles cannot drift into two slightly different islands — the same reason
 * `ProfitSlice` holds its `PCT_ISLAND` at module scope. The span carries
 * `whitespace-nowrap` (a price must not break across a line inside a bubble)
 * and NOTHING logical, which is what makes pinning it safe.
 *
 * ⚠️ What the tag wraps is decided in the message files and is load-bearing:
 * the tag must contain the CURRENCY SIGN as well as the digits. See the module
 * note.
 */
const LTR_ISLAND = {
  ltr: (chunks: ReactNode) => (
    <span dir="ltr" className="whitespace-nowrap">
      {chunks}
    </span>
  ),
};

interface InboxRow {
  /** The booking / ticket handle — the row's React key and its mono end mark. */
  handle: string;
  glyph: ReactNode;
  /** The service tone: the real `SERVICE_META` chip, re-expressed by `TONE`. */
  service: ConsoleTone;
  name: string;
  age: string;
  subject: string;
  status: { label: string; tone: ConsoleTone };
  /** Rendered only when it SHOUTS — the real row's `high`/`urgent` gate. */
  priority?: string;
  /** Absent on a terminal ticket, exactly as the real row drops it. */
  sla?: string;
  /** Present only once the customer has rated, i.e. only when terminal. */
  csat?: string;
  /** The selected conversation: brand rail + row wash. */
  active?: boolean;
  /** The desk still owes this one an answer. */
  unread?: boolean;
}

export function SupportInboxSlice() {
  const t = useTranslations("TourScope.deepDive.support.slice");

  /* Three conversations across three services, using the same references the
     bookings feed two sections above already drew — so a reader meets
     `FL-8C21F4` as a booking there and as the ticket's own subject here. Ordered
     newest-first by last activity, which is the real list's default. */
  const rows: InboxRow[] = [
    {
      handle: "FL-8C21F4",
      glyph: PlaneGlyph,
      service: "info",
      name: t("r1Name"),
      age: t("r1Age"),
      subject: t("r1Subject"),
      status: { label: t("stOpen"), tone: "info" },
      priority: t("prHigh"),
      sla: t("r1Sla"),
      active: true,
      unread: true,
    },
    {
      handle: "VS-7A3F09",
      glyph: StampGlyph,
      service: "orange",
      name: t("r2Name"),
      age: t("r2Age"),
      subject: t("r2Subject"),
      status: { label: t("stPendingCustomer"), tone: "warning" },
    },
    {
      handle: "HT-2F9A31",
      glyph: BedGlyph,
      service: "teal",
      name: t("r3Name"),
      age: t("r3Age"),
      subject: t("r3Subject"),
      status: { label: t("stResolved"), tone: "success" },
      csat: t("r3Csat"),
    },
  ];

  return (
    <div aria-hidden="true" className={`select-none text-zinc-300 antialiased ${SHEET}`}>
      {/* The real shell's own gutter. The inbox is the one console screen that
          floats INSIDE its page rather than filling it (`p-2 sm:p-3` around a
          `rounded-2xl` card), and the gutter is what makes the two panes read
          as one window with a seam rather than as two stacked bands. */}
      <div className="p-2 sm:p-3">
        <div className={`overflow-hidden rounded-2xl border bg-white/[0.02] ${DIVIDE}`}>
          {/* ⚠️ Fractional tracks, not the real shell's fixed `w-[380px]` list.
              At a viewport width the fixed pane is a third of the screen; in a
              ~950px frame it is 40%, and below `md` it would be the whole
              thing. Fractions hold the proportion at every frame width and
              reverse for free under `dir="rtl"`, which a `flex` + fixed width
              would too — but only after a second rule for the divider. */}
          <div className="sm:grid sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            {/* ── A. LIST PANE ───────────────────────────────────────────
                The only pane on a phone. The real shell does exactly this
                collapse: below `md` the list is `flex` and the conversation
                `hidden`, because a messenger on a phone is one pane at a
                time. */}
            <div className={`flex min-w-0 flex-col sm:border-e ${DIVIDE}`}>
              {/* 1. Queue switcher. Two tabs, and the real component is
                     emphatic that there are only two: the escalations-to-
                     Tourscope queue is deliberately absent because it holds no
                     customers. The count discs are UNREAD counts, not totals —
                     which is why the idle tab has one at all. */}
              <div className="flex shrink-0 items-center gap-1 px-2 pt-2">
                <span className="flex-1 rounded-lg bg-ts-purple/15 px-2 py-1.5 text-center text-[12px] font-semibold text-white">
                  <span className="inline-flex items-center justify-center gap-1.5">
                    <span className="truncate">{t("tabCustomers")}</span>
                    {/* `bg-ts-purple` and not `ts-purple-text`: this is a
                        FILLED disc carrying white glyphs, so what is read is
                        the label's 7.7:1 against the fill, not the fill's own
                        edge against the page. The thin marks below — the 3px
                        rail and the 6px unread dot — take the lighter one for
                        the opposite reason. */}
                    <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-ts-purple px-1 text-[10px] font-bold leading-none tabular-nums text-white">
                      {t("tabCustomersCount")}
                    </span>
                  </span>
                </span>
                <span className="flex-1 rounded-lg px-2 py-1.5 text-center text-[12px] font-semibold text-zinc-500">
                  <span className="inline-flex items-center justify-center gap-1.5">
                    <span className="truncate">{t("tabSupplier")}</span>
                    <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-ts-purple/15 px-1 text-[10px] font-bold leading-none tabular-nums text-ts-purple-text">
                      {t("tabSupplierCount")}
                    </span>
                  </span>
                </span>
              </div>

              {/* 2. The filter bar's search field — DRAWN, not focusable (rule
                     2). The placeholder is the real screen's own string, and it
                     is the string that tells a reader what this box searches:
                     not just subjects, but the BOOKING and the PNR, which is
                     the section's whole claim in one line of chrome. */}
              <div className="shrink-0 px-3 pb-2 pt-2">
                <span
                  className={`relative flex h-8 items-center rounded-lg border bg-white/[0.04] ps-8 pe-3 ${DIVIDE}`}
                >
                  <Glyph className="absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500">
                    {SearchGlyph}
                  </Glyph>
                  <span className="min-w-0 truncate text-[12px] text-zinc-500">
                    {t("search")}
                  </span>
                </span>
              </div>

              {/* 3. The conversations. */}
              <div className="flex min-w-0 flex-col">
                {rows.map((row) => (
                  <div
                    key={row.handle}
                    className={`relative flex min-w-0 items-center gap-2.5 border-t px-3 py-2.5 ${DIVIDE} ${
                      row.active ? "bg-ts-purple/[0.06]" : ""
                    }`}
                  >
                    {/* The active rail. `start-0` puts it on the row's leading
                        edge in both locales; `rounded-full` and the 6px top /
                        bottom inset are the real component's own geometry. */}
                    {row.active && (
                      <span className="absolute bottom-1.5 start-0 top-1.5 w-[3px] rounded-full bg-ts-purple-text" />
                    )}

                    {/* The avatar slot, carrying the SERVICE rather than a
                        face — the real row's choice, and the reason this frame
                        needs no photography. */}
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-lg ${TONE[row.service].chip}`}
                    >
                      <Glyph className="size-4">{row.glyph}</Glyph>
                    </span>

                    <div className="flex min-w-0 flex-1 flex-col gap-y-0.5">
                      {/* Line 1 — who, and how long since anyone acted. */}
                      <div className="flex items-center gap-1.5">
                        {row.unread && (
                          <span className="size-1.5 shrink-0 rounded-full bg-ts-purple-text" />
                        )}
                        <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-white">
                          {row.name}
                        </span>
                        <span
                          className={`shrink-0 whitespace-nowrap text-[10.5px] tabular-nums ${
                            row.unread ? "font-semibold text-ts-purple-text" : "text-zinc-500"
                          }`}
                        >
                          {row.age}
                        </span>
                      </div>

                      {/* Line 2 — the subject, which is what an agent scans. */}
                      <span
                        className={`truncate text-[12px] leading-4 ${
                          row.unread ? "font-semibold text-white" : "text-zinc-300"
                        }`}
                      >
                        {row.subject}
                      </span>

                      {/* Line 3 — the slim meta line. `overflow-hidden` +
                          `whitespace-nowrap` is the real row's own overflow
                          behaviour: at the narrowest frames the tail clips
                          rather than wrapping, because a meta line that grows
                          to two lines changes the row height and the pane stops
                          showing ten conversations. */}
                      <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                        {/* Status is a DOT plus muted text here, not a pill —
                            the real row's own anatomy. A pill on every row
                            would out-shout the subject above it. */}
                        {/* ⚠️ `min-w-0` and NOT `shrink-0`, which is the one
                            place this diverges from the real row's class list.
                            Something has to give when the line overflows, and
                            flexbox gives on whatever can shrink: with every
                            item rigid, the overflow lands on the `ms-auto`
                            handle at the end — so the BOOKING REFERENCE was
                            what got clipped (measured at 640px: row 2 over by
                            6px, row 3 by 3px, i.e. the last glyph or two of
                            `VS-7A3F09`). Letting the status label absorb it
                            instead loses the tail of a word whose coloured dot
                            already carries the state, and keeps intact the one
                            string on this row a customer would read back over
                            the phone. */}
                        <span className="inline-flex min-w-0 items-center gap-1 text-[10.5px] font-medium text-zinc-500">
                          <span
                            className={`size-1.5 shrink-0 rounded-full ${TONE[row.status.tone].dot}`}
                          />
                          <span className="min-w-0 truncate">{row.status.label}</span>
                        </span>
                        {row.priority && (
                          <Soft tone="warning" caps>
                            {row.priority}
                          </Soft>
                        )}
                        {/* ⚠️ Present below `sm` and from `md`, absent in the
                            band between — which is not a fussy breakpoint but
                            the one width where this line genuinely does not
                            fit. Measured: the list pane is 322px on a phone
                            (it has the frame to itself) and 277px+ from `md`,
                            but 226px at `sm`, where the conversation pane
                            arrives and takes 3/5 of a ~600px frame. At 226px
                            the meta line overflows its own `overflow-hidden`
                            box by 37px (EN) / 31px (AR), and because the handle
                            is `ms-auto` the thing clipped is the BOOKING
                            REFERENCE — the one item on this row the section's
                            claim rests on.

                            Dropping the SLA there costs the frame nothing: the
                            conversation pane, which is on screen at exactly
                            those widths, carries the same countdown as a
                            `SlaPill` in its header. And it is the real row's
                            own instinct — `showSla` already withholds this
                            span on a terminal ticket, and the real tables drop
                            columns by width all over the console. */}
                        {row.sla && (
                          <span className="shrink-0 text-[10.5px] tabular-nums text-zinc-500 sm:hidden md:inline">
                            {row.sla}
                          </span>
                        )}
                        {/* The CSAT chip takes the slot the SLA vacates: a
                            ticket can only be rated once it is terminal, and a
                            terminal ticket has no countdown, so the two never
                            compete. The star is a FLEX SIBLING of the score,
                            never a glyph inside the text run — which is what
                            puts it on the inline start in both locales without
                            a bidi question ever arising. */}
                        {row.csat && (
                          <Soft tone="success" className="gap-0.5 !px-1.5 !py-px">
                            <Glyph className="size-2.5" filled>
                              {StarGlyph}
                            </Glyph>
                            <span className="tabular-nums">{row.csat}</span>
                          </Soft>
                        )}
                        {/* ⚠️ The pin is on the INNER span. `ms-auto` on a
                            `dir="ltr"` element would resolve against that
                            element's own direction and push the handle to the
                            physical left inside an RTL pane. */}
                        <span className="ms-auto shrink-0 ps-1 font-mono text-[10px] text-zinc-500">
                          <span dir="ltr">{row.handle}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── B. CONVERSATION PANE ───────────────────────────────────
                Hidden on a phone, where the real shell shows the list alone. */}
            <div className="hidden min-w-0 flex-col sm:flex">
              {/* 1. Header — who, what, and the one primary action. */}
              <div className="flex min-w-0 items-start gap-2.5 px-3 pt-3 sm:px-4">
                {/* `InboxAvatar`: initials, never a photograph. The support
                    payload carries no image source at all, so the real
                    component derives up to two initials from the (possibly
                    masked) counterparty label and falls back to a brand
                    glyph. */}
                <span
                  className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-full text-[11px] font-bold ${TONE.neutral.chip}`}
                >
                  {t("avatarInitials")}
                </span>

                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold tracking-tight text-white">
                    {t("r1Subject")}
                  </span>
                  {/* The real header's own sub-line, separators included. A
                      literal `·` is safe here — and is the product's markup —
                      because every neighbour is either a Latin reference or an
                      Arabic name: there is no Arabic-Indic numeral for it to be
                      absorbed into, which is the case `Dot` exists for. They
                      are flex ITEMS rather than characters in one run, so the
                      order mirrors with the row. */}
                  <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[11px] text-zinc-500">
                    <span dir="ltr" className="shrink-0 font-mono">
                      TKT-4F2A91
                    </span>
                    <span className="shrink-0 text-zinc-600">·</span>
                    <span className="min-w-0 truncate">{t("r1Name")}</span>
                    <span className="shrink-0 text-zinc-600">·</span>
                    <span dir="ltr" className="shrink-0 font-mono">
                      FL-8C21F4
                    </span>
                  </span>
                </div>

                {/* ONE primary action. The real header carries an overflow menu
                    beside it (forward, add charge, auto-resolve) precisely so
                    that this button and the SUBJECT above it are the only two
                    things competing for the eye. */}
                <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-ts-purple px-2 py-1 text-[11px] font-semibold text-white">
                  <Glyph className="size-3">{CheckGlyph}</Glyph>
                  {t("resolve")}
                </span>
              </div>

              {/* 2. Meta chips. One StatusBadge and three SOFT pills — see the
                     module note on why the two shapes must stay distinct. */}
              <div
                className={`flex flex-wrap items-center gap-1.5 border-b px-3 pb-3 pt-2.5 sm:px-4 ${DIVIDE}`}
              >
                <Badge tone="info">{t("stOpen")}</Badge>
                <Soft tone="neutral" caps>
                  {t("dept")}
                </Soft>
                <Soft tone="warning" caps>
                  {t("prHigh")}
                </Soft>
                <Soft tone="warning">
                  <Glyph className="size-3">{ClockGlyph}</Glyph>
                  {t("slaLeft")}
                </Soft>
              </div>

              {/* 3. The thread. `self-start` / `self-end` in a flex COLUMN
                     resolve on the inline axis, so the customer sits on the
                     reader's start and the agent on their end — mirrored under
                     `dir="rtl"` with no second rule and no absolute
                     positioning. */}
              <div className="flex min-w-0 flex-col gap-2 px-3 py-3.5 sm:px-4">
                {/* Customer. `rounded-ss-sm` — border-START-start-radius — is
                    what tucks the bubble's corner toward its own speaker in
                    both locales. */}
                <span className="max-w-[85%] self-start rounded-2xl rounded-ss-sm bg-white/[0.05] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-zinc-300">
                  {t("msgCustomer")}
                </span>

                {/* Agent. The mirror corner, `rounded-se-sm`. */}
                <span className="max-w-[85%] self-end rounded-2xl rounded-se-sm bg-ts-purple/15 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-zinc-200">
                  {t.rich("msgAgent", LTR_ISLAND)}
                </span>

                {/* 4. The in-thread payable card — the fact ledger's row 03
                       pointing at a real thing. Aligned with the agent bubble
                       because the agent is who raised it. */}
                <div className="w-full max-w-[85%] self-end rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <span className="flex min-w-0 items-center gap-1.5 text-[12px] font-semibold text-white">
                    <span className="grid size-5 shrink-0 place-items-center rounded-md bg-ts-purple/15 text-ts-purple-text">
                      <Glyph className="size-3">{CardGlyph}</Glyph>
                    </span>
                    <span className="min-w-0 truncate">{t("chargeTitle")}</span>
                    <span className="shrink-0 text-zinc-600">—</span>
                    <span dir="ltr" className="shrink-0 font-mono text-[11px] text-zinc-400">
                      FL-8C21F4
                    </span>
                  </span>

                  <div
                    className={`mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t pt-2.5 ${DIVIDE}`}
                  >
                    <span className="font-mono text-[15px] font-semibold tabular-nums text-white">
                      <span dir="ltr">$35.00</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <Badge tone="warning">{t("chargeStatus")}</Badge>
                      <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-white/15 px-2 py-[2px] text-[10px] font-semibold text-zinc-300">
                        <Glyph className="size-2.5">{CardGlyph}</Glyph>
                        {t("pay")}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer chrome ──────────────────────────────────────────────────
          The console twin of the storefront slices' "48 fares · 12 airlines".
          Neither slot is decoration: the first is why this desk is not a
          separate help-desk product, and the second is the promise the SLA pill
          above it is a live reading of. */}
      <div className={`flex flex-wrap items-center gap-2 border-t px-3 py-2 sm:px-4 ${DIVIDE}`}>
        <span className="text-[10px] text-zinc-400">{t("footerBorn")}</span>
        <Dot />
        <span className="text-[10px] text-zinc-400">{t("footerSla")}</span>
      </div>
    </div>
  );
}
