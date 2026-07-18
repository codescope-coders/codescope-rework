import { NextResponse } from "next/server";
import {
  CreateDistribution,
  CreateDistributionDto,
  GetAllDistributions,
} from "@/services/distributions";
import { requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export const GET = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.VIEW_PARTNERS);
  if (auth instanceof NextResponse) return auth;
  try {
    return await GetAllDistributions();
  } catch (error: unknown) {
    return NextResponse.json(
      { message: (error as Error)?.message || "Something went wrong" },
      { status: 500 },
    );
  }
};

export const POST = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_DISTRIBUTIONS);
  if (auth instanceof NextResponse) return auth;
  try {
    const body: CreateDistributionDto = await request.json();
    const fieldErrors: Record<string, string> = {};
    if (!body.date) fieldErrors.date = "required";
    if (!(Number(body.amount) > 0)) fieldErrors.amount = "required";
    if (Object.keys(fieldErrors).length) {
      return NextResponse.json(
        { message: "التاريخ والمبلغ مطلوبان.", fieldErrors },
        { status: 400 },
      );
    }
    return await CreateDistribution(body);
  } catch {
    return NextResponse.json({ message: "تعذّر تسجيل التوزيع." }, { status: 500 });
  }
};
