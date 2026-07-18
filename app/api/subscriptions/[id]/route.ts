import { NextResponse } from "next/server";
import {
  DeleteSubscription,
  UpdateSubscription,
  UpdateSubscriptionDto,
} from "@/services/subscriptions";
import { requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_SUBSCRIPTIONS);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const subId = parseInt(id, 10);
    if (isNaN(subId)) {
      return NextResponse.json({ message: "معرّف غير صالح." }, { status: 400 });
    }
    const body: UpdateSubscriptionDto = await request.json();
    return await UpdateSubscription(subId, body);
  } catch {
    return NextResponse.json({ message: "تعذّر الحفظ." }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_SUBSCRIPTIONS);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const subId = parseInt(id, 10);
    if (isNaN(subId)) {
      return NextResponse.json(
        { message: "معرّف غير صالح.", success: false },
        { status: 400 },
      );
    }
    return await DeleteSubscription(subId);
  } catch {
    return NextResponse.json(
      { message: "تعذّر الحذف.", success: false },
      { status: 500 },
    );
  }
}
