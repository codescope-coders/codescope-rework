import { NextResponse } from "next/server";
import {
  GetAllWebsiteRequests,
  type WebsiteRequestKind,
  type WebsiteRequestStatus,
} from "@/services/website-requests";
import { requirePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

/**
 * Dashboard read for the "Website requests" module. This file is GUARDED end to
 * end — the public form posts to `/api/package-requests`, which is a separate
 * route precisely so nothing here has to be selectively unguarded.
 */

const KINDS = ["PACKAGE", "CONTACT"] as const;
const STATUSES = ["NEW", "CONTACTED", "CONVERTED", "CLOSED"] as const;

export const GET = async (request: Request) => {
  const auth = await requirePermission(
    request,
    PERMISSIONS.VIEW_WEBSITE_REQUESTS,
  );
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const kind = searchParams.get("kind");
    const status = searchParams.get("status");
    return await GetAllWebsiteRequests({
      kind: KINDS.includes(kind as WebsiteRequestKind)
        ? (kind as WebsiteRequestKind)
        : undefined,
      status: STATUSES.includes(status as WebsiteRequestStatus)
        ? (status as WebsiteRequestStatus)
        : undefined,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: (error as Error)?.message || "Something went wrong" },
      { status: 500 },
    );
  }
};
