import { db } from "@/lib/db";
import { servers } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export type ServerStatus = "ACTIVE" | "MAINTENANCE" | "DOWN";

export interface ServerDto {
  id: number;
  name: string;
  provider: string | null;
  ip: string | null;
  specs: string | null;
  sysAdmin: string | null;
  status: ServerStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServerDto {
  name: string;
  provider?: string | null;
  ip?: string | null;
  specs?: string | null;
  sysAdmin?: string | null;
  status?: ServerStatus;
  notes?: string | null;
}
export type UpdateServerDto = Partial<CreateServerDto>;

const serverSelection = {
  id: servers.id,
  name: servers.name,
  provider: servers.provider,
  ip: servers.ip,
  specs: servers.specs,
  sysAdmin: servers.sysAdmin,
  status: servers.status,
  notes: servers.notes,
  createdAt: servers.createdAt,
  updatedAt: servers.updatedAt,
};

export const GetAllServers = async () => {
  const rows = await db
    .select(serverSelection)
    .from(servers)
    .orderBy(desc(servers.updatedAt));
  return NextResponse.json({ message: "ok", payload: rows as unknown as ServerDto[] });
};

export const CreateServer = async (data: CreateServerDto) => {
  const [row] = await db
    .insert(servers)
    .values({
      name: data.name,
      provider: data.provider ?? null,
      ip: data.ip ?? null,
      specs: data.specs ?? null,
      sysAdmin: data.sysAdmin ?? null,
      status: data.status ?? "ACTIVE",
      notes: data.notes ?? null,
    })
    .returning();

  return NextResponse.json({ message: "تمت الإضافة.", payload: row }, { status: 201 });
};

export const UpdateServer = async (id: number, data: UpdateServerDto) => {
  const existing = await db.query.servers.findFirst({
    where: eq(servers.id, id),
  });
  if (!existing) {
    return NextResponse.json({ message: "غير موجود." }, { status: 404 });
  }

  const [row] = await db
    .update(servers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(servers.id, id))
    .returning();

  return NextResponse.json({ message: "تم الحفظ.", payload: row });
};

export const DeleteServer = async (id: number) => {
  const existing = await db.query.servers.findFirst({
    where: eq(servers.id, id),
  });
  if (!existing) {
    return NextResponse.json({ message: "غير موجود.", success: false }, { status: 404 });
  }
  await db.delete(servers).where(eq(servers.id, id));
  return NextResponse.json({ message: "تم الحذف.", success: true });
};
