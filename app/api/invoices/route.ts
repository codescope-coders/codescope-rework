import { NextResponse } from "next/server";
import { CreateInvoice, CreateInvoiceDto, GetInvoices } from "@/services/invoices";
import { requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export const GET = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.VIEW_INVOICES);
  if (auth instanceof NextResponse) return auth;
  try {
    return await GetInvoices();
  } catch (error: unknown) {
    return NextResponse.json(
      { message: (error as Error)?.message || "Something went wrong" },
      { status: 500 },
    );
  }
};

export const POST = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_INVOICES);
  if (auth instanceof NextResponse) return auth;
  try {
    const body: CreateInvoiceDto = await request.json();
    if (!body.company?.trim()) {
      return NextResponse.json(
        { message: "اسم الشركة مطلوب.", fieldErrors: { company: "required" } },
        { status: 400 },
      );
    }
    if (body.total === undefined || body.total === null || body.total === "") {
      return NextResponse.json(
        { message: "قيمة الفاتورة مطلوبة.", fieldErrors: { total: "required" } },
        { status: 400 },
      );
    }
    return await CreateInvoice(body);
  } catch {
    return NextResponse.json(
      { message: "تعذّرت إضافة الفاتورة." },
      { status: 500 },
    );
  }
};
