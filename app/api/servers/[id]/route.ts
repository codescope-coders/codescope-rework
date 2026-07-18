import { NextResponse } from "next/server";
import { DeleteServer, UpdateServer, UpdateServerDto } from "@/services/servers";
import { requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_SERVERS);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const serverId = parseInt(id, 10);
    if (isNaN(serverId)) {
      return NextResponse.json({ message: "معرّف غير صالح." }, { status: 400 });
    }
    const body: UpdateServerDto = await request.json();
    return await UpdateServer(serverId, body);
  } catch {
    return NextResponse.json({ message: "تعذّر الحفظ." }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_SERVERS);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const serverId = parseInt(id, 10);
    if (isNaN(serverId)) {
      return NextResponse.json(
        { message: "معرّف غير صالح.", success: false },
        { status: 400 },
      );
    }
    return await DeleteServer(serverId);
  } catch {
    return NextResponse.json(
      { message: "تعذّر الحذف.", success: false },
      { status: 500 },
    );
  }
}
