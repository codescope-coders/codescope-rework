import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { FadeIn } from "@/components/site/FadeIn";
import { HeroBackground } from "@/components/site/HeroBackground";
import { AnimatedHeadline } from "@/components/site/AnimatedHeadline";
import { CountUp } from "@/components/site/CountUp";
import { HeroProductPreview } from "@/components/site/HeroProductPreview";
import { MagneticButton } from "@/components/site/MagneticButton";
import { ManifestoSection } from "@/components/site/ManifestoSection";
import { TenantBrandsMarquee } from "@/components/site/TenantBrandsMarquee";
import { DashboardMock } from "@/components/site/tourscope/PlatformPreview";
import { ScrollCue } from "@/components/site/ScrollCue";
import { ArrowRightIcon } from "@/components/site/icons";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import {
  AirplaneTilt, Bed, MapTrifold, IdentificationBadge, ShieldCheck, SimCard,
} from "@phosphor-icons/react/dist/ssr";

export default async function HomePage() {
  const t = await getTranslations("Home");

  const verticals = [
    { Icon: AirplaneTilt, label: t("platform.v1") },
    { Icon: Bed, label: t("platform.v2") },
    { Icon: MapTrifold, label: t("platform.v3") },
    { Icon: IdentificationBadge, label: t("platform.v4") },
    { Icon: ShieldCheck, label: t("platform.v5") },
    { Icon: SimCard, label: t("platform.v6") },
  ];

  // Production facts — a typographic ledger, not another icon grid. Every line
  // is a claim we can demo; none of them is a number we made up.
  const productionFacts = [
    { n: "01", term: t("production.r1Term"), value: t("production.r1Value") },
    { n: "02", term: t("production.r2Term"), value: t("production.r2Value") },
    { n: "03", term: t("production.r3Term"), value: t("production.r3Value") },
    { n: "04", term: t("production.r4Term"), value: t("production.r4Value") },
    { n: "05", term: t("production.r5Term"), value: t("production.r5Value") },
    { n: "06", term: t("production.r6Term"), value: t("production.r6Value") },
  ];

  const companyFacts = [t("about.fact1"), t("about.fact2"), t("about.fact3")];

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
        <HeroBackground />

        <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-20 w-full grid grid-cols-1 lg:grid-cols-[58fr_42fr] gap-12 lg:gap-20 items-center">
          <div>
            <FadeIn delay={0}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-xs text-zinc-400 mb-8 bg-white/3">
                <span className="w-1.5 h-1.5 rounded-full bg-cs-teal animate-pulse shrink-0" />
                {t("hero.eyebrow")}
              </div>
            </FadeIn>

            <AnimatedHeadline
              text={t("hero.headline")}
              accent={t("hero.headlineAccent")}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tighter leading-[1.05] mb-6 text-balance"
              accentClassName="text-cs-teal-hover"
            />

            {/* The hero's entrance chain. Each step is ~60ms behind the last,
                so the whole hero — headline, promise, CTAs, proof, product shot
                — has landed by ~0.95s. It used to run to ~1.55s, with the
                primary CTA arriving at 1.13s: a second of watching a page
                assemble itself before you can act on it, every visit. */}
            <FadeIn delay={0.06}>
              <p className="text-lg text-zinc-300 leading-relaxed max-w-[50ch] mb-10">
                {t("hero.subhead")}
              </p>
            </FadeIn>

            <FadeIn delay={0.12}>
              <div className="flex flex-wrap gap-3 mb-14">
                <MagneticButton>
                  <Link
                    href="/tourscope"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-cs-teal text-white text-sm font-semibold rounded-xl hover:bg-cs-teal-hover transition-colors duration-200 active:scale-[0.98]"
                  >
                    {t("hero.ctaPrimary")}
                    <ArrowRightIcon size={15} className="text-white rtl:rotate-180" />
                  </Link>
                </MagneticButton>
                <MagneticButton>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 text-zinc-300 text-sm font-medium rounded-xl hover:bg-white/5 hover:text-white transition-colors duration-200 active:scale-[0.98]"
                  >
                    {t("hero.ctaSecondary")}
                    <ArrowUpRight size={15} className="rtl:-scale-x-100" />
                  </Link>
                </MagneticButton>
              </div>
            </FadeIn>

            <FadeIn delay={0.18}>
              <div className="grid grid-cols-2 gap-6 border-t border-white/5 pt-8 sm:grid-cols-4">
                {[
                  // Counting up to 6 reads weak — only the big inventory
                  // figures (700+ airlines) earn the animation. "1.5M+" is a
                  // formatted string CountUp can't parse, so it stays static.
                  { value: t("hero.stat1"), label: t("hero.stat1Label"), count: false },
                  { value: t("hero.stat2"), label: t("hero.stat2Label"), count: true },
                  { value: t("hero.stat3"), label: t("hero.stat3Label"), count: false },
                  { value: t("hero.stat4"), label: t("hero.stat4Label"), count: false },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-white tabular-nums">
                      {stat.count ? <CountUp value={stat.value} /> : stat.value}
                    </p>
                    <p className="text-xs text-zinc-300 mt-1 leading-snug">{stat.label}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.24}>
              <p className="text-[11px] text-zinc-300 tracking-wide mt-6">
                {t("hero.foundedNote")}
              </p>
            </FadeIn>
          </div>

          <HeroProductPreview />
        </div>

        <FadeIn delay={0.4} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ScrollCue label={t("hero.scrollCue")} />
        </FadeIn>
      </section>

      {/* ── MANIFESTO — why we built Tourscope ───────────────────────────── */}
      <ManifestoSection
        text={t("manifesto.text")}
        eyebrow={t("manifesto.eyebrow")}
        highlights={t.raw("manifesto.highlights") as string[]}
      />

      {/* ── THE PLATFORM — promoted Tourscope showcase ───────────────────── */}
      <section className="relative py-24 px-6 border-t border-white/5 bg-zinc-900/30 overflow-hidden">
        {/* Depth: purple aurora anchored to the top of the section */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-24 h-[520px]"
          style={{ background: "radial-gradient(ellipse 60% 100% at 50% 0%, rgba(111,0,255,0.14), transparent 70%)" }}
        />
        <div className="relative max-w-7xl mx-auto">
          <FadeIn>
            {/* No eyebrow. The headline says what the section is; a label above
                every section is a tic, and once five of seven have one they
                stop reading as emphasis and start reading as chrome. */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
              {t("platform.headline")}
            </h2>
            <p className="text-lg text-zinc-300 leading-relaxed max-w-[56ch] mb-10">
              {t("platform.body")}
            </p>
          </FadeIn>

          {/* Real product — the traveler storefront across devices.
              The composite is the section's centerpiece, so it runs wider than
              the copy column above it and carries its own ambient wash. Capped
              at 1160px: the source is 1742px, and anything wider drops the
              render below the 1.5× density that keeps the wordmarks crisp.
              The picture does NOT mirror under RTL — it is a photograph of real
              product UI, and flipping it would mirror the product's own
              chrome. Only the layout around it swaps sides.

              The asset is alpha-keyed, so the wash below shows THROUGH the gaps
              between the devices rather than being occluded by a black plate.
              It is a plain positioned sibling painted before the image — NOT
              `-z-10`, which would drop it behind the section's own
              `bg-zinc-900/30` and mute it.

              PNG, not WebP, and that is load-bearing: Next 16.1.3's image
              optimizer FLATTENS the alpha of a WebP *source* (verified — the
              same keyed pixels served through `/_next/image` come back with
              α=255 everywhere), while a PNG source round-trips transparency
              intact and is still delivered to the browser as WebP — measured
              121KB at the widest size, against a 444KB source on disk.
              Shipping the .webp source silently restored the black plate this
              asset was keyed to remove. */}
          <FadeIn delay={0.05}>
            {/* Below `sm` the negative inline margin cancels the section's own
                `px-6` so three devices are not squeezed into 327px — the
                section is `overflow-hidden`, so the bleed cannot scroll the
                page sideways, and `-mx-` is symmetric so it needs no RTL
                counterpart. */}
            <div className="relative -mx-6 sm:mx-auto sm:max-w-[1160px]">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-x-8 -inset-y-10 blur-3xl"
                style={{ background: "radial-gradient(ellipse 62% 66% at 50% 50%, rgba(111,0,255,0.26), transparent 72%)" }}
              />
              <Image
                src="/Mockups/platform-devices.png"
                alt={t("platform.devicesAlt")}
                width={1742}
                height={903}
                priority={false}
                sizes="(max-width: 1200px) 100vw, 1160px"
                className="relative w-full h-auto select-none"
              />
            </div>
          </FadeIn>

          {/* The two products, side by side directly under the composite: the
              storefront on the inline start, the console on the inline end.
              Stacked in one column beside the console mock they read as two
              unrelated blocks; paired under the picture they read as its two
              halves. `items-stretch` (grid default) keeps the cards level when
              one body wraps a line longer than the other. */}
          <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-5">
            <FadeIn delay={0.05}>
              <div className="h-full rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
                <span className="inline-block px-2.5 py-1 rounded-full border border-cs-teal/25 bg-cs-teal/[0.07] text-[11px] font-semibold text-cs-teal mb-4 tracking-wide">
                  {t("platform.b2cTag")}
                </span>
                <h3 className="text-xl font-bold text-white mb-2 leading-snug">{t("platform.b2cTitle")}</h3>
                <p className="text-sm text-zinc-300 leading-relaxed">{t("platform.b2cBody")}</p>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="card-ts-gradient h-full rounded-2xl border border-ts-purple/20 p-6">
                <span className="inline-block px-2.5 py-1 rounded-full border border-ts-purple/30 bg-ts-purple/15 text-[11px] font-semibold text-ts-purple-text mb-4 tracking-wide">
                  {t("platform.b2bTag")}
                </span>
                <h3 className="text-xl font-bold text-white mb-2 leading-snug">{t("platform.b2bTitle")}</h3>
                <p className="text-sm text-zinc-300 leading-relaxed">{t("platform.b2bBody")}</p>
              </div>
            </FadeIn>
          </div>

          {/* The console's own evidence. The composite above shows the traveler
              side on three devices; this is the agency side, so it follows the
              card that describes it rather than competing with the composite
              for the same row. */}
          <FadeIn delay={0.12}>
            <div className="relative mx-auto mt-10 max-w-4xl">
              <div aria-hidden className="absolute -inset-6 pointer-events-none"
                style={{ background: "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(111,0,255,0.12), transparent)" }} />
              <DashboardMock className="relative" />
            </div>
          </FadeIn>

          {/* Six verticals strip */}
          <FadeIn delay={0.1}>
            <div className="mt-14 pt-10 border-t border-white/5">
              <p className="text-sm font-medium text-zinc-400 mb-5">
                {t("platform.verticalsLabel")}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {verticals.map((v) => (
                  <span key={v.label}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-white/8 bg-white/[0.03] text-sm text-zinc-300">
                    <v.Icon size={16} weight="duotone" className="text-ts-purple-hover" />
                    {v.label}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.12}>
            <Link
              href="/tourscope"
              className="group mt-10 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-ts-purple-text transition-colors duration-200"
            >
              {t("platform.cta")}
              <ArrowUpRight size={15} className="rtl:-scale-x-100 ltr:group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ── PRODUCTION FACTS — a ledger strip, not an icon grid ──────────── */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
              {t("production.headline")}
            </h2>
            <p className="text-zinc-300 leading-relaxed max-w-[52ch] mb-12">
              {t("production.sub")}
            </p>
          </FadeIn>

          {/* `dl` accepts a `div` per term/value group — but only ONE level of
              it. FadeIn used to sit between the list and the row, producing
              `dl > div > div > dt`, which no parser reads as a description
              list. The fade wrapper IS the row now. */}
          <dl className="border-t border-white/[0.07]">
            {productionFacts.map((fact, i) => (
              <FadeIn
                key={fact.term}
                delay={i * 0.05}
                className="grid gap-x-8 gap-y-1 py-5 border-b border-white/[0.07] sm:grid-cols-[3rem_minmax(0,13rem)_1fr]"
              >
                <span
                  aria-hidden
                  className="hidden sm:block text-xs font-semibold tabular-nums text-zinc-600 pt-1"
                >
                  {fact.n}
                </span>
                <dt className="text-sm font-semibold text-white pt-0.5">{fact.term}</dt>
                <dd className="text-[15px] text-zinc-300 leading-relaxed">{fact.value}</dd>
              </FadeIn>
            ))}
          </dl>
        </div>
      </section>

      {/* ── CLIENT BRANDS — the wall of agencies running on Tourscope ────── */}
      {/* No tint, and with the marks floating unframed that is the whole point:
          the ground IS the surface they sit on, so a wash here would read as a
          box drawn around all of them at once. `overflow-hidden` is what keeps
          the full-bleed rows from scrolling the page sideways. */}
      <section className="py-24 border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
              {t("partners.headline")}
            </h2>
            <p className="text-zinc-300 leading-relaxed max-w-[56ch] mb-12">
              {t("partners.sub")}
            </p>
          </FadeIn>
        </div>

        {/* Outside the `px-6` container on purpose — the rows run edge to edge
            so the drift reads as continuous rather than as two clipped strips. */}
        <FadeIn delay={0.05}>
          <TenantBrandsMarquee />
        </FadeIn>
      </section>

      {/* ── THE COMPANY — compact strip ──────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5 bg-zinc-900/20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <FadeIn>
            <p className="text-sm font-medium text-cs-teal-hover mb-3">{t("about.eyebrow")}</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight text-balance">
              {t("about.headline")}
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="text-zinc-300 leading-relaxed text-lg mb-8">{t("about.body")}</p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-8 text-sm text-zinc-300">
              {companyFacts.map((fact, i) => (
                <span key={fact} className="inline-flex items-center gap-3">
                  {i > 0 && <span aria-hidden className="w-1 h-1 rounded-full bg-zinc-700" />}
                  {fact}
                </span>
              ))}
            </div>

            <Link
              href="/about"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-cs-teal-hover transition-colors duration-200"
            >
              {t("about.cta")}
              <ArrowUpRight size={15} className="rtl:-scale-x-100 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="relative py-36 px-6 overflow-hidden border-t border-white/5">
        {/* Code-drawn aurora — same language as HeroBackground, no 10MB JPEG. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 70% at 22% 18%, rgba(0,167,157,0.16), transparent 65%), radial-gradient(ellipse 60% 75% at 80% 82%, rgba(111,0,255,0.18), transparent 68%), radial-gradient(ellipse 90% 60% at 50% 50%, rgba(111,0,255,0.06), transparent 75%)",
          }}
        />
        <div className="relative max-w-2xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tight mb-5 text-white leading-tight text-balance">
              {t("cta.headline")}
            </h2>
            <p className="text-zinc-300 text-lg mb-10 max-w-[42ch] mx-auto leading-relaxed">
              {t("cta.subhead")}
            </p>
            <MagneticButton>
              <Link
                href="/get-started"
                className="inline-flex items-center gap-2 px-8 py-4 bg-cs-teal text-white font-semibold rounded-xl hover:bg-cs-teal-hover transition-colors duration-200 active:scale-[0.98]"
              >
                {t("cta.button")}
                <ArrowRightIcon size={16} className="text-white rtl:rotate-180" />
              </Link>
            </MagneticButton>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
