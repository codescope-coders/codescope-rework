import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/rbac/guard";
import { getNotifications } from "@/services/notifications";

/**
 * Role-scoped attention items for the notification bell. Computed server-side
 * from pending approvals, due subscriptions, overdue follow-ups, open tickets,
 * report reminders, etc. (see services/notifications).
 */
export const GET = async (request: Request) => {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const payload = await getNotifications(auth);
    return NextResponse.json({ message: "ok", payload });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: (error as Error)?.message || "Something went wrong", payload: [] },
      { status: 500 },
    );
  }
};
