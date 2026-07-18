import { NextResponse } from "next/server";
import { CreateLeave, CreateLeaveDto, GetAllLeaves } from "@/services/leaves";
import { claimsCan, requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export const GET = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.VIEW_LEAVES);
  if (auth instanceof NextResponse) return auth;
  try {
    const canAll = claimsCan(auth, PERMISSIONS.VIEW_LEAVES_ALL);
    return await GetAllLeaves({ scopeUserId: canAll ? null : auth.id });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: (error as Error)?.message || "Something went wrong" },
      { status: 500 },
    );
  }
};

export const POST = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.REQUEST_LEAVE);
  if (auth instanceof NextResponse) return auth;
  try {
    const body: CreateLeaveDto = await request.json();
    const fieldErrors: Record<string, string> = {};
    if (!body.startDate) fieldErrors.startDate = "required";
    if (!body.endDate) fieldErrors.endDate = "required";
    if (Object.keys(fieldErrors).length) {
      return NextResponse.json(
        { message: "تاريخا بداية ونهاية الإجازة مطلوبان.", fieldErrors },
        { status: 400 },
      );
    }
    const canAll = claimsCan(auth, PERMISSIONS.VIEW_LEAVES_ALL);
    return await CreateLeave(body, { actorId: auth.id, canAll });
  } catch {
    return NextResponse.json(
      { message: "تعذّر إرسال طلب الإجازة." },
      { status: 500 },
    );
  }
};
