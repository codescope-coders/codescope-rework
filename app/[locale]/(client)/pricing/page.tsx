import type { Metadata } from "next";
import { Fragment } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight, Check } from "@phosphor-icons/react/dist/ssr";
import { Link } from "@/i18n/routing";
import { AnimatedHeadline } from "@/components/site/AnimatedHeadline";
import { FadeIn } from "@/components/site/FadeIn";
import { HeroBackground } from "@/components/site/HeroBackground";
import { PricingFaq } from "@/components/site/PricingFaq";
import { ScrollRevealText } from "@/components/site/ScrollRevealText";
import { SpotlightCard } from "@/components/site/SpotlightCard";
import {
  SPOTLIGHT_NEUTRAL,
  SPOTLIGHT_PURPLE,
  SPOTLIGHT_TEAL,
} from "@/lib/colors";
import {
  ADDONS,
  ADVANCED_BUNDLED_ADDONS_ANNUAL,
  PACKAGES,
  PRICING_NOTES,
  SETUP_INCLUDES,
} from "@/data/pricing";
import { usd } from "@/lib/bidi";

/**
 * The public pricing page.
 *
 * ── Numbers come from ONE place ────────────────────────────────────────────
 * Every amount on this page is read from `data/pricing.ts`. Nothing here
 * retypes a price, and the localized prose that travels WITH a price (feature
 * lists, add-on names, what setup buys) lives in that file too, as `*En`
 * siblings of the Arabic — see its header for why. The message files carry only
 * page framing: headings, column labels, the CTA.
 *
 * ── What this page deliberately is not ─────────────────────────────────────
 * The data behind it began as a printed proposal, with an issue date, a
 * validity window and a signature block. None of that is here: a public page
 * that asks to be signed is a PDF wearing a website. It was removed from the
 * data file as well, so there is nothing left to accidentally render.
 *
 * ── Billing terms are a TABLE, not a toggle ────────────────────────────────
 * Three fixed terms with fixed prices is a fact, not a state. A quarterly /
 * annual / two-year switch would hide two thirds of the answer behind an
 * interaction and make the page impossible to scan, screenshot or compare —
 * which is what a buyer with three tabs open is doing. The annual price leads
 * because it is the default term; the alternatives sit under it in a quiet
 * tabular ladder.
 */

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Pricing");

  return {
    // `absolute` bypasses the layout's "%s | CodeScope" template: the copy
    // already names both the product and the company, and the template would
    // print "…by Codescope | CodeScope".
    title: { absolute: t("meta.title") },
    description: t("meta.description"),
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
    },
  };
}

