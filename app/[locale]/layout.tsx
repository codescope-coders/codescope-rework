import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import { getMessages, setRequestLocale } from "next-intl/server";
import { getDir } from "@/lib/utils";
import { NextIntlClientProvider } from "next-intl";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import localFont from "next/font/local";
import { QueryProvider } from "@/lib/queryClientProvider";
import { ApplicationSentMessage } from "@/components/ApplicationSentMessage";

export const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-urbanist",
});

const dahabArabic = localFont({
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
  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = getDir(locale);
  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`antialiased ${locale == "en" && urbanist.className} ${locale == "ar" && dahabArabic.className}`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <NuqsAdapter>
              <ApplicationSentMessage />
              {children}
            </NuqsAdapter>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
