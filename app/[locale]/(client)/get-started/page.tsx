import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Envelope } from "@phosphor-icons/react/dist/ssr";
import { FadeIn } from "@/components/site/FadeIn";
import GetStartedForm from "@/components/site/GetStartedForm";
import { HeroBackground } from "@/components/site/HeroBackground";

/**
 * `/get-started` — where every "Request a demo" / "Talk to us" button on the
 * site now lands.
 *
 * It exists because those buttons used to point at `/contact`, whose form asks
 * for a name, an email and free text — and then delivers the result as an
 * email. A visitor arriving from the Advanced pricing card had to retype which
 * package they had just been reading about, and nobody could answer "how many
 * people asked about Charter this month?" without searching an inbox. This page
 * asks the two extra questions a sales conversation needs (package, phone),
 * pre-writes the message in the visitor's language, and writes a row the
 * dashboard's "Website requests" module reads.
 *
 * `/contact` is unchanged and stays what it was: a general way to write to us.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "GetStarted" });

  return {
    // `absolute`, like the pricing page: the title already names the product
    // and the company, and the layout template would print "…by Codescope |
    // CodeScope".
    title: { absolute: t("meta.title") },
    description: t("meta.description"),
    openGraph: { title: t("meta.title"), description: t("meta.description") },
  };
}

export default async function GetStartedPage() {
  const t = await getTranslations("GetStarted");
  const tContact = await getTranslations("Contact");

  return (
    <>
      <section className="relative pt-40 pb-16 px-6 overflow-hidden">
        <HeroBackground />
        <div className="relative max-w-3xl mx-auto">
          {/* A plain `h1`, not `AnimatedHeadline`. That component takes a
              `text` + `accent` PAIR and always emits a `<br/>` between them, so
              a one-sentence headline would either gain a phantom line break or
              have to be split at a seam the approved copy does not have. This
              is also a task page rather than a marketing page: the heading
              above a form has nothing to reveal. */}
          <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tighter leading-[1.05] mb-4">
            {t("hero.heading")}
          </h1>
          <p className="text-lg text-zinc-300 leading-relaxed max-w-[52ch]">
            {t("hero.subheading")}
          </p>
        </div>
      </section>

      <section className="py-16 px-6 pb-32">
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 items-start">
          {/* The page's ONE reveal. The form is the page; a cascade of
              staggered fades over six fields would animate a task rather than
              an entrance. */}
          <FadeIn>
            {/* `useSearchParams` (via nuqs) forces this subtree out of static
                rendering; the boundary is what keeps the hero above it
                prerendered instead of the whole route going dynamic. */}
            <Suspense fallback={<div className="min-h-[32rem]" />}>
              <GetStartedForm />
            </Suspense>
          </FadeIn>

          {/* The same escape hatch /contact offers. A form is not the only way
              a person should be able to reach a company. */}
          <div className="shrink-0">
            <div className="glass-card rounded-2xl p-6 flex flex-col gap-4 min-w-[220px]">
              <div className="w-9 h-9 rounded-lg bg-cs-teal/15 border border-cs-teal/20 flex items-center justify-center">
                <Envelope size={18} weight="duotone" className="text-cs-teal" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 mb-1">
                  {tContact("email.label")}
                </p>
                <a
                  href={`mailto:${tContact("email.value")}`}
                  className="text-sm text-zinc-300 hover:text-white transition-colors duration-200 break-all"
                >
                  {tContact("email.value")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
