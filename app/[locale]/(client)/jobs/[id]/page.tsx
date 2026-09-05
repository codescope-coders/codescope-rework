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
  // min-height (one <main> per page — the shell owns it), and why the Arabic
  // copy and its `dir` stay put through the P3 reskin.
  return (
    <div className="text-white" dir="rtl">
      <Content />
    </div>
  );
}
