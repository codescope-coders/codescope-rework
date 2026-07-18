import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export type PackageTier = "CHARTER" | "STANDARD" | "ADVANCED";
export type BillingCycle = "MONTHLY" | "YEARLY";
export type SubscriptionStatus = "ACTIVE" | "PENDING_ACTIVATION" | "STOPPED";
export type Currency = "IQD" | "USD";

export interface SubscriptionDto {
  id: number;
  company: string;
  systemName: string | null;
  phone: string | null;
  address: string | null;
  package: PackageTier;
  amount: string | null;
  currency: Currency;
  cycle: BillingCycle;
  startDate: string | null;
  nextDue: string | null;
  status: SubscriptionStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionDto {
  company: string;
  systemName?: string | null;
  phone?: string | null;
  address?: string | null;
  package?: PackageTier;
  amount?: number | string | null;
  currency?: Currency;
  cycle?: BillingCycle;
  startDate?: string | null;
  nextDue?: string | null;
  status?: SubscriptionStatus;
  notes?: string | null;
}
export type UpdateSubscriptionDto = Partial<CreateSubscriptionDto>;

/** amount is nullable numeric — empty/absent becomes null, otherwise a string. */
const toAmount = (v: number | string | null | undefined): string | null =>
  v === "" || v === null || v === undefined ? null : String(v);

export const GetSubscriptions = async () => {
  const rows = await db
    .select()
    .from(subscriptions)
    .orderBy(subscriptions.nextDue);
  return NextResponse.json({
    message: "ok",
    payload: rows as unknown as SubscriptionDto[],
  });
};

export const CreateSubscription = async (data: CreateSubscriptionDto) => {
  const [row] = await db
    .insert(subscriptions)
    .values({
      company: data.company,
      systemName: data.systemName ?? null,
      phone: data.phone ?? null,
      address: data.address ?? null,
      package: data.package ?? "STANDARD",
      amount: toAmount(data.amount),
      currency: data.currency ?? "IQD",
      cycle: data.cycle ?? "MONTHLY",
      startDate: data.startDate || null,
      nextDue: data.nextDue || null,
      status: data.status ?? "ACTIVE",
      notes: data.notes ?? null,
    })
    .returning();
  return NextResponse.json({ message: "تمت الإضافة.", payload: row }, { status: 201 });
};

export const UpdateSubscription = async (
  id: number,
  data: UpdateSubscriptionDto,
) => {
  const existing = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.id, id),
  });
  if (!existing) {
    return NextResponse.json({ message: "غير موجود." }, { status: 404 });
  }

  const patch: Record<string, unknown> = { ...data, updatedAt: new Date() };
  if ("amount" in patch) patch.amount = toAmount(data.amount);
  if (patch.startDate === "") patch.startDate = null;
  if (patch.nextDue === "") patch.nextDue = null;

  const [row] = await db
    .update(subscriptions)
    .set(patch)
    .where(eq(subscriptions.id, id))
    .returning();
  return NextResponse.json({ message: "تم الحفظ.", payload: row });
};

export const DeleteSubscription = async (id: number) => {
  const existing = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.id, id),
  });
  if (!existing) {
    return NextResponse.json(
      { message: "غير موجود.", success: false },
      { status: 404 },
    );
  }
  await db.delete(subscriptions).where(eq(subscriptions.id, id));
  return NextResponse.json({ message: "تم الحذف.", success: true });
};
