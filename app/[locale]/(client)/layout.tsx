import { ContactUsDialog } from "@/components/ContactUsDialog";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import SmoothScrollingProvider from "@/providers/ lenis-provider";
import { ReactNode } from "react";
import { Toaster } from "sonner";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden">
      <SmoothScrollingProvider>
        <Toaster />
        <Header />
        {children}
        <ContactUsDialog />
        <Footer />
      </SmoothScrollingProvider>
    </div>
  );
}
