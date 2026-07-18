import { NextResponse } from "next/server";
import { GetBranding, UpdateBranding, BrandingDto } from "@/services/branding";
import { requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

// Public: the login screen renders branding before authentication.
export const GET = async () => {
  try {
    return await GetBranding();
  } catch (error: unknown) {
    return NextResponse.json(
      { message: (error as Error)?.message || "Something went wrong" },
      { status: 500 },
    );
  }
};

export const PUT = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_BRANDING);
  if (auth instanceof NextResponse) return auth;
  try {
    const body: Partial<BrandingDto> = await request.json();
    if (body.name !== undefined && !String(body.name).trim()) {
      return NextResponse.json(
        { message: "Validation failed.", fieldErrors: { name: "Name is required." } },
        { status: 400 },
      );
    }
    return await UpdateBranding(body);
  } catch {
    return NextResponse.json(
      { message: "Error updating branding." },
      { status: 400 },
    );
  }
};
