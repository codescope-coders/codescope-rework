import { db } from "@/lib/db";
import {
  payrollEmployees,
  payrollSheets,
  payrollSheetItems,
  ledgerEntries,
  spendRequests,
  leaves,
  admins,
} from "@/lib/db/schema";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { monthLabel } from "@/lib/dashboard/format";

const todayISO = () => new Date().toISOString().slice(0, 10);
const monthKeyNow = () => new Date().toISOString().slice(0, 7);

type Currency = "IQD" | "USD";

export interface EmployeeDto {
  id: number;
  userId: number | null;
  name: string;
  position: string | null;
  salary: string;
  currency: Currency;
  lastPaid: string | null;
  pendingRequest: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SheetItemDto {
  id: number;
  sheetId: number;
  payrollEmployeeId: number | null;
  name: string;
  position: string | null;
  salary: string;
  currency: Currency;
  deduction: string;
  deductionReason: string | null;
  bonus: string;
}

export interface SheetDto {
  id: number;
  month: string;
  date: string;
  createdById: number | null;
  createdByName: string | null;
  status: "PENDING" | "PAID" | "REJECTED";
  decidedById: number | null;
  decidedByName: string | null;
  decidedDate: string | null;
  items: SheetItemDto[];
}

export interface CreateEmployeeDto {
  userId?: number | null;
  name: string;
  position?: string | null;
  salary: number | string;
  currency?: Currency;
}
export type UpdateEmployeeDto = Partial<CreateEmployeeDto>;

export interface SheetItemInput {
  payrollEmployeeId: number | null;
  name: string;
  position?: string | null;
  salary: number | string;
  currency: Currency;
  deduction?: number | string;
  deductionReason?: string | null;
  bonus?: number | string;
}

const num = (v: unknown) => Number(v || 0);
const netOf = (i: { salary: unknown; deduction?: unknown; bonus?: unknown }) =>
  num(i.salary) - num(i.deduction) + num(i.bonus);

/* ─────────────────────────────── Employees ────────────────────────────────*/

export const GetAllEmployees = async () => {
  const rows = await db
    .select({
      id: payrollEmployees.id,
      userId: payrollEmployees.userId,
      name: payrollEmployees.name,
      position: payrollEmployees.position,
      salary: payrollEmployees.salary,
      currency: payrollEmployees.currency,
      lastPaid: payrollEmployees.lastPaid,
      createdAt: payrollEmployees.createdAt,
      updatedAt: payrollEmployees.updatedAt,
      pendingRequest: sql<boolean>`exists (select 1 from ${spendRequests} sr where sr.payroll_id = ${payrollEmployees.id} and sr.status = 'PENDING')`,
    })
    .from(payrollEmployees)
    .orderBy(desc(payrollEmployees.createdAt));
  return NextResponse.json({ message: "ok", payload: rows as unknown as EmployeeDto[] });
};

export const CreateEmployee = async (data: CreateEmployeeDto) => {
  const [row] = await db
    .insert(payrollEmployees)
    .values({
      userId: data.userId ?? null,
      name: data.name,
      position: data.position ?? null,
      salary: String(data.salary),
      currency: data.currency ?? "IQD",
    })
    .returning();
  return NextResponse.json(
    { message: "تمت إضافة الموظف.", payload: row },
    { status: 201 },
  );
};

export const UpdateEmployee = async (id: number, data: UpdateEmployeeDto) => {
  const patch: Record<string, unknown> = { ...data, updatedAt: new Date() };
  if (data.salary !== undefined) patch.salary = String(data.salary);
  const [row] = await db
    .update(payrollEmployees)
    .set(patch)
    .where(eq(payrollEmployees.id, id))
    .returning();
  if (!row) return NextResponse.json({ message: "غير موجود." }, { status: 404 });
  return NextResponse.json({ message: "تم الحفظ.", payload: row });
};

export const DeleteEmployee = async (id: number) => {
  await db.delete(payrollEmployees).where(eq(payrollEmployees.id, id));
  return NextResponse.json({ message: "تم الحذف.", success: true });
};

/** Individual payout. Admins (canApprove) post an EXPENSE directly + stamp
 * lastPaid; everyone else files a PENDING spend request instead. */
export const PayEmployee = async (
  id: number,
  actorId: number,
  canApprove: boolean,
) => {
  const emp = await db.query.payrollEmployees.findFirst({
    where: eq(payrollEmployees.id, id),
  });
  if (!emp) return NextResponse.json({ message: "غير موجود." }, { status: 404 });
  const today = todayISO();

  if (canApprove) {
    await db.insert(ledgerEntries).values({
      date: today,
      type: "EXPENSE",
      category: "رواتب",
      amount: emp.salary,
      currency: emp.currency,
      notes: `راتب ${emp.name}`,
    });
    await db
      .update(payrollEmployees)
      .set({ lastPaid: today, updatedAt: new Date() })
      .where(eq(payrollEmployees.id, id));
    return NextResponse.json({ message: "تم صرف الراتب وتسجيله بالحركات.", success: true });
  }

  await db.insert(spendRequests).values({
    date: today,
    requestedById: actorId,
    reason: `راتب ${emp.name}`,
    amount: emp.salary,
    currency: emp.currency,
    status: "PENDING",
    payrollId: id,
  });
  return NextResponse.json({
    message: "أُرسل طلب صرف الراتب بانتظار موافقة الإدارة.",
    success: true,
  });
};

/* ──────────────────────────────── Sheets ──────────────────────────────────*/

async function nameMap(ids: (number | null)[]) {
  const clean = [...new Set(ids.filter((x): x is number => x != null))];
  if (!clean.length) return new Map<number, string | null>();
  const rows = await db
    .select({ id: admins.id, name: admins.name })
    .from(admins)
    .where(inArray(admins.id, clean));
  return new Map(rows.map((r) => [r.id, r.name]));
}

export const GetSheets = async () => {
  const sheets = await db.query.payrollSheets.findMany({
    with: { items: true },
    orderBy: (s, { desc }) => desc(s.month),
  });
  const names = await nameMap(
    sheets.flatMap((s) => [s.createdById, s.decidedById]),
  );
  const payload = sheets.map((s) => ({
    ...s,
    createdByName: s.createdById ? names.get(s.createdById) ?? null : null,
    decidedByName: s.decidedById ? names.get(s.decidedById) ?? null : null,
  }));
  return NextResponse.json({ message: "ok", payload: payload as unknown as SheetDto[] });
};

export const CreateSheet = async (
  items: SheetItemInput[],
  actorId: number,
  month?: string,
) => {
  const m = month || monthKeyNow();
  const existing = await db.query.payrollSheets.findFirst({
    where: eq(payrollSheets.month, m),
  });
  if (existing) {
    return NextResponse.json(
      { message: "يوجد مشف رواتب لهذا الشهر مسبقاً." },
      { status: 400 },
    );
  }
  const [sheet] = await db
    .insert(payrollSheets)
    .values({ month: m, date: todayISO(), createdById: actorId, status: "PENDING" })
    .returning();
  if (items.length) {
    await db.insert(payrollSheetItems).values(
      items.map((it) => ({
        sheetId: sheet.id,
        payrollEmployeeId: it.payrollEmployeeId ?? null,
        name: it.name,
        position: it.position ?? null,
        salary: String(it.salary),
        currency: it.currency,
        deduction: String(it.deduction ?? 0),
        deductionReason: it.deductionReason ?? null,
        bonus: String(it.bonus ?? 0),
      })),
    );
  }
  return NextResponse.json(
    { message: "أُرسل مشف الرواتب للإدارة.", payload: sheet },
    { status: 201 },
  );
};

/** Replace a PENDING sheet's line items (admin edit before approval). */
export const UpdateSheetItems = async (id: number, items: SheetItemInput[]) => {
  const sheet = await db.query.payrollSheets.findFirst({
    where: eq(payrollSheets.id, id),
  });
  if (!sheet) return NextResponse.json({ message: "غير موجود." }, { status: 404 });
  if (sheet.status !== "PENDING") {
    return NextResponse.json({ message: "لا يمكن تعديل مشف مُعتمد." }, { status: 400 });
  }
  await db.delete(payrollSheetItems).where(eq(payrollSheetItems.sheetId, id));
  if (items.length) {
    await db.insert(payrollSheetItems).values(
      items.map((it) => ({
        sheetId: id,
        payrollEmployeeId: it.payrollEmployeeId ?? null,
        name: it.name,
        position: it.position ?? null,
        salary: String(it.salary),
        currency: it.currency,
        deduction: String(it.deduction ?? 0),
        deductionReason: it.deductionReason ?? null,
        bonus: String(it.bonus ?? 0),
      })),
    );
  }
  return NextResponse.json({ message: "تم حفظ التعديلات." });
};

export const DecideSheet = async (
  id: number,
  approve: boolean,
  actorId: number,
) => {
  const sheet = await db.query.payrollSheets.findFirst({
    where: eq(payrollSheets.id, id),
    with: { items: true },
  });
  if (!sheet) return NextResponse.json({ message: "غير موجود." }, { status: 404 });
  if (sheet.status !== "PENDING") {
    return NextResponse.json({ message: "تمت معالجة هذا المشف مسبقاً." }, { status: 400 });
  }
  const today = todayISO();

  if (approve) {
    const label = monthLabel(sheet.month, "ar");
    const entries = sheet.items.map((it) => {
      const parts: string[] = [];
      if (num(it.deduction) > 0)
        parts.push(
          `خصم ${num(it.deduction)}${it.deductionReason ? " (" + it.deductionReason + ")" : ""}`,
        );
      if (num(it.bonus) > 0) parts.push(`مكافأة ${num(it.bonus)}`);
      const extra = parts.length ? ` — ${parts.join("، ")}` : "";
      return {
        date: today,
        type: "EXPENSE" as const,
        category: "رواتب",
        amount: String(netOf(it)),
        currency: it.currency,
        notes: `مشف رواتب ${label} — ${it.name}${extra}`,
        sheetId: id,
      };
    });
    if (entries.length) await db.insert(ledgerEntries).values(entries);

    const empIds = sheet.items
      .map((it) => it.payrollEmployeeId)
      .filter((x): x is number => x != null);
    if (empIds.length) {
      await db
        .update(payrollEmployees)
        .set({ lastPaid: today, updatedAt: new Date() })
        .where(inArray(payrollEmployees.id, empIds));
    }
  }

  await db
    .update(payrollSheets)
    .set({
      status: approve ? "PAID" : "REJECTED",
      decidedById: actorId,
      decidedDate: today,
      updatedAt: new Date(),
    })
    .where(eq(payrollSheets.id, id));

  return NextResponse.json({
    message: approve ? "تم اعتماد صرف الرواتب." : "تم رفض المشف.",
    success: true,
  });
};

export const DeleteSheet = async (id: number) => {
  const sheet = await db.query.payrollSheets.findFirst({
    where: eq(payrollSheets.id, id),
  });
  if (!sheet) {
    return NextResponse.json({ message: "غير موجود.", success: false }, { status: 404 });
  }
  if (sheet.status !== "PENDING") {
    return NextResponse.json(
      { message: "لا يمكن حذف مشف مُعتمد.", success: false },
      { status: 400 },
    );
  }
  await db.delete(payrollSheets).where(eq(payrollSheets.id, id));
  return NextResponse.json({ message: "تم الحذف.", success: true });
};

/** userIds with an APPROVED unpaid leave overlapping the current month — used to
 * warn in the sheet builder. */
export const GetUnpaidLeaveUserIds = async () => {
  const m = monthKeyNow();
  const rows = await db
    .selectDistinct({ employeeId: leaves.employeeId })
    .from(leaves)
    .where(
      and(
        eq(leaves.status, "APPROVED"),
        eq(leaves.type, "UNPAID"),
        sql`substring(${leaves.startDate}::text, 1, 7) <= ${m}`,
        sql`substring(${leaves.endDate}::text, 1, 7) >= ${m}`,
      ),
    );
  const ids = rows.map((r) => r.employeeId).filter((x): x is number => x != null);
  return NextResponse.json({ message: "ok", payload: ids });
};
