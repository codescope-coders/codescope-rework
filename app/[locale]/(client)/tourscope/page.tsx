import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { FadeIn } from "@/components/site/FadeIn";
import { ScrollRevealText } from "@/components/site/ScrollRevealText";
import { SpotlightCard } from "@/components/site/SpotlightCard";
import { HeroBackground } from "@/components/site/HeroBackground";
import { SPOTLIGHT_PURPLE } from "@/lib/colors";
import { BusinessEngine } from "@/components/site/tourscope/BusinessEngine";
import { TenantAppGrid } from "@/components/site/TenantAppGrid";
import { ProductFrame } from "@/components/site/tourscope/ProductFrame";
import {
  StorefrontSearchSlice,
  ConsoleInventorySlice,
  VisaStorefrontSlice,
  VisaRequirementsSlice,
  ArabicStorefrontSlice,
  PoolMarkupsSlice,
} from "@/components/site/tourscope/ProductSlices";
import {
  AirplaneTilt, Bed, MapTrifold, IdentificationBadge, ShieldCheck, SimCard,
  PlugsConnected, Lock, Translate, CurrencyCircleDollar, Buildings,
  ArrowRight, ArrowUpRight, Check,
} from "@phosphor-icons/react/dist/ssr";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("TourScope.meta");
  return {
    title: { absolute: t("title") },
    description: t("description"),
    openGraph: { title: t("title"), description: t("description") },
  };
}

