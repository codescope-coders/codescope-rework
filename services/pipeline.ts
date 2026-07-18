import { db } from "@/lib/db";
import { pipelineLeads, subscriptions, admins } from "@/lib/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export type PipelineStage =
  | "INITIAL_CONTACT"
  | "PROPOSAL"
  | "NEGOTIATION"
  | "SIGNED"
  | "REJECTED";
export type PackageTier = "CHARTER" | "STANDARD" | "ADVANCED";
export type BillingCycle = "MONTHLY" | "YEARLY";

export interface LeadDto {
  id: number;
  company: string;
  contact: string | null;
  phone: string | null;
  address: string | null;
  stage: PipelineStage;
  employeeId: number | null;
  employeeName: string | null;
  package: PackageTier;
  cycle: BillingCycle;
  nextAction: string | null;
  nextDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadDto {
  company: string;
  contact?: string | null;
  phone?: string | null;
  address?: string | null;
  stage?: PipelineStage;
  employeeId?: number | null;
  package?: PackageTier;
  cycle?: BillingCycle;
  nextAction?: string | null;
  nextDate?: string | null;
  notes?: string | null;
}
export type UpdateLeadDto = Partial<CreateLeadDto>;

interface Scope {
  actorId: number;
  canAll: boolean;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

const leadSelection = {
  id: pipelineLeads.id,
  company: pipelineLeads.company,
  contact: pipelineLeads.contact,
  phone: pipelineLeads.phone,
  address: pipelineLeads.address,
  stage: pipelineLeads.stage,
  employeeId: pipelineLeads.employeeId,
  package: pipelineLeads.package,
  cycle: pipelineLeads.cycle,
  nextAction: pipelineLeads.nextAction,
  nextDate: pipelineLeads.nextDate,
  notes: pipelineLeads.notes,
  createdAt: pipelineLeads.createdAt,
  updatedAt: pipelineLeads.updatedAt,
  employeeName: admins.name,
};

/** On SIGNED, spin up a PENDING_ACTIVATION subscription for the company if the
 * company doesn't already have one (case-insensitive). Mirrors the source app. */
async function ensurePendingSubscription(lead: {
  company: string;
  phone: string | null;
  address: string | null;
  package: PackageTier;
  cycle: BillingCycle;
}) {
  const existing = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(sql`lower(${subscriptions.company}) = lower(${lead.company})`)
    .limit(1);
  if (existing.length) return;
  const today = todayISO();
  await db.insert(subscriptions).values({
    company: lead.company,
    phone: lead.phone,
    address: lead.address,
    package: lead.package,
    cycle: lead.cycle,
    currency: "IQD",
    amount: null,
    startDate: today,
    nextDue: today,
    status: "PENDING_ACTIVATION",
    notes:
      "أُضيفت تلقائياً بعد توقيع العقد من متابعة المبيعات — تحتاج المحاسب/الإدارة لإضافة القيمة وتفعيلها.",
  });
}

export const GetAllLeads = async (opts: { scopeUserId?: number | null } = {}) => {
  const conditions = [];
  if (opts.scopeUserId != null)
    conditions.push(eq(pipelineLeads.employeeId, opts.scopeUserId));
  const rows = await db
    .select(leadSelection)
    .from(pipelineLeads)
    .leftJoin(admins, eq(pipelineLeads.employeeId, admins.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(pipelineLeads.updatedAt));
  return NextResponse.json({ message: "ok", payload: rows as unknown as LeadDto[] });
};

export const CreateLead = async (data: CreateLeadDto, scope: Scope) => {
  const employeeId = scope.canAll ? (data.employeeId ?? null) : scope.actorId;
  const [row] = await db
    .insert(pipelineLeads)
    .values({
      company: data.company,
      contact: data.contact ?? null,
      phone: data.phone ?? null,
      address: data.address ?? null,
      stage: data.stage ?? "INITIAL_CONTACT",
      employeeId,
      package: data.package ?? "STANDARD",
      cycle: data.cycle ?? "MONTHLY",
      nextAction: data.nextAction ?? null,
      nextDate: data.nextDate || null,
      notes: data.notes ?? null,
    })
    .returning();

  if (row.stage === "SIGNED") await ensurePendingSubscription(row);

  return NextResponse.json({ message: "تمت الإضافة.", payload: row }, { status: 201 });
};

export const UpdateLead = async (
  id: number,
  data: UpdateLeadDto,
  scope: Scope,
) => {
  const existing = await db.query.pipelineLeads.findFirst({
    where: eq(pipelineLeads.id, id),
  });
  if (!existing) {
    return NextResponse.json({ message: "غير موجود." }, { status: 404 });
  }
  if (!scope.canAll && existing.employeeId !== scope.actorId) {
    return NextResponse.json({ message: "غير مصرّح." }, { status: 403 });
  }

  const patch = { ...data };
  if (!scope.canAll) delete patch.employeeId; // non-admin can't reassign
  if (patch.nextDate === "") patch.nextDate = null;

  const wasSigned = existing.stage === "SIGNED";
  const [row] = await db
    .update(pipelineLeads)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(pipelineLeads.id, id))
    .returning();

  if (row.stage === "SIGNED" && !wasSigned) await ensurePendingSubscription(row);

  return NextResponse.json({ message: "تم الحفظ.", payload: row });
};

export const DeleteLead = async (id: number, scope: Scope) => {
  const existing = await db.query.pipelineLeads.findFirst({
    where: eq(pipelineLeads.id, id),
  });
  if (!existing) {
    return NextResponse.json({ message: "غير موجود.", success: false }, { status: 404 });
  }
  if (!scope.canAll && existing.employeeId !== scope.actorId) {
    return NextResponse.json({ message: "غير مصرّح.", success: false }, { status: 403 });
  }
  await db.delete(pipelineLeads).where(eq(pipelineLeads.id, id));
  return NextResponse.json({ message: "تم الحذف.", success: true });
};
