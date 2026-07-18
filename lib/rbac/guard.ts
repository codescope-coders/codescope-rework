import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import { resolvePermissions, type Role } from "./permissions";

export interface AuthClaims {
  id: number;
  email: string;
  name: string | null;
  role: Role;
}

function getBearer(request: Request): string | null {
  const header = request.headers.get("Authorization") || "";
  if (!header.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  return token || null;
}

/** Verify the JWT and return its claims, or a 401 NextResponse to return as-is. */
export async function requireAuth(
  request: Request,
): Promise<AuthClaims | NextResponse> {
  const token = getBearer(request);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const payload = (await verifyJWT(token)) as unknown as AuthClaims;
    return payload;
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

/**
 * requireAuth + check the caller's role grants `code`. Returns the claims on
 * success or a 401 (no/invalid token) / 403 (authenticated but not permitted)
 * NextResponse the route should return directly.
 */
export async function requirePermission(
  request: Request,
  code: string,
): Promise<AuthClaims | NextResponse> {
  const claims = await requireAuth(request);
  if (claims instanceof NextResponse) return claims;
  if (!resolvePermissions(claims.role).includes(code)) {
    return NextResponse.json(
      { message: "You don't have access to this action.", code: "FORBIDDEN" },
      { status: 403 },
    );
  }
  return claims;
}

/** True if the caller's role grants `code`. */
export function claimsCan(claims: AuthClaims, code: string): boolean {
  return resolvePermissions(claims.role).includes(code);
}
