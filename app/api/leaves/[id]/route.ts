import { NextResponse } from "next/server";
import {
  DecideLeave,
  DeleteLeave,
  UpdateLeave,
  UpdateLeaveDto,
} from "@/services/leaves";
import { claimsCan, requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const leaveId = parseInt(id, 10);
    if (isNaN(leaveId)) {
      return NextResponse.json({ message: "معرّف غير صالح." }, { status: 400 });
    }
    const body: UpdateLeaveDto = await request.json();

    // Approval / rejection decision — requires APPROVE_LEAVES.
    if (body.decision === "APPROVED" || body.decision === "REJECTED") {
      const auth = await requirePermission(request, PERMISSIONS.APPROVE_LEAVES);
      if (auth instanceof NextResponse) return auth;
      return await DecideLeave(leaveId, body.decision, auth.id);
    }

    // Otherwise a normal owner edit — requires REQUEST_LEAVE.
    const auth = await requirePermission(request, PERMISSIONS.REQUEST_LEAVE);
    if (auth instanceof NextResponse) return auth;
    const canAll = claimsCan(auth, PERMISSIONS.VIEW_LEAVES_ALL);
    return await UpdateLeave(leaveId, body, { actorId: auth.id, canAll });
  } catch {
    return NextResponse.json({ message: "تعذّر الحفظ." }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(request, PERMISSIONS.VIEW_LEAVES);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const leaveId = parseInt(id, 10);
    if (isNaN(leaveId)) {
      return NextResponse.json(
        { message: "معرّف غير صالح.", success: false },
        { status: 400 },
      );
    }
    const canApprove = claimsCan(auth, PERMISSIONS.APPROVE_LEAVES);
    return await DeleteLeave(leaveId, { actorId: auth.id, canApprove });
  } catch {
    return NextResponse.json(
      { message: "تعذّر الحذف.", success: false },
      { status: 500 },
    );
  }
}
