import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import type { Metadata } from "next";
export const metadata: Metadata = { robots: { index: false, follow: false } };
import { getLocale } from "next-intl/server";
import { ReactNode } from "react";
import { Toaster } from "sonner";

// Authentication has its own responsive shell and shares the dashboard theme
// preference. Marketing navigation, analytics and smooth scrolling stay outside.
export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  return (
    <NextIntlClientProvider messages={await getMessages()}>
      <Toaster dir={dir} position="top-center" richColors />
      {children}
    </NextIntlClientProvider>
  );
}
