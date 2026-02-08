import { db } from "@/lib/db";
import { jobs, applications } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { NextResponse } from "next/server";

export type StatsDto = {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  interviewedApplications: number;
  rejectedApplications: number;
  totalJobs: number;
  activeJobs: number;
  closedJobs: number;
};

export type GetStatsResponse = {
  message: string;
  payload: StatsDto;
};

export const GetStats = async (): Promise<NextResponse<GetStatsResponse>> => {
  const [totalApplicationsResult] = await db
    .select({ count: count() })
    .from(applications);

  const [pendingApplicationsResult] = await db
    .select({ count: count() })
    .from(applications)
    .where(eq(applications.status, "PENDING"));

  const [approvedApplicationsResult] = await db
    .select({ count: count() })
    .from(applications)
    .where(eq(applications.status, "APPROVED"));

  const [interviewedApplicationsResult] = await db
    .select({ count: count() })
    .from(applications)
    .where(eq(applications.status, "INTERVIEWED"));

  const [rejectedApplicationsResult] = await db
    .select({ count: count() })
    .from(applications)
    .where(eq(applications.status, "REJECTED"));

  const [totalJobsResult] = await db.select({ count: count() }).from(jobs);

  const [activeJobsResult] = await db
    .select({ count: count() })
    .from(jobs)
    .where(eq(jobs.status, "AVAILABLE"));

  const [closedJobsResult] = await db
    .select({ count: count() })
    .from(jobs)
    .where(eq(jobs.status, "CLOSED"));

  const stats: StatsDto = {
    totalApplications: totalApplicationsResult.count,
    pendingApplications: pendingApplicationsResult.count,
    approvedApplications: approvedApplicationsResult.count,
    interviewedApplications: interviewedApplicationsResult.count,
    rejectedApplications: rejectedApplicationsResult.count,
    totalJobs: totalJobsResult.count,
    activeJobs: activeJobsResult.count,
    closedJobs: closedJobsResult.count,
  };

  return NextResponse.json(
    {
      message: "Statistics retrieved successfully.",
      payload: stats,
    },
    { status: 200 },
  );
};
