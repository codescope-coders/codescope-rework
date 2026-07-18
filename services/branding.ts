import { db } from "@/lib/db";
import { branding } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export interface BrandingDto {
  name: string;
  tagline: string | null;
  logoUrl: string | null;
  logoText: string | null;
}

const DEFAULT: BrandingDto = {
  name: "كودسكوب",
  tagline: "متابعة تورسكوب",
  logoUrl: null,
  logoText: "CS",
};

function shape(row: {
  name: string;
  tagline: string | null;
  logoUrl: string | null;
  logoText: string | null;
}): BrandingDto {
  return {
    name: row.name,
    tagline: row.tagline,
    logoUrl: row.logoUrl,
    logoText: row.logoText,
  };
}

/** The branding singleton (id = 1); created with defaults on first read. */
export const GetBranding = async () => {
  let row = await db.query.branding.findFirst({ where: eq(branding.id, 1) });
  if (!row) {
    [row] = await db
      .insert(branding)
      .values({ id: 1, ...DEFAULT })
      .onConflictDoNothing({ target: branding.id })
      .returning();
    if (!row) row = await db.query.branding.findFirst({ where: eq(branding.id, 1) });
  }
  return NextResponse.json({
    message: "ok",
    payload: row ? shape(row) : DEFAULT,
  });
};

export const UpdateBranding = async (data: Partial<BrandingDto>) => {
  const [row] = await db
    .insert(branding)
    .values({
      id: 1,
      name: data.name ?? DEFAULT.name,
      tagline: data.tagline ?? DEFAULT.tagline,
      logoUrl: data.logoUrl ?? null,
      logoText: data.logoText ?? DEFAULT.logoText,
    })
    .onConflictDoUpdate({
      target: branding.id,
      set: { ...data, updatedAt: new Date() },
    })
    .returning();

  return NextResponse.json({
    message: "Branding updated.",
    payload: shape(row),
  });
};
