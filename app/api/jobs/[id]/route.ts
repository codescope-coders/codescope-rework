import { authGuard } from "@/lib/authGuard";
import {
  DeleteJob,
  GetJobById,
  UpdateJob,
  UpdateJobDto,
} from "@/services/jobs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const jobId = parseInt(id);

    if (isNaN(jobId)) {
      return NextResponse.json(
        {
          message: "Invalid job ID.",
          payload: null,
        },
        { status: 400 },
      );
    }

    return await GetJobById(jobId);
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      {
        message: "An error occurred while retrieving the job listing.",
        payload: null,
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Auth guard
    const authResult = await authGuard(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;
    const jobId = parseInt(id);

    if (isNaN(jobId)) {
      return NextResponse.json({ message: "Invalid job ID." }, { status: 400 });
    }

    // Check body size
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 1024 * 1024) {
      return NextResponse.json(
        { message: "Request body too large." },
        { status: 413 },
      );
    }

    const body: UpdateJobDto = await request.json();

    // Validate at least one field is provided
    if (Object.keys(body).length === 0) {
      return NextResponse.json(
        { message: "At least one field must be provided for update." },
        { status: 400 },
      );
    }

    // Validate fields
    const fieldErrors: Record<string, string> = {};

    if (body.position !== undefined && !body.position?.trim()) {
      fieldErrors.position = "Position cannot be empty.";
    }

    if (body.requirements !== undefined && body.requirements.length === 0) {
      fieldErrors.requirements = "At least one requirement is required.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        { message: "Validation failed.", fieldErrors },
        { status: 400 },
      );
    }

    return await UpdateJob(jobId, body);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof SyntaxError
            ? "Invalid JSON format."
            : "Error updating job.",
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
    const jobId = parseInt(id);

    if (isNaN(jobId)) {
      return NextResponse.json(
        { message: "Invalid job ID.", success: false },
        { status: 400 },
      );
    }

    return await DeleteJob(jobId);
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting job.", success: false },
      { status: 500 },
    );
  }
}
