import { NextResponse } from "next/server";
import {
  DecideRequest,
  DeleteRequest,
  UpdateRequestDto,
} from "@/services/requests";
import { claimsCan, requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const requestId = parseInt(id, 10);
    if (isNaN(requestId)) {
      return NextResponse.json({ message: "معرّف غير صالح." }, { status: 400 });
    }
    const body: UpdateRequestDto = await request.json();

    // The only PUT is an approve / reject decision — requires APPROVE_SPEND_REQUESTS.
    if (body.decision === "PAID" || body.decision === "REJECTED") {
      const auth = await requirePermission(
        request,
        PERMISSIONS.APPROVE_SPEND_REQUESTS,
      );
      if (auth instanceof NextResponse) return auth;
      return await DecideRequest(requestId, body.decision, auth.id);
    }

    return NextResponse.json({ message: "قرار غير صالح." }, { status: 400 });
  } catch {
    return NextResponse.json({ message: "تعذّر الحفظ." }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(request, PERMISSIONS.CREATE_SPEND_REQUEST);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const requestId = parseInt(id, 10);
    if (isNaN(requestId)) {
      return NextResponse.json(
        { message: "معرّف غير صالح.", success: false },
        { status: 400 },
      );
    }
    const canApprove = claimsCan(auth, PERMISSIONS.APPROVE_SPEND_REQUESTS);
    return await DeleteRequest(requestId, { actorId: auth.id, canApprove });
  } catch {
    return NextResponse.json(
      { message: "تعذّر الحذف.", success: false },
      { status: 500 },
    );
  }
}
