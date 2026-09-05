"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import {
  AirplaneTilt,
  Bed,
  Buildings,
  CheckCircle,
  Headset,
  IdentificationBadge,
  MagnifyingGlass,
  Receipt,
  ShareNetwork,
  SquaresFour,
  Ticket,
  Wallet,
} from "@phosphor-icons/react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { DURATION, EASE } from "@/lib/motion";
import { tsPurple } from "@/lib/colors";
import {
  AirlineTile,
  CountChip,
  DIVIDE,
  Dot,
  IconTile,
  LABEL,
  Pill,
  PulseDot,
  ROW,
  Route,
  Shimmer,
  Wordmark,
} from "@/components/site/tourscope/slice-primitives";

/**
 * The hero's product artifact — a two-sided PLATFORM, not a search box.
 *
 * ── Why it is a scene and not a card ────────────────────────────────────────
 * This shipped first as an empty search form, then as a single mid-search
 * card. The card was honest and it was small: one window, one vertical, one
 * side of the business — a widget. Tourscope is two products against one
 * database (the traveler's storefront and the agency's console), and the hero
 * is the only place on the site where both can be seen at once, in one glance,
 * before anyone has read a word.
 *
 * So the artifact is a layered scene:
 *
 *   BACK   the agency console — icon rail, "Live bookings", a queue carrying
 *          THREE verticals (flight, hotel, visa), a financial block and the
 *          pooled-inventory footer.
 *   FRONT  the traveler storefront mid-search, overlapping it.
 *   ON TOP two satellites: a confirmation toast and a ledger chip.
 *
 * ── The invariant that makes it mean something ──────────────────────────────
 * ONE booking — `FL-8241`, `BGW → IST`, `$284` — appears FOUR times: as the
 * priced result on the storefront, as the top row of the console's queue, on
 * the toast that bridges them, and as the ledger credit. Route, reference and
 * amount all come from single message keys (`fromCode` / `toCode`,
 * `bookingRef`, `bookingAmount`) precisely so they CANNOT drift apart: the
 * scene's whole claim is that these are one booking travelling through one
 * platform, and three slightly different numbers would say the opposite.
 *
 * ── Rules, shared with `components/tourscope/ProductSlices.tsx` ─────────────
 * That file is the fidelity bar; the atoms both files draw with now live in
 * `components/tourscope/slice-primitives.tsx`. Anything added here follows:
 *
 * 1. Every visible string comes from `Home.hero.preview`. The exceptions are
 *    punctuation and currency signs, which are identical in both locales.
 * 2. The root is `aria-hidden`, and nothing inside is focusable — the actions
 *    are `span`s, so the tab order never enters a hidden subtree. The hero's
 *    real heading, subhead and CTAs sit beside it and carry the meaning.
 * 3. Logical properties only (`ms`/`me`/`ps`/`pe`/`start`/`end`), so the whole
 *    composition mirrors under `dir="rtl"`: the console swings to the top-END,
 *    the storefront to the bottom-START, and both satellites follow. Tilts are
 *    mirrored explicitly (`-rotate-*` + `rtl:rotate-*`) because a transform is
 *    not a logical property.
 * 4. Motion: a staggered entrance (console → storefront → satellites), the
 *    live pulses and the skeleton shimmer. There is deliberately NO hover lift
 *    — a card can lift as one object, a scene of three windows cannot without
 *    flattening the depth it exists to show — and no idle bob.
 * 5. Depth is drawn with opacity, shadow and overlap. No blur filters: a
 *    blurred back window reads as an out-of-focus photograph of a product
 *    rather than as a product, and it destroys exactly the 9px UI type that
 *    makes the queue legible.
 *
 * ── Below `lg` ──────────────────────────────────────────────────────────────
 * The scene simplifies rather than shrinking: at `sm`–`lg` the console is
 * dropped and the storefront keeps the toast (the thread still reads: searched,
 * then confirmed); below `sm` the storefront card stands alone, because a
 * 390px column cannot hold two overlapping windows without either becoming
 * unreadable.
 */

/** The card's own row surface — the storefront runs a slightly softer radius. */
const CARD_ROW = `rounded-xl ${ROW}`;

/* ── The agency console — the back layer ────────────────────────────────────
   Wider than the storefront (~114%) and offset to the top-END, so the two
   windows read as a stack rather than as a pair. Dimmed a little, never
   blurred: everything on it is meant to be read. */

