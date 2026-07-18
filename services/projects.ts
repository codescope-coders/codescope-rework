import { db } from "@/lib/db";
import { projects, subscriptions, admins, servers } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { NextResponse } from "next/server";

export type ProjectStage =
  | "DOMAIN"
  | "BRAND_DESIGN"
  | "BRAND_READY"
  | "BRAND_APPROVAL"
  | "DEV_HANDOFF"
  | "DEVELOPMENT"
  | "DELIVERY";

export interface ProjectDto {
  id: number;
  company: string;
  systemName: string | null;
  contact: string | null;
  phone: string | null;
  domain: string | null;
  stage: ProjectStage;
  assignedToId: number | null;
  developerId: number | null;
  designerId: number | null;
  serverId: number | null;
  brandFile: string | null;
  startDate: string | null;
  notes: string | null;
  assignedToName: string | null;
  developerName: string | null;
  designerName: string | null;
  serverName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  company: string;
  systemName?: string | null;
  contact?: string | null;
  phone?: string | null;
  domain?: string | null;
  stage?: ProjectStage;
  assignedToId?: number | null;
  developerId?: number | null;
  designerId?: number | null;
  serverId?: number | null;
  brandFile?: string | null;
  startDate?: string | null;
  notes?: string | null;
}
export type UpdateProjectDto = Partial<CreateProjectDto>;

// admins is joined three times (assignee / developer / designer), so each needs
// its own alias.
const asg = alias(admins, "proj_asg");
const dev = alias(admins, "proj_dev");
const des = alias(admins, "proj_des");

const projectSelection = {
  id: projects.id,
  company: projects.company,
  systemName: projects.systemName,
  contact: projects.contact,
  phone: projects.phone,
  domain: projects.domain,
  stage: projects.stage,
  assignedToId: projects.assignedToId,
  developerId: projects.developerId,
  designerId: projects.designerId,
  serverId: projects.serverId,
  brandFile: projects.brandFile,
  startDate: projects.startDate,
  notes: projects.notes,
  createdAt: projects.createdAt,
  updatedAt: projects.updatedAt,
  assignedToName: asg.name,
  developerName: dev.name,
  designerName: des.name,
  serverName: servers.name,
};

/** Keep the matching subscription's system name in sync with the project. Only
 * updates when a subscription for that company already exists (case-insensitive)
 * — never creates one. */
async function syncSubscriptionSystemName(company: string, systemName: string) {
  await db
    .update(subscriptions)
    .set({ systemName, updatedAt: new Date() })
    .where(sql`lower(${subscriptions.company}) = lower(${company})`);
}

export const GetAllProjects = async () => {
  const rows = await db
    .select(projectSelection)
    .from(projects)
    .leftJoin(asg, eq(projects.assignedToId, asg.id))
    .leftJoin(dev, eq(projects.developerId, dev.id))
    .leftJoin(des, eq(projects.designerId, des.id))
    .leftJoin(servers, eq(projects.serverId, servers.id))
    .orderBy(desc(projects.updatedAt));
  return NextResponse.json({
    message: "ok",
    payload: rows as unknown as ProjectDto[],
  });
};

export const CreateProject = async (data: CreateProjectDto) => {
  const [row] = await db
    .insert(projects)
    .values({
      company: data.company,
      systemName: data.systemName ?? null,
      contact: data.contact ?? null,
      phone: data.phone ?? null,
      domain: data.domain ?? null,
      stage: data.stage ?? "DOMAIN",
      assignedToId: data.assignedToId ?? null,
      developerId: data.developerId ?? null,
      designerId: data.designerId ?? null,
      serverId: data.serverId ?? null,
      brandFile: data.brandFile ?? null,
      startDate: data.startDate || null,
      notes: data.notes ?? null,
    })
    .returning();

  if (row.systemName?.trim())
    await syncSubscriptionSystemName(row.company, row.systemName);

  return NextResponse.json({ message: "تمت الإضافة.", payload: row }, { status: 201 });
};

export const UpdateProject = async (id: number, data: UpdateProjectDto) => {
  const existing = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });
  if (!existing) {
    return NextResponse.json({ message: "غير موجود." }, { status: 404 });
  }

  const patch = { ...data };
  if (patch.startDate === "") patch.startDate = null;

  const [row] = await db
    .update(projects)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning();

  if (row.systemName?.trim())
    await syncSubscriptionSystemName(row.company, row.systemName);

  return NextResponse.json({ message: "تم الحفظ.", payload: row });
};

export const DeleteProject = async (id: number) => {
  const existing = await db.query.projects.findFirst({
    where: eq(projects.id, id),
  });
  if (!existing) {
    return NextResponse.json(
      { message: "غير موجود.", success: false },
      { status: 404 },
    );
  }
  await db.delete(projects).where(eq(projects.id, id));
  return NextResponse.json({ message: "تم الحذف.", success: true });
};
