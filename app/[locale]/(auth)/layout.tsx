import { ContactUsDialog } from "@/components/ContactUsDialog";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import SmoothScrollingProvider from "@/providers/ lenis-provider";
import { ReactNode } from "react";
import { Toaster } from "sonner";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <div dir="ltr">
      <SmoothScrollingProvider>
        <Toaster dir="ltr" />
        <Header />
        {children}
        <ContactUsDialog />
        <Footer />
      </SmoothScrollingProvider>
    </div>
  );
}
