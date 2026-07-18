import { NextResponse } from "next/server";
import {
  CreateLedgerEntry,
  CreateLedgerEntryDto,
  GetLedger,
} from "@/services/ledger";
import { requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export const GET = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.VIEW_FINANCE);
  if (auth instanceof NextResponse) return auth;
  try {
    return await GetLedger();
  } catch (error: unknown) {
    return NextResponse.json(
      { message: (error as Error)?.message || "Something went wrong" },
      { status: 500 },
    );
  }
};

export const POST = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_LEDGER);
  if (auth instanceof NextResponse) return auth;
  try {
    const body: CreateLedgerEntryDto = await request.json();

    // Direct EXPENSE entries need the stronger (admin) grant on top of MANAGE_LEDGER.
    if (body.type === "EXPENSE") {
      const expenseAuth = await requirePermission(
        request,
        PERMISSIONS.MANAGE_LEDGER_EXPENSE,
      );
      if (expenseAuth instanceof NextResponse) return expenseAuth;
    }

    const fieldErrors: Record<string, string> = {};
    if (body.type !== "INCOME" && body.type !== "EXPENSE")
      fieldErrors.type = "required";
    const amount = Number(body.amount);
    if (body.amount == null || body.amount === "" || isNaN(amount) || amount <= 0)
      fieldErrors.amount = "required";
    if (Object.keys(fieldErrors).length) {
      return NextResponse.json(
        { message: "تحقّق من الحقول المطلوبة.", fieldErrors },
        { status: 400 },
      );
    }

    return await CreateLedgerEntry(body);
  } catch {
    return NextResponse.json({ message: "تعذّرت إضافة الحركة." }, { status: 500 });
  }
};
