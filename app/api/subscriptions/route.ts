import { NextResponse } from "next/server";
import {
  CreateSubscription,
  CreateSubscriptionDto,
  GetSubscriptions,
} from "@/services/subscriptions";
import { requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export const GET = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.VIEW_SUBSCRIPTIONS);
  if (auth instanceof NextResponse) return auth;
  try {
    return await GetSubscriptions();
  } catch (error: unknown) {
    return NextResponse.json(
      { message: (error as Error)?.message || "Something went wrong" },
      { status: 500 },
    );
  }
};

export const POST = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_SUBSCRIPTIONS);
  if (auth instanceof NextResponse) return auth;
  try {
    const body: CreateSubscriptionDto = await request.json();
    if (!body.company?.trim()) {
      return NextResponse.json(
        { message: "اسم الشركة مطلوب.", fieldErrors: { company: "required" } },
        { status: 400 },
      );
    }
    return await CreateSubscription(body);
  } catch {
    return NextResponse.json(
      { message: "تعذّرت إضافة الاشتراك." },
      { status: 500 },
    );
  }
};
