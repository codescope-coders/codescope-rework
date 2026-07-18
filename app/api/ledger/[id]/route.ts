import { NextResponse } from "next/server";
import {
  DeleteLedgerEntry,
  UpdateLedgerEntry,
  UpdateLedgerEntryDto,
} from "@/services/ledger";
import { requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_LEDGER);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const entryId = parseInt(id, 10);
    if (isNaN(entryId)) {
      return NextResponse.json({ message: "معرّف غير صالح." }, { status: 400 });
    }
    const body: UpdateLedgerEntryDto = await request.json();
    return await UpdateLedgerEntry(entryId, body);
  } catch {
    return NextResponse.json({ message: "تعذّر الحفظ." }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_LEDGER);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const entryId = parseInt(id, 10);
    if (isNaN(entryId)) {
      return NextResponse.json(
        { message: "معرّف غير صالح.", success: false },
        { status: 400 },
      );
    }
    return await DeleteLedgerEntry(entryId);
  } catch {
    return NextResponse.json(
      { message: "تعذّر الحذف.", success: false },
      { status: 500 },
    );
  }
}
