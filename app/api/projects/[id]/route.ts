import { NextResponse } from "next/server";
import { DeleteProject, UpdateProject, UpdateProjectDto } from "@/services/projects";
import { requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_PROJECTS);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const projectId = parseInt(id, 10);
    if (isNaN(projectId)) {
      return NextResponse.json({ message: "معرّف غير صالح." }, { status: 400 });
    }
    const body: UpdateProjectDto = await request.json();
    return await UpdateProject(projectId, body);
  } catch {
    return NextResponse.json({ message: "تعذّر الحفظ." }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_PROJECTS);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const projectId = parseInt(id, 10);
    if (isNaN(projectId)) {
      return NextResponse.json(
        { message: "معرّف غير صالح.", success: false },
        { status: 400 },
      );
    }
    return await DeleteProject(projectId);
  } catch {
    return NextResponse.json(
      { message: "تعذّر الحذف.", success: false },
      { status: 500 },
    );
  }
}
