"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import {
  Bed,
  Buildings,
  CaretRight,
  CaretUp,
  Check,
  CheckCircle,
  Globe,
  IdentificationBadge,
  MagnifyingGlass,
  MapTrifold,
  Percent,
  Plus,
  ShareNetwork,
  ShieldCheck,
  SimCard,
  X,
} from "@phosphor-icons/react";
import {
  CARD,
  CountChip,
  DIVIDE,
  Dot,
  IconTile,
  LABEL,
  Pill,
  PulseDot,
  ROW,
  SHEET,
  Wordmark,
} from "@/components/site/tourscope/slice-primitives";

/**
 * Coded slices of the Tourscope product, drawn in this site's own dark palette.
 *
 * ── Why coded and not captured ──────────────────────────────────────────────
 * The page shipped real screenshots first. They were honest and they were
 * wrong: the product renders light, and a white rectangle dropped onto a
 * near-black page is a hole in it — no frame, border or glow reconciles the
 * two. Worse, a 1600px capture shrunk into a 600px column turns its own type
 * into texture, so the part that carries the claim (a fare, a required
 * document, a "Shared · Tourscope Pool" badge) is exactly the part that stops
 * being readable.
 *
 * These are the same screens rebuilt as DOM: the real structure, the real
 * field labels, the real badge vocabulary — at a size that reads, in the
 * palette the page is already in. Layout was taken from the captures in
 * `public/Product/` (which stay on disk, now unreferenced); nothing here is
 * invented product.
 *
 * ── Rules for anything added below ──────────────────────────────────────────
 * 1. Every visible string comes from `TourScope.slices`. No literal copy —
 *    the one exception is punctuation and currency signs, which are the same
 *    in both locales.
 * 2. Illustrative figures are allowed (brief §1) *because* they sit inside a
 *    product mock. They are UI, not claims. Nothing here may state a metric
 *    the page then repeats as fact in prose.
 * 3. Each slice root is `aria-hidden`: the section copy beside it carries the
 *    meaning, and read aloud these are a stack of loose fragments. That is
 *    also why nothing inside is focusable — buttons are styled `span`s, so
 *    the tab order never enters a hidden subtree.
 * 4. Logical properties only (`ms`/`me`/`ps`/`pe`/`start`/`end`), so every
 *    slice mirrors under `dir="rtl"` without a second set of rules. Directional
 *    glyphs (`→`) live in the message files, where Arabic supplies `←`.
 * 5. Motion: the pulse dot, and nothing else. These already arrive inside the
 *    page's `FadeIn`; a second entrance per row reads as a slideshow.
 *
 * ── Where the vocabulary lives ──────────────────────────────────────────────
 * Surfaces (`SHEET` / `CARD` / `ROW` / `LABEL` / `DIVIDE`) and every atom the
 * hero's platform scene also draws (`Pill`, `PulseDot`, `Dot`, `IconTile`,
 * `CountChip`, `Wordmark`) are imported from `slice-primitives.tsx` — one
 * definition, so a pill here and a pill in the hero cannot drift apart. Only
 * slice-ONLY atoms stay below.
 */

function SliceRoot({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`select-none text-zinc-300 antialiased ${SHEET} ${className}`}
    >
      {children}
    </div>
  );
}

/* Flags as two- and three-band discs. Real flag art at 12px is mud; the band
   pattern is what the eye actually resolves at this size, and it keeps the
   slice free of a sprite sheet. */
type FlagKey = "iq" | "bh" | "cn" | "ae" | "ge";

function FlagDot({ code, size = 13 }: { code: FlagKey; size?: number }) {
  const s = { width: size, height: size } as const;
  const base = "relative shrink-0 overflow-hidden rounded-full ring-1 ring-inset ring-white/15";

  if (code === "iq") {
    return (
      <span className={base} style={s}>
        <span className="absolute inset-x-0 top-0 h-1/3 bg-[#ce1126]" />
        <span className="absolute inset-x-0 top-1/3 h-1/3 bg-white" />
        <span className="absolute inset-x-0 bottom-0 h-1/3 bg-[#141414]" />
      </span>
    );
  }
  if (code === "bh") {
    return (
      <span className={base} style={s}>
        <span className="absolute inset-0 bg-[#ce1126]" />
        <span className="absolute inset-y-0 start-0 w-[38%] bg-white" />
      </span>
    );
  }
  if (code === "cn") {
    return (
      <span className={base} style={s}>
        <span className="absolute inset-0 bg-[#de2910]" />
        <span className="absolute start-[22%] top-[26%] h-[26%] w-[26%] rounded-full bg-[#ffde00]" />
      </span>
    );
  }
  if (code === "ae") {
    return (
      <span className={base} style={s}>
        <span className="absolute inset-x-0 top-0 h-1/3 bg-[#00732f]" />
        <span className="absolute inset-x-0 top-1/3 h-1/3 bg-white" />
        <span className="absolute inset-x-0 bottom-0 h-1/3 bg-[#141414]" />
        <span className="absolute inset-y-0 start-0 w-[32%] bg-[#ce1126]" />
      </span>
    );
  }
  return (
    <span className={base} style={s}>
      <span className="absolute inset-0 bg-white" />
      <span className="absolute inset-y-0 start-[42%] w-[16%] bg-[#ce1126]" />
      <span className="absolute inset-x-0 top-[42%] h-[16%] bg-[#ce1126]" />
    </span>
  );
}

