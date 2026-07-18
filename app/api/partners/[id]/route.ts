import { NextResponse } from "next/server";
import {
  DeletePartner,
  UpdatePartner,
  UpdatePartnerDto,
} from "@/services/partners";
import { requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_PARTNERS);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const partnerId = parseInt(id, 10);
    if (isNaN(partnerId)) {
      return NextResponse.json({ message: "معرّف غير صالح." }, { status: 400 });
    }
    const body: UpdatePartnerDto = await request.json();
    return await UpdatePartner(partnerId, body);
  } catch {
    return NextResponse.json({ message: "تعذّر الحفظ." }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_PARTNERS);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const partnerId = parseInt(id, 10);
    if (isNaN(partnerId)) {
      return NextResponse.json(
        { message: "معرّف غير صالح.", success: false },
        { status: 400 },
      );
    }
    return await DeletePartner(partnerId);
  } catch {
    return NextResponse.json(
      { message: "تعذّر الحذف.", success: false },
      { status: 500 },
    );
  }
}
