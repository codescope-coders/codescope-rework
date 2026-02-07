import { authGuard } from "@/lib/authGuard";
import { ToggleJobStatus } from "@/services/jobs";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await authGuard(request);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const jobId = parseInt(id);

    if (isNaN(jobId)) {
      return NextResponse.json(
        { message: "Invalid job ID.", payload: null },
        { status: 400 },
      );
    }

    return await ToggleJobStatus(jobId);
  } catch (error) {
    return NextResponse.json(
      { message: "Error toggling job status.", payload: null },
      { status: 500 },
    );
  }
}
