import { db } from "@/lib/db";
import { admins } from "@/lib/db/schema";
import { and, desc, eq, ne, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { Role } from "@/lib/rbac/permissions";

export interface UserDto {
  id: number;
  email: string;
  name: string | null;
  role: Role;
  permissions: string[];
  active: boolean;
  createdAt: string;
}

export interface CreateUserDto {
  email: string;
  name: string;
  role: Role;
  permissions?: string[];
  active?: boolean;
}
export type UpdateUserDto = Partial<CreateUserDto>;

const selection = {
  id: admins.id,
  email: admins.email,
  name: admins.name,
  role: admins.role,
  permissions: admins.permissions,
  active: admins.active,
  createdAt: admins.createdAt,
};

export const GetAllUsers = async () => {
  const rows = await db.select(selection).from(admins).orderBy(desc(admins.createdAt));
  return NextResponse.json({ message: "ok", payload: rows as unknown as UserDto[] });
};

export const CreateUser = async (data: CreateUserDto) => {
  const email = data.email.trim().toLowerCase();
  const existing = await db.query.admins.findFirst({
    where: eq(admins.email, email),
  });
  if (existing) {
    return NextResponse.json(
      { message: "هذا البريد مستخدم مسبقاً.", fieldErrors: { email: "exists" } },
      { status: 409 },
    );
  }
  const [row] = await db
    .insert(admins)
    .values({
      email,
      name: data.name,
      role: data.role,
      permissions: data.permissions ?? [],
      active: data.active ?? true,
    })
    .returning(selection);
  return NextResponse.json(
    { message: "تمت إضافة المستخدم.", payload: row as unknown as UserDto },
    { status: 201 },
  );
};

export const UpdateUser = async (id: number, data: UpdateUserDto) => {
  const existing = await db.query.admins.findFirst({ where: eq(admins.id, id) });
  if (!existing) {
    return NextResponse.json({ message: "غير موجود." }, { status: 404 });
  }
  const patch: Record<string, unknown> = { ...data, updatedAt: new Date() };
  if (data.email) {
    const email = data.email.trim().toLowerCase();
    const clash = await db.query.admins.findFirst({
      where: and(eq(admins.email, email), ne(admins.id, id)),
    });
    if (clash) {
      return NextResponse.json(
        { message: "هذا البريد مستخدم مسبقاً.", fieldErrors: { email: "exists" } },
        { status: 409 },
      );
    }
    patch.email = email;
  }
  const [row] = await db
    .update(admins)
    .set(patch)
    .where(eq(admins.id, id))
    .returning(selection);
  return NextResponse.json({ message: "تم الحفظ.", payload: row as unknown as UserDto });
};

export const DeleteUser = async (id: number, actorId: number) => {
  const target = await db.query.admins.findFirst({ where: eq(admins.id, id) });
  if (!target) {
    return NextResponse.json(
      { message: "غير موجود.", success: false },
      { status: 404 },
    );
  }
  if (target.role === "ADMIN") {
    const [{ count }] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(admins)
      .where(eq(admins.role, "ADMIN"));
    if (Number(count) <= 1) {
      return NextResponse.json(
        { message: "لا يمكن حذف آخر حساب إدارة.", success: false },
        { status: 400 },
      );
    }
  }
  await db.delete(admins).where(eq(admins.id, id));
  return NextResponse.json({ message: "تم الحذف.", success: true });
};
