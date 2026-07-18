import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { admins } from "@/lib/db/schema";
import { requireAuth } from "@/lib/rbac/guard";
import { resolvePermissions } from "@/lib/rbac/permissions";

/**
 * The signed-in user's profile — id, email, name, role, and effective
 * permissions (role defaults ∪ per-user grants). Read fresh from the DB each
 * time so a role change takes effect on the next refetch without re-login.
 */
export const GET = async (req: Request) => {
  const claims = await requireAuth(req);
  if (claims instanceof NextResponse) return claims;

  const user = await db.query.admins.findFirst({
    where: eq(admins.id, claims.id),
    columns: {
      id: true,
      email: true,
      name: true,
      role: true,
      permissions: true,
      active: true,
    },
  });

  if (!user || !user.active) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    message: "ok",
    payload: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: resolvePermissions(user.role, user.permissions),
    },
  });
};
