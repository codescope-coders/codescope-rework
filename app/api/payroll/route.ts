import { NextResponse } from "next/server";
import { CreateEmployee, CreateEmployeeDto, GetAllEmployees } from "@/services/payroll";
import { requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export const GET = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.VIEW_PAYROLL);
  if (auth instanceof NextResponse) return auth;
  try {
    return await GetAllEmployees();
  } catch (error: unknown) {
    return NextResponse.json(
      { message: (error as Error)?.message || "Something went wrong" },
      { status: 500 },
    );
  }
};

export const POST = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_PAYROLL);
  if (auth instanceof NextResponse) return auth;
  try {
    const body: CreateEmployeeDto = await request.json();
    const fieldErrors: Record<string, string> = {};
    if (!body.name?.trim()) fieldErrors.name = "required";
    if (body.salary === undefined || body.salary === "") fieldErrors.salary = "required";
    if (Object.keys(fieldErrors).length) {
      return NextResponse.json({ message: "بيانات ناقصة.", fieldErrors }, { status: 400 });
    }
    return await CreateEmployee(body);
  } catch {
    return NextResponse.json({ message: "تعذّرت الإضافة." }, { status: 500 });
  }
};
