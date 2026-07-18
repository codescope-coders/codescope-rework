import { NextResponse } from "next/server";
import { CreateRequest, CreateRequestDto, GetRequests } from "@/services/requests";
import { claimsCan, requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export const GET = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.CREATE_SPEND_REQUEST);
  if (auth instanceof NextResponse) return auth;
  try {
    // Approvers (admin) see every request; requesters see only their own.
    const canAll = claimsCan(auth, PERMISSIONS.APPROVE_SPEND_REQUESTS);
    return await GetRequests({ scopeUserId: canAll ? null : auth.id });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: (error as Error)?.message || "Something went wrong" },
      { status: 500 },
    );
  }
};

export const POST = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.CREATE_SPEND_REQUEST);
  if (auth instanceof NextResponse) return auth;
  try {
    const body: CreateRequestDto = await request.json();
    const fieldErrors: Record<string, string> = {};
    if (!body.date) fieldErrors.date = "required";
    if (body.amount == null || Number(body.amount) <= 0)
      fieldErrors.amount = "required";
    if (Object.keys(fieldErrors).length) {
      return NextResponse.json(
        { message: "يرجى إكمال الحقول المطلوبة.", fieldErrors },
        { status: 400 },
      );
    }
    return await CreateRequest(body, auth.id);
  } catch {
    return NextResponse.json(
      { message: "تعذّر إرسال الطلب." },
      { status: 500 },
    );
  }
};
