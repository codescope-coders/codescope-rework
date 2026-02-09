// lib/services/applications.ts
import { db } from "@/lib/db";
import { applications, jobs } from "@/lib/db/schema";
import {
  eq,
  and,
  ilike,
  desc,
  asc,
  or,
  isNull,
  lte,
  gte,
  sql,
} from "drizzle-orm";
import { NextResponse } from "next/server";
import { JobDto } from "./jobs";
import { unlink } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export type ApplicationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "INTERVIEWED";
export type ExpectedSalary =
  | "RANGE_400_600"
  | "RANGE_700_900"
  | "RANGE_1000_1500"
  | "RANGE_1500_2000"
  | "OTHER";

export type EducationLevel =
  | "NO_FORMAL_EDUCATION"
  | "PRIMARY"
  | "INTERMEDIATE"
  | "SECONDARY"
  | "DIPLOMA"
  | "BACHELORS"
  | "MASTERS"
  | "DOCTORATE"
  | "POSTDOCTORATE"
  | "CERTIFICATE"
  | "PROFESSIONAL_CERTIFICATION";

export type CreateApplicationDto = {
  jobId: number | string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  currentCity: string;
  nationality: string;
  date_of_birth: string;
  availabilityToStart?: string;
  yearsOfExperience?: number;
  lastJobTitle?: string;
  lastCompanyName?: string;
  highestEducationLevel?: EducationLevel;
  fieldOfStudy?: string;
  graduationYear?: number;
  expectedSalary?: ExpectedSalary;
  links?: string[];
  cvUrl: string;
};

export type UpdateApplicationDto = {
  status?: ApplicationStatus;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  currentCity?: string;
  date_of_birth?: Date;
  nationality?: string;
  expectedSalary?: ExpectedSalary;
  availabilityToStart?: string;
  yearsOfExperience?: number;
  lastJobTitle?: string;
  lastCompanyName?: string;
  links?: string[];
  cvUrl?: string;
  highestEducationLevel?: EducationLevel;
  fieldOfStudy?: string;
  graduationYear?: number;
};

export type ApplicationDto = {
  id: number;
  jobId: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  currentCity?: string;
  date_of_birth: string;
  nationality?: string;
  expectedSalary?: ExpectedSalary;
  availabilityToStart?: string;
  yearsOfExperience?: number;
  lastJobTitle?: string;
  lastCompanyName?: string;
  links: string[];
  cvUrl?: string;
  highestEducationLevel?: EducationLevel;
  fieldOfStudy?: string;
  graduationYear?: number;
  status: ApplicationStatus;
  appliedAt: string;
  job?: JobDto;
  createdAt: string;
  updatedAt: Date;
};

export type GetAllApplicationsOptions = {
  search?: string;
  status?: ApplicationStatus;
  jobId?: number;
  expectedSalary?: "lowest" | "highest";
  availability?: "immediate" | "soonest" | "later";
};

export const GetAllApplications = async ({
  search,
  status,
  jobId,
  expectedSalary,
  availability,
}: GetAllApplicationsOptions = {}): Promise<
  NextResponse<{
    message: string;
    payload: ApplicationDto[];
  }>
> => {
  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(applications.email, `%${search}%`),
        ilike(applications.fullName, `%${search}%`),
      ),
    );
  }
  if (status) {
    conditions.push(eq(applications.status, status));
  }
  if (jobId) {
    conditions.push(eq(applications.jobId, jobId));
  }
  if (availability === "immediate") {
    conditions.push(
      or(
        eq(applications.availabilityToStart, "IMMEDIATELY"),
        isNull(applications.availabilityToStart),
      ),
    );
  } else if (availability === "soonest") {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const thirtyDaysFromNowISO = thirtyDaysFromNow.toISOString();

    conditions.push(
      or(
        eq(applications.availabilityToStart, "IMMEDIATELY"),
        isNull(applications.availabilityToStart),
        lte(applications.availabilityToStart, thirtyDaysFromNowISO),
      ),
    );
  } else if (availability === "later") {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const thirtyDaysFromNowISO = thirtyDaysFromNow.toISOString();
    conditions.push(
      gte(applications.availabilityToStart, thirtyDaysFromNowISO),
    );
  }

  const orderByClause = [];
  if (expectedSalary === "lowest") {
    orderByClause.push(
      sql`CASE ${applications.expectedSalary}
        WHEN 'RANGE_400_600' THEN 1
        WHEN 'RANGE_700_900' THEN 2
        WHEN 'RANGE_1000_1500' THEN 3
        WHEN 'RANGE_1500_2000' THEN 4
        WHEN 'OTHER' THEN 5
        ELSE 6
      END ASC`,
    );
  } else if (expectedSalary === "highest") {
    orderByClause.push(
      sql`CASE ${applications.expectedSalary}
        WHEN 'RANGE_1500_2000' THEN 1
        WHEN 'RANGE_1000_1500' THEN 2
        WHEN 'RANGE_700_900' THEN 3
        WHEN 'RANGE_400_600' THEN 4
        WHEN 'OTHER' THEN 5
        ELSE 6
      END ASC`,
    );
  }

  orderByClause.push(asc(applications.status));
  orderByClause.push(desc(applications.appliedAt));

  const applicationsData = await db.query.applications.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: orderByClause,
    with: {
      job: {
        columns: {
          position: true,
        },
      },
    },
  });

  return NextResponse.json(
    {
      message: "Applications retrieved successfully.",
      payload: applicationsData as unknown as ApplicationDto[],
    },
    { status: 200 },
  );
};

