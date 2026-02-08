// app/api/applications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GetAllApplications, CreateApplication } from "@/services/applications";
import { authGuard } from "@/lib/authGuard";
import type {
  CreateApplicationDto,
  ApplicationStatus,
} from "@/services/applications";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authGuard(request);
    if (authResult instanceof NextResponse) return authResult;

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") as ApplicationStatus | undefined;
    const jobId = searchParams.get("jobId")
      ? parseInt(searchParams.get("jobId")!)
      : undefined;
    const expectedSalary = searchParams.get("expectedSalary") as
      | "lowest"
      | "highest"
      | undefined;
    const availability = searchParams.get("availability") as
      | "immediate"
      | "soonest"
      | "later"
      | undefined;

    return await GetAllApplications({
      search,
      status,
      jobId,
      expectedSalary,
      availability,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching applications.", payload: [] },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 1024 * 1024) {
      return NextResponse.json(
        { message: "Request body too large." },
        { status: 413 },
      );
    }

    const body: CreateApplicationDto = await request.json();

    const fieldErrors: Record<string, string> = {};

    if (!body.jobId) fieldErrors.jobId = "Job ID is required.";
    if (!body.fullName?.trim()) fieldErrors.fullName = "Full name is required.";
    if (!body.email?.trim()) fieldErrors.email = "Email is required.";
    if (!body.currentCity?.trim())
      fieldErrors.currentCity = "Current city is required.";
    if (!body.nationality?.trim())
      fieldErrors.nationality = "Nationality is required.";
    if (!body.date_of_birth)
      fieldErrors.date_of_birth = "Date of birth is required.";
    if (!body.cvUrl?.trim()) fieldErrors.cvUrl = "CV is required.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (body.email && !emailRegex.test(body.email)) {
      fieldErrors.email = "Invalid email format.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        { message: "Validation failed.", fieldErrors, payload: null },
        { status: 400 },
      );
    }

    return await CreateApplication(body);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message:
          error instanceof SyntaxError
            ? "Invalid JSON format."
            : "Error submitting application.",
        payload: null,
      },
      { status: 400 },
    );
  }
}
