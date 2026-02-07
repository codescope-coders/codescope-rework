import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { eq, and, ilike, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ApplicationDto } from "./applications";

export type JobStatus = "AVAILABLE" | "CLOSED";
export type JobTypes =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "FREELANCE"
  | "INTERNSHIP"
  | "TEMPORARY";

export type CreateJobDto = {
  position: string;
  location?: string;
  description?: string;
  status?: JobStatus;
  type?: JobTypes;
  requirements: string[];
  responsibilities?: string[];
};

export type UpdateJobDto = {
  position?: string;
  location?: string;
  description?: string;
  status?: JobStatus;
  type?: JobTypes;
  requirements?: string[];
  responsibilities?: string[];
};

export type JobDto = {
  id: number;
  position: string;
  location?: string;
  description?: string;
  status: JobStatus;
  type: JobTypes;
  requirements: string[];
  responsibilities: string[];
  createdAt: string;
  updatedAt: string;
  total_applications?: number;
  applications?: ApplicationDto[];
};

interface GetAllJobsOptions {
  fields?: (keyof JobDto)[];
  search?: string;
  status?: JobStatus;
  type?: JobTypes;
  page?: number;
  limit?: number;
}

export interface GetAllJobsResponse {
  message: string;
  payload: JobDto[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
export const GetAllJobs = async ({
  fields,
  search,
  status,
  type,
  page,
  limit,
}: GetAllJobsOptions = {}) => {
  const conditions = [];

  if (search) {
    conditions.push(ilike(jobs.position, `%${search}%`));
  }

  if (status) {
    conditions.push(eq(jobs.status, status));
  }

  if (type) {
    conditions.push(eq(jobs.type, type));
  }

  const includeApplications = fields?.includes("applications" as keyof JobDto);
  const includeTotalApplications = fields?.includes(
    "total_applications" as keyof JobDto,
  );

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Only add pagination if both page and limit are provided
  let totalCount: number | undefined;
  let totalPages: number | undefined;
  let offset: number | undefined;

  if (page !== undefined && limit !== undefined) {
    const [{ count }] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(jobs)
      .where(whereClause);

    totalCount = Number(count);
    totalPages = Math.ceil(totalCount / limit);
    offset = (page - 1) * limit;
  }

  const jobsData = await db.query.jobs.findMany({
    where: whereClause,
    ...(fields && fields.length > 0
      ? {
          columns: Object.fromEntries(
            fields
              .filter((f) => f !== "applications" && f !== "total_applications")
              .map((f) => [f, true]),
          ) as Partial<Record<keyof JobDto, true>>,
        }
      : {}),
    orderBy: [
      sql`${jobs.status} = 'AVAILABLE' DESC`,
      sql`${jobs.createdAt} DESC`,
    ],
    ...(limit !== undefined ? { limit } : {}),
    ...(offset !== undefined ? { offset } : {}),
    with:
      includeApplications || includeTotalApplications
        ? {
            applications: includeApplications
              ? true
              : {
                  columns: { id: true }, // Just get count
                },
          }
        : undefined,
  });

  // Transform data to include total_applications count
  const transformedData = jobsData.map((job: any) => {
    const result: any = { ...job };

    if (includeTotalApplications && job.applications) {
      result.total_applications = job.applications.length;
    }

    // Remove applications array if not requested
    if (!includeApplications && job.applications) {
      delete result.applications;
    }

    return result;
  });

  const response: {
    message: string;
    payload: Partial<JobDto>[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  } = {
    message: "Job listings retrieved successfully.",
    payload: transformedData as unknown as Partial<JobDto>[],
  };

  // Only include pagination if it was requested
  if (
    page !== undefined &&
    limit !== undefined &&
    totalCount !== undefined &&
    totalPages !== undefined
  ) {
    response.pagination = {
      page,
      limit,
      total: totalCount,
      totalPages,
    };
  }

  return NextResponse.json(response, { status: 200 });
};

export const GetJobById = async (
  id: number,
): Promise<
  NextResponse<{
    message: string;
    payload: JobDto | null;
  }>
> => {
  const jobData = await db.query.jobs.findFirst({
    where: eq(jobs.id, id),
  });

  if (!jobData) {
    return NextResponse.json(
      {
        message: "Job listing not found.",
        payload: null,
      },
      { status: 404 },
    );
  }

  return NextResponse.json(
    {
      message: "Job listing retrieved successfully.",
      payload: jobData as unknown as JobDto,
    },
    { status: 200 },
  );
};

export const CreateJob = async (
  data: CreateJobDto,
): Promise<
  NextResponse<{
    message: string;
    payload: JobDto;
  }>
> => {
  const [newJob] = await db
    .insert(jobs)
    .values({
      position: data.position,
      location: data.location,
      description: data.description,
      status: data.status || "AVAILABLE",
      type: data.type || "FULL_TIME",
      requirements: data.requirements,
      responsibilities: data.responsibilities || [],
    })
    .returning();

  return NextResponse.json(
    {
      message: "Job listing created successfully.",
      payload: newJob as unknown as JobDto,
    },
    { status: 201 },
  );
};

export const UpdateJob = async (
  id: number,
  data: UpdateJobDto,
): Promise<
  NextResponse<{
    message: string;
    payload: JobDto | null;
  }>
> => {
  const existingJob = await db.query.jobs.findFirst({
    where: eq(jobs.id, id),
  });

  if (!existingJob) {
    return NextResponse.json(
      {
        message: "Job listing not found.",
        payload: null,
      },
      { status: 404 },
    );
  }

  const [updatedJob] = await db
    .update(jobs)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, id))
    .returning();

  return NextResponse.json(
    {
      message: "Job listing updated successfully.",
      payload: updatedJob as unknown as JobDto,
    },
    { status: 200 },
  );
};

export const DeleteJob = async (
  id: number,
): Promise<
  NextResponse<{
    message: string;
    success: boolean;
  }>
> => {
  const existingJob = await db.query.jobs.findFirst({
    where: eq(jobs.id, id),
  });

  if (!existingJob) {
    return NextResponse.json(
      {
        message: "Job listing not found.",
        success: false,
      },
      { status: 404 },
    );
  }

  await db.delete(jobs).where(eq(jobs.id, id));

  return NextResponse.json(
    {
      message: "Job listing deleted successfully.",
      success: true,
    },
    {
      status: 200,
    },
  );
};

export const ToggleJobStatus = async (
  id: number,
): Promise<
  NextResponse<{
    message: string;
    payload: JobDto | null;
  }>
> => {
  const existingJob = await db.query.jobs.findFirst({
    where: eq(jobs.id, id),
  });

  if (!existingJob) {
    return NextResponse.json(
      {
        message: "Job listing not found.",
        payload: null,
      },
      {
        status: 404,
      },
    );
  }

  const newStatus: JobStatus =
    existingJob.status === "AVAILABLE" ? "CLOSED" : "AVAILABLE";

  const [updatedJob] = await db
    .update(jobs)
    .set({
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, id))
    .returning();

  return NextResponse.json(
    {
      message: `Job listing status changed to ${newStatus.toLowerCase()}.`,
      payload: updatedJob as unknown as JobDto,
    },
    { status: 201 },
  );
};
