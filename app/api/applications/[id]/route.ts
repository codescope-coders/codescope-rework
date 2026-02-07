// app/api/applications/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  GetApplicationById,
  UpdateApplication,
  DeleteApplication,
} from "@/services/applications";
import { authGuard } from "@/lib/authGuard";
import type { UpdateApplicationDto } from "@/services/applications";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await authGuard(request);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const applicationId = parseInt(id);

    if (isNaN(applicationId)) {
      return NextResponse.json(
        { message: "Invalid application ID." },
        { status: 400 },
      );
    }

    return await GetApplicationById(applicationId);
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching application." },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await authGuard(request);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const applicationId = parseInt(id);

    if (isNaN(applicationId)) {
      return NextResponse.json(
        { message: "Invalid application ID." },
        { status: 400 },
      );
    }

    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 1024 * 1024) {
      return NextResponse.json(
        { message: "Request body too large." },
        { status: 413 },
      );
    }

    const body: UpdateApplicationDto = await request.json();

    if (Object.keys(body).length === 0) {
      return NextResponse.json(
        { message: "At least one field must be provided for update." },
        { status: 400 },
      );
    }

    return await UpdateApplication(applicationId, body);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof SyntaxError
            ? "Invalid JSON format."
            : "Error updating application.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await authGuard(request);
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const applicationId = parseInt(id);

    if (isNaN(applicationId)) {
      return NextResponse.json(
        { message: "Invalid application ID.", success: false },
        { status: 400 },
      );
    }

    return await DeleteApplication(applicationId);
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting application.", success: false },
      { status: 500 },
    );
  }
}
