import { db } from "@/lib/db";
import {
  spendRequests,
  ledgerEntries,
  payrollEmployees,
  admins,
} from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export type Currency = "IQD" | "USD";
export type RequestStatus = "PENDING" | "PAID" | "REJECTED";
export type RequestDecision = "PAID" | "REJECTED";

export interface RequestDto {
  id: number;
  date: string;
  requestedById: number | null;
  requestedByName: string | null;
  reason: string | null;
  amount: string;
  currency: Currency;
  status: RequestStatus;
  decidedById: number | null;
  decidedDate: string | null;
  payrollId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRequestDto {
  date: string;
  reason?: string | null;
  amount: number | string;
  currency?: Currency;
}
export type UpdateRequestDto = Partial<CreateRequestDto> & {
  decision?: RequestDecision;
};

interface DeleteScope {
  actorId: number;
  canApprove: boolean;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

const requestSelection = {
  id: spendRequests.id,
  date: spendRequests.date,
  requestedById: spendRequests.requestedById,
  reason: spendRequests.reason,
  amount: spendRequests.amount,
  currency: spendRequests.currency,
  status: spendRequests.status,
  decidedById: spendRequests.decidedById,
  decidedDate: spendRequests.decidedDate,
  payrollId: spendRequests.payrollId,
  createdAt: spendRequests.createdAt,
  updatedAt: spendRequests.updatedAt,
  requestedByName: admins.name,
};

export const GetRequests = async (
  opts: { scopeUserId?: number | null } = {},
) => {
  const conditions = [];
  if (opts.scopeUserId != null)
    conditions.push(eq(spendRequests.requestedById, opts.scopeUserId));
  const rows = await db
    .select(requestSelection)
    .from(spendRequests)
    .leftJoin(admins, eq(spendRequests.requestedById, admins.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(spendRequests.createdAt));
  return NextResponse.json({
    message: "ok",
    payload: rows as unknown as RequestDto[],
  });
};

/** File a new spend request. The requester is always the actor; status PENDING. */
export const CreateRequest = async (data: CreateRequestDto, actorId: number) => {
  const [row] = await db
    .insert(spendRequests)
    .values({
      date: data.date,
      requestedById: actorId,
      reason: data.reason ?? null,
      amount: String(data.amount),
      currency: data.currency ?? "IQD",
      status: "PENDING",
    })
    .returning();
  return NextResponse.json(
    { message: "تم إرسال طلب الصرف.", payload: row },
    { status: 201 },
  );
};

/**
 * Approve (PAID) or reject a spend request. On approval, post a matching
 * EXPENSE to the ledger and — for a payroll-linked request — stamp the
 * employee's lastPaid. Rejection just records the decision.
 */
export const DecideRequest = async (
  id: number,
  decision: RequestDecision,
  actorId: number,
) => {
  const existing = await db.query.spendRequests.findFirst({
    where: eq(spendRequests.id, id),
  });
  if (!existing) {
    return NextResponse.json({ message: "غير موجود." }, { status: 404 });
  }
  if (existing.status !== "PENDING") {
    return NextResponse.json(
      { message: "تمت معالجة هذا الطلب مسبقاً." },
      { status: 400 },
    );
  }
  const today = todayISO();

  if (decision === "PAID") {
    await db.insert(ledgerEntries).values({
      date: today,
      type: "EXPENSE",
      category: existing.payrollId ? "رواتب" : "طلب صرف",
      amount: existing.amount,
      currency: existing.currency,
      notes: existing.reason,
      requestId: existing.id,
    });
    if (existing.payrollId != null) {
      await db
        .update(payrollEmployees)
        .set({ lastPaid: today, updatedAt: new Date() })
        .where(eq(payrollEmployees.id, existing.payrollId));
    }
  }

  const [row] = await db
    .update(spendRequests)
    .set({
      status: decision,
      decidedById: actorId,
      decidedDate: today,
      updatedAt: new Date(),
    })
    .where(eq(spendRequests.id, id))
    .returning();

  return NextResponse.json({
    message:
      decision === "PAID" ? "تم اعتماد الصرف وتسجيله بالحركات." : "تم رفض الطلب.",
    payload: row,
  });
};

export const DeleteRequest = async (id: number, scope: DeleteScope) => {
  const existing = await db.query.spendRequests.findFirst({
    where: eq(spendRequests.id, id),
  });
  if (!existing) {
    return NextResponse.json(
      { message: "غير موجود.", success: false },
      { status: 404 },
    );
  }
  const isOwner = existing.requestedById === scope.actorId;
  const allowed =
    scope.canApprove || (isOwner && existing.status === "PENDING");
  if (!allowed) {
    return NextResponse.json(
      { message: "غير مصرّح.", success: false },
      { status: 403 },
    );
  }
  await db.delete(spendRequests).where(eq(spendRequests.id, id));
  return NextResponse.json({ message: "تم الحذف.", success: true });
};
