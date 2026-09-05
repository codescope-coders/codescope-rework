import Image from "next/image";
import { getLocale } from "next-intl/server";
import { FadeIn } from "@/components/site/FadeIn";
import { PARTNER_APPS, PARTNER_BRANDS, brandName } from "@/data/partners";
import { STAGGER } from "@/lib/motion";

/**
 * The agencies' own store icons.
 *
 * Static by design — the lockup wall on the home page drifts because it is
 * ambience, and this is evidence. A moving exhibit invites you to watch it
 * rather than read it.
 *
 * No name label under the tiles: an app icon IS the identity, and a caption
 * under each one would turn seven squares into a table. The brand name rides in
 * `alt`, which is where a screen reader needs it and where a sighted reader
 * does not.
 */
export async function TenantAppGrid() {
  const locale = await getLocale();
  const brands = PARTNER_APPS.map((slug) =>
    PARTNER_BRANDS.find((b) => b.slug === slug)
  ).filter((b) => b !== undefined);

  return (
    // `gap-3` at base rather than `gap-4`: seven 72px tiles wrap 4+3 inside a
    // 390px viewport at 12px, and 3+3+1 at 16px — and a lone seventh tile on
    // its own row reads as an orphan rather than a grid. It degrades back to
    // 3+3+1 on anything narrower, which is the right way round.
    <ul className="flex flex-wrap justify-center gap-3 sm:gap-5">
      {brands.map((brand, i) => (
        <FadeIn as="li" key={brand.slug} delay={i * STAGGER.base}>
          {/* `rounded-[22%]` rather than a pixel radius: the iOS squircle is a
              proportion of the side, so the corner stays right when the tile
              steps up at `sm`. */}
          {/* 88px on desktop rather than a flat 72: seven icons at 72 read as
              a footnote under a 5xl headline, and the row is the section's
              whole evidence. 72 stays on mobile, where three per row is the
              constraint that matters. */}
          <span className="block size-[72px] overflow-hidden rounded-[22%] shadow-lg shadow-black/40 ring-1 ring-inset ring-white/10 sm:size-[88px]">
            <Image
              src={`/partners/apps/${brand.slug}.webp`}
              alt={brandName(brand, locale)}
              width={320}
              height={320}
              unoptimized
              className="size-full select-none object-cover"
            />
          </span>
        </FadeIn>
      ))}
    </ul>
  );
}
