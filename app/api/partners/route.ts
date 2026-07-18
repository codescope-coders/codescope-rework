import { NextResponse } from "next/server";
import {
  CreatePartner,
  CreatePartnerDto,
  GetAllPartners,
} from "@/services/partners";
import { requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export const GET = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.VIEW_PARTNERS);
  if (auth instanceof NextResponse) return auth;
  try {
    return await GetAllPartners();
  } catch (error: unknown) {
    return NextResponse.json(
      { message: (error as Error)?.message || "Something went wrong" },
      { status: 500 },
    );
  }
};

export const POST = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_PARTNERS);
  if (auth instanceof NextResponse) return auth;
  try {
    const body: CreatePartnerDto = await request.json();
    if (!body.name?.trim()) {
      return NextResponse.json(
        { message: "اسم الشريك مطلوب.", fieldErrors: { name: "required" } },
        { status: 400 },
      );
    }
    return await CreatePartner(body);
  } catch {
    return NextResponse.json({ message: "تعذّرت إضافة الشريك." }, { status: 500 });
  }
};
