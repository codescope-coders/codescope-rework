import { NextResponse } from "next/server";
import { CreateReport, CreateReportDto, GetAllReports } from "@/services/reports";
import { claimsCan, requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export const GET = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.VIEW_REPORTS);
  if (auth instanceof NextResponse) return auth;
  try {
    const canAll = claimsCan(auth, PERMISSIONS.VIEW_REPORTS_ALL);
    return await GetAllReports({ scopeUserId: canAll ? null : auth.id });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: (error as Error)?.message || "Something went wrong" },
      { status: 500 },
    );
  }
};

export const POST = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_REPORTS);
  if (auth instanceof NextResponse) return auth;
  try {
    const body: CreateReportDto = await request.json();
    if (!body.date?.trim()) {
      return NextResponse.json(
        { message: "التاريخ مطلوب.", fieldErrors: { date: "required" } },
        { status: 400 },
      );
    }
    const canAll = claimsCan(auth, PERMISSIONS.VIEW_REPORTS_ALL);
    return await CreateReport(body, { actorId: auth.id, canAll });
  } catch {
    return NextResponse.json(
      { message: "تعذّرت إضافة التقرير." },
      { status: 500 },
    );
  }
};
