import { NextResponse } from "next/server";
import { DeleteReport, UpdateReport, UpdateReportDto } from "@/services/reports";
import { claimsCan, requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_REPORTS);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const reportId = parseInt(id, 10);
    if (isNaN(reportId)) {
      return NextResponse.json({ message: "معرّف غير صالح." }, { status: 400 });
    }
    const body: UpdateReportDto = await request.json();
    const canAll = claimsCan(auth, PERMISSIONS.VIEW_REPORTS_ALL);
    return await UpdateReport(reportId, body, { actorId: auth.id, canAll });
  } catch {
    return NextResponse.json({ message: "تعذّر الحفظ." }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_REPORTS);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const reportId = parseInt(id, 10);
    if (isNaN(reportId)) {
      return NextResponse.json(
        { message: "معرّف غير صالح.", success: false },
        { status: 400 },
      );
    }
    const canAll = claimsCan(auth, PERMISSIONS.VIEW_REPORTS_ALL);
    return await DeleteReport(reportId, { actorId: auth.id, canAll });
  } catch {
    return NextResponse.json(
      { message: "تعذّر الحذف.", success: false },
      { status: 500 },
    );
  }
}