export default async function PricingPage() {
  const t = await getTranslations("Pricing");
  const locale = await getLocale();
  const ar = locale === "ar";

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pb-20 pt-40">
        <HeroBackground />
        <div className="relative mx-auto max-w-7xl">
          <AnimatedHeadline
            text={t("hero.heading")}
            accent={t("hero.headingAccent")}
            className="mb-6 text-5xl font-bold tracking-tighter leading-[1.05] text-white sm:text-6xl lg:text-7xl"
            accentClassName="text-zinc-400"
          />
          <FadeIn delay={0.5}>
            <p className="max-w-[54ch] text-lg leading-relaxed text-zinc-300">
              {t("hero.subheading")}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── Packages ─────────────────────────────────────────────────────── */}
      <section className="relative px-6 py-16">
        {/* Clean ground.

            `GridHighlight` is a single `fixed inset-0 -z-10` layer mounted by
            the client layout — the whole site's ambient net, plus a teal glow
            that follows the cursor. It is right everywhere else on this page
            and wrong HERE: the cards have just been given their own
            cursor-following spotlight, and two cursor-reactive effects in one
            viewport read as a page that is following you around rather than a
            card that is responding to you.

            A `fixed` layer cannot be masked from a section that scrolls past
            it, so the section paints over it instead: opaque `--color-cs-ink`
            (the same value the body carries, so the seam is invisible) at a
            z-index above the grid's −10 and below content's auto/0. The
            section is `relative` with `z-index: auto`, which positions this
            child without creating a stacking context that would trap it. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-[5] bg-cs-ink"
        />
        <div className="relative mx-auto max-w-7xl">
          <FadeIn>
            <h2 className="mb-12 max-w-[24ch] text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t("packages.heading")}
            </h2>
          </FadeIn>

          {/* `items-stretch` + a negative block margin on the featured card is
              what makes it senior in SIZE rather than only in colour — a badge
              alone reads as a sticker on three equal cards. */}
          <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-3 lg:gap-6">
            {PACKAGES.map((pkg, i) => {
              const featured = Boolean(pkg.featured);
              const bestValue = Boolean(pkg.bestValue);
              const features = ar ? pkg.features : pkg.featuresEn;

              return (
                <FadeIn
                  key={pkg.id}
                  delay={i * 0.08}
                  className={featured ? "relative z-10 lg:-my-5" : ""}
                >
                  {/* The hover is the site's existing SpotlightCard, not a new
                      effect: a cursor-following wash inside the card, tinted to
                      whatever that card is arguing (purple = the pick, teal =
                      the value, neutral = neither), plus a 4px lift and the
                      ground's own hairline brightening on the same 350ms curve.
                      `lift` is opt-in because the other cards on the site are
                      not pickable and must not start claiming to be. */}
                  <SpotlightCard
                    lift
                    surfaceClassName={
                      featured
                        ? "pkg-ground-featured"
                        : bestValue
                          ? "pkg-ground-value"
                          : "pkg-ground"
                    }
                    spotlightColor={
                      featured
                        ? SPOTLIGHT_PURPLE
                        : bestValue
                          ? SPOTLIGHT_TEAL
                          : SPOTLIGHT_NEUTRAL
                    }
                    className="flex h-full flex-col p-7 md:p-8"
                  >
                    {/* Name + badge. Two badges, two registers: the featured
                        card's is FILLED purple (it is the recommendation), the
                        best-value card's is an OUTLINE in teal (it is an
                        argument). Same size and position, so the row still
                        scans as three cards rather than two headlines. */}
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-bold text-white">
                        {ar ? pkg.name : pkg.nameEn}
                      </h3>
                      {featured && (pkg.badge || pkg.badgeEn) && (
                        <span className="rounded-full border border-ts-purple/40 bg-ts-purple/15 px-2.5 py-0.5 text-[0.6875rem] font-semibold text-ts-purple-text">
                          {ar ? pkg.badge : pkg.badgeEn}
                        </span>
                      )}
                      {bestValue && (
                        <span className="rounded-full border border-cs-teal/45 px-2.5 py-0.5 text-[0.6875rem] font-semibold text-cs-teal">
                          {t("packages.bestValueBadge")}
                        </span>
                      )}
                    </div>
                    <p className="mb-7 text-sm leading-relaxed text-zinc-400">
                      {ar ? pkg.icp : pkg.icpEn}
                    </p>

                    {/* Headline price — the ANNUAL amount, per founder
                        direction (2026-09-05). The monthly figure is what a
                        card of this shape reflexively leads with, and it is the
                        wrong number here: nobody can buy a month (the minimum
                        term is three, and annual is the default), so "$375"
                        headlined a price that is not on sale. The monthly
                        equivalent survives underneath, as an equivalence rather
                        than an offer.

                        Every amount on this page sits in its own `dir="ltr"`
                        span: a bare "$4,500" beside Arabic renders as "4,500$"
                        because the bidi algorithm hands the currency sign to
                        the surrounding right-to-left run. Isolating the token
                        is the only fix that survives every neighbour. */}
                    <div className="flex items-baseline gap-2">
                      <span
                        dir="ltr"
                        className="text-5xl font-bold tabular-nums tracking-tight text-white"
                      >
                        {`$${pkg.annual.price}`}
                      </span>
                      <span className="text-sm text-zinc-400">
                        {t("packages.perYear")}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-zinc-500">
                      <span dir="ltr" className="tabular-nums">
                        {pkg.annual.perMonth}
                      </span>{" "}
                      {t("packages.perMonth")}
                    </p>

                    {/* Every term, priced two ways. A ladder, not a switch —
                        and a real column grid rather than a run-on line, so
                        the numbers align down the card and each amount is its
                        own isolated cell. */}
                    <div className="mt-6 border-t border-white/8 pt-4">
                      <h4 className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-widest text-zinc-500">
                        {t("packages.billingHeading")}
                      </h4>
                      <dl className="grid grid-cols-[1fr_auto_auto] items-baseline gap-x-5 gap-y-2 text-sm">
                        <span aria-hidden />
                        <span className="text-end text-[0.625rem] font-semibold uppercase tracking-wider text-zinc-600">
                          {t("packages.colBilled")}
                        </span>
                        <span className="text-end text-[0.625rem] font-semibold uppercase tracking-wider text-zinc-600">
                          {t("packages.perMonth")}
                        </span>

                        {/* The annual term is deliberately NOT a row here: it
                            is the headline above, and restating it would print
                            both of its numbers twice inside one card. "Other
                            terms" means other than the one on sale. */}
                        {pkg.alts.map((alt) => (
                          <Fragment key={alt.termEn}>
                            <dt className="text-zinc-400">
                              {ar ? alt.term : alt.termEn}
                            </dt>
                            <dd
                              dir="ltr"
                              className="text-end tabular-nums text-zinc-300"
                            >
                              {alt.total}
                            </dd>
                            <dd
                              dir="ltr"
                              className="text-end tabular-nums text-zinc-500"
                            >
                              {alt.perMonth}
                            </dd>
                          </Fragment>
                        ))}
                      </dl>

                      <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-white/5 pt-3 text-sm">
                        <span className="text-zinc-400">
                          {t("packages.setup")}
                        </span>
                        <span className="text-zinc-300">
                          <span dir="ltr" className="tabular-nums">
                            {pkg.setup}
                          </span>
                          <span className="text-zinc-500">
                            {" "}
                            · {t("packages.setupOnce")}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mt-6 border-t border-white/8 pt-5">
                      <h4 className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-widest text-zinc-500">
                        {t("packages.includes")}
                      </h4>
                      <ul className="flex flex-col gap-2.5">
                        {features.map((feature) => (
                          <li key={feature} className="flex gap-3">
                            <Check
                              aria-hidden
                              size={14}
                              weight="bold"
                              className="mt-1 shrink-0 text-cs-teal"
                            />
                            <span className="text-sm leading-relaxed text-zinc-300">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* The value line — the punchline of the feature list, so
                        it sits under it rather than up beside the badge.

                        `{sum}` arrives already wrapped in U+2066/U+2069
                        (isolate / pop), not as a `dir="ltr"` element: next-intl
                        interpolates ICU ARGUMENTS as text, and only TAGS can
                        carry markup. Without the isolates the Arabic sentence
                        hands "$3,400" its own currency sign back on the wrong
                        end. See `usd()`. */}
                    {bestValue && (
                      <p className="mt-6 rounded-xl border border-cs-teal/20 bg-cs-teal/[0.06] px-4 py-3 text-xs leading-relaxed text-zinc-300">
                        {t("packages.bestValueLine", {
                          sum: usd(ADVANCED_BUNDLED_ADDONS_ANNUAL),
                        })}
                      </p>
                    )}

                    <p className="mt-6 text-xs leading-relaxed text-zinc-500">
                      {ar ? pkg.footnote : pkg.footnoteEn}
                    </p>

                    {/* `mt-auto` pins every CTA to the card's bottom edge, so
                        three cards with different feature counts still line
                        their buttons up. */}
                    {/* The card knows which package the reader is looking at,
                        so the request form should not have to ask again — the
                        tier rides across as `?package=`, preselects the
                        control and pre-writes the message. `pkg.id` is already
                        the exact `charter | standard | advanced` alphabet the
                        form and the API validate against. */}
                    <Link
                      href={`/get-started?package=${pkg.id}`}
                      className={[
                        "mt-auto inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-colors duration-200 active:scale-[0.98]",
                        featured
                          ? "bg-cs-teal text-white hover:bg-cs-teal-hover"
                          : "border border-white/10 bg-white/4 text-white hover:border-cs-teal/40 hover:bg-cs-teal/10",
                      ].join(" ")}
                    >
                      {featured ? t("packages.ctaFeatured") : t("packages.cta")}
                      <ArrowRight aria-hidden size={14} weight="bold" className="rtl:rotate-180" />
                    </Link>
                  </SpotlightCard>
                </FadeIn>
              );
            })}
          </div>

          {/* The two terms a buyer would otherwise meet at signing. They live
              INSIDE this section rather than in one of their own: they are
              footnotes to the cards above, and given their own band of the page
              they read as a feature. */}
          <FadeIn>
            <div className="mt-14 lg:mt-20">
              <h3 className="mb-4 text-[0.6875rem] font-semibold uppercase tracking-widest text-zinc-500">
                {t("notes.heading")}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {PRICING_NOTES.map((note) => (
                  <div
                    key={note.titleEn}
                    className="rounded-2xl border border-white/8 bg-white/2 p-6"
                  >
                    <h4 className="mb-2 text-base font-semibold text-white">
                      {ar ? note.title : note.titleEn}
                    </h4>
                    <p className="max-w-[52ch] text-sm leading-relaxed text-zinc-400">
                      {ar ? note.body : note.bodyEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Add-ons ──────────────────────────────────────────────────────── */}
      <section className="border-t border-white/5 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <FadeIn>
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t("addons.heading")}
            </h2>
            <p className="mb-10 max-w-[58ch] leading-relaxed text-zinc-300">
              {t("addons.subheading")}
            </p>

            {/* Desktop: a real table, so the five money columns line up and can
                be compared down a column. Below `md` the same rows render as
                stacked definition lists — a five-column table at 390px is
                either a horizontal scroller nobody finds or an overflowing
                page, and both are worse than repeating the labels. */}
            <div className="hidden overflow-hidden rounded-2xl border border-white/8 md:block">
              <table className="w-full border-collapse text-sm">
                <caption className="sr-only">{t("addons.tableLabel")}</caption>
                <thead>
                  <tr className="border-b border-white/8 bg-white/2">
                    <th
                      scope="col"
                      className="px-5 py-3.5 text-start text-xs font-semibold uppercase tracking-widest text-zinc-400"
                    >
                      {t("addons.colAddon")}
                    </th>
                    {(
                      [
                        "colSetup",
                        "colQuarterly",
                        "colAnnual",
                        "colBiannual",
                      ] as const
                    ).map((col) => (
                      <th
                        key={col}
                        scope="col"
                        className="px-5 py-3.5 text-end text-xs font-semibold uppercase tracking-widest text-zinc-400"
                      >
                        {t(`addons.${col}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ADDONS.map((addon) => (
                    <tr
                      key={addon.nameEn}
                      className="border-b border-white/5 last:border-b-0 transition-colors duration-200 hover:bg-white/2"
                    >
                      <th
                        scope="row"
                        className="px-5 py-4 text-start font-medium text-white"
                      >
                        {ar ? addon.name : addon.nameEn}
                        {(ar ? addon.sub : addon.subEn) && (
                          <span className="ms-2 font-normal text-zinc-500">
                            {ar ? addon.sub : addon.subEn}
                          </span>
                        )}
                      </th>
                      {[
                        addon.setup,
                        addon.quarterly,
                        addon.annual,
                        addon.biannual,
                      ].map((value, vi) => (
                        <td
                          key={vi}
                          className="px-5 py-4 text-end tabular-nums text-zinc-300"
                        >
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 md:hidden">
              {ADDONS.map((addon) => (
                <div
                  key={addon.nameEn}
                  className="rounded-xl border border-white/8 bg-white/2 p-4"
                >
                  <h3 className="mb-3 text-sm font-semibold text-white">
                    {ar ? addon.name : addon.nameEn}
                    {(ar ? addon.sub : addon.subEn) && (
                      <span className="ms-2 font-normal text-zinc-500">
                        {ar ? addon.sub : addon.subEn}
                      </span>
                    )}
                  </h3>
                  <dl className="flex flex-col gap-1.5">
                    {(
                      [
                        ["colSetup", addon.setup],
                        ["colQuarterly", addon.quarterly],
                        ["colAnnual", addon.annual],
                        ["colBiannual", addon.biannual],
                      ] as const
                    ).map(([col, value]) => (
                      <div
                        key={col}
                        className="flex items-baseline justify-between gap-4"
                      >
                        <dt className="text-xs text-zinc-500">
                          {t(`addons.${col}`)}
                        </dt>
                        <dd className="text-sm tabular-nums text-zinc-300">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── What setup buys ──────────────────────────────────────────────── */}
      <section className="border-t border-white/5 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <FadeIn>
            <h2 className="mb-10 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t("setup.heading")}
            </h2>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SETUP_INCLUDES.map((item) => (
                <li
                  key={item.en}
                  className="flex items-start gap-4 rounded-xl border border-white/8 bg-white/2 p-5"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-cs-teal/20 bg-cs-teal/15">
                    <Check aria-hidden size={13} weight="bold" className="text-cs-teal" />
                  </span>
                  <span className="text-sm leading-relaxed text-zinc-300">
                    {ar ? item.ar : item.en}
                  </span>
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </section>

      {/* ── Questions ────────────────────────────────────────────────────── */}
      {/* Two columns rather than a centred stack: every other heading on this
          page starts at the 7xl grid's inline edge, and a centred `max-w-4xl`
          block put this one alone in the middle of the page. The heading holds
          its own column and sticks while the reader works down seventeen
          answers; the answers keep a readable measure. */}
      <section className="border-t border-white/5 px-6 py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-20">
          <FadeIn>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:sticky lg:top-28">
              {t("faq.heading")}
            </h2>
          </FadeIn>
          {/* Capped even though the column is wider: a question row that runs
              the full grid puts its open/close affordance a screen-width away
              from the words it belongs to. */}
          <FadeIn delay={0.08} className="max-w-[46rem]">
            <PricingFaq />
          </FadeIn>
        </div>
      </section>

      {/* ── Closing ──────────────────────────────────────────────────────── */}
      <section className="border-t border-white/5 px-6 py-28">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
          <FadeIn>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t("cta.heading")}
            </h2>
          </FadeIn>
          {/* The page's ONE reveal. It is a statement in the company's own
              voice ("we'll tell you plainly…"), which is the only kind of line
              this effect belongs on — and it is used once, here, rather than
              sprayed across the section headings above. */}
          {/* The floor is 1.5rem, not the 1.25rem it reads at first glance:
              the reveal's UNREVEALED state is white at 30%, which is ~3.2:1 on
              this ground — inside AA for LARGE text (24px) and outside it for
              anything smaller. The type size is what keeps the un-scrolled
              state legible, so it cannot drop below 24px at any viewport. */}
          <ScrollRevealText
            text={t("cta.body")}
            className="max-w-[46ch] font-medium leading-[1.55] tracking-tight"
            style={{ fontSize: "clamp(1.5rem,2.4vw,1.875rem)" }}
          />
          <FadeIn delay={0.08}>
            {/* No `?package=`: this CTA sits under "Not sure which fits?", so
                it lands on the form's own "Not sure yet" default. */}
            <Link
              href="/get-started"
              className="inline-flex items-center gap-2 rounded-xl bg-cs-teal px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-cs-teal-hover active:scale-[0.98]"
            >
              {t("cta.button")}
              <ArrowRight aria-hidden size={15} weight="bold" className="rtl:rotate-180" />
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
