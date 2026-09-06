import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { localizedPageMetadata } from "@/lib/site-meta";
import { Content } from "./components/Content";

/**
 * Same fix, same rule as the careers list: this route served the HOME page's
 * title in both locales.
 *
 * The role's own title is deliberately NOT in here. It would need a database
 * read inside `generateMetadata`, which runs on the request path — and a throw
 * there does not degrade the tab title, it fails the whole page render. A role
 * page that loads with a generic title beats a role page that 500s because the
 * jobs API was briefly unavailable.
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
    arDescription: meta("description"),
  });
}

export default function page() {
  // See the sibling jobs/page.tsx for why this is a <div> with no slab and no
  // min-height — one <main> per page, the shell owns it.
  //
  // ⚠️ The `dir="rtl"` that used to sit here is GONE. It was correct only for
  // as long as the page's furniture was hardcoded Arabic on both routes; now
  // that every string is locale-resolved it would force the English role page
  // to render right-to-left. The role's own text — position, description,
  // requirements, responsibilities — is operator-authored data in whatever
  // language it was typed, so each of those elements carries `dir="auto"`
  // inside `Content` and the direction travels with the content rather than
  // with the route.
  return (
    <div className="text-white">
      <Content />
    </div>
  );
}
