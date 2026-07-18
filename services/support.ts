import { db } from "@/lib/db";
import { tickets, admins } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH";

export interface TicketDto {
  id: number;
  date: string;
  company: string;
  phone: string | null;
  subject: string;
  description: string | null;
  priority: TicketPriority;
  status: TicketStatus;
  assignedToId: number | null;
  assignedToName: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketDto {
  date?: string;
  company: string;
  phone?: string | null;
  subject: string;
  description?: string | null;
  priority?: TicketPriority;
  status?: TicketStatus;
  assignedToId?: number | null;
  notes?: string | null;
}
export type UpdateTicketDto = Partial<CreateTicketDto>;

interface Scope {
  actorId: number;
  canAll: boolean;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

const ticketSelection = {
  id: tickets.id,
  date: tickets.date,
  company: tickets.company,
  phone: tickets.phone,
  subject: tickets.subject,
  description: tickets.description,
  priority: tickets.priority,
  status: tickets.status,
  assignedToId: tickets.assignedToId,
  notes: tickets.notes,
  createdAt: tickets.createdAt,
  updatedAt: tickets.updatedAt,
  assignedToName: admins.name,
};

export const GetAllTickets = async (
  opts: { scopeUserId?: number | null } = {},
) => {
  const conditions = [];
  if (opts.scopeUserId != null)
    conditions.push(eq(tickets.assignedToId, opts.scopeUserId));
  const rows = await db
    .select(ticketSelection)
    .from(tickets)
    .leftJoin(admins, eq(tickets.assignedToId, admins.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(tickets.date), desc(tickets.updatedAt));
  return NextResponse.json({
    message: "ok",
    payload: rows as unknown as TicketDto[],
  });
};

export const CreateTicket = async (data: CreateTicketDto, scope: Scope) => {
  const assignedToId = scope.canAll ? (data.assignedToId ?? null) : scope.actorId;
  const [row] = await db
    .insert(tickets)
    .values({
      date: data.date || todayISO(),
      company: data.company,
      phone: data.phone ?? null,
      subject: data.subject,
      description: data.description ?? null,
      priority: data.priority ?? "MEDIUM",
      status: data.status ?? "OPEN",
      assignedToId,
      notes: data.notes ?? null,
    })
    .returning();
  return NextResponse.json(
    { message: "تمت الإضافة.", payload: row },
    { status: 201 },
  );
};

export const UpdateTicket = async (
  id: number,
  data: UpdateTicketDto,
  scope: Scope,
) => {
  const existing = await db.query.tickets.findFirst({
    where: eq(tickets.id, id),
  });
  if (!existing) {
    return NextResponse.json({ message: "غير موجود." }, { status: 404 });
  }
  if (!scope.canAll && existing.assignedToId !== scope.actorId) {
    return NextResponse.json({ message: "غير مصرّح." }, { status: 403 });
  }

  const patch = { ...data };
  if (!scope.canAll) delete patch.assignedToId; // non-admin can't reassign
  if (patch.date === "") delete patch.date;

  const [row] = await db
    .update(tickets)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(tickets.id, id))
    .returning();

  return NextResponse.json({ message: "تم الحفظ.", payload: row });
};

export const DeleteTicket = async (id: number, scope: Scope) => {
  const existing = await db.query.tickets.findFirst({
    where: eq(tickets.id, id),
  });
  if (!existing) {
    return NextResponse.json(
      { message: "غير موجود.", success: false },
      { status: 404 },
    );
  }
  if (!scope.canAll && existing.assignedToId !== scope.actorId) {
    return NextResponse.json(
      { message: "غير مصرّح.", success: false },
      { status: 403 },
    );
  }
  await db.delete(tickets).where(eq(tickets.id, id));
  return NextResponse.json({ message: "تم الحذف.", success: true });
};
