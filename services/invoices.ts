import { db } from "@/lib/db";
import { invoices } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export type PackageTier = "CHARTER" | "STANDARD" | "ADVANCED";
export type Currency = "IQD" | "USD";

export interface InvoiceDto {
  id: number;
  number: number;
  date: string;
  company: string;
  systemName: string | null;
  phone: string | null;
  address: string | null;
  package: PackageTier;
  currency: Currency;
  total: string;
  paid: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceDto {
  date?: string | null;
  company: string;
  systemName?: string | null;
  phone?: string | null;
  address?: string | null;
  package?: PackageTier;
  currency?: Currency;
  total?: number | string | null;
  paid?: number | string | null;
  notes?: string | null;
}
export type UpdateInvoiceDto = Partial<CreateInvoiceDto>;

const todayISO = () => new Date().toISOString().slice(0, 10);

/** numeric column wants a string; empty/absent becomes "0". */
const toMoney = (v: number | string | null | undefined): string =>
  v === "" || v === null || v === undefined ? "0" : String(v);

export const GetInvoices = async () => {
  const rows = await db.select().from(invoices).orderBy(desc(invoices.number));
  return NextResponse.json({
    message: "ok",
    payload: rows as unknown as InvoiceDto[],
  });
};

export const CreateInvoice = async (data: CreateInvoiceDto) => {
  // Auto-assign the next invoice number: (max existing OR 1000) + 1.
  const [agg] = await db
    .select({ max: sql<number>`coalesce(max(${invoices.number}), 1000)` })
    .from(invoices);
  const number = Number(agg?.max ?? 1000) + 1;

  const [row] = await db
    .insert(invoices)
    .values({
      number,
      date: data.date || todayISO(),
      company: data.company,
      systemName: data.systemName ?? null,
      phone: data.phone ?? null,
      address: data.address ?? null,
      package: data.package ?? "STANDARD",
      currency: data.currency ?? "IQD",
      total: toMoney(data.total),
      paid: toMoney(data.paid),
      notes: data.notes ?? null,
    })
    .returning();
  return NextResponse.json({ message: "تمت الإضافة.", payload: row }, { status: 201 });
};

export const UpdateInvoice = async (id: number, data: UpdateInvoiceDto) => {
  const existing = await db.query.invoices.findFirst({
    where: eq(invoices.id, id),
  });
  if (!existing) {
    return NextResponse.json({ message: "غير موجود." }, { status: 404 });
  }

  const patch: Record<string, unknown> = { ...data, updatedAt: new Date() };
  if ("total" in patch) patch.total = toMoney(data.total);
  if ("paid" in patch) patch.paid = toMoney(data.paid);
  if (patch.date === "") delete patch.date;

  const [row] = await db
    .update(invoices)
    .set(patch)
    .where(eq(invoices.id, id))
    .returning();
  return NextResponse.json({ message: "تم الحفظ.", payload: row });
};

export const DeleteInvoice = async (id: number) => {
  const existing = await db.query.invoices.findFirst({
    where: eq(invoices.id, id),
  });
  if (!existing) {
    return NextResponse.json(
      { message: "غير موجود.", success: false },
      { status: 404 },
    );
  }
  await db.delete(invoices).where(eq(invoices.id, id));
  return NextResponse.json({ message: "تم الحذف.", success: true });
};
