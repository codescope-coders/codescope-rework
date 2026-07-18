import { NextResponse } from "next/server";
import { GetUnpaidLeaveUserIds } from "@/services/payroll";
import { requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export const GET = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.VIEW_PAYROLL);
  if (auth instanceof NextResponse) return auth;
  try {
    return await GetUnpaidLeaveUserIds();
  } catch (error: unknown) {
    return NextResponse.json(
      { message: (error as Error)?.message || "Something went wrong", payload: [] },
      { status: 500 },
    );
  }
};
