import { db } from "@/lib/db";
import { packageRequests } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * Website requests — the submissions the public marketing site produces.
 *
 * Shaped like `services/support.ts` (the closest existing module: a record with
 * a status lifecycle and a staff-internal note), with two deliberate
 * differences:
 *
 *   1. There is no CREATE here. Rows are created by the PUBLIC form routes
 *      (`app/api/package-requests`, `app/api/contact`) with no session — a
 *      dashboard-side create would be inventing a lead that nobody sent.
 *   2. There is no per-user scope. A ticket belongs to its assignee; a website
 *      request belongs to nobody until someone picks it up, so every holder of
 *      VIEW_WEBSITE_REQUESTS sees the whole queue. That is also why there is no
 *      VIEW_..._ALL sibling permission.
 *
 * Staff may change `status` and `note` and nothing else: name / email / phone /
 * message / package / locale are what the visitor actually wrote, and editing
 * them would quietly rewrite the record of a request we have to answer. There
 * is no delete for the same reason — spam is CLOSED, not erased, so "did anyone
 * ever ask us about X?" always has an answer.
 */

export type WebsiteRequestKind = "PACKAGE" | "CONTACT";
export type WebsiteRequestStatus =
  | "NEW"
  | "CONTACTED"
  | "CONVERTED"
  | "CLOSED";
export type WebsiteRequestPackage = "CHARTER" | "STANDARD" | "ADVANCED";

export interface WebsiteRequestDto {
  id: number;
  kind: WebsiteRequestKind;
  package: WebsiteRequestPackage | null;
  name: string;
  agency: string | null;
  email: string;
  phone: string | null;
  message: string;
  locale: string;
  status: WebsiteRequestStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

/** The only two fields staff own. */
export interface UpdateWebsiteRequestDto {
  status?: WebsiteRequestStatus;
  note?: string | null;
}

const requestSelection = {
  id: packageRequests.id,
  kind: packageRequests.kind,
  package: packageRequests.package,
  name: packageRequests.name,
  agency: packageRequests.agency,
  email: packageRequests.email,
  phone: packageRequests.phone,
  message: packageRequests.message,
  locale: packageRequests.locale,
  status: packageRequests.status,
  note: packageRequests.note,
  createdAt: packageRequests.createdAt,
  updatedAt: packageRequests.updatedAt,
};

export const GetAllWebsiteRequests = async (
  opts: { kind?: WebsiteRequestKind; status?: WebsiteRequestStatus } = {},
) => {
  const conditions = [];
  if (opts.kind) conditions.push(eq(packageRequests.kind, opts.kind));
  if (opts.status) conditions.push(eq(packageRequests.status, opts.status));
  const rows = await db
    .select(requestSelection)
    .from(packageRequests)
    .where(conditions.length ? and(...conditions) : undefined)
    // Newest first: this is a queue, and the request nobody has answered yet is
    // the one that matters.
    .orderBy(desc(packageRequests.createdAt));
  return NextResponse.json({
    message: "ok",
    payload: rows as unknown as WebsiteRequestDto[],
  });
};

export const UpdateWebsiteRequest = async (
  id: number,
  data: UpdateWebsiteRequestDto,
) => {
  const existing = await db.query.packageRequests.findFirst({
    where: eq(packageRequests.id, id),
  });
  if (!existing) {
    return NextResponse.json({ message: "غير موجود." }, { status: 404 });
  }

  // Whitelist, not a spread: the body arrives from the client, and everything
  // outside these two columns is the visitor's own words.
  const patch: UpdateWebsiteRequestDto = {};
  if (data.status !== undefined) patch.status = data.status;
  if (data.note !== undefined) patch.note = data.note || null;

  const [row] = await db
    .update(packageRequests)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(packageRequests.id, id))
    .returning();

  return NextResponse.json({ message: "تم الحفظ.", payload: row });
};
