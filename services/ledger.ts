import { db } from "@/lib/db";
import { ledgerEntries } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export type LedgerType = "INCOME" | "EXPENSE";
export type Currency = "IQD" | "USD";

export interface LedgerEntryDto {
  id: number;
  date: string;
  type: LedgerType;
  category: string | null;
  amount: string;
  currency: Currency;
  notes: string | null;
  requestId: number | null;
  sheetId: number | null;
  distributionId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLedgerEntryDto {
  date?: string | null;
  type: LedgerType;
  category?: string | null;
  amount: number | string;
  currency?: Currency;
  notes?: string | null;
}
export type UpdateLedgerEntryDto = Partial<CreateLedgerEntryDto>;

const todayISO = () => new Date().toISOString().slice(0, 10);

/** True when a row is posted by another module (spend request / payroll sheet /
 * profit distribution) — such rows are read-only in the ledger UI + API. */
function isSystemManaged(row: {
  requestId: number | null;
  sheetId: number | null;
  distributionId: number | null;
}): boolean {
  return row.requestId != null || row.sheetId != null || row.distributionId != null;
}

/** All ledger movements, oldest first (date asc, then id asc) so the caller can
 * roll a running balance forward. */
export const GetLedger = async () => {
  const rows = await db
    .select()
    .from(ledgerEntries)
    .orderBy(asc(ledgerEntries.date), asc(ledgerEntries.id));
  return NextResponse.json({
    message: "ok",
    payload: rows as unknown as LedgerEntryDto[],
  });
};

export const CreateLedgerEntry = async (data: CreateLedgerEntryDto) => {
  const [row] = await db
    .insert(ledgerEntries)
    .values({
      date: data.date || todayISO(),
      type: data.type,
      category: data.category ?? null,
      amount: String(data.amount),
      currency: data.currency ?? "IQD",
      notes: data.notes ?? null,
    })
    .returning();
  return NextResponse.json({ message: "تمت الإضافة.", payload: row }, { status: 201 });
};

export const UpdateLedgerEntry = async (
  id: number,
  data: UpdateLedgerEntryDto,
) => {
  const existing = await db.query.ledgerEntries.findFirst({
    where: eq(ledgerEntries.id, id),
  });
  if (!existing) {
    return NextResponse.json({ message: "غير موجود." }, { status: 404 });
  }
  if (isSystemManaged(existing)) {
    return NextResponse.json(
      { message: "هذه الحركة مُدارة من النظام ولا يمكن تعديلها." },
      { status: 400 },
    );
  }

  const patch: Record<string, unknown> = {};
  if (data.date !== undefined) patch.date = data.date || todayISO();
  if (data.type !== undefined) patch.type = data.type;
  if (data.category !== undefined) patch.category = data.category ?? null;
  if (data.amount !== undefined) patch.amount = String(data.amount);
  if (data.currency !== undefined) patch.currency = data.currency;
  if (data.notes !== undefined) patch.notes = data.notes ?? null;

  const [row] = await db
    .update(ledgerEntries)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(ledgerEntries.id, id))
    .returning();
  return NextResponse.json({ message: "تم الحفظ.", payload: row });
};

export const DeleteLedgerEntry = async (id: number) => {
  const existing = await db.query.ledgerEntries.findFirst({
    where: eq(ledgerEntries.id, id),
  });
  if (!existing) {
    return NextResponse.json(
      { message: "غير موجود.", success: false },
      { status: 404 },
    );
  }
  if (isSystemManaged(existing)) {
    return NextResponse.json(
      { message: "هذه الحركة مُدارة من النظام ولا يمكن حذفها.", success: false },
      { status: 400 },
    );
  }
  await db.delete(ledgerEntries).where(eq(ledgerEntries.id, id));
  return NextResponse.json({ message: "تم الحذف.", success: true });
};
