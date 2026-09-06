import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/site/FadeIn";
import { HeroBackground } from "@/components/site/HeroBackground";
import { localizedPageMetadata } from "@/lib/site-meta";
import { Content } from "./components/Content";

/**
 * Careers had NO metadata of its own, so both locales served the HOME page's
 * title and description — a browser tab and a search result claiming to be the
 * company's front page.
 *
 * The titles are the nav label this page is reached by, and BOTH descriptions
 * are now this page's own heading. That symmetry is new: while the page was
 * hardcoded Arabic there was no English page copy to describe, so the English
 * description borrowed the site-wide company sentence rather than have someone
 * invent prose for a meta tag. The careers surface is translated now, so the
 * description says what the page says, in the language the page is in.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const nav = await getTranslations({ locale, namespace: "Nav" });
  const t = await getTranslations({ locale, namespace: "Jobs" });

  return localizedPageMetadata({
    locale,
    enTitle: nav("jobs"),
    enDescription: t("heading"),
    arTitleLabel: nav("jobs"),
    arDescription: t("heading"),
  });
}

/**
 * Careers — reskinned into the public design system (P3), translated (P8).
 *
 * Not a `<main>`: the public shell already renders one, and two `main`
 * landmarks on a page is the semantic twin of a double header.
 *
 * ⚠️ There is NO `dir` attribute anywhere on this page any more. It used to
 * carry `dir="rtl"` because the furniture was hardcoded Arabic even on the
 * English route, so the direction had to travel with the copy rather than with
 * the document. Every string here is now locale-resolved, so the document's own
 * direction is correct by construction and a hardcoded one could only ever be
 * wrong — it would right-align the English page. Job DATA is the part that is
 * still whatever language the operator typed, and that carries `dir="auto"`
 * per-element inside `Content`.
 *
 * The teal accents, hairline borders and zinc ramp are the site's, not the
 * dashboard's — `ts-purple` belongs to Tourscope product surfaces and appears
 * nowhere here, because Careers is a Codescope page.
 */
export default async function page() {
  const t = await getTranslations("Jobs");

  return (
    <div className="text-white">
      <section className="relative overflow-hidden px-6 pb-14 pt-40">
        <HeroBackground />
        <div className="relative mx-auto max-w-7xl">
          <FadeIn>
            <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t("heading")}
            </h1>
          </FadeIn>
        </div>
      </section>

      <section className="px-6 pb-28">
        <div className="mx-auto max-w-7xl">
          <Content />
        </div>
      </section>
    </div>
  );
}