export const GetApplicationById = async (
  id: number,
): Promise<
  NextResponse<{
    message: string;
    payload: ApplicationDto | null;
  }>
> => {
  const applicationData = await db.query.applications.findFirst({
    where: eq(applications.id, id),
    with: {
      job: true,
    },
  });

  if (!applicationData) {
    return NextResponse.json(
      {
        message: "Application not found.",
        payload: null,
      },
      { status: 404 },
    );
  }

  return NextResponse.json(
    {
      message: "Application retrieved successfully.",
      payload: applicationData as unknown as ApplicationDto,
    },
    { status: 200 },
  );
};

export const CreateApplication = async (
  data: CreateApplicationDto,
): Promise<
  NextResponse<{
    message: string;
    payload: ApplicationDto | null;
    fieldErrors?: Record<string, string>;
  }>
> => {
  const fieldErrors: Record<string, string> = {};

  const job = await db.query.jobs.findFirst({
    where: eq(jobs.id, data.jobId as number),
  });

  if (!job) {
    return NextResponse.json(
      {
        message: "Job listing not found.",
        payload: null,
      },
      { status: 404 },
    );
  }

  if (job.status !== "AVAILABLE") {
    return NextResponse.json(
      {
        message: "This job position is no longer accepting applications.",
        payload: null,
      },
      { status: 400 },
    );
  }

  if (!data.fullName?.trim()) {
    fieldErrors.fullName = "Full name is required.";
  }

  if (!data.email?.trim()) {
    fieldErrors.email = "Email is required.";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      fieldErrors.email = "Invalid email format.";
    }
  }

  if (!data.currentCity?.trim()) {
    fieldErrors.currentCity = "Current city is required.";
  }

  if (!data.nationality?.trim()) {
    fieldErrors.nationality = "Nationality is required.";
  }

  if (!data.date_of_birth) {
    fieldErrors.date_of_birth = "Date of birth is required.";
  }

  if (!data.cvUrl?.trim()) {
    fieldErrors.cvUrl = "CV is required.";
  }

  const validSalaryRanges = [
    "RANGE_400_600",
    "RANGE_700_900",
    "RANGE_1000_1500",
    "RANGE_1500_2000",
    "OTHER",
  ];

  if (data.expectedSalary && !validSalaryRanges.includes(data.expectedSalary)) {
    fieldErrors.expectedSalary = "Invalid salary range.";
  }

  const validEducationLevels = [
    "NO_FORMAL_EDUCATION",
    "PRIMARY",
    "INTERMEDIATE",
    "SECONDARY",
    "DIPLOMA",
    "BACHELORS",
    "MASTERS",
    "DOCTORATE",
    "POSTDOCTORATE",
    "CERTIFICATE",
    "PROFESSIONAL_CERTIFICATION",
  ];

  if (
    data.highestEducationLevel &&
    !validEducationLevels.includes(data.highestEducationLevel)
  ) {
    fieldErrors.highestEducationLevel = "Invalid education level.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      {
        message: "Validation failed.",
        payload: null,
        fieldErrors,
      },
      { status: 400 },
    );
  }

  const [newApplication] = await db
    .insert(applications)
    .values({
      jobId: data.jobId as number,
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      currentCity: data.currentCity,
      nationality: data.nationality,
      date_of_birth: data.date_of_birth,
      availabilityToStart: data.availabilityToStart,
      yearsOfExperience: data.yearsOfExperience,
      lastJobTitle: data.lastJobTitle,
      lastCompanyName: data.lastCompanyName,
      highestEducationLevel: data.highestEducationLevel,
      fieldOfStudy: data.fieldOfStudy,
      graduationYear: data.graduationYear,
      expectedSalary: data.expectedSalary,
      links: data.links || [],
      cvUrl: data.cvUrl,
      status: "PENDING",
    })
    .returning();

  return NextResponse.json(
    {
      message: "Application submitted successfully.",
      payload: newApplication as unknown as ApplicationDto,
    },
    { status: 201 },
  );
};

