import { db } from "@/lib/db";
import { leaves, admins } from "@/lib/db/schema";
import { alias } from "drizzle-orm/pg-core";
import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export type LeaveType = "REGULAR" | "SICK" | "EMERGENCY" | "UNPAID";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";
export type LeaveDecision = "APPROVED" | "REJECTED";

export interface LeaveDto {
  id: number;
  employeeId: number | null;
  employeeName: string | null;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: LeaveStatus;
  decidedById: number | null;
  decidedByName: string | null;
  decidedDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveDto {
  employeeId?: number | null;
  type?: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string | null;
}
export type UpdateLeaveDto = Partial<CreateLeaveDto> & {
  decision?: LeaveDecision;
};

interface Scope {
  actorId: number;
  canAll: boolean;
}
interface DeleteScope {
  actorId: number;
  canApprove: boolean;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

// Second admins join, aliased, to resolve the decider's name.
const deciders = alias(admins, "deciders");

const leaveSelection = {
  id: leaves.id,
  employeeId: leaves.employeeId,
  type: leaves.type,
  startDate: leaves.startDate,
  endDate: leaves.endDate,
  reason: leaves.reason,
  status: leaves.status,
  decidedById: leaves.decidedById,
  decidedDate: leaves.decidedDate,
  createdAt: leaves.createdAt,
  updatedAt: leaves.updatedAt,
  employeeName: admins.name,
  decidedByName: deciders.name,
};

export const GetAllLeaves = async (
  opts: { scopeUserId?: number | null } = {},
) => {
  const conditions = [];
  if (opts.scopeUserId != null)
    conditions.push(eq(leaves.employeeId, opts.scopeUserId));
  const rows = await db
    .select(leaveSelection)
    .from(leaves)
    .leftJoin(admins, eq(leaves.employeeId, admins.id))
    .leftJoin(deciders, eq(leaves.decidedById, deciders.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(leaves.createdAt));
  return NextResponse.json({
    message: "ok",
    payload: rows as unknown as LeaveDto[],
  });
};

export const CreateLeave = async (data: CreateLeaveDto, scope: Scope) => {
  const employeeId = scope.canAll ? (data.employeeId ?? null) : scope.actorId;
  const [row] = await db
    .insert(leaves)
    .values({
      employeeId,
      type: data.type ?? "REGULAR",
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason ?? null,
      status: "PENDING",
    })
    .returning();
  return NextResponse.json(
    { message: "تم إرسال طلب الإجازة.", payload: row },
    { status: 201 },
  );
};

/** Owner edit of a leave request (no decision). */
export const UpdateLeave = async (
  id: number,
  data: UpdateLeaveDto,
  scope: Scope,
) => {
  const existing = await db.query.leaves.findFirst({
    where: eq(leaves.id, id),
  });
  if (!existing) {
    return NextResponse.json({ message: "غير موجود." }, { status: 404 });
  }
  if (!scope.canAll && existing.employeeId !== scope.actorId) {
    return NextResponse.json({ message: "غير مصرّح." }, { status: 403 });
  }

  const patch = { ...data };
  delete patch.decision; // decisions go through the approval path
  if (!scope.canAll) delete patch.employeeId; // non-admin can't reassign

  const [row] = await db
    .update(leaves)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(leaves.id, id))
    .returning();

  return NextResponse.json({ message: "تم الحفظ.", payload: row });
};

/** Approve / reject a leave. Stamps the decider + decision date. */
export const DecideLeave = async (
  id: number,
  decision: LeaveDecision,
  actorId: number,
) => {
  const existing = await db.query.leaves.findFirst({
    where: eq(leaves.id, id),
  });
  if (!existing) {
    return NextResponse.json({ message: "غير موجود." }, { status: 404 });
  }
  const [row] = await db
    .update(leaves)
    .set({
      status: decision,
      decidedById: actorId,
      decidedDate: todayISO(),
      updatedAt: new Date(),
    })
    .where(eq(leaves.id, id))
    .returning();
  return NextResponse.json({ message: "تم الحفظ.", payload: row });
};

export const DeleteLeave = async (id: number, scope: DeleteScope) => {
  const existing = await db.query.leaves.findFirst({
    where: eq(leaves.id, id),
  });
  if (!existing) {
    return NextResponse.json(
      { message: "غير موجود.", success: false },
      { status: 404 },
    );
  }
  const isOwner = existing.employeeId === scope.actorId;
  const allowed = scope.canApprove || (isOwner && existing.status === "PENDING");
  if (!allowed) {
    return NextResponse.json(
      { message: "غير مصرّح.", success: false },
      { status: 403 },
    );
  }
  await db.delete(leaves).where(eq(leaves.id, id));
  return NextResponse.json({ message: "تم الحذف.", success: true });
};
