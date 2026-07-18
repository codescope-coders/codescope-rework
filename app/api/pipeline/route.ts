import { NextResponse } from "next/server";
import { CreateLead, CreateLeadDto, GetAllLeads } from "@/services/pipeline";
import { claimsCan, requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export const GET = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.VIEW_PIPELINE);
  if (auth instanceof NextResponse) return auth;
  try {
    const canAll = claimsCan(auth, PERMISSIONS.VIEW_PIPELINE_ALL);
    return await GetAllLeads({ scopeUserId: canAll ? null : auth.id });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: (error as Error)?.message || "Something went wrong" },
      { status: 500 },
    );
  }
};

export const POST = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_PIPELINE);
  if (auth instanceof NextResponse) return auth;
  try {
    const body: CreateLeadDto = await request.json();
    if (!body.company?.trim()) {
      return NextResponse.json(
        { message: "اسم الشركة مطلوب.", fieldErrors: { company: "required" } },
        { status: 400 },
      );
    }
    const canAll = claimsCan(auth, PERMISSIONS.VIEW_PIPELINE_ALL);
    return await CreateLead(body, { actorId: auth.id, canAll });
  } catch {
    return NextResponse.json(
      { message: "تعذّرت إضافة العميل." },
      { status: 500 },
    );
  }
};
