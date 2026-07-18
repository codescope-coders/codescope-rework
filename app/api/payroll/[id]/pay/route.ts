import { NextResponse } from "next/server";
import { PayEmployee } from "@/services/payroll";
import { claimsCan, requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_PAYROLL);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const empId = parseInt(id, 10);
    if (isNaN(empId))
      return NextResponse.json({ message: "معرّف غير صالح.", success: false }, { status: 400 });
    const canApprove = claimsCan(auth, PERMISSIONS.APPROVE_PAYROLL);
    return await PayEmployee(empId, auth.id, canApprove);
  } catch {
    return NextResponse.json({ message: "تعذّرت العملية.", success: false }, { status: 500 });
  }
}
