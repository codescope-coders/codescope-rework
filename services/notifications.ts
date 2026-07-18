import { and, eq, gte, lte, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  admins,
  leaves,
  partners,
  payrollSheets,
  pipelineLeads,
  projects,
  reports,
  spendRequests,
  subscriptions,
  tickets,
} from "@/lib/db/schema";
import type { AuthClaims } from "@/lib/rbac/guard";
import { PERMISSIONS as P, resolvePermissions } from "@/lib/rbac/permissions";

/**
 * A notification is returned as a KIND + params + href; the client formats the
 * localized text (so the same feed reads in the viewer's language). See
 * components/dashboard/notification-format.ts.
 */
export interface AppNotification {
  id: string;
  kind: string;
  params: Record<string, string | number>;
  href: string;
}

const todayISO = () => new Date().toISOString().slice(0, 10);
function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00").getTime();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((d - now.getTime()) / (24 * 3600 * 1000));
}

export async function getNotifications(
  claims: AuthClaims,
): Promise<AppNotification[]> {
  const perms = new Set(resolvePermissions(claims.role));
  const has = (p: string) => perms.has(p);
  const out: AppNotification[] = [];
  const today = todayISO();

  // ── Admin approvals ──────────────────────────────────────────────────────
  if (has(P.APPROVE_SPEND_REQUESTS)) {
    const rows = await db
      .select({
        id: spendRequests.id,
        amount: spendRequests.amount,
        currency: spendRequests.currency,
        by: admins.name,
      })
      .from(spendRequests)
      .leftJoin(admins, eq(spendRequests.requestedById, admins.id))
      .where(eq(spendRequests.status, "PENDING"));
    for (const r of rows)
      out.push({
        id: "req-" + r.id,
        kind: "pending_request",
        params: { by: r.by ?? "—", amount: r.amount, currency: r.currency },
        href: "/dashboard/finance?tab=requests",
      });
  }

  if (has(P.APPROVE_PAYROLL)) {
    const sheets = await db.query.payrollSheets.findMany({
      where: eq(payrollSheets.status, "PENDING"),
      with: { items: true },
    });
    for (const s of sheets)
      out.push({
        id: "sheet-" + s.id,
        kind: "pending_sheet",
        params: { month: s.month, count: s.items.length },
        href: "/dashboard/finance?tab=payroll",
      });
  }

  if (has(P.APPROVE_LEAVES)) {
    const rows = await db
      .select({
        id: leaves.id,
        type: leaves.type,
        employee: admins.name,
      })
      .from(leaves)
      .leftJoin(admins, eq(leaves.employeeId, admins.id))
      .where(eq(leaves.status, "PENDING"));
    for (const l of rows)
      out.push({
        id: "leave-" + l.id,
        kind: "pending_leave",
        params: { employee: l.employee ?? "—", type: l.type },
        href: "/dashboard/leaves",
      });
  }

  if (has(P.MANAGE_PROJECTS)) {
    const rows = await db
      .select({ id: projects.id, company: projects.company })
      .from(projects)
      .where(eq(projects.stage, "BRAND_APPROVAL"));
    for (const pr of rows)
      out.push({
        id: "brand-" + pr.id,
        kind: "project_brand",
        params: { company: pr.company },
        href: "/dashboard/projects",
      });
  }

  if (has(P.MANAGE_PARTNERS)) {
    const [{ total, count }] = await db
      .select({
        total: sql<number>`coalesce(sum(${partners.percentage}), 0)`,
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(partners);
    if (Number(count) > 0 && Math.round(Number(total)) !== 100)
      out.push({
        id: "partner-pct",
        kind: "partner_pct",
        params: { pct: Math.round(Number(total)) },
        href: "/dashboard/partners",
      });
  }

  // ── Finance: subscriptions ───────────────────────────────────────────────
  if (has(P.VIEW_SUBSCRIPTIONS)) {
    const active = await db
      .select({ id: subscriptions.id, company: subscriptions.company, nextDue: subscriptions.nextDue })
      .from(subscriptions)
      .where(eq(subscriptions.status, "ACTIVE"));
    for (const s of active) {
      const dd = daysUntil(s.nextDue);
      if (dd !== null && dd <= 7)
        out.push({
          id: "sub-" + s.id,
          kind: "sub_due",
          params: { company: s.company, days: dd },
          href: "/dashboard/finance?tab=subs",
        });
    }
    const pending = await db
      .select({ id: subscriptions.id, company: subscriptions.company })
      .from(subscriptions)
      .where(eq(subscriptions.status, "PENDING_ACTIVATION"));
    for (const s of pending)
      out.push({
        id: "subpending-" + s.id,
        kind: "sub_pending",
        params: { company: s.company },
        href: "/dashboard/finance?tab=subs",
      });
  }

  // ── Pipeline: due follow-ups (scoped) ────────────────────────────────────
  if (has(P.VIEW_PIPELINE)) {
    const conds = [lte(pipelineLeads.nextDate, today)];
    if (!has(P.VIEW_PIPELINE_ALL)) conds.push(eq(pipelineLeads.employeeId, claims.id));
    const rows = await db
      .select({ id: pipelineLeads.id, company: pipelineLeads.company, nextDate: pipelineLeads.nextDate })
      .from(pipelineLeads)
      .where(and(...conds));
    for (const l of rows) {
      const dd = daysUntil(l.nextDate);
      if (dd !== null && dd <= 0)
        out.push({
          id: "lead-" + l.id,
          kind: "lead_due",
          params: { company: l.company, days: dd },
          href: "/dashboard/pipeline",
        });
    }
  }

  // ── Support: open tickets (scoped) ───────────────────────────────────────
  if (has(P.VIEW_SUPPORT)) {
    const conds = [ne(tickets.status, "RESOLVED")];
    if (!has(P.VIEW_SUPPORT_ALL)) conds.push(eq(tickets.assignedToId, claims.id));
    const rows = await db
      .select({ id: tickets.id, company: tickets.company, subject: tickets.subject })
      .from(tickets)
      .where(and(...conds));
    for (const tk of rows)
      out.push({
        id: "ticket-" + tk.id,
        kind: "open_ticket",
        params: { company: tk.company, subject: tk.subject },
        href: "/dashboard/support",
      });
  }

  // ── Weekly report reminder (staff who must submit their own) ─────────────
  if (has(P.VIEW_REPORTS) && !has(P.VIEW_REPORTS_ALL)) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000)
      .toISOString()
      .slice(0, 10);
    const recent = await db
      .select({ id: reports.id })
      .from(reports)
      .where(and(eq(reports.employeeId, claims.id), gte(reports.date, weekAgo)))
      .limit(1);
    if (recent.length === 0)
      out.push({ id: "report-reminder", kind: "report_reminder", params: {}, href: "/dashboard/reports" });
  }

  return out;
}
