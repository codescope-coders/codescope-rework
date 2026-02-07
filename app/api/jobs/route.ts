import { NextRequest, NextResponse } from "next/server";
import { CreateJob, CreateJobDto, GetAllJobs } from "@/services/jobs";
import { authGuard } from "@/lib/authGuard";

export const GET = async (req: Request) => {
  try {
    const { search, status, type, fields, page, limit } = Object.fromEntries(
      new URL(req.url).searchParams,
    ) as Record<string, string>;

    const fieldsArray = fields ? fields.split(",") : undefined;
    const pageNumber = page ? parseInt(page, 10) : undefined;
    const limitNumber = limit ? parseInt(limit, 10) : undefined;

    return await GetAllJobs({
      search,
      status: status as any,
      type: type as any,
      fields: fieldsArray as any,
      page: pageNumber,
      limit: limitNumber,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Something went wrong" },
      { status: 500 },
    );
  }
};

export const POST = async (request: NextRequest) => {
  if (!request.body) {
    return NextResponse.json(
      { message: "Request body is required." },
      { status: 400 },
    );
  }

  const contentLength = request.headers.get("content-length");
  const MAX_BODY_SIZE = 1024 * 1024; // 1MB

  if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
    return NextResponse.json(
      { message: "Request body is too large. Maximum size is 1MB." },
      { status: 413 },
    );
  }

  try {
    const authResult = await authGuard(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body: CreateJobDto = await request.json();
    const fieldErrors: Record<string, string> = {};

    if (!body.position?.trim()) fieldErrors.position = "Position is required.";
    if (!body.requirements?.length)
      fieldErrors.requirements = "At least one requirement is required.";

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        { message: "Validation failed.", fieldErrors },
        { status: 400 },
      );
    }

    return await CreateJob(body);
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      {
        message: "An error occurred while creating the job listing.",
        payload: null,
      },
      { status: 500 },
    );
  }
};
