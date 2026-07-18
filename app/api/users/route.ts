import { NextResponse } from "next/server";
import { CreateUser, CreateUserDto, GetAllUsers } from "@/services/users";
import { requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS, ROLES } from "@/lib/rbac/permissions";

export const GET = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_USERS);
  if (auth instanceof NextResponse) return auth;
  try {
    return await GetAllUsers();
  } catch (error: unknown) {
    return NextResponse.json(
      { message: (error as Error)?.message || "Something went wrong" },
      { status: 500 },
    );
  }
};

export const POST = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_USERS);
  if (auth instanceof NextResponse) return auth;
  try {
    const body: CreateUserDto = await request.json();
    const fieldErrors: Record<string, string> = {};
    if (!body.email?.trim()) fieldErrors.email = "required";
    if (!body.name?.trim()) fieldErrors.name = "required";
    if (!ROLES.includes(body.role)) fieldErrors.role = "invalid";
    if (Object.keys(fieldErrors).length) {
      return NextResponse.json(
        { message: "بيانات غير مكتملة.", fieldErrors },
        { status: 400 },
      );
    }
    return await CreateUser(body);
  } catch {
    return NextResponse.json(
      { message: "تعذّرت إضافة المستخدم." },
      { status: 500 },
    );
  }
};
