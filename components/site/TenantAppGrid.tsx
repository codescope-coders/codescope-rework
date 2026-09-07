import Image from "next/image";
import { getLocale } from "next-intl/server";
import { FadeIn } from "@/components/site/FadeIn";
import { SpotlightGroup } from "@/components/site/SpotlightGroup";
import { TiltTile } from "@/components/site/TiltTile";
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
    // `gap-3` at base rather than `gap-4`: at 12px, 72px tiles wrap four to a
    // row inside a 390px viewport (4·72 + 3·12 = 324 against 342 of usable
    // width); at 16px only three fit, which turns a full grid into a taller,
    // sparser one. The wall is sixteen icons now, so both settings tile evenly
    // — four rows of four on a phone, two rows of eight on the desktop — and
    // no row is left holding a single orphan tile.
    <SpotlightGroup>
      <ul className="flex flex-wrap justify-center gap-3 sm:gap-5">
        {brands.map((brand, i) => (
          <FadeIn as="li" key={brand.slug} delay={i * STAGGER.base}>
            {/* The tile tilts toward the cursor and its siblings recede — the
                same gesture the card grids use, with none of their chrome. See
                `TiltTile` for why an icon may lean further than a card. */}
            <TiltTile>
              {/* `rounded-[22%]` rather than a pixel radius: the iOS squircle is
                  a proportion of the side, so the corner stays right when the
                  tile steps up at `sm`. */}
              {/* 88px on desktop rather than a flat 72: the row is the section's
                  whole evidence, and at 72 it reads as a footnote under a 5xl
                  headline. 72 stays on mobile, where fitting four per row is the
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
            </TiltTile>
          </FadeIn>
        ))}
      </ul>
    </SpotlightGroup>
  );
}
