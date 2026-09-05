import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { localizedPageMetadata } from "@/lib/site-meta";
import { FadeIn } from "@/components/site/FadeIn";
import { HeroBackground } from "@/components/site/HeroBackground";
import { AnimatedHeadline } from "@/components/site/AnimatedHeadline";
import { Envelope } from "@phosphor-icons/react/dist/ssr";
import ContactForm from "@/components/site/ContactForm";

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
  const t = await getTranslations({ locale, namespace: "Contact" });
  const nav = await getTranslations({ locale, namespace: "Nav" });

  return localizedPageMetadata({
    locale,
    enTitle: "Contact",
    enDescription:
      "Tell us about your agency or project. Request a Tourscope demo or a general inquiry — we reply within 24 hours.",
    arTitleLabel: nav("contact"),
    arDescription: t("hero.subheading"),
  });
}

export default async function ContactPage() {
  const t = await getTranslations("Contact");

  return (
    <>
      <section className="relative pt-40 pb-16 px-6 overflow-hidden">
        <HeroBackground />
        {/* No eyebrow — "Get in touch" above "Let's build something real." on
            the contact page is the third restatement of the same fact. */}
        <div className="relative max-w-3xl mx-auto">
          <AnimatedHeadline
            text={t("hero.heading")}
            accent={t("hero.headlineAccent")}
            className="text-5xl sm:text-6xl font-bold text-white tracking-tighter leading-[1.05] mb-4"
            accentClassName="text-zinc-400"
          />
          <FadeIn delay={0.5}>
            <p className="text-lg text-zinc-300 leading-relaxed">{t("hero.subheading")}</p>
          </FadeIn>
        </div>
      </section>

      <section className="py-16 px-6 pb-32">
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 items-start">
          <FadeIn>
            <ContactForm />
          </FadeIn>
          <FadeIn delay={0.1} direction="left" className="shrink-0">
            <div className="glass-card rounded-2xl p-6 flex flex-col gap-4 min-w-[220px]">
              <div className="w-9 h-9 rounded-lg bg-cs-teal/15 border border-cs-teal/20 flex items-center justify-center">
                <Envelope size={18} weight="duotone" className="text-cs-teal" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 mb-1">{t("email.label")}</p>
                <a href={`mailto:${t("email.value")}`} className="text-sm text-zinc-300 hover:text-white transition-colors duration-200 break-all">
                  {t("email.value")}
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
