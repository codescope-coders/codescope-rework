import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import { IBM_Plex_Sans_Arabic, Urbanist } from "next/font/google";
import { AddonsAndDecisions } from "./components/AddonsAndDecisions";
import { HeroSection } from "./components/Hero";
import { PricingPlans } from "./components/PricingPlans";
import { WhyTourscope } from "./components/WhyTourscope";

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

export const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-urbanist",
  display: "swap",
});

export default function page() {
  const locale = useLocale();
  return (
    <main
      className={cn(
        locale == "ar" ? ibmPlexSansArabic.className : urbanist.className,
        "bg-[#f5f5f7]",
      )}
    >
      <HeroSection />
      <WhyTourscope />
      <PricingPlans />
      <AddonsAndDecisions />
    </main>
  );
}
