import { NextResponse } from "next/server";
import { DeleteTicket, UpdateTicket, UpdateTicketDto } from "@/services/support";
import { claimsCan, requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_SUPPORT);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const ticketId = parseInt(id, 10);
    if (isNaN(ticketId)) {
      return NextResponse.json({ message: "معرّف غير صالح." }, { status: 400 });
    }
    const body: UpdateTicketDto = await request.json();
    const canAll = claimsCan(auth, PERMISSIONS.VIEW_SUPPORT_ALL);
    return await UpdateTicket(ticketId, body, { actorId: auth.id, canAll });
  } catch {
    return NextResponse.json({ message: "تعذّر الحفظ." }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_SUPPORT);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const ticketId = parseInt(id, 10);
    if (isNaN(ticketId)) {
      return NextResponse.json(
        { message: "معرّف غير صالح.", success: false },
        { status: 400 },
      );
    }
    const canAll = claimsCan(auth, PERMISSIONS.VIEW_SUPPORT_ALL);
    return await DeleteTicket(ticketId, { actorId: auth.id, canAll });
  } catch {
    return NextResponse.json(
      { message: "تعذّر الحذف.", success: false },
      { status: 500 },
    );
  }
}
