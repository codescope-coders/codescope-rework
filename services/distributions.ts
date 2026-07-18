import { db } from "@/lib/db";
import {
  distributions,
  distributionShares,
  ledgerEntries,
  partners,
} from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export type Currency = "IQD" | "USD";

export interface ShareDto {
  id: number;
  distributionId: number;
  partnerId: number | null;
  name: string;
  percentage: string;
  amount: string;
}

export interface DistributionDto {
  id: number;
  date: string;
  amount: string;
  currency: Currency;
  note: string | null;
  createdAt: string;
  shares: ShareDto[];
}

export interface CreateDistributionDto {
  date: string;
  amount: number;
  currency?: Currency;
  note?: string | null;
}

/** The Arabic ledger category every profit-distribution expense is filed under. */
const PROFIT_DISTRIBUTION_CATEGORY = "توزيع أرباح";

export const GetAllDistributions = async () => {
  const rows = await db.query.distributions.findMany({
    with: { shares: true },
    orderBy: desc(distributions.date),
  });
  return NextResponse.json({
    message: "ok",
    payload: rows as unknown as DistributionDto[],
  });
};

export const CreateDistribution = async (data: CreateDistributionDto) => {
  const currency: Currency = data.currency ?? "IQD";
  const amount = Number(data.amount);

  const allPartners = await db.select().from(partners);

  const [dist] = await db
    .insert(distributions)
    .values({
      date: data.date,
      amount: String(amount),
      currency,
      note: data.note ?? null,
    })
    .returning();

  // One share (and one matching ledger EXPENSE) per partner.
  const split = allPartners.map((p) => ({
    partnerId: p.id,
    name: p.name,
    percentage: Number(p.percentage),
    share: Math.round((amount * Number(p.percentage)) / 100),
  }));

  if (split.length) {
    await db.insert(distributionShares).values(
      split.map((s) => ({
        distributionId: dist.id,
        partnerId: s.partnerId,
        name: s.name,
        percentage: String(s.percentage),
        amount: String(s.share),
      })),
    );
    await db.insert(ledgerEntries).values(
      split.map((s) => ({
        date: data.date,
        type: "EXPENSE" as const,
        category: PROFIT_DISTRIBUTION_CATEGORY,
        amount: String(s.share),
        currency,
        notes: `${PROFIT_DISTRIBUTION_CATEGORY} — ${s.name} (${s.percentage}%)`,
        distributionId: dist.id,
      })),
    );
  }

  return NextResponse.json(
    { message: "تم تسجيل التوزيع.", payload: dist },
    { status: 201 },
  );
};

export const DeleteDistribution = async (id: number) => {
  const existing = await db.query.distributions.findFirst({
    where: eq(distributions.id, id),
  });
  if (!existing) {
    return NextResponse.json({ message: "غير موجود.", success: false }, { status: 404 });
  }
  // Remove the ledger expenses first, then the distribution (shares cascade).
  await db.delete(ledgerEntries).where(eq(ledgerEntries.distributionId, id));
  await db.delete(distributions).where(eq(distributions.id, id));
  return NextResponse.json({ message: "تم الحذف.", success: true });
};