/** A search-panel field: small-caps label over a value. The storefront's atom. */
function Field({
  label,
  value,
  hint,
  className = "",
}: {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={`min-w-0 rounded-lg border border-white/[0.07] bg-white/[0.04] px-2.5 py-[7px] ${className}`}>
      <p className={`${LABEL} truncate`}>{label}</p>
      <p className="mt-[3px] flex items-baseline gap-1 truncate text-[11.5px] font-semibold leading-none text-zinc-100">
        <span className="truncate">{value}</span>
        {hint && <span className="shrink-0 text-[10px] font-medium text-zinc-500">{hint}</span>}
      </p>
    </div>
  );
}

/** Segmented control — trip types, console tabs. Hugs its content, as the real one does. */
function Segments({ items }: { items: { label: string; count?: string; active?: boolean }[] }) {
  return (
    <div className="flex w-fit max-w-full flex-wrap items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.03] p-1">
      {items.map((it) => (
        <span
          key={it.label}
          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10.5px] font-medium leading-none ${
            it.active
              ? "bg-ts-purple/20 text-ts-purple-text ring-1 ring-inset ring-ts-purple/30"
              : "text-zinc-500"
          }`}
        >
          {it.label}
          {it.count && (
            <span
              className={`rounded px-1 py-[1px] text-[8.5px] font-semibold tabular-nums ${
                it.active ? "bg-ts-purple/25 text-ts-purple-text" : "bg-white/[0.06] text-zinc-500"
              }`}
            >
              {it.count}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

/** The purple primary action. A `span`: nothing inside an aria-hidden tree is focusable. */
function Action({
  label,
  icon,
  className = "",
}: {
  label: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg bg-ts-purple px-3 py-2 text-[11px] font-semibold leading-none text-white shadow-[0_6px_16px_rgba(111,0,255,0.32)] ${className}`}
    >
      {label}
      {icon}
    </span>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-[1px] text-[7px] leading-none text-amber-400">
      {Array.from({ length: count }, (_, i) => (
        <span key={i}>★</span>
      ))}
    </span>
  );
}

/* ── A. Storefront search — the hero ────────────────────────────────────────
   The marketplace home, top to bottom: brand bar, trip-type selector, the
   four-field search widget, streaming results, and the service rail that is
   the "six verticals behind one search" claim made literal. */

export function StorefrontSearchSlice() {
  const t = useTranslations("TourScope.slices");

  const services = [
    { label: t("a.svcTours"), Icon: MapTrifold },
    { label: t("a.svcVisas"), Icon: IdentificationBadge },
    { label: t("a.svcInsurance"), Icon: ShieldCheck },
    { label: t("a.svcEsim"), Icon: SimCard },
  ];

  return (
    <SliceRoot>
      {/* Brand bar */}
      <div className={`flex items-center gap-2 border-b ${DIVIDE} px-3 py-2.5 sm:px-4`}>
        <Wordmark className="h-[13px]" />
        <span className="hidden h-3 w-px shrink-0 bg-white/10 sm:block" />
        <span className="hidden items-center gap-1 rounded-md border border-white/[0.07] bg-white/[0.04] px-2 py-[3px] text-[9.5px] font-medium text-zinc-400 sm:inline-flex">
          <Globe size={10} />
          {t("a.region")}
        </span>
        <span className="ms-auto flex items-center gap-1.5">
          <span className="rounded-md border border-white/[0.07] bg-white/[0.04] px-1.5 py-[3px] text-[9.5px] font-semibold text-zinc-300">
            {t("a.currency")}
          </span>
          <span className="rounded-md border border-white/[0.07] bg-white/[0.04] px-1.5 py-[3px] text-[9.5px] font-semibold text-zinc-300">
            {t("a.language")}
          </span>
          <span className="ms-1 hidden items-center gap-1 sm:flex">
            <PulseDot />
            <span className="text-[9.5px] font-medium text-zinc-400">{t("live")}</span>
          </span>
        </span>
      </div>

      {/* Search widget */}
      <div className="px-3 pb-3 pt-3 sm:px-4">
        <Segments
          items={[
            { label: t("a.tabOneWay"), active: true },
            { label: t("a.tabRound") },
            { label: t("a.tabMulti") },
            { label: t("a.tabOpen") },
          ]}
        />

        <div className="mt-2 flex flex-col gap-1.5 lg:flex-row lg:items-stretch">
          {/* Not four equal columns: the travelers field carries two strings
              ("2 adults" + the cabin) and truncated its own value at an even
              split. The real widget is wide enough not to notice; this one is
              600px and has to be told. */}
          <div className="grid min-w-0 grid-cols-2 gap-1.5 sm:grid-cols-[1fr_1fr_1fr_1.3fr] lg:flex-1">
            <Field label={t("a.fromLabel")} value={t("a.fromValue")} hint={t("a.fromCode")} />
            <Field label={t("a.toLabel")} value={t("a.toValue")} hint={t("a.toCode")} />
            <Field label={t("a.datesLabel")} value={t("a.datesValue")} />
            {/* Cabin rides the `hint` slot rather than the value: as one string
                ("2 adults · Economy") it truncated in the narrowest field. */}
            <Field
              label={t("a.travelersLabel")}
              value={t("a.travelersValue")}
              hint={t("a.cabin")}
            />
          </div>
          <Action
            label={t("a.search")}
            icon={<MagnifyingGlass size={12} weight="bold" />}
            className="shrink-0 py-2.5 lg:w-[86px] lg:py-0"
          />
        </div>

        <p className="mt-1.5 flex items-center gap-1.5 text-[9.5px] text-zinc-500">
          <CheckCircle size={11} weight="fill" className="shrink-0 text-cs-teal" />
          {t("a.taxNote")}
        </p>
      </div>

      {/* Streaming results */}
      <div className={`border-t ${DIVIDE} px-3 pb-3 pt-2.5 sm:px-4`}>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className={LABEL}>{t("a.resultsLabel")}</span>
          <span className="flex items-center gap-1.5">
            <PulseDot />
            <span className="truncate text-[9.5px] font-medium text-zinc-400">
              {t("a.searching")}
            </span>
          </span>
        </div>

        <div className={`flex items-center gap-2.5 p-2 ${ROW}`}>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-ts-purple/25 bg-ts-purple/15 text-[10px] font-bold tracking-tight text-ts-purple-text">
            {t("a.airline")}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12px] font-semibold leading-tight text-white">
              {t("a.route")}
            </span>
            <span className="block truncate text-[10px] leading-tight text-zinc-500">
              {t("a.routeMeta")}
            </span>
          </span>
          <span className="flex shrink-0 flex-col items-end gap-1">
            <span className="text-[13px] font-bold leading-none tabular-nums text-white">
              {t("a.price")}
            </span>
            <Pill tone="teal">{t("available")}</Pill>
          </span>
        </div>
      </div>

      {/* Service rail — the other verticals, one bar. The claim the section
          headline makes, made literal by the product's own navigation. */}
      <div className={`flex flex-wrap items-center gap-1.5 border-t ${DIVIDE} px-3 py-2.5 sm:px-4`}>
        {services.map(({ label, Icon }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[9.5px] font-medium text-zinc-400"
          >
            <Icon size={11} weight="duotone" className="text-zinc-500" />
            {label}
          </span>
        ))}
      </div>
    </SliceRoot>
  );
}

