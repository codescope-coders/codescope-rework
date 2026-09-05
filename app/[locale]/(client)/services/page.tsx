import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { localizedPageMetadata } from "@/lib/site-meta";
import { Link } from "@/i18n/routing";
import { FadeIn } from "@/components/site/FadeIn";
import { SpotlightCard } from "@/components/site/SpotlightCard";
import { HeroBackground } from "@/components/site/HeroBackground";
import { AnimatedHeadline } from "@/components/site/AnimatedHeadline";
import {
  Code, Palette, TreeStructure,
  Ticket, UsersThree, ChartBar, Globe, ArrowRight,
} from "@phosphor-icons/react/dist/ssr";

/**
 * EN metadata is unchanged; AR is assembled from this page's own approved
 * strings (its nav label and its hero subheading) — see `lib/site-meta.ts`.
 * As a static `const metadata` this block served the English title and
 * description on the Arabic route.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Services" });
  const nav = await getTranslations({ locale, namespace: "Nav" });

  return localizedPageMetadata({
    locale,
    enTitle: "Engineering",
    enDescription:
      "The engineering standard behind Tourscope: clean architecture, design systems, and flow-first thinking — the same bar we hold every line of code to.",
    arTitleLabel: nav("services"),
    arDescription: t("hero.subheading"),
  });
}

export default async function ServicesPage() {
  const t = await getTranslations("Services");

  const pillars = [
    { icon: Code, title: t("pillar1.title"), description: t("pillar1.description"), tags: [t("pillar1.tag1"), t("pillar1.tag2"), t("pillar1.tag3"), t("pillar1.tag4")] },
    { icon: Palette, title: t("pillar2.title"), description: t("pillar2.description"), tags: [t("pillar2.tag1"), t("pillar2.tag2"), t("pillar2.tag3"), t("pillar2.tag4")] },
    { icon: TreeStructure, title: t("pillar3.title"), description: t("pillar3.description"), tags: [t("pillar3.tag1"), t("pillar3.tag2"), t("pillar3.tag3"), t("pillar3.tag4")] },
  ];

  const builds = [
    { icon: Ticket, title: t("builds.b1Title"), desc: t("builds.b1Desc") },
    { icon: UsersThree, title: t("builds.b2Title"), desc: t("builds.b2Desc") },
    { icon: ChartBar, title: t("builds.b3Title"), desc: t("builds.b3Desc") },
    { icon: Globe, title: t("builds.b4Title"), desc: t("builds.b4Desc") },
  ];

  return (
    <>
      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        <HeroBackground />
        {/* No eyebrow — the headline names the section on its own, and the
            tracked-uppercase label above every section is the reflex
            PRODUCT.md lists as an anti-reference. */}
        <div className="relative max-w-7xl mx-auto">
          <AnimatedHeadline
            text={t("hero.heading")}
            accent={t("hero.headlineAccent")}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tighter leading-[1.05] mb-6"
            accentClassName="text-zinc-400"
          />
          <FadeIn delay={0.5}>
            <p className="text-lg text-zinc-300 max-w-[50ch] leading-relaxed">{t("hero.subheading")}</p>
          </FadeIn>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <FadeIn key={pillar.title} delay={i * 0.08}>
                <SpotlightCard className="p-8 md:p-10 flex flex-col md:flex-row gap-8 md:items-start">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-cs-teal/15 border border-cs-teal/20 flex items-center justify-center">
                    <Icon size={24} weight="duotone" className="text-cs-teal" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-3">{pillar.title}</h2>
                    <p className="text-zinc-300 leading-relaxed max-w-[58ch] mb-6">{pillar.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {pillar.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 rounded-full text-xs border border-white/8 text-zinc-400 bg-white/3">{tag}</span>
                      ))}
                    </div>
                  </div>
                  {/* Decorative only — the pillar's own heading carries the
                      order. Unlabelled it made a screen reader announce
                      "zero one" before every title, which the numerals on the
                      Tourscope page already avoid. */}
                  <div aria-hidden className="shrink-0 text-6xl font-bold text-white/4 tabular-nums leading-none select-none group-hover:text-white/8 transition-colors duration-300">0{i + 1}</div>
                </SpotlightCard>
              </FadeIn>
            );
          })}
        </div>
      </section>

      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-12">{t("builds.heading")}</h2>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {builds.map((build, i) => {
              const Icon = build.icon;
              return (
                <FadeIn key={build.title} delay={i * 0.08}>
                  <SpotlightCard className="p-6 flex gap-5 items-start h-full">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-white/8 flex items-center justify-center shrink-0">
                      <Icon size={18} weight="duotone" className="text-zinc-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1.5">{build.title}</h3>
                      <p className="text-sm text-zinc-300 leading-relaxed">{build.desc}</p>
                    </div>
                  </SpotlightCard>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 glass-card rounded-2xl p-8 md:p-12">
          <FadeIn>
            <h2 className="text-2xl font-bold text-white">{t("cta.heading")}</h2>
          </FadeIn>
          <FadeIn delay={0.08}>
            <Link href="/contact" className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-cs-teal text-white text-sm font-semibold rounded-xl hover:bg-cs-teal-hover transition-colors duration-200 active:scale-[0.98]">
              {t("cta.button")}<ArrowRight size={15} weight="bold" className="rtl:rotate-180" />
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