export const UpdateApplication = async (
  id: number,
  data: UpdateApplicationDto,
): Promise<
  NextResponse<{
    message: string;
    payload: ApplicationDto | null;
    fieldErrors?: Record<string, string>;
  }>
> => {
  const existingApplication = await db.query.applications.findFirst({
    where: eq(applications.id, id),
  });

  if (!existingApplication) {
    return NextResponse.json(
      {
        message: "Application not found.",
        payload: null,
      },
      { status: 404 },
    );
  }

  const fieldErrors: Record<string, string> = {};

  const validStatuses = ["PENDING", "APPROVED", "REJECTED", "INTERVIEWED"];
  if (data.status && !validStatuses.includes(data.status)) {
    fieldErrors.status = "Invalid application status.";
  }

  if (data.fullName !== undefined && !data.fullName?.trim()) {
    fieldErrors.fullName = "Full name cannot be empty.";
  }

  if (data.email !== undefined) {
    if (!data.email?.trim()) {
      fieldErrors.email = "Email cannot be empty.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        fieldErrors.email = "Invalid email format.";
      }
    }
  }

  if (data.currentCity !== undefined && !data.currentCity?.trim()) {
    fieldErrors.currentCity = "Current city cannot be empty.";
  }

  if (data.nationality !== undefined && !data.nationality?.trim()) {
    fieldErrors.nationality = "Nationality cannot be empty.";
  }

  if (data.cvUrl !== undefined && !data.cvUrl?.trim()) {
    fieldErrors.cvUrl = "CV URL cannot be empty.";
  }

  const validSalaryRanges = [
    "RANGE_400_600",
    "RANGE_700_900",
    "RANGE_1000_1500",
    "RANGE_1500_2000",
    "OTHER",
  ];
  if (data.expectedSalary && !validSalaryRanges.includes(data.expectedSalary)) {
    fieldErrors.expectedSalary = "Invalid salary range.";
  }

  const validEducationLevels = [
    "NO_FORMAL_EDUCATION",
    "PRIMARY",
    "INTERMEDIATE",
    "SECONDARY",
    "DIPLOMA",
    "BACHELORS",
    "MASTERS",
    "DOCTORATE",
    "POSTDOCTORATE",
    "CERTIFICATE",
    "PROFESSIONAL_CERTIFICATION",
  ];

  if (
    data.highestEducationLevel &&
    !validEducationLevels.includes(data.highestEducationLevel)
  ) {
    fieldErrors.highestEducationLevel = "Invalid education level.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      {
        message: "Validation failed.",
        payload: null,
        fieldErrors,
      },
      { status: 400 },
    );
  }

  const updatePayload = {
    ...data,
    date_of_birth: data.date_of_birth
      ? data.date_of_birth.toISOString()
      : undefined,
    updatedAt: new Date(),
  };

  const [updatedApplication] = await db
    .update(applications)
    .set(updatePayload)
    .where(eq(applications.id, id))
    .returning();

  return NextResponse.json(
    {
      message: "Application updated successfully.",
      payload: updatedApplication as unknown as ApplicationDto,
    },
    { status: 200 },
  );
};

export const DeleteApplication = async (
  id: number,
): Promise<
  NextResponse<{
    message: string;
    success: boolean;
  }>
> => {
  const existingApplication = await db.query.applications.findFirst({
    where: eq(applications.id, id),
  });

  if (!existingApplication) {
    return NextResponse.json(
      {
        message: "Application not found.",
        success: false,
      },
      { status: 404 },
    );
  }

  if (existingApplication.cvUrl) {
    try {
      const fileName = path.basename(existingApplication.cvUrl);
      const filePath = path.join(
        process.cwd(),
        "public",
        "uploads",
        "cvs",
        fileName,
      );

      if (existsSync(filePath)) {
        await unlink(filePath);
        console.log(`Deleted CV file: ${fileName}`);
      }
    } catch (fileError) {
      console.error("Error deleting CV file:", fileError);
    }
  }

  await db.delete(applications).where(eq(applications.id, id));

  return NextResponse.json(
    {
      message: "Application deleted successfully.",
      success: true,
    },
    { status: 200 },
  );
};
