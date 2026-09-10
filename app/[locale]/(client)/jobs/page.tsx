import { getPublicJobs } from "@/lib/public-jobs";
import { getLocale as getSchemaLocale } from "next-intl/server";
import { BreadcrumbData } from "@/components/site/StructuredData";
import { pageMetadata } from "@/lib/site-meta";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/site/FadeIn";
import { HeroBackground } from "@/components/site/HeroBackground";
import { Content } from "./components/Content";

export async function generateMetadata({ params }: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata("/jobs", locale);
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
  const locale = await getSchemaLocale();
  const t = await getTranslations("Jobs");
  const jobs = await getPublicJobs();

  return (
    <div className="text-white">
      <BreadcrumbData path="/jobs" locale={locale} />
      <section className="site-hero relative overflow-hidden px-6 pb-14 pt-40">
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
          <Content initialJobs={jobs ?? undefined} />
        </div>
      </section>
    </div>
  );
}
