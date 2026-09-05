import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { localizedPageMetadata } from "@/lib/site-meta";
import { Link } from "@/i18n/routing";
import { FadeIn } from "@/components/site/FadeIn";
import { ScrollRevealText } from "@/components/site/ScrollRevealText";
import { SpotlightCard } from "@/components/site/SpotlightCard";
import { HeroBackground } from "@/components/site/HeroBackground";
import { AnimatedHeadline } from "@/components/site/AnimatedHeadline";
import {
  ArrowRight, Trophy, Pencil, Handshake,
  Code, PaintBrush, Compass, AirplaneTilt,
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
  const t = await getTranslations({ locale, namespace: "About" });
  const nav = await getTranslations({ locale, namespace: "Nav" });

  return localizedPageMetadata({
    locale,
    enTitle: "About",
    enDescription:
      "Codescope is the product-engineering company behind Tourscope — a team of 18 engineers, designers, and product people building independently from Karbala, Iraq.",
    arTitleLabel: nav("about"),
    arDescription: t("hero.subheading"),
  });
}

export default async function AboutPage() {
  const t = await getTranslations("About");

  const values = [
    { icon: Trophy, title: t("values.v1Title"), desc: t("values.v1Desc") },
    { icon: Pencil, title: t("values.v2Title"), desc: t("values.v2Desc") },
    { icon: Handshake, title: t("values.v3Title"), desc: t("values.v3Desc") },
  ];

  const disciplines = [
    { Icon: Code, label: t("team.d1"), desc: t("team.d1Desc") },
    { Icon: PaintBrush, label: t("team.d2"), desc: t("team.d2Desc") },
    { Icon: Compass, label: t("team.d3"), desc: t("team.d3Desc") },
    { Icon: AirplaneTilt, label: t("team.d4"), desc: t("team.d4Desc") },
  ];

  return (
    <>
      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        <HeroBackground />
        {/* No eyebrow. "About Codescope" above a headline that reads "We are
            Codescope." is the label restating the thing it labels — the same
            cut the home and Tourscope pages already took. */}
        <div className="relative max-w-7xl mx-auto">
          <AnimatedHeadline
            text={t("hero.heading")}
            accent={t("hero.headlineAccent")}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tighter leading-[1.05] mb-6"
            accentClassName="text-zinc-400"
          />
          <FadeIn delay={0.5}>
            <p className="text-lg text-zinc-300 max-w-[52ch] leading-relaxed">{t("hero.subheading")}</p>
          </FadeIn>
        </div>
      </section>

      {/* ── How we got here — this page's spoken-statement moment ─────────── */}
      {/* The two-column split is kept: a small heading beside a large statement
          is the manifesto's own label/statement anatomy laid on its side, and
          it is what stops a 300-character paragraph at this size from reading
          as a wall. `items-start` keeps the heading level with the statement's
          first line. Padding is up from `py-16` because the statement is now
          roughly three times the height it was and needs the air. */}
      <section className="py-24 sm:py-28 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10 lg:gap-16 items-start">
          <FadeIn>
            <h2 className="text-2xl font-bold text-white tracking-tight">{t("story.heading")}</h2>
          </FadeIn>
          {/* Not inside a `FadeIn` — see the matching note on the Tourscope
              page. The reveal is this paragraph's entrance. */}
          <ScrollRevealText
            text={t("story.body")}
            highlights={t.raw("story.highlights") as string[]}
            offset={["center 85%", "center 25%"]}
            className="max-w-[42ch] text-xl font-medium leading-[1.45] tracking-tight sm:text-2xl lg:text-[1.75rem]"
          />
        </div>
      </section>

      {/* ── The team — composition, not fabricated headshots ──────────────── */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          {/* Plain heading inside the FadeIn, not a per-token ScrollReveal.
              The manifesto on the home page is the one place that reveal is
              still spent; everywhere else it made an ordinary section heading
              announce itself like the page's signature moment. */}
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              {t("team.heading")}
            </h2>
            <p className="text-lg text-zinc-300 leading-relaxed max-w-[56ch] mb-12">{t("team.body")}</p>
          </FadeIn>

          <FadeIn delay={0.06}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.06]">
              {disciplines.map((d) => (
                <div key={d.label} className="bg-[#0a0a0c] p-6 flex flex-col gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-cs-teal/12 border border-cs-teal/20 flex items-center justify-center">
                    <d.Icon size={19} weight="duotone" className="text-cs-teal" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-white mb-1.5">{d.label}</h3>
                    <p className="text-[13px] text-zinc-300 leading-relaxed">{d.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-20 px-6 border-y border-white/5 bg-zinc-900/20">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            {/* The one label kept on this page: it captions the diagram
                below rather than restating a heading, so it earns its place —
                restyled to the house register (small, medium, brand tint)
                instead of the tracked-uppercase form PRODUCT.md calls out. */}
            <p className="text-sm font-medium text-cs-teal-hover mb-8">{t("positioning.label")}</p>
            <div className="relative flex items-center justify-between gap-4 mb-10">
              <div className="text-sm text-zinc-400 font-medium shrink-0">{t("positioning.left")}</div>
              <div className="flex-1 h-px bg-gradient-to-r from-white/5 via-cs-teal/40 to-white/5" />
              <div className="shrink-0 px-4 py-2 rounded-full border border-cs-teal/30 bg-cs-teal/10 text-sm font-semibold text-cs-teal">
                {t("positioning.center")}
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-white/5 via-cs-teal/40 to-white/5" />
              <div className="text-sm text-zinc-400 font-medium shrink-0">{t("positioning.right")}</div>
            </div>
            <blockquote className="text-2xl sm:text-3xl font-bold text-white leading-snug mb-6 max-w-[50ch]">
              &ldquo;{t("positioning.statement")}&rdquo;
            </blockquote>
            <p className="text-zinc-300 leading-relaxed max-w-[58ch]">{t("positioning.detail")}</p>
          </FadeIn>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-12">{t("values.heading")}</h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <FadeIn key={value.title} delay={i * 0.1}>
                  <SpotlightCard className="p-7 h-full flex flex-col gap-4">
                    <div className="w-10 h-10 rounded-lg bg-cs-teal/15 border border-cs-teal/20 flex items-center justify-center">
                      <Icon size={20} weight="duotone" className="text-cs-teal" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">{value.title}</h3>
                      <p className="text-sm text-zinc-300 leading-relaxed">{value.desc}</p>
                    </div>
                  </SpotlightCard>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">{t("cta.heading")}</h2>
            <p className="text-zinc-300 mb-10">{t("cta.subheading")}</p>
            <Link href="/get-started" className="inline-flex items-center gap-2 px-8 py-4 bg-cs-teal text-white font-semibold rounded-xl hover:bg-cs-teal-hover transition-colors duration-200 active:scale-[0.98]">
              {t("cta.button")}<ArrowRight size={16} weight="bold" className="rtl:rotate-180" />
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
