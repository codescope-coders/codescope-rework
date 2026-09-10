import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { publicMessages } from "@/lib/public-messages";
import { ApplicationSentMessage } from "@/components/ApplicationSentMessage";
import { PublicAnalytics } from "@/components/site/PublicAnalytics";
import { OrganizationData } from "@/components/site/StructuredData";
import { SITE_URL } from "@/lib/site-urls";
import type { Metadata } from "next";
import { ReactNode } from "react";

import { Toaster } from "sonner";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { CodeFieldBackground } from "@/components/site/CodeFieldBackground";
import { PageTransition } from "@/components/site/PageTransition";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { ScrollToTop } from "@/components/site/ScrollToTop";
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
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
};

export default async function ClientLayout({ children }: { children: ReactNode }) {
  const messages = publicMessages(await getMessages());
  const measurementId = process.env.GA4_MEASUREMENT_ID ?? "";
  const analyticsEnabled = process.env.GA4_ENABLED === "true" && /^G-[A-Z0-9]+$/.test(measurementId);
  return (
    <NextIntlClientProvider messages={messages}>
    <div
      data-site="public"
      className={`${geistSans.variable} ${geistMono.variable} min-h-[100dvh] flex flex-col`}
    >
      <ApplicationSentMessage />
      <OrganizationData />
      <Toaster />
      <CodeFieldBackground />
      <SmoothScroll />
      <ScrollToTop />
      <ScrollProgress />
      <Navbar />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      {analyticsEnabled && <PublicAnalytics measurementId={measurementId} debug={process.env.GA4_DEBUG_MODE === "true"} />}
    </div>
    </NextIntlClientProvider>
  );
}
