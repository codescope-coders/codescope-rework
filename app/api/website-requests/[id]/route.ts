import { NextResponse } from "next/server";
import {
  UpdateWebsiteRequest,
  type UpdateWebsiteRequestDto,
} from "@/services/website-requests";
import { requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

/** PUT (not PATCH) per the dashboard convention; `params` is a Promise. */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(
    request,
    PERMISSIONS.MANAGE_WEBSITE_REQUESTS,
  );
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const requestId = parseInt(id, 10);
    if (isNaN(requestId)) {
      return NextResponse.json({ message: "معرّف غير صالح." }, { status: 400 });
    }
    const body: UpdateWebsiteRequestDto = await request.json();
    return await UpdateWebsiteRequest(requestId, body);
  } catch {
    return NextResponse.json({ message: "تعذّر الحفظ." }, { status: 400 });
  }
}
