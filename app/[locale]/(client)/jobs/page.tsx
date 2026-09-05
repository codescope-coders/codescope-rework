import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/site/FadeIn";
import { HeroBackground } from "@/components/site/HeroBackground";
import { localizedPageMetadata } from "@/lib/site-meta";
import { Content } from "./components/Content";

/**
 * The page's own heading, hoisted so the metadata below can reuse it rather
 * than keep a second copy of the same Arabic sentence — two literals that must
 * agree is a drift waiting to happen.
 */
const AR_HEADING = "اكتشف خطوتك المهنية التالية";

/**
 * Careers had NO metadata of its own, so both locales served the HOME page's
 * title and description — a browser tab and a search result claiming to be the
 * company's front page.
 *
 * What it is allowed to say is the same rule `lib/site-meta.ts` states: nothing
 * new. The titles are the nav label this page is reached by; the Arabic
 * description is this page's own heading, already approved and already on
 * screen. The ENGLISH description is deliberately the site-wide one — the page
 * itself is Arabic (see the note below), so there is no English page copy to
 * describe, and inventing some to fill a meta tag would be authoring prose that
 * nobody reviewed. It stays the honest, approved company sentence until the
 * careers surface is genuinely translated.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const nav = await getTranslations({ locale, namespace: "Nav" });
  const meta = await getTranslations({ locale, namespace: "Meta" });

  return localizedPageMetadata({
    locale,
    enTitle: nav("jobs"),
    enDescription: meta("description"),
    arTitleLabel: nav("jobs"),
    arDescription: AR_HEADING,
  });
}

/**
 * Careers — reskinned into the public design system (P3).
 *
 * Not a `<main>`: the public shell already renders one, and two `main`
 * landmarks on a page is the semantic twin of a double header.
 *
 * ⚠️ `dir="rtl"` is kept, and the copy is kept HARDCODED IN ARABIC — including
 * on the English route. Both are pre-existing and deliberately out of scope
 * here: this phase restyles the page, it does not author or translate its
 * content. The direction attribute travels with the copy; dropping it would
 * left-align Arabic paragraphs under an English shell, which is worse than the
 * mixed alignment it produces today. The real fix is a translated careers
 * surface, which is a content decision, not a styling one.
 *
 * The teal accents, hairline borders and zinc ramp are the site's, not the
 * dashboard's — `ts-purple` belongs to Tourscope product surfaces and appears
 * nowhere here, because Careers is a Codescope page.
 */
export default function page() {
  return (
    <div className="text-white">
      <section className="relative overflow-hidden px-6 pb-14 pt-40">
        <HeroBackground />
        <div className="relative mx-auto max-w-7xl" dir="rtl">
          <FadeIn>
            <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {AR_HEADING}
            </h1>
          </FadeIn>
        </div>
      </section>

      {/* No `dir="rtl"` on this wrapper. It used to sit here, and it forced
          right-to-left onto the ONE part of this page that is properly
          translated — the empty state — which rendered "Check back, or write to
          us." with its full stop moved to the front of the line. Direction now
          travels with the copy: the Arabic heading above and the Arabic job
          cards inside carry their own, and anything locale-aware inherits the
          document's. */}
      <section className="px-6 pb-28">
        <div className="mx-auto max-w-7xl">
          <Content />
        </div>
      </section>
    </div>
  );
}
