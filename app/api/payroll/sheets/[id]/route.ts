import { NextResponse } from "next/server";
import {
  DecideSheet,
  DeleteSheet,
  UpdateSheetItems,
  SheetItemInput,
} from "@/services/payroll";
import { claimsCan, requireAuth, requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const sheetId = parseInt(id, 10);
    if (isNaN(sheetId)) return NextResponse.json({ message: "معرّف غير صالح." }, { status: 400 });
    const body: { decision?: "PAID" | "REJECTED"; items?: SheetItemInput[] } =
      await request.json();

    if (body.decision === "PAID" || body.decision === "REJECTED") {
      if (!claimsCan(auth, PERMISSIONS.APPROVE_PAYROLL))
        return NextResponse.json({ message: "غير مصرّح." }, { status: 403 });
      return await DecideSheet(sheetId, body.decision === "PAID", auth.id);
    }
    if (Array.isArray(body.items)) {
      if (!claimsCan(auth, PERMISSIONS.MANAGE_PAYROLL))
        return NextResponse.json({ message: "غير مصرّح." }, { status: 403 });
      return await UpdateSheetItems(sheetId, body.items);
    }
    return NextResponse.json({ message: "طلب غير صالح." }, { status: 400 });
  } catch {
    return NextResponse.json({ message: "تعذّر الحفظ." }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_PAYROLL);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const sheetId = parseInt(id, 10);
    if (isNaN(sheetId))
      return NextResponse.json({ message: "معرّف غير صالح.", success: false }, { status: 400 });
    return await DeleteSheet(sheetId);
  } catch {
    return NextResponse.json({ message: "تعذّر الحذف.", success: false }, { status: 500 });
  }
}
