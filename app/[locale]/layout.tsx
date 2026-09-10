import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import { setRequestLocale } from "next-intl/server";
import { getDir } from "@/lib/utils";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/config";
import { hasLocale } from "next-intl";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import localFont from "next/font/local";
import { QueryProvider } from "@/lib/queryClientProvider";

export const urbanist = Urbanist({
  preload: false,
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-urbanist",
});

// These faces belong to the app shell. Marketing uses Geist / IBM Plex;
// loading all six OTF weights eagerly costs ~225 KB on every public visit.
const dahabArabic = localFont({
  preload: false,
  src: [
    {
      path: "./fonts/Dahab Arabic ITF Black.otf",
      weight: "900",
      style: "normal",
    },
    {
      path: "./fonts/Dahab Arabic ITF Extra Bold.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/Dahab Arabic ITF Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Dahab Arabic ITF Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Dahab Arabic ITF Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Dahab Arabic ITF Light.otf",
      weight: "300",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "Codescope",
  description:
    "Codescope was founded to drive growth for businesses in Iraq by delivering precisely tailored applications and innovative websites. From initial concept to final deployment, we’re dedicated to creating products that combine thoughtful design, robust development, and meticulous quality assurance.",
};

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const dir = getDir(locale);
  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`antialiased ${locale == "en" && urbanist.className} ${locale == "ar" && dahabArabic.className}`}
        suppressHydrationWarning
      >
          <QueryProvider>
            <NuqsAdapter>
              {children}
            </NuqsAdapter>
          </QueryProvider>
      </body>
    </html>
  );
}
