import type { Metadata } from "next";
import { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Toaster } from "sonner";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { GridHighlight } from "@/components/site/GridHighlight";
import { PageTransition } from "@/components/site/PageTransition";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { geistMono, geistSans } from "@/lib/site-fonts";

/**
 * The public marketing shell.
 *
 * `data-site="public"` on the root element is load-bearing, not decoration:
 * every element-level rule in the ported design system (page ground, the
 * Arabic face and its heading leading, `::selection`, the focus ring, the
 * reduced-motion safety net) is scoped under that attribute so it cannot reach
 * the internal dashboard, which shares this stylesheet. The Geist variables
 * ride on the same element for the same reason — see `lib/site-fonts.ts`.
 *
 * No `overflow-hidden` wrapper: the previous shell used one to paper over
 * horizontal overflow, and it would clip nothing useful here while risking the
 * fixed navbar and scroll-progress bar. Overflow is instead a property the
 * pages themselves have to keep clean.
 */
/**
 * Per-locale metadata, declared HERE rather than on the root layout.
 *
 * As a `const metadata` the Arabic site served the English title, description
 * and Open Graph card — the two things a search result and a shared link are
 * made of, in the wrong language, on every page that doesn't override them.
 * It sits on the (client) layout because the root layout is shared with the
 * internal dashboard, whose own title must not move.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });

  return {
    metadataBase: new URL("https://codescope.dev"),
    title: {
      default: t("title"),
      // Not translated: it is the brand name plus a separator.
      template: "%s | CodeScope",
    },
    description: t("description"),
    keywords: t("keywords")
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean),
    openGraph: {
      type: "website",
      siteName: "CodeScope",
      locale,
      title: t("title"),
      description: t("ogDescription"),
    },
  };
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-site="public"
      className={`${geistSans.variable} ${geistMono.variable} min-h-[100dvh] flex flex-col`}
    >
      <Toaster />
      <GridHighlight />
      <SmoothScroll />
      <ScrollProgress />
      <Navbar />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </div>
  );
}