export default async function TourScopePage() {
  const t = await getTranslations("TourScope");
  const tFooter = await getTranslations("Footer");

  const verticals = [
    { Icon: AirplaneTilt, title: t("verticals.f1Title"), desc: t("verticals.f1Desc") },
    { Icon: Bed, title: t("verticals.f2Title"), desc: t("verticals.f2Desc") },
    { Icon: MapTrifold, title: t("verticals.f3Title"), desc: t("verticals.f3Desc") },
    { Icon: IdentificationBadge, title: t("verticals.f4Title"), desc: t("verticals.f4Desc") },
    { Icon: ShieldCheck, title: t("verticals.f5Title"), desc: t("verticals.f5Desc") },
    { Icon: SimCard, title: t("verticals.f6Title"), desc: t("verticals.f6Desc") },
  ];

  /* The product tour. Each item pairs ONE product view with the one claim that
     view proves — an alternating editorial split, deliberately not a card grid:
     the page already spends its card budget on the six verticals, and a third
     grid would make "here is the product" and "here is what you can sell" look
     like the same kind of content.

     The views are CODED slices, not screenshots. See ProductSlices.tsx for why
     — in short, the product renders light and the page does not, and a 1600px
     capture shrunk into this column stops being readable exactly where it
     starts mattering. */
  const tour = [
    {
      num: "01",
      title: t("marketTour.i1Title"),
      body: t("marketTour.i1Body"),
      caption: t("shots.visasCaption"),
      slice: <VisaStorefrontSlice />,
    },
    {
      num: "02",
      title: t("marketTour.i2Title"),
      body: t("marketTour.i2Body"),
      caption: t("shots.visaDetailCaption"),
      slice: <VisaRequirementsSlice />,
    },
    {
      num: "03",
      title: t("marketTour.i3Title"),
      body: t("marketTour.i3Body"),
      caption: t("shots.homeArCaption"),
      slice: <ArabicStorefrontSlice />,
    },
  ];

  // Four clusters, rendered as a spec sheet — see BusinessEngine.
  const engineClusters = [
    {
      index: "01",
      title: t("engine.c1Title"),
      thesis: t("engine.c1Thesis"),
      items: [t("engine.c1I1"), t("engine.c1I2"), t("engine.c1I3")],
    },
    {
      index: "02",
      title: t("engine.c2Title"),
      thesis: t("engine.c2Thesis"),
      items: [t("engine.c2I1"), t("engine.c2I2"), t("engine.c2I3"), t("engine.c2I4")],
    },
    {
      index: "03",
      title: t("engine.c3Title"),
      thesis: t("engine.c3Thesis"),
      items: [t("engine.c3I1"), t("engine.c3I2"), t("engine.c3I3")],
    },
    {
      index: "04",
      title: t("engine.c4Title"),
      thesis: t("engine.c4Thesis"),
      items: [t("engine.c4I1"), t("engine.c4I2"), t("engine.c4I3")],
    },
  ];

  /* The features that don't fit a comparison table. Hairline rows, not icon
     cards — this is the fourth "list of things" on the page and the only one
     whose items are pure prose. */
  const beyond = [
    { num: "01", title: t("beyond.b1Title"), body: t("beyond.b1Body") },
    { num: "02", title: t("beyond.b2Title"), body: t("beyond.b2Body") },
    { num: "03", title: t("beyond.b3Title"), body: t("beyond.b3Body") },
    { num: "04", title: t("beyond.b4Title"), body: t("beyond.b4Body") },
    { num: "05", title: t("beyond.b5Title"), body: t("beyond.b5Body") },
    { num: "06", title: t("beyond.b6Title"), body: t("beyond.b6Body") },
  ];

  const story = [
    { num: "01", label: t("story.b1Label"), body: t("story.b1Body") },
    { num: "02", label: t("story.b2Label"), body: t("story.b2Body") },
    { num: "03", label: t("story.b3Label"), body: t("story.b3Body") },
  ];

  const trust = [
    { Icon: PlugsConnected, label: t("trust.i1") },
    { Icon: Lock, label: t("trust.i2") },
    { Icon: Translate, label: t("trust.i3") },
    { Icon: CurrencyCircleDollar, label: t("trust.i4") },
    { Icon: Buildings, label: t("trust.i5") },
    { Icon: ShieldCheck, label: t("trust.i6") },
  ];

  const chips = [t("hero.chip1"), t("hero.chip2"), t("hero.chip3"), t("hero.chip4")];

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-36 sm:pt-40 pb-24 px-6 overflow-hidden">
        <HeroBackground variant="purple" />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-14 lg:gap-16 items-center">
          <div>
            <FadeIn delay={0}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ts-purple/10 border border-ts-purple/25 text-xs font-semibold text-ts-purple-text mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-cs-teal animate-pulse" />
                {t("hero.label")}
              </span>
            </FadeIn>

            <FadeIn delay={0.08}>
              <Image
                src="/Branding/tourscope.svg"
                alt="TourScope"
                width={340}
                height={36}
                className="h-9 sm:h-10 w-auto mb-7"
                priority
              />
            </FadeIn>

            <FadeIn delay={0.16}>
              <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-[1.08] mb-5 text-balance">
                {t("hero.headline")}
              </h1>
            </FadeIn>

            <FadeIn delay={0.24}>
              <p className="text-lg text-zinc-300 leading-relaxed max-w-[52ch] mb-8">
                {t("hero.desc")}
              </p>
            </FadeIn>

            <FadeIn delay={0.32}>
              <div className="flex flex-wrap gap-3 mb-8">
                <Link
                  href="/get-started"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-ts-purple text-white text-sm font-semibold rounded-xl hover:bg-ts-purple-hover transition-colors duration-200 active:scale-[0.98]"
                >
                  {t("hero.cta")}<ArrowRight size={15} weight="bold" className="rtl:rotate-180" />
                </Link>
                <a
                  href="#platform"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 text-zinc-300 text-sm font-medium rounded-xl hover:bg-white/5 hover:text-white transition-colors duration-200"
                >
                  {t("hero.ctaSecondary")}<ArrowUpRight size={15} className="rtl:-scale-x-100" />
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="flex flex-wrap gap-2">
                {chips.map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/8 bg-white/[0.03] text-xs text-zinc-400"
                  >
                    <Check size={12} weight="bold" className="text-ts-purple-hover" />
                    {chip}
                  </span>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* The storefront, coded. One frame at every width — the slice is
              responsive DOM, so the search fields stack on a phone and stay
              legible instead of shrinking into texture. That also retires the
              old two-element arrangement here (a desktop screenshot plus a
              separate small-screen mock), which shipped two different pictures
              of the same screen and downloaded one of them to phones that
              never painted it. */}
          <FadeIn delay={0.2}>
            <ProductFrame caption={t("shots.homeCaption")}>
              <StorefrontSearchSlice />
            </ProductFrame>
          </FadeIn>
        </div>
      </section>

      {/* ── Two sides ────────────────────────────────────────────────────── */}
      <section id="platform" className="py-28 sm:py-32 px-6 border-t border-white/5 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            {/* One of two kept eyebrows on this page (the other is the business
                engine). Above five of seven sections they read as chrome; on
                the two that genuinely reframe the product, they still land. */}
            <p className="text-sm font-medium text-ts-purple-text mb-3">{t("twoSides.eyebrow")}</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight max-w-[20ch] text-balance mb-16">
              {t("twoSides.headline")}
            </h2>
          </FadeIn>

          <div className="grid lg:grid-cols-2 gap-5">
            {/* B2C */}
            <FadeIn delay={0.05}>
              <div className="relative h-full rounded-2xl border border-white/[0.07] bg-zinc-900/30 p-8 sm:p-10 flex flex-col">
                <span className="self-start px-2.5 py-1 rounded-full border border-cs-teal/25 bg-cs-teal/[0.07] text-[11px] font-semibold text-cs-teal mb-6 tracking-wide">
                  {t("twoSides.b2cTag")}
                </span>
                <h3 className="text-2xl font-bold text-white leading-snug mb-3">{t("twoSides.b2cTitle")}</h3>
                <p className="text-zinc-300 leading-relaxed max-w-[46ch] mb-7">{t("twoSides.b2cBody")}</p>
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 mb-8">
                  {[t("twoSides.b2cB1"), t("twoSides.b2cB2"), t("twoSides.b2cB3"), t("twoSides.b2cB4")].map((b) => (
                    <li key={b} className="flex items-center gap-2.5 text-sm text-zinc-300">
                      <Check size={14} weight="bold" className="text-cs-teal shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  {[t("verticals.f1Title"), t("verticals.f2Title"), t("verticals.f3Title")].map((v) => (
                    <span key={v} className="px-2.5 py-1 rounded-md text-[11px] font-medium text-zinc-400 border border-white/8 bg-white/[0.02]">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* B2B */}
            <FadeIn delay={0.1}>
              <div className="card-ts-gradient relative h-full overflow-hidden rounded-2xl border border-white/[0.07] p-8 sm:p-10 flex flex-col">
                <span className="self-start px-2.5 py-1 rounded-full border border-ts-purple/30 bg-ts-purple/15 text-[11px] font-semibold text-ts-purple-text mb-6 tracking-wide">
                  {t("twoSides.b2bTag")}
                </span>
                <h3 className="text-2xl font-bold text-white leading-snug mb-3">{t("twoSides.b2bTitle")}</h3>
                <p className="text-zinc-300 leading-relaxed max-w-[46ch] mb-7">{t("twoSides.b2bBody")}</p>
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 mb-8">
                  {[t("twoSides.b2bB1"), t("twoSides.b2bB2"), t("twoSides.b2bB3"), t("twoSides.b2bB4")].map((b) => (
                    <li key={b} className="flex items-center gap-2.5 text-sm text-zinc-300">
                      <Check size={14} weight="bold" className="text-ts-purple-hover shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                {/* The console's inventory table. This card's claim is "you run
                    the business from one screen", so what it shows is the part
                    of that screen carrying the claim — a real table of real
                    properties, with the pool footer that says two of them are
                    being resold by other agencies.

                    A captured screenshot used to sit here, cropped to this
                    band. At card width the caption was legible and the table
                    rows were not, which is the wrong half to lose.

                    `glow` is off — the card already sits on a purple ground,
                    and a second wash on top of it reads as haze. */}
                <div className="mt-auto pt-2">
                  <ProductFrame caption={t("shots.consoleCaption")} glow={false}>
                    <ConsoleInventorySlice />
                  </ProductFrame>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Inside the marketplace — the product tour ─────────────────────── */}
      {/* overflow-x-clip (not -hidden): the ProductFrame glow extends past the
          section's inline padding between sm and ~1360px; clip doesn't create a
          scroll container, so the sticky navbar is unaffected. */}
      <section className="py-28 sm:py-32 px-6 border-t border-white/5 bg-zinc-900/20 overflow-x-clip">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3 max-w-[16ch] text-balance">
              {t("marketTour.headline")}
            </h2>
            <p className="text-lg text-zinc-300 leading-relaxed max-w-[52ch]">{t("marketTour.sub")}</p>
          </FadeIn>

          <div className="mt-16 flex flex-col gap-20 sm:gap-24 lg:gap-28">
            {tour.map((item, i) => {
              /* Alternation is expressed as GRID PLACEMENT, not source order,
                 so the DOM keeps reading title → body → image on a phone (and
                 to a screen reader) while the desktop layout zig-zags. Column 1
                 is the inline-start column, so the whole thing mirrors under
                 `dir="rtl"` with no second set of rules. */
              const flipped = i % 2 === 1;
              return (
                <div
                  key={item.num}
                  className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
                >
                  <FadeIn
                    className={
                      flipped
                        ? "lg:col-start-2 lg:row-start-1"
                        : "lg:col-start-1 lg:row-start-1"
                    }
                  >
                    <span
                      aria-hidden
                      className="block text-[11px] font-semibold tabular-nums tracking-widest text-ts-purple-text mb-4"
                    >
                      {item.num}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug mb-4 text-balance">
                      {item.title}
                    </h3>
                    <p className="text-[17px] text-zinc-300 leading-relaxed max-w-[46ch]">
                      {item.body}
                    </p>
                  </FadeIn>

                  <FadeIn
                    delay={0.08}
                    className={
                      flipped
                        ? "lg:col-start-1 lg:row-start-1"
                        : "lg:col-start-2 lg:row-start-1"
                    }
                  >
                    <ProductFrame caption={item.caption}>{item.slice}</ProductFrame>
                  </FadeIn>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Six verticals ────────────────────────────────────────────────── */}
      <section className="py-28 sm:py-32 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3">
              {t("verticals.headline")}
            </h2>
            <p className="text-lg text-zinc-300 mb-12">{t("verticals.sub")}</p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {verticals.map((v, i) => (
              <FadeIn key={v.title} delay={i * 0.06}>
                {/* `gap-3`, not `gap-4`: the icon tile's 16px gap plus the
                    h3's own half-leading opened ~21px between a card's icon
                    and its own label, against ~10px between that label and the
                    line under it — so the tile read as detached from the thing
                    it names and the grid looked airy rather than dense. */}
                <SpotlightCard className="group p-7 h-full flex flex-col gap-3" spotlightColor={SPOTLIGHT_PURPLE}>
                  <div className="w-11 h-11 rounded-xl bg-ts-purple/15 border border-ts-purple/25 flex items-center justify-center">
                    <v.Icon size={22} weight="duotone" className="text-ts-purple-hover" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{v.title}</h3>
                    <p className="text-sm text-zinc-300 leading-relaxed">{v.desc}</p>
                  </div>
                </SpotlightCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── The business engine — spec sheet ─────────────────────────────── */}
      <section className="py-28 sm:py-32 px-6 border-t border-white/5 bg-zinc-900/20 overflow-x-clip">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <p className="text-sm font-medium text-ts-purple-text mb-3">{t("engine.eyebrow")}</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3 max-w-[24ch] text-balance">
              {t("engine.headline")}
            </h2>
            <p className="text-lg text-zinc-300 mb-12 max-w-[60ch] leading-relaxed">{t("engine.sub")}</p>
          </FadeIn>

          {/* Anchor visual. The pricing table, wide — and the only thing on it
              that matters is the source column: two of these four products are
              another agency's inventory being resold, and the pool badge is the
              only thing on screen that says so. The captured version of this
              screen opened on a KPI strip of mostly zeroes, which on a
              marketing page reads as "nobody uses this" rather than as "this
              demo tenant has not configured it"; the slice simply starts below
              it. */}
          <FadeIn delay={0.06}>
            <ProductFrame caption={t("shots.pricingCaption")} className="mb-10 sm:mb-12">
              <PoolMarkupsSlice />
            </ProductFrame>
          </FadeIn>

          <BusinessEngine clusters={engineClusters} />
        </div>
      </section>

      {/* ── More than a booking tool ─────────────────────────────────────── */}
      <section className="py-28 sm:py-32 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3 max-w-[20ch] text-balance">
              {t("beyond.headline")}
            </h2>
            <p className="text-lg text-zinc-300 leading-relaxed max-w-[56ch]">{t("beyond.sub")}</p>
          </FadeIn>

          {/* Two columns of hairline rows. The rule is on each item's block
              start, so a row of two items shares one continuous line and the
              list needs no dividers of its own — the same ledger anatomy the
              trust list and the business engine use, at a smaller scale. */}
          <ul className="mt-14 border-b border-white/[0.07] md:grid md:grid-cols-2 md:gap-x-14 lg:gap-x-20">
            {beyond.map((item, i) => (
              <FadeIn
                as="li"
                key={item.num}
                delay={(i % 2) * 0.05}
                className="border-t border-white/[0.07] py-7 sm:py-8"
              >
                <div className="flex gap-4 sm:gap-5">
                  <span
                    aria-hidden
                    className="shrink-0 pt-1 text-[11px] font-semibold tabular-nums tracking-widest text-ts-purple-text"
                  >
                    {item.num}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-white leading-snug mb-2">
                      {item.title}
                    </h3>
                    <p className="text-[15px] text-zinc-300 leading-relaxed max-w-[48ch]">
                      {item.body}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Why agencies switch — the build story ────────────────────────── */}
      <section className="py-28 sm:py-32 px-6 border-t border-white/5 bg-zinc-900/20">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight max-w-[22ch] text-balance mb-8">
              {t("story.headline")}
            </h2>
          </FadeIn>

          {/* This page's one spoken-statement moment. The heading above states
              the claim; this is the page dropping into first person to say why
              it is entitled to make it, so it reveals rather than fades — and
              it is the paragraph, never the `h2`, for the reason
              `ScrollRevealText` documents.

              Deliberately NOT wrapped in `FadeIn`: the reveal IS the entrance,
              and an opacity animation on top of a per-token colour animation
              means the first third of the sweep happens on text that is still
              fading up. The surrounding heading and cards keep their FadeIns. */}
          <ScrollRevealText
            text={t("story.body")}
            highlights={t.raw("story.highlights") as string[]}
            offset={["center 80%", "center 30%"]}
            className="mb-14 max-w-[30ch] text-2xl font-medium leading-[1.35] tracking-tight sm:text-3xl lg:text-4xl"
          />

          <div className="grid md:grid-cols-3 gap-px rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.06]">
            {story.map((s, i) => (
              <FadeIn key={s.num} delay={i * 0.08} className="h-full">
                <div className="bg-cs-panel h-full p-8 flex flex-col gap-4">
                  <span className="text-sm font-bold text-ts-purple-text tabular-nums">{s.num}</span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">{s.label}</span>
                  <p className="text-zinc-200 leading-relaxed">{s.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust bar ────────────────────────────────────────────────────── */}
      <section className="py-28 sm:py-32 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-12 max-w-[24ch] mx-auto text-balance">
              {t("trust.headline")}
            </h2>
          </FadeIn>

          {/* Hairline rows, not a fourth card grid. These are six one-line
              claims, and boxing each one in the same rounded card as the
              verticals section directly above made two different kinds of
              content look like the same kind — by the third grid the page
              stopped distinguishing "here is what you can sell" from "here is
              what it is built on". Same ledger anatomy as the production-facts
              band on the home page. */}
          <ul className="max-w-4xl mx-auto border-t border-white/[0.07] mb-10">
            {trust.map((item, i) => (
              <FadeIn
                as="li"
                key={item.label}
                delay={i * 0.05}
                className="flex items-center gap-4 py-4 border-b border-white/[0.07] sm:gap-5"
              >
                <span
                  aria-hidden
                  className="hidden sm:block w-8 shrink-0 text-xs font-semibold tabular-nums text-zinc-600"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <item.Icon size={18} weight="duotone" className="shrink-0 text-ts-purple-hover" />
                <span className="text-[15px] text-zinc-300 leading-relaxed">{item.label}</span>
              </FadeIn>
            ))}
          </ul>

          <FadeIn>
            <p className="text-center text-sm text-zinc-300">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cs-teal align-middle me-2" />
              {t("trust.note")}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── APP STORE ICONS — the same white-label, one layer further out ── */}
      {/* Tinted: the trust ledger above and the CTA below are both untinted, so
          the band is what separates this exhibit from the claims it evidences. */}
      <section className="py-28 sm:py-32 px-6 border-t border-white/5 bg-zinc-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4 text-balance">
              {t("appGrid.headline")}
            </h2>
            <p className="text-lg text-zinc-300 leading-relaxed max-w-[54ch] mx-auto mb-12">
              {t("appGrid.sub")}
            </p>
          </FadeIn>
          <TenantAppGrid />
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative py-32 px-6 overflow-hidden border-t border-white/5">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 50% 60% at 50% 50%, rgba(111,0,255,0.1), transparent)" }}
        />
        <div className="relative max-w-2xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-5 leading-tight text-balance">
              {t("cta.heading")}
            </h2>
            <p className="text-lg text-zinc-300 mb-10 max-w-[44ch] mx-auto leading-relaxed">{t("cta.subheading")}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/get-started"
                className="inline-flex items-center gap-2 px-8 py-4 bg-ts-purple text-white font-semibold rounded-xl hover:bg-ts-purple-hover transition-colors duration-200 active:scale-[0.98]"
              >
                {t("cta.cta")}<ArrowRight size={16} weight="bold" className="rtl:rotate-180" />
              </Link>
              <a
                href={`mailto:${tFooter("email")}`}
                className="inline-flex items-center gap-2 px-8 py-4 border border-white/10 text-zinc-300 font-medium rounded-xl hover:bg-white/5 hover:text-white transition-colors duration-200"
              >
                {t("cta.ctaSecondary")}<ArrowUpRight size={16} className="rtl:-scale-x-100" />
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
