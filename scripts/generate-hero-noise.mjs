// Bake the existing hero grain once instead of filtering a viewport on device.
// Run from the repository root: node scripts/generate-hero-noise.mjs
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const tile = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
  <rect width="256" height="256" filter="url(#grain)"/>
</svg>`;
await mkdir("public/textures", { recursive: true });
await sharp(Buffer.from(tile)).webp({ quality: 75, alphaQuality: 50 }).toFile("public/textures/hero-noise.webp");

// Preserve the original circle sizes and blur-3xl (64px) falloff. Padding
// accommodates three standard deviations so the image has no visible crop.
for (const [name, color] of [["teal", "#00a79d"], ["purple", "#6f00ff"]]) {
  for (const diameter of [650, 500]) {
    const padding = 192;
    const size = diameter + padding * 2;
    const orb = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <filter id="soft" x="0" y="0" width="${size}" height="${size}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feGaussianBlur stdDeviation="64"/>
      </filter>
      <circle cx="${size / 2}" cy="${size / 2}" r="${diameter / 2}" fill="${color}" filter="url(#soft)"/>
    </svg>`;
    await sharp(Buffer.from(orb)).resize({ width: 256 }).webp({ quality: 75, alphaQuality: 75 })
      .toFile(`public/textures/hero-orb-${name}-${diameter}.webp`);
  }
}
