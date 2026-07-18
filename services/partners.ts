import { db } from "@/lib/db";
import { partners, distributionShares } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export interface PartnerDto {
  id: number;
  name: string;
  percentage: number;
  phone: string | null;
  joinDate: string | null;
  notes: string | null;
  /** SUM of every distribution_shares.amount paid to this partner. */
  receivedTotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartnerDto {
  name: string;
  percentage?: number;
  phone?: string | null;
  joinDate?: string | null;
  notes?: string | null;
}
export type UpdatePartnerDto = Partial<CreatePartnerDto>;

const partnerSelection = {
  id: partners.id,
  name: partners.name,
  percentage: partners.percentage,
  phone: partners.phone,
  joinDate: partners.joinDate,
  notes: partners.notes,
  createdAt: partners.createdAt,
  updatedAt: partners.updatedAt,
  // Correlated subquery: total this partner has received across all distributions.
  receivedTotal: sql<string>`coalesce((select sum(${distributionShares.amount}) from ${distributionShares} where ${distributionShares.partnerId} = ${partners.id}), 0)`,
};

export const GetAllPartners = async () => {
  const rows = await db
    .select(partnerSelection)
    .from(partners)
    .orderBy(desc(partners.createdAt));
  // percentage + receivedTotal come back as numeric strings — parse to Number.
  const payload = rows.map((r) => ({
    ...r,
    percentage: Number(r.percentage),
    receivedTotal: Number(r.receivedTotal),
  }));
  return NextResponse.json({ message: "ok", payload: payload as unknown as PartnerDto[] });
};

export const CreatePartner = async (data: CreatePartnerDto) => {
  const [row] = await db
    .insert(partners)
    .values({
      name: data.name,
      percentage: String(Number(data.percentage ?? 0)),
      phone: data.phone ?? null,
      joinDate: data.joinDate || null,
      notes: data.notes ?? null,
    })
    .returning();
  return NextResponse.json({ message: "تمت الإضافة.", payload: row }, { status: 201 });
};

export const UpdatePartner = async (id: number, data: UpdatePartnerDto) => {
  const existing = await db.query.partners.findFirst({
    where: eq(partners.id, id),
  });
  if (!existing) {
    return NextResponse.json({ message: "غير موجود." }, { status: 404 });
  }

  const patch: Record<string, unknown> = { ...data, updatedAt: new Date() };
  if (data.percentage != null) patch.percentage = String(Number(data.percentage));
  if (patch.joinDate === "") patch.joinDate = null;

  const [row] = await db
    .update(partners)
    .set(patch)
    .where(eq(partners.id, id))
    .returning();
  return NextResponse.json({ message: "تم الحفظ.", payload: row });
};

export const DeletePartner = async (id: number) => {
  const existing = await db.query.partners.findFirst({
    where: eq(partners.id, id),
  });
  if (!existing) {
    return NextResponse.json({ message: "غير موجود.", success: false }, { status: 404 });
  }
  await db.delete(partners).where(eq(partners.id, id));
  return NextResponse.json({ message: "تم الحذف.", success: true });
};
