import { NextResponse } from "next/server";
import { CreateServer, CreateServerDto, GetAllServers } from "@/services/servers";
import { requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export const GET = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.VIEW_SERVERS);
  if (auth instanceof NextResponse) return auth;
  try {
    return await GetAllServers();
  } catch (error: unknown) {
    return NextResponse.json(
      { message: (error as Error)?.message || "Something went wrong" },
      { status: 500 },
    );
  }
};

export const POST = async (request: Request) => {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_SERVERS);
  if (auth instanceof NextResponse) return auth;
  try {
    const body: CreateServerDto = await request.json();
    if (!body.name?.trim()) {
      return NextResponse.json(
        { message: "اسم السيرفر مطلوب.", fieldErrors: { name: "required" } },
        { status: 400 },
      );
    }
    return await CreateServer(body);
  } catch {
    return NextResponse.json(
      { message: "تعذّرت إضافة السيرفر." },
      { status: 500 },
    );
  }
};
