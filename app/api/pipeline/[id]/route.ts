import { NextResponse } from "next/server";
import { DeleteLead, UpdateLead, UpdateLeadDto } from "@/services/pipeline";
import { claimsCan, requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_PIPELINE);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const leadId = parseInt(id, 10);
    if (isNaN(leadId)) {
      return NextResponse.json({ message: "معرّف غير صالح." }, { status: 400 });
    }
    const body: UpdateLeadDto = await request.json();
    const canAll = claimsCan(auth, PERMISSIONS.VIEW_PIPELINE_ALL);
    return await UpdateLead(leadId, body, { actorId: auth.id, canAll });
  } catch {
    return NextResponse.json({ message: "تعذّر الحفظ." }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_PIPELINE);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const leadId = parseInt(id, 10);
    if (isNaN(leadId)) {
      return NextResponse.json(
        { message: "معرّف غير صالح.", success: false },
        { status: 400 },
      );
    }
    const canAll = claimsCan(auth, PERMISSIONS.VIEW_PIPELINE_ALL);
    return await DeleteLead(leadId, { actorId: auth.id, canAll });
  } catch {
    return NextResponse.json(
      { message: "تعذّر الحذف.", success: false },
      { status: 500 },
    );
  }
}