/* ── B. Console inventory — the B2B card ────────────────────────────────────
   Direct-contract hotel inventory. Narrow by construction (it lives inside a
   card), so the location column folds into the listing cell below `sm` rather
   than being dropped: on a supplier table, where a property IS matters. */

export function ConsoleInventorySlice() {
  const t = useTranslations("TourScope.slices");

  const rows = [
    { name: t("b.r1Name"), stars: 5, city: t("b.r1City"), country: t("b.r1Country"), rooms: t("b.r1Rooms"), units: "3" },
    { name: t("b.r2Name"), stars: 4, city: t("b.r2City"), country: t("b.r2Country"), rooms: t("b.r2Rooms"), units: "2" },
    { name: t("b.r3Name"), stars: 3, city: t("b.r3City"), country: t("b.r3Country"), rooms: t("b.r3Rooms"), units: "3" },
  ];

  return (
    <SliceRoot>
      {/* Page head */}
      <div className={`flex items-center gap-2 border-b ${DIVIDE} px-3 py-2.5`}>
        <IconTile tone="purple">
          <Buildings size={13} weight="duotone" />
        </IconTile>
        <span className="min-w-0 truncate text-[12.5px] font-semibold text-white">
          {t("b.title")}
        </span>
        <CountChip>{t("b.count")}</CountChip>
        <span className="ms-auto shrink-0">
          <Pill tone="purple" className="px-2 py-[3px] text-[9.5px]">
            <Plus size={9} weight="bold" />
            {t("b.add")}
          </Pill>
        </span>
      </div>

      {/* Table */}
      <div className="px-3 pb-2.5 pt-2.5">
        <div className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-2 pb-1.5 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_auto] ${LABEL}`}>
          <span className="truncate">{t("b.colListing")}</span>
          <span className="hidden truncate sm:block">{t("b.colLocation")}</span>
          <span className="hidden truncate sm:block">{t("b.colInventory")}</span>
          <span className="truncate text-end">{t("b.colStatus")}</span>
        </div>

        <div className="flex flex-col gap-1">
          {rows.map((r) => (
            <div
              key={r.name}
              className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-2 py-1.5 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_auto] ${ROW}`}
            >
              <span className="flex min-w-0 items-center gap-2">
                <IconTile>
                  <Bed size={12} weight="duotone" />
                </IconTile>
                <span className="min-w-0">
                  <span className="block truncate text-[11.5px] font-semibold leading-tight text-zinc-100">
                    {r.name}
                  </span>
                  <span className="mt-[2px] flex items-center gap-1.5">
                    <Stars count={r.stars} />
                    <span className="truncate text-[9.5px] leading-none text-zinc-500 sm:hidden">
                      {r.city}
                    </span>
                  </span>
                </span>
              </span>

              <span className="hidden min-w-0 sm:block">
                <span className="block truncate text-[11px] leading-tight text-zinc-300">
                  {r.city}
                </span>
                <span className="block truncate text-[9.5px] leading-tight text-zinc-500">
                  {r.country}
                </span>
              </span>

              <span className="hidden min-w-0 items-center gap-1.5 sm:flex">
                <span className="truncate text-[10.5px] text-zinc-400">{r.rooms}</span>
                <span className="shrink-0 rounded bg-white/[0.06] px-1 py-[1px] text-[8.5px] font-semibold tabular-nums text-zinc-400">
                  {r.units}
                </span>
              </span>

              <span className="shrink-0 justify-self-end">
                <Pill tone="teal" dot>
                  {t("active")}
                </Pill>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pool footer — the cross-agency claim, in the product's own words */}
      <div className={`flex items-center gap-2 border-t ${DIVIDE} px-3 py-2`}>
        <ShareNetwork size={11} weight="duotone" className="shrink-0 text-ts-purple-text" />
        <span className="min-w-0 truncate text-[10px] text-zinc-400">{t("b.pooled")}</span>
        <span className="ms-auto shrink-0">
          <Pill tone="purple">{t("poolBadge")}</Pill>
        </span>
      </div>
    </SliceRoot>
  );
}

