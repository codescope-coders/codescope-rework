import { NextResponse } from "next/server";
import { DeleteInvoice, UpdateInvoice, UpdateInvoiceDto } from "@/services/invoices";
import { requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_INVOICES);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const invoiceId = parseInt(id, 10);
    if (isNaN(invoiceId)) {
      return NextResponse.json({ message: "معرّف غير صالح." }, { status: 400 });
    }
    const body: UpdateInvoiceDto = await request.json();
    return await UpdateInvoice(invoiceId, body);
  } catch {
    return NextResponse.json({ message: "تعذّر الحفظ." }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_INVOICES);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const invoiceId = parseInt(id, 10);
    if (isNaN(invoiceId)) {
      return NextResponse.json(
        { message: "معرّف غير صالح.", success: false },
        { status: 400 },
      );
    }
    return await DeleteInvoice(invoiceId);
  } catch {
    return NextResponse.json(
      { message: "تعذّر الحذف.", success: false },
      { status: 500 },
    );
  }
}
