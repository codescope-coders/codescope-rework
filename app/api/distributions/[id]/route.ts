import { NextResponse } from "next/server";
import { DeleteDistribution } from "@/services/distributions";
import { requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_DISTRIBUTIONS);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const distributionId = parseInt(id, 10);
    if (isNaN(distributionId)) {
      return NextResponse.json(
        { message: "معرّف غير صالح.", success: false },
        { status: 400 },
      );
    }
    return await DeleteDistribution(distributionId);
  } catch {
    return NextResponse.json(
      { message: "تعذّر الحذف.", success: false },
      { status: 500 },
    );
  }
}
