import { NextResponse } from "next/server";
import { CreateTicket, CreateTicketDto, GetAllTickets } from "@/services/support";
import { claimsCan, requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export const GET = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.VIEW_SUPPORT);
  if (auth instanceof NextResponse) return auth;
  try {
    const canAll = claimsCan(auth, PERMISSIONS.VIEW_SUPPORT_ALL);
    return await GetAllTickets({ scopeUserId: canAll ? null : auth.id });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: (error as Error)?.message || "Something went wrong" },
      { status: 500 },
    );
  }
};

export const POST = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_SUPPORT);
  if (auth instanceof NextResponse) return auth;
  try {
    const body: CreateTicketDto = await request.json();
    if (!body.company?.trim()) {
      return NextResponse.json(
        { message: "اسم الشركة مطلوب.", fieldErrors: { company: "required" } },
        { status: 400 },
      );
    }
    if (!body.subject?.trim()) {
      return NextResponse.json(
        { message: "موضوع التذكرة مطلوب.", fieldErrors: { subject: "required" } },
        { status: 400 },
      );
    }
    const canAll = claimsCan(auth, PERMISSIONS.VIEW_SUPPORT_ALL);
    return await CreateTicket(body, { actorId: auth.id, canAll });
  } catch {
    return NextResponse.json(
      { message: "تعذّرت إضافة التذكرة." },
      { status: 500 },
    );
  }
};
