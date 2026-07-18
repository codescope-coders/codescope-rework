import { getLocale } from "next-intl/server";
import { ReactNode } from "react";
import { Toaster } from "sonner";

// Minimal, full-screen chrome for the single public route (login). Intentionally
// omits the marketing Header/Footer + smooth-scroll provider so the login owns
// the whole viewport (editorial split layout).
export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  return (
    <>
      <Toaster dir={dir} position="top-center" richColors />
      {children}
    </>
  );
}
