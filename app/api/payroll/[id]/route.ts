import { NextResponse } from "next/server";
import { DeleteEmployee, UpdateEmployee, UpdateEmployeeDto } from "@/services/payroll";
import { requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_PAYROLL);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const empId = parseInt(id, 10);
    if (isNaN(empId)) return NextResponse.json({ message: "معرّف غير صالح." }, { status: 400 });
    const body: UpdateEmployeeDto = await request.json();
    return await UpdateEmployee(empId, body);
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
    const empId = parseInt(id, 10);
    if (isNaN(empId))
      return NextResponse.json({ message: "معرّف غير صالح.", success: false }, { status: 400 });
    return await DeleteEmployee(empId);
  } catch {
    return NextResponse.json({ message: "تعذّر الحذف.", success: false }, { status: 500 });
  }
}
