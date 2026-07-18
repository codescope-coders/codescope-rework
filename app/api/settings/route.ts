import { NextResponse } from "next/server";
import { GetSettings, UpdateSettings, SettingsDto } from "@/services/settings";
import { requireAuth, requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export const GET = async (request: Request) => {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    return await GetSettings();
  } catch (error: unknown) {
    return NextResponse.json(
      { message: (error as Error)?.message || "Something went wrong" },
      { status: 500 },
    );
  }
};

export const PUT = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_SETTINGS);
  if (auth instanceof NextResponse) return auth;
  try {
    const body: Partial<SettingsDto> = await request.json();
    return await UpdateSettings(body);
  } catch {
    return NextResponse.json(
      { message: "Error updating settings." },
      { status: 400 },
    );
  }
};
