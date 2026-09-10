import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { FadeIn } from "@/components/site/FadeIn";
import { ConsoleBookingsSection } from "@/components/site/tourscope/deep-dive/ConsoleBookingsSection";
import { ConsoleFinancialsSection } from "@/components/site/tourscope/deep-dive/ConsoleFinancialsSection";
import { ConsoleInventorySection } from "@/components/site/tourscope/deep-dive/ConsoleInventorySection";
import { ConsoleMarketplaceSection } from "@/components/site/tourscope/deep-dive/ConsoleMarketplaceSection";
import { ConsoleSupportSection } from "@/components/site/tourscope/deep-dive/ConsoleSupportSection";
import { DeepDiveRail } from "@/components/site/tourscope/deep-dive/DeepDiveRail";
import { EsimSection } from "@/components/site/tourscope/deep-dive/EsimSection";
import { FlightsSection } from "@/components/site/tourscope/deep-dive/FlightsSection";
import { GroupsSection } from "@/components/site/tourscope/deep-dive/GroupsSection";
import { HotelsSection } from "@/components/site/tourscope/deep-dive/HotelsSection";
import { InsuranceSection } from "@/components/site/tourscope/deep-dive/InsuranceSection";
import { VisasSection } from "@/components/site/tourscope/deep-dive/VisasSection";
import {
  DEEP_DIVE_SECTIONS,
  type DeepDiveSection,
} from "@/components/site/tourscope/deep-dive/sections";

/**
 * The deep-dive region — a topic rail beside a column of long-form sections,
 * each drawn from the real product.
 *
 * ── Why a rail rather than more page ────────────────────────────────────────
 * The page above this point is a pitch: seven sections a reader takes in order.
 * This region is a REFERENCE — six verticals plus five console areas, each with
 * its own evidence — and a reader arrives at it wanting one of them, not all
 * eleven. A rail turns "scroll until you find flights" into "click flights",
 * without splitting the material across eleven routes nobody would crawl.
 *
 * ── The shell is config-driven on purpose ───────────────────────────────────
 * `sections.ts` is the single list; the rail and this column both render from
 * it. Adding a section is an entry there, a `nav.<navKey>` message pair, and a
 * body in `sectionBody` below — never a second hand-maintained list of anchors.
 *
 * Desktop jumps use Lenis and the section's top padding to clear the header.
 * Native phone scrolling also honours scroll-margin, clearing the sticky pill
 * bar without requiring large gaps between every section. Reduced-motion
 * readers use the same offsets with an instant native jump.
 */

function sectionBody(section: DeepDiveSection): ReactNode {
  switch (section.id) {
    case "dd-flights":
      return <FlightsSection num={section.num} />;
    case "dd-hotels":
      return <HotelsSection num={section.num} />;
    case "dd-groups":
      return <GroupsSection num={section.num} />;
    case "dd-visas":
      return <VisasSection num={section.num} />;
    case "dd-insurance":
      return <InsuranceSection num={section.num} />;
    case "dd-esim":
      return <EsimSection num={section.num} />;
    case "dd-bookings":
      return <ConsoleBookingsSection num={section.num} />;
    case "dd-inventory":
      return <ConsoleInventorySection num={section.num} />;
    case "dd-financials":
      return <ConsoleFinancialsSection num={section.num} />;
    case "dd-support":
      return <ConsoleSupportSection num={section.num} />;
    case "dd-marketplace":
      return <ConsoleMarketplaceSection num={section.num} />;
    default:
      return null;
  }
}

export async function DeepDiveRegion() {
  const t = await getTranslations("TourScope.deepDive");

  return (
    <section id="explore" className="py-16 sm:py-32 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-ts-purple-text mb-3">
            {t("eyebrow")}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3 max-w-[18ch] text-balance">
            {t("headline")}
          </h2>
          <p className="text-lg text-zinc-300 leading-relaxed max-w-[58ch]">{t("sub")}</p>
        </FadeIn>

        {/* The rail is grid COLUMN 1, which is the inline-start column — so the
            whole region mirrors under `dir="rtl"` with no second set of rules,
            exactly as the product tour's alternating split does. */}
        <div className="mt-14 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14 xl:gap-16">
          <DeepDiveRail />

          <div className="flex flex-col">
            {DEEP_DIVE_SECTIONS.map((section) => (
              <section key={section.id} id={section.id} className="pt-16 scroll-mt-32 lg:scroll-mt-0 lg:pt-24">
                {sectionBody(section)}
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