function ConsoleWindow() {
  const t = useTranslations("Home.hero.preview");

  /* The rail. Icon-only, as the real console's collapsed state is — five
     destinations, one active. No labels: a nav label at 8px is texture. */
  const nav = [
    { Icon: SquaresFour, active: true },
    { Icon: Ticket, active: false },
    { Icon: Buildings, active: false },
    { Icon: Wallet, active: false },
    { Icon: Headset, active: false },
  ];

  /* Three verticals in one queue. This is the platform-breadth claim made by
     the product's own table rather than by a sentence: a flight, a hotel and a
     visa, each with its own reference series, sitting in one operator's inbox.
     Row 1 is THE booking — the same one the storefront in front is searching. */
  const queue = [
    {
      Icon: AirplaneTilt,
      tone: "purple" as const,
      title: <Route from={t("fromCode")} to={t("toCode")} arrow={9} />,
      ref: t("bookingRef"),
      meta: null,
      amount: t("bookingAmount"),
      status: t("q1Status"),
      statusTone: "teal" as const,
    },
    {
      Icon: Bed,
      tone: "zinc" as const,
      title: t("q2Name"),
      ref: t("q2Ref"),
      meta: t("q2City"),
      amount: t("q2Amount"),
      status: t("q2Status"),
      statusTone: "zinc" as const,
    },
    {
      Icon: IdentificationBadge,
      tone: "zinc" as const,
      title: t("q3Name"),
      ref: t("q3Ref"),
      meta: t("q3Type"),
      amount: t("q3Amount"),
      status: t("q3Status"),
      statusTone: "purple" as const,
    },
    /* A fourth row, deliberately. It is the row the confirmation toast lands
       on: the toast covers this row's money column and nothing else, which is
       why the three verticals above it stay whole. Without a row here the
       toast would have to sit on the visa row, and the platform-breadth claim
       is exactly what would go missing. */
    {
      Icon: AirplaneTilt,
      tone: "zinc" as const,
      title: t("q4Name"),
      ref: t("q4Ref"),
      meta: null,
      amount: t("q4Amount"),
      status: t("q4Status"),
      statusTone: "teal" as const,
    },
  ];

  /* The console's money edge. Everything but the figures sits behind the
     storefront — so the LABELS run to the start and the AMOUNTS to the end,
     and what survives the overlap is a right-aligned column of currency. A
     centre-split grid put the second cell's label under the card's edge and
     printed "…NDING / …12", which reads as a rendering fault rather than as
     depth. */
  const financials = [
    { l: t("finLabel1"), v: t("finValue1") },
    { l: t("finLabel2"), v: t("finValue2") },
    { l: t("finLabel3"), v: t("finValue3") },
  ];

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        /* Darker than the storefront's `#0e0a1a`. Depth on a near-black ground
           is carried by ground value and by the front card's shadow falling
           across this one — not by a blur, which would take the 11px queue
           type with it. */
        background: "#08060f",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 18px 44px rgba(0,0,0,0.5)",
      }}
    >
      <div className="flex">
        {/* Icon rail */}
        <div
          className={`flex w-[38px] shrink-0 flex-col items-center gap-[7px] border-e ${DIVIDE} bg-white/[0.02] py-3`}
        >
          {/* The tenant's brand tile. A colour field, not a logo: the console is
              white-labeled, so any mark here would be somebody's invented brand. */}
          <span className="block h-[22px] w-[22px] rounded-md bg-gradient-to-br from-ts-purple/70 to-cs-teal/50 ring-1 ring-inset ring-white/15" />
          <span className="my-[3px] block h-px w-4 bg-white/10" />
          {nav.map(({ Icon, active }, i) => (
            <span
              key={i}
              className={`flex h-[22px] w-[22px] items-center justify-center rounded-md ${
                active
                  ? "bg-ts-purple/20 text-ts-purple-text ring-1 ring-inset ring-ts-purple/30"
                  : "text-zinc-600"
              }`}
            >
              <Icon size={12} weight="duotone" />
            </span>
          ))}
        </div>

        {/* Main area */}
        <div className="min-w-0 flex-1">
          <div className={`flex items-center gap-1.5 border-b ${DIVIDE} px-3 py-[11px]`}>
            <span className="truncate text-[11.5px] font-semibold leading-none text-white">
              {t("consoleTitle")}
            </span>
            <CountChip>{t("consoleCount")}</CountChip>
            <span className="ms-auto flex shrink-0 items-center gap-1.5">
              <PulseDot />
              <span className="text-[9.5px] font-medium leading-none text-zinc-400">
                {t("live")}
              </span>
            </span>
          </div>

          <div className="px-2.5 pb-2.5 pt-2">
            <div className="flex items-center justify-between gap-2 px-1.5 pb-1.5">
              <span className={`truncate ${LABEL}`}>{t("colBooking")}</span>
              <span className={`truncate ${LABEL}`}>{t("colStatus")}</span>
            </div>

            <div className="flex flex-col gap-1">
              {queue.map((row) => (
                <div
                  key={row.ref}
                  className={`flex items-center gap-2 px-2 py-[7px] ${ROW}`}
                >
                  <IconTile tone={row.tone} size="h-[26px] w-[26px]">
                    <row.Icon size={13} weight="duotone" />
                  </IconTile>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] font-semibold leading-none text-white">
                      {row.title}
                    </span>
                    <span className="mt-[5px] flex items-center gap-1.5 text-[9px] leading-none text-zinc-500">
                      <span className="shrink-0 tabular-nums">{row.ref}</span>
                      {row.meta && (
                        <>
                          <Dot />
                          <span className="truncate">{row.meta}</span>
                        </>
                      )}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-[5px]">
                    <span className="text-[11px] font-bold leading-none tabular-nums text-white">
                      {row.amount}
                    </span>
                    <Pill tone={row.statusTone}>{row.status}</Pill>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* END-ALIGNED label-over-value stacks, not label…value rows. The
              storefront card covers this block's START side, so a justified row
              layout showed three bare amounts floating in the exposed strip
              with their labels hidden — orphaned numbers reading as a glitch.
              Stacked at the inline end, label and value stay together inside
              the strip the card leaves visible (which mirrors correctly in
              RTL, where the exposed side is the logical end too). */}
          <div className={`border-t ${DIVIDE} bg-white/[0.02] px-3 py-3`}>
            <span className={`block text-end ${LABEL}`}>{t("finTitle")}</span>
            <div className="mt-2 flex flex-col items-end gap-2.5">
              {financials.map((cell) => (
                <span key={cell.l} className="flex flex-col items-end gap-[3px]">
                  <span className="text-[9px] uppercase tracking-[0.1em] leading-none text-zinc-500">
                    {cell.l}
                  </span>
                  <span className="text-[11px] font-semibold leading-none tabular-nums text-zinc-200">
                    {cell.v}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* The cross-agency claim, in the product's own words — and the last
              thing the console needs structurally: it carries the window's
              bottom edge past the storefront's top by enough to make the
              overlap read as a stack rather than as a near-miss, and its badge
              is what keeps the end column from going hollow between the
              financial figures and the ledger chip below. */}
          <div className={`flex items-center gap-2 border-t ${DIVIDE} px-3 py-2.5`}>
            {/* Note first (truncates under the card), icon + badge GROUPED at
                the end — the icon anchors the badge so the exposed strip shows
                a labeled element, not a lone pill floating in the dark. */}
            <span className="min-w-0 truncate text-[9.5px] leading-none text-zinc-500">
              {t("poolNote")}
            </span>
            <span className="ms-auto flex shrink-0 items-center gap-1.5">
              <ShareNetwork size={11} weight="duotone" className="shrink-0 text-ts-purple-text" />
              <Pill tone="purple">{t("poolBadge")}</Pill>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── The traveler storefront — the front layer ──────────────────────────────
   The mid-search moment, slimmed to one priced result and one still arriving:
   the console behind now carries the breadth, so a second fare and a hotel
   card here would only be repeating it. */

function StorefrontCard() {
  const t = useTranslations("Home.hero.preview");

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: "#0e0a1a",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: `0 34px 74px rgba(0,0,0,0.72), 0 8px 22px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03), 0 14px 44px ${tsPurple(0.16)}`,
      }}
    >
      {/* Brand bar. The chrome sits at the START and the END is left empty on
          purpose: that corner is where the confirmation toast lands at `lg`,
          and a toast clipping a currency chip in half is the one thing that
          would make the layering read as a bug. The live indicator is not
          duplicated here — the results header below already carries one, and
          the console behind carries the other. */}
      <div className={`flex items-center gap-2 border-b ${DIVIDE} px-4 py-3`}>
        <Wordmark className="h-[15px]" />
        <span className="h-3 w-px shrink-0 bg-white/10" />
        <span className="rounded-md border border-white/[0.07] bg-white/[0.04] px-1.5 py-[3px] text-[9.5px] font-semibold leading-none text-zinc-300">
          {t("currency")}
        </span>
        <span className="rounded-md border border-white/[0.07] bg-white/[0.04] px-1.5 py-[3px] text-[9.5px] font-semibold leading-none text-zinc-300">
          {t("language")}
        </span>
      </div>

      {/* The query, already made. A full-width purple button is the loudest
          thing on the page and says "type here"; the search has happened, so
          the action is a state marker, not a CTA. */}
      <div className="px-4 pb-3 pt-3.5">
        <div
          className="flex items-center gap-3 rounded-xl px-3 py-2.5"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
        >
          <span className="min-w-0 flex-1">
            <Route
              from={t("fromCode")}
              to={t("toCode")}
              className="text-[14.5px] font-semibold leading-none text-white"
              arrow={12}
            />
            <span className="mt-1.5 block truncate text-[10px] leading-none text-zinc-500">
              {t("tripMeta")}
            </span>
          </span>
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ts-purple"
            style={{ boxShadow: `0 6px 16px ${tsPurple(0.4)}` }}
          >
            <MagnifyingGlass size={13} weight="bold" className="text-white" />
          </span>
        </div>
      </div>

      <div className={`border-t ${DIVIDE} px-4 pb-4 pt-2.5`}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className={LABEL}>{t("resultsLabel")}</span>
          <span className="flex min-w-0 items-center gap-1.5">
            <PulseDot />
            <span className="truncate text-[9.5px] font-medium text-zinc-400">
              {t("searching")}
            </span>
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {/* The settled fare. Rows lead with TIMES, not the route: the query
              bar above already states BGW → IST, and repeating it here made the
              card read as two copies of one line. */}
          <div className={`flex items-center gap-2.5 p-2.5 ${CARD_ROW}`}>
            <AirlineTile code={t("r1Airline")} tone="purple" />
            <span className="min-w-0 flex-1">
              <Route
                from={t("r1Depart")}
                to={t("r1Arrive")}
                className="text-[12px] font-semibold leading-none tabular-nums text-white"
                arrow={10}
              />
              <span className="mt-1 block truncate text-[10px] leading-none text-zinc-500">
                {t("r1Meta")}
              </span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-[13px] font-bold leading-none tabular-nums text-white">
                {t("bookingAmount")}
              </span>
              <Pill tone="teal">{t("available")}</Pill>
            </span>
          </div>

          {/* The row still arriving — what makes this a live search rather than
              a static list of one. */}
          <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.05] bg-white/[0.015] p-2.5">
            <Shimmer className="h-7 w-7 rounded-md" />
            <span className="min-w-0 flex-1">
              <Shimmer className="h-[9px] w-[54%] rounded-full" delay={0.12} />
              <Shimmer className="mt-[7px] h-[7px] w-[34%] rounded-full" delay={0.2} />
            </span>
            <span className="flex shrink-0 flex-col items-end gap-[7px]">
              <Shimmer className="h-[10px] w-10 rounded-full" delay={0.28} />
              <Shimmer className="h-[8px] w-14 rounded-full" delay={0.36} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Satellites ─────────────────────────────────────────────────────────────
   Exactly two, and both are the same booking again. They sit on the windows'
   EDGES, never across their middles: a chip parked over a fare or a status pill
   reads as a rendering fault, one hanging off a corner reads as depth. */

/** The storefront search became a console row. Straddles both layers. */
function ConfirmationToast() {
  const t = useTranslations("Home.hero.preview");
  return (
    <div
      className="flex items-center gap-2.5 rounded-xl px-2.5 py-3"
      style={{
        background: "#120d20",
        border: "1px solid rgba(255,255,255,0.11)",
        boxShadow: "0 16px 34px rgba(0,0,0,0.55)",
      }}
    >
      <CheckCircle size={20} weight="fill" className="shrink-0 text-cs-teal" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[11px] font-semibold leading-none text-white">
          {t("toastTitle")}
        </span>
        <span className="mt-[5px] flex items-center gap-1.5 text-[9.5px] leading-none text-zinc-400">
          <span className="shrink-0 tabular-nums">{t("bookingRef")}</span>
          <Dot />
          <Route from={t("fromCode")} to={t("toCode")} arrow={8} className="shrink-0" />
        </span>
      </span>
    </div>
  );
}

/** The money side, accounting-grade: one booking, one credit, one line. */
function LedgerChip() {
  const t = useTranslations("Home.hero.preview");
  return (
    <div
      className="flex items-center gap-2.5 rounded-xl px-2.5 py-2"
      style={{
        background: "#0f0b1b",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 14px 30px rgba(0,0,0,0.5)",
      }}
    >
      <IconTile tone="teal" size="h-[26px] w-[26px]">
        <Receipt size={13} weight="duotone" />
      </IconTile>
      <span className="min-w-0 flex-1">
        <span className={`block truncate ${LABEL}`}>{t("ledgerLabel")}</span>
        <span className="mt-[5px] flex items-center gap-1.5 leading-none">
          {/* `+` is punctuation, so it is a literal — and the amount itself
              comes from the SAME key the storefront row and the console row
              use, which is what stops the three from drifting. */}
          <span
            dir="ltr"
            className="shrink-0 text-[11.5px] font-bold leading-none tabular-nums text-cs-teal"
          >
            +{t("bookingAmount")}
          </span>
          <Dot />
          <span className="truncate text-[9.5px] leading-none text-zinc-500">
            {t("ledgerRef")}
          </span>
        </span>
      </span>
    </div>
  );
}

export function HeroProductPreview() {
  const reduced = useReducedMotionSafe();

  /* The last link in the hero's entrance chain (headline → subhead → CTAs →
     stats → note, each ~60ms apart). Inside the scene the order is the reading
     order of the claim: the operation exists, the storefront sits in front of
     it, and the two satellites are what passed between them. It all lands by
     ~0.95s — the same budget the words are held to. */
  const enter = (delay: number, duration: number = DURATION.slow) =>
    reduced ? { duration: 0 } : { duration, delay, ease: EASE };

  return (
    <div className="relative select-none" aria-hidden="true">
      {/* Ambient wash. One soft radial — layered shadows on a near-black ground
          turn into grey mud. It is a gradient, not a blur filter. */}
      <div
        className="pointer-events-none absolute -inset-8"
        style={{
          background: `radial-gradient(ellipse 70% 58% at 58% 42%, ${tsPurple(0.1)}, transparent 72%)`,
        }}
      />

      {/* The scene's height is fixed rather than content-derived because every
          layer is absolutely positioned inside it. `lg:top-[268px]` on the
          storefront below is the console's fourth-row baseline — the row
          heights are content-driven and width-independent, so one number holds
          from `lg` to the container's 1280px cap. */}
      <div className="relative mx-auto w-full max-w-[420px] lg:mx-0 lg:h-[600px] lg:max-w-none">
        {/* BACK — the agency console. Dimmed to 0.88 and offset to the top-END.
            No scale: a hairline border scaled to 0.98px goes soft, and soft is
            the one thing this layer must not be — the depth is carried by
            ground value, by the overlap, and by the front card's cast shadow. */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 0.88, y: 0 }}
          transition={enter(0.28)}
          className="absolute hidden lg:block lg:top-0 lg:end-0 lg:w-[80%]"
        >
          <ConsoleWindow />
        </motion.div>

        {/* FRONT — the storefront, plus the two satellites that hang off its
            edges. They ride inside this wrapper so their anchoring is the same
            in both layout modes: the card, never the scene. */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={enter(0.4, DURATION.base)}
          className="relative w-full lg:absolute lg:top-[268px] lg:start-0 lg:w-[70%]"
        >
          <StorefrontCard />

          {/* Bridging the two layers, and the one piece of this scene whose
              position is arithmetic rather than taste:

              — vertically it hangs 36px above the card so it lands on the
                console's FOURTH queue row (the row that exists to be landed
                on) and dips 10px onto the card's empty header corner. The
                three verticals above it are never touched.
              — `end-[-42.8%]` is 30/70 of the card's width: the card is 70% of
                the scene and the console runs to 100%, so this is exactly the
                console's end edge. Stopping short leaves that row's status
                pill peeking past the toast, which reads as a fragment.

              Below `lg` there is no console to bridge to, so it drops to the
              card's bottom edge and simply says the search was booked. */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={enter(0.6, DURATION.base)}
            className="absolute hidden bottom-[-26px] end-[-5%] w-[196px] -rotate-[1.5deg] sm:block lg:bottom-auto lg:top-[-47px] lg:end-[-42.8%] lg:w-[64%] lg:max-w-[200px] rtl:rotate-[1.5deg]"
          >
            <ConfirmationToast />
          </motion.div>

          {/* The money that came out of it, hanging off the card's bottom-end
              corner — in the same column as the console's financial block
              above, so the two read as one side of the business. */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={enter(0.68, DURATION.base)}
            className="absolute hidden rotate-[1.75deg] lg:block lg:bottom-[-30px] lg:end-[-30%] lg:w-[56%] lg:max-w-[190px] rtl:-rotate-[1.75deg]"
          >
            <LedgerChip />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
