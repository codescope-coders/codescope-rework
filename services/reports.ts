import { db } from "@/lib/db";
import { reports, admins } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export interface ReportDto {
  id: number;
  date: string;
  employeeId: number | null;
  employeeName: string | null;
  done: string | null;
  ongoing: string | null;
  blockers: string | null;
  plan: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportDto {
  date?: string;
  employeeId?: number | null;
  done?: string | null;
  ongoing?: string | null;
  blockers?: string | null;
  plan?: string | null;
}
export type UpdateReportDto = Partial<CreateReportDto>;

interface Scope {
  actorId: number;
  canAll: boolean;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

const reportSelection = {
  id: reports.id,
  date: reports.date,
  employeeId: reports.employeeId,
  done: reports.done,
  ongoing: reports.ongoing,
  blockers: reports.blockers,
  plan: reports.plan,
  createdAt: reports.createdAt,
  updatedAt: reports.updatedAt,
  employeeName: admins.name,
};

export const GetAllReports = async (
  opts: { scopeUserId?: number | null } = {},
) => {
  const conditions = [];
  if (opts.scopeUserId != null)
    conditions.push(eq(reports.employeeId, opts.scopeUserId));
  const rows = await db
    .select(reportSelection)
    .from(reports)
    .leftJoin(admins, eq(reports.employeeId, admins.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(reports.date));
  return NextResponse.json({
    message: "ok",
    payload: rows as unknown as ReportDto[],
  });
};

export const CreateReport = async (data: CreateReportDto, scope: Scope) => {
  const employeeId = scope.canAll ? (data.employeeId ?? null) : scope.actorId;
  const [row] = await db
    .insert(reports)
    .values({
      date: data.date || todayISO(),
      employeeId,
      done: data.done ?? null,
      ongoing: data.ongoing ?? null,
      blockers: data.blockers ?? null,
      plan: data.plan ?? null,
    })
    .returning();

  return NextResponse.json(
    { message: "تمت الإضافة.", payload: row },
    { status: 201 },
  );
};

export const UpdateReport = async (
  id: number,
  data: UpdateReportDto,
  scope: Scope,
) => {
  const existing = await db.query.reports.findFirst({
    where: eq(reports.id, id),
  });
  if (!existing) {
    return NextResponse.json({ message: "غير موجود." }, { status: 404 });
  }
  if (!scope.canAll && existing.employeeId !== scope.actorId) {
    return NextResponse.json({ message: "غير مصرّح." }, { status: 403 });
  }

  const patch = { ...data };
  if (!scope.canAll) delete patch.employeeId; // non-admin can't reassign

  const [row] = await db
    .update(reports)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(reports.id, id))
    .returning();

  return NextResponse.json({ message: "تم الحفظ.", payload: row });
};

export const DeleteReport = async (id: number, scope: Scope) => {
  const existing = await db.query.reports.findFirst({
    where: eq(reports.id, id),
  });
  if (!existing) {
    return NextResponse.json(
      { message: "غير موجود.", success: false },
      { status: 404 },
    );
  }
  if (!scope.canAll && existing.employeeId !== scope.actorId) {
    return NextResponse.json(
      { message: "غير مصرّح.", success: false },
      { status: 403 },
    );
  }
  await db.delete(reports).where(eq(reports.id, id));
  return NextResponse.json({ message: "تم الحذف.", success: true });
};
