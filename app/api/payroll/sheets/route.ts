import { NextResponse } from "next/server";
import { CreateSheet, GetSheets, SheetItemInput } from "@/services/payroll";
import { requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export const GET = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.VIEW_PAYROLL);
  if (auth instanceof NextResponse) return auth;
  try {
    return await GetSheets();
  } catch (error: unknown) {
    return NextResponse.json(
      { message: (error as Error)?.message || "Something went wrong" },
      { status: 500 },
    );
  }
};

export const POST = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_PAYROLL);
  if (auth instanceof NextResponse) return auth;
  try {
    const body: { items: SheetItemInput[]; month?: string } = await request.json();
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ message: "لا يوجد موظفون بالمشف." }, { status: 400 });
    }
    return await CreateSheet(body.items, auth.id, body.month);
  } catch {
    return NextResponse.json({ message: "تعذّر إنشاء المشف." }, { status: 500 });
  }
};