/* ── C. Visa storefront — browse by passport ────────────────────────────────
   Two country cards at full fidelity and a third clipped by the frame, which
   is what tells the reader this is a grid continuing past the window rather
   than a two-item list. */

export function VisaStorefrontSlice() {
  const t = useTranslations("TourScope.slices");

  const cards = [
    {
      flag: "bh" as FlagKey,
      name: t("c.c1Name"),
      type: t("c.c1Type"),
      types: t("c.c1Types"),
      fastest: t("c.c1Fastest"),
      stay: t("c.c1Stay"),
      price: t("c.c1Price"),
      band: "from-[#1c2a4a] to-[#3a2350]",
    },
    {
      flag: "cn" as FlagKey,
      name: t("c.c2Name"),
      type: t("c.c2Type"),
      types: t("c.c2Types"),
      fastest: t("c.c2Fastest"),
      stay: t("c.c2Stay"),
      price: t("c.c2Price"),
      band: "from-[#123037] to-[#25204a]",
    },
  ];

  return (
    <SliceRoot>
      {/* Passport context line */}
      <div className={`flex items-center gap-2 border-b ${DIVIDE} px-3 py-2.5 sm:px-4`}>
        <FlagDot code="iq" />
        <span className="truncate text-[11.5px] font-semibold text-white">{t("c.passport")}</span>
        <Dot />
        <span className="truncate text-[10.5px] text-zinc-500">{t("c.countries")}</span>
      </div>

      {/* Card grid, clipped at the bottom */}
      <div className="relative max-h-[268px] overflow-hidden px-3 pt-3 sm:px-4">
        <div className="grid grid-cols-2 gap-2">
          {cards.map((c) => (
            <div key={c.name} className={`overflow-hidden ${CARD}`}>
              {/* Photo band. A gradient, not a stock image: the real card
                  carries a destination photo, and a wrong photo is a worse
                  lie than an honest colour field. The sheen and the darkened
                  foot are what keep it reading as a photo slot rather than as
                  an empty div. */}
              <div className={`relative h-10 overflow-hidden bg-gradient-to-br ${c.band} sm:h-12`}>
                <span className="absolute -inset-x-4 -top-6 h-10 rotate-[-8deg] bg-white/[0.06] blur-md" />
                <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute start-1.5 top-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-1.5 py-[2px] text-[8.5px] font-semibold text-zinc-200 backdrop-blur-sm">
                    <span className="block h-[3px] w-[3px] rounded-full bg-ts-purple-text" />
                    {t("c.typeCount")}
                  </span>
                </span>
                <span className="absolute end-1.5 top-1.5">
                  <Pill tone="purple" className="bg-ts-purple/30 backdrop-blur-sm">
                    {t("c.badge")}
                  </Pill>
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-2 pt-2">
                <FlagDot code={c.flag} size={12} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11.5px] font-bold leading-tight text-white">
                    {c.name}
                  </span>
                  <span className="block truncate text-[9.5px] leading-tight text-zinc-500">
                    {c.type}
                  </span>
                </span>
              </div>

              <div className={`mx-2 mt-2 grid grid-cols-3 divide-x divide-white/[0.06] rounded-md border border-white/[0.06] bg-white/[0.03] rtl:divide-x-reverse`}>
                {[
                  { l: t("c.typesLabel"), v: c.types },
                  { l: t("c.fastestLabel"), v: c.fastest },
                  { l: t("c.stayLabel"), v: c.stay },
                ].map((s) => (
                  <span key={s.l} className="min-w-0 px-1 py-1 text-center">
                    <span className={`block truncate ${LABEL}`}>{s.l}</span>
                    <span className="mt-[2px] block truncate text-[10px] font-semibold leading-none text-zinc-200">
                      {s.v}
                    </span>
                  </span>
                ))}
              </div>

              <div className="flex items-end justify-between gap-1.5 px-2 pb-2 pt-2">
                <span className="min-w-0">
                  <span className={`block ${LABEL}`}>{t("c.fromLabel")}</span>
                  <span className="mt-[1px] flex items-baseline gap-[2px] text-white">
                    <span className="text-[9px] text-zinc-500">$</span>
                    <span className="text-[15px] font-bold leading-none tabular-nums">
                      {c.price}
                    </span>
                  </span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-ts-purple/40 px-2 py-1 text-[9.5px] font-semibold leading-none text-ts-purple-text">
                  {t("c.apply")}
                  <CaretRight size={9} weight="bold" className="rtl:rotate-180" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* The row that continues past the window */}
        <div className="mt-2 grid grid-cols-2 gap-2">
          {["from-[#2a1c40] to-[#123037]", "from-[#331f2e] to-[#1c2a4a]"].map((band) => (
            <div key={band} className={`h-10 bg-gradient-to-br ${band} ${CARD}`} />
          ))}
        </div>

        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-cs-panel to-transparent" />
      </div>
    </SliceRoot>
  );
}

/* ── D. Visa requirements — the zoom slice ──────────────────────────────────
   The pre-payment disclosure step, and the page's one genuinely zoomed view:
   one dialog at close to real size, because the claim it proves is that the
   documents and the rules are *legible* before anyone pays. */

export function VisaRequirementsSlice() {
  const t = useTranslations("TourScope.slices");

  const stats = [
    { l: t("d.maxStayLabel"), v: t("d.maxStay") },
    { l: t("d.processingLabel"), v: t("d.processing") },
    { l: t("d.entriesLabel"), v: t("d.entries") },
  ];

  return (
    <SliceRoot>
      {/* Dialog head */}
      <div className={`flex items-center gap-2.5 border-b ${DIVIDE} px-3.5 py-3`}>
        <FlagDot code="bh" size={20} />
        <span className="truncate text-[14px] font-bold text-white">{t("d.name")}</span>
        <span className="ms-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-zinc-500">
          <X size={10} weight="bold" />
        </span>
      </div>

      <div className="px-3.5 py-3">
        <p className={`mb-2 ${LABEL}`}>{t("d.selectType")}</p>

        {/* The selected visa type — purple ring, exactly as the product marks it */}
        <div className="overflow-hidden rounded-lg border border-ts-purple/35 bg-ts-purple/[0.06]">
          <div className="flex items-center gap-2 px-2.5 py-2">
            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-ts-purple-text">
              <span className="block h-[6px] w-[6px] rounded-full bg-ts-purple-text" />
            </span>
            <span className="truncate text-[12px] font-semibold text-white">{t("d.type")}</span>
            <Pill tone="purple">{t("d.badge")}</Pill>
            <span className="ms-auto flex shrink-0 items-baseline gap-[2px] text-white">
              <span className="text-[9.5px] text-zinc-500">$</span>
              <span className="text-[16px] font-bold leading-none tabular-nums">{t("d.price")}</span>
            </span>
          </div>

          {/* Three-cell stat strip */}
          <div className={`grid grid-cols-3 divide-x divide-white/[0.07] border-y ${DIVIDE} bg-white/[0.02] rtl:divide-x-reverse`}>
            {stats.map((s) => (
              <span key={s.l} className="min-w-0 px-2.5 py-2">
                <span className={`block truncate ${LABEL}`}>{s.l}</span>
                <span className="mt-[3px] block truncate text-[12px] font-semibold leading-none text-white">
                  {s.v}
                </span>
              </span>
            ))}
          </div>

          <div className={`flex items-center gap-1.5 border-b ${DIVIDE} px-2.5 py-1.5`}>
            <span className={LABEL}>{t("d.availableFor")}</span>
            <FlagDot code="iq" size={11} />
            <span className="text-[10px] font-medium text-zinc-300">{t("d.nationality")}</span>
          </div>

          <div className="px-2.5 py-2">
            <p className="mb-2 flex items-center gap-1 text-[10px] font-semibold text-ts-purple-text">
              {t("d.toggle")}
              <CaretUp size={9} weight="bold" />
            </p>

            <p className={`mb-1.5 ${LABEL}`}>{t("d.docsLabel")}</p>
            <div className="mb-2.5 flex flex-col gap-[5px]">
              {[t("d.doc1"), t("d.doc2"), t("d.doc3")].map((doc) => (
                <span key={doc} className="flex items-center gap-1.5">
                  <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-cs-teal/30 bg-cs-teal/10 text-cs-teal">
                    <Check size={7} weight="bold" />
                  </span>
                  <span className="truncate text-[11px] text-zinc-200">{doc}</span>
                </span>
              ))}
            </div>

            <p className={`mb-1.5 ${LABEL}`}>{t("d.rulesLabel")}</p>
            <div className="flex flex-col gap-[3px]">
              {[t("d.rule1"), t("d.rule2")].map((rule) => (
                <span key={rule} className="flex gap-1.5 text-[10.5px] leading-snug text-zinc-400">
                  <span className="mt-[5px] block h-[3px] w-[3px] shrink-0 rounded-full bg-zinc-600" />
                  <span className="min-w-0">{rule}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dialog footer */}
      <div className={`flex items-center gap-3 border-t ${DIVIDE} bg-white/[0.02] px-3.5 py-2.5`}>
        <span className="flex items-baseline gap-[2px] text-white">
          <span className="text-[10px] text-zinc-500">$</span>
          <span className="text-[18px] font-bold leading-none tabular-nums">{t("d.price")}</span>
        </span>
        <Action label={t("d.apply")} className="ms-auto px-4 py-2.5" />
      </div>
    </SliceRoot>
  );
}

/* ── E. Arabic storefront — always RTL ──────────────────────────────────────
   Slice A's anatomy, pinned to `dir="rtl"` and Arabic on BOTH locales. That is
   the whole point: an English reader has to SEE the mirrored product, and a
   locale-following slice would show them the English one. Its strings are
   therefore Arabic in `en.json` too — deliberately, not a translation slip. */

export function ArabicStorefrontSlice() {
  const t = useTranslations("TourScope.slices");

  return (
    <div dir="rtl" lang="ar">
      <SliceRoot>
        <div className={`flex items-center gap-2 border-b ${DIVIDE} px-3 py-2.5 sm:px-4`}>
          <Wordmark className="h-[13px]" />
          <span className="hidden h-3 w-px shrink-0 bg-white/10 sm:block" />
          <span className="hidden items-center gap-1 rounded-md border border-white/[0.07] bg-white/[0.04] px-2 py-[3px] text-[9.5px] font-medium text-zinc-400 sm:inline-flex">
            <Globe size={10} />
            {t("e.region")}
          </span>
          <span className="ms-auto flex items-center gap-1.5">
            <span className="rounded-md border border-white/[0.07] bg-white/[0.04] px-1.5 py-[3px] text-[9.5px] font-semibold text-zinc-300">
              {t("e.currency")}
            </span>
            <span className="rounded-md border border-white/[0.07] bg-white/[0.04] px-1.5 py-[3px] text-[9.5px] font-semibold text-zinc-300">
              {t("e.language")}
            </span>
            <span className="ms-1 hidden items-center gap-1 sm:flex">
              <PulseDot />
              <span className="text-[9.5px] font-medium text-zinc-400">{t("e.live")}</span>
            </span>
          </span>
        </div>

        <div className="px-3 pb-3 pt-3 sm:px-4">
          <Segments
            items={[
              { label: t("e.tabOneWay"), active: true },
              { label: t("e.tabRound") },
              { label: t("e.tabMulti") },
              { label: t("e.tabOpen") },
            ]}
          />

          <div className="mt-2 flex flex-col gap-1.5 lg:flex-row lg:items-stretch">
            {/* Not four equal columns: the travelers field carries two strings
              ("2 adults" + the cabin) and truncated its own value at an even
              split. The real widget is wide enough not to notice; this one is
              600px and has to be told. */}
          <div className="grid min-w-0 grid-cols-2 gap-1.5 sm:grid-cols-[1fr_1fr_1fr_1.3fr] lg:flex-1">
              <Field label={t("e.fromLabel")} value={t("e.fromValue")} hint={t("e.fromCode")} />
              <Field label={t("e.toLabel")} value={t("e.toValue")} hint={t("e.toCode")} />
              <Field label={t("e.datesLabel")} value={t("e.datesValue")} />
              <Field
                label={t("e.travelersLabel")}
                value={t("e.travelersValue")}
                hint={t("e.cabin")}
              />
            </div>
            <Action
              label={t("e.search")}
              icon={<MagnifyingGlass size={12} weight="bold" />}
              className="shrink-0 py-2.5 lg:w-[86px] lg:py-0"
            />
          </div>

          <p className="mt-1.5 flex items-center gap-1.5 text-[9.5px] text-zinc-500">
            <CheckCircle size={11} weight="fill" className="shrink-0 text-cs-teal" />
            {t("e.taxNote")}
          </p>
        </div>

        <div className={`border-t ${DIVIDE} px-3 pb-3 pt-2.5 sm:px-4`}>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className={LABEL}>{t("e.resultsLabel")}</span>
            <span className="flex items-center gap-1.5">
              <PulseDot />
              <span className="truncate text-[9.5px] font-medium text-zinc-400">
                {t("e.searching")}
              </span>
            </span>
          </div>

          <div className={`flex items-center gap-2.5 p-2 ${ROW}`}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-ts-purple/25 bg-ts-purple/15 text-[10px] font-bold tracking-tight text-ts-purple-text">
              {t("e.airline")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-semibold leading-tight text-white">
                {t("e.route")}
              </span>
              <span className="block truncate text-[10px] leading-tight text-zinc-500">
                {t("e.routeMeta")}
              </span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-[13px] font-bold leading-none tabular-nums text-white">
                {t("e.price")}
              </span>
              <Pill tone="teal">{t("e.available")}</Pill>
            </span>
          </div>
        </div>
      </SliceRoot>
    </div>
  );
}

/* ── F. Pool markups — the business-engine anchor ───────────────────────────
   Visa pricing rules. The source column is the whole slice: two of these four
   products are somebody else's inventory being resold, and the badge is the
   only thing on screen that says so. Everything else is scaffolding for it. */

export function PoolMarkupsSlice() {
  const t = useTranslations("TourScope.slices");

  const rows = [
    { product: t("f.r1Product"), flag: "ae" as FlagKey, dest: t("f.r1Dest"), shared: true, tiers: "3" },
    { product: t("f.r2Product"), flag: "bh" as FlagKey, dest: t("f.r2Dest"), shared: true, tiers: "3" },
    { product: t("f.r3Product"), flag: "cn" as FlagKey, dest: t("f.r3Dest"), shared: false, tiers: "2" },
    { product: t("f.r4Product"), flag: "ge" as FlagKey, dest: t("f.r4Dest"), shared: true, tiers: "3" },
  ];

  /* Six columns, as the real table has. Five left a hole between the source
     badge and the currency wide enough to read as a rendering fault; the
     tiers column is what the product puts there. */
  const grid =
    "grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 sm:gap-3 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1.3fr)_minmax(0,0.95fr)_minmax(0,0.42fr)_minmax(0,0.42fr)_auto]";

  return (
    <SliceRoot>
      {/* Page head */}
      <div className={`flex items-center gap-2 border-b ${DIVIDE} px-3.5 py-3 sm:px-5`}>
        <IconTile tone="purple">
          <Percent size={12} weight="bold" />
        </IconTile>
        <span className="truncate text-[13px] font-semibold text-white">{t("f.title")}</span>
        {/* A chip, not "· 52": a bare middot beside a numeral reorders under
            bidi and reads as part of the number in Arabic. */}
        <CountChip>{t("f.count")}</CountChip>
      </div>

      <div className="px-3.5 pb-3 pt-3 sm:px-5">
        <div className="mb-2.5 flex">
          <Segments
            items={[
              { label: t("f.tabProducts"), count: t("f.tabProductsCount"), active: true },
              { label: t("f.tabSellers"), count: t("f.tabSellersCount") },
            ]}
          />
        </div>

        {/* Table */}
        <div className={`${grid} px-2.5 pb-1.5 ${LABEL}`}>
          <span className="truncate">{t("f.colProduct")}</span>
          <span className="hidden truncate md:block">{t("f.colRoute")}</span>
          <span className="truncate">{t("f.colSource")}</span>
          <span className="hidden truncate md:block">{t("f.colCurrency")}</span>
          <span className="hidden truncate md:block">{t("f.colTiers")}</span>
          <span className="truncate text-end">{t("f.colStatus")}</span>
        </div>

        <div className="flex flex-col gap-1">
          {rows.map((r) => (
            <div key={r.product} className={`${grid} px-2.5 py-2 ${ROW}`}>
              <span className="flex min-w-0 items-center gap-2">
                <IconTile>
                  <ShareNetwork size={11} weight="duotone" />
                </IconTile>
                <span className="min-w-0">
                  <span className="block truncate text-[11.5px] font-semibold leading-tight text-zinc-100">
                    {r.product}
                  </span>
                  <span className="block truncate text-[9.5px] leading-tight text-zinc-500">
                    {t("f.tier")}
                  </span>
                </span>
              </span>

              <span className="hidden min-w-0 items-center gap-1.5 md:flex">
                <span className="inline-flex min-w-0 items-center gap-1 rounded border border-white/[0.07] bg-white/[0.04] px-1.5 py-[3px]">
                  <FlagDot code={r.flag} size={10} />
                  <span className="truncate text-[9.5px] text-zinc-300">{r.dest}</span>
                </span>
                <span className="inline-flex min-w-0 items-center gap-1 rounded border border-white/[0.07] bg-white/[0.04] px-1.5 py-[3px]">
                  <FlagDot code="iq" size={10} />
                  <span className="truncate text-[9.5px] text-zinc-300">{t("f.nationality")}</span>
                </span>
              </span>

              <span className="min-w-0">
                {r.shared ? (
                  <Pill tone="purple" dot className="max-w-full">
                    <span className="truncate">{t("f.sourceShared")}</span>
                  </Pill>
                ) : (
                  <Pill tone="zinc" dot className="max-w-full">
                    <span className="truncate">{t("f.sourceOwn")}</span>
                  </Pill>
                )}
              </span>

              <span className="hidden truncate text-[10.5px] font-medium text-zinc-400 md:block">
                {t("f.currency")}
              </span>

              <span className="hidden min-w-0 md:block">
                <Pill tone="zinc">{t("f.tiers", { count: r.tiers })}</Pill>
              </span>

              <span className="shrink-0 justify-self-end">
                <Pill tone="teal" dot>
                  {t("active")}
                </Pill>
              </span>
            </div>
          ))}
        </div>
      </div>
    </SliceRoot>
  );
}
