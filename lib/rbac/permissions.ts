/**
 * RBAC for the Follow-up dashboard. Pure + isomorphic (safe on server and
 * client). Permissions are string tokens; each of the six console roles maps to
 * a default set. ADMIN holds the full catalog, so it passes every gate.
 *
 * The backend route guards (lib/rbac/guard.ts) and the client nav gating
 * (useCan / filterSidebarConfig) both resolve permissions from the SAME map, so
 * what a user can DO and what they can SEE never drift.
 */
import type { LucideIcon } from "lucide-react";

export const ROLES = [
  "ADMIN",
  "ACCOUNTANT",
  "EMPLOYEE",
  "DEVELOPER",
  "DESIGNER",
  "SYSADMIN",
] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = {
  VIEW_DASHBOARD: "VIEW_DASHBOARD",

  // Pipeline — VIEW = own leads, VIEW_ALL = every employee's leads.
  VIEW_PIPELINE: "VIEW_PIPELINE",
  VIEW_PIPELINE_ALL: "VIEW_PIPELINE_ALL",
  MANAGE_PIPELINE: "MANAGE_PIPELINE",

  // Projects (delivery).
  VIEW_PROJECTS: "VIEW_PROJECTS",
  MANAGE_PROJECTS: "MANAGE_PROJECTS",
  ASSIGN_PROJECTS: "ASSIGN_PROJECTS",

  // Servers.
  VIEW_SERVERS: "VIEW_SERVERS",
  MANAGE_SERVERS: "MANAGE_SERVERS",

  // Weekly reports — VIEW = own, VIEW_ALL = everyone's.
  VIEW_REPORTS: "VIEW_REPORTS",
  VIEW_REPORTS_ALL: "VIEW_REPORTS_ALL",
  MANAGE_REPORTS: "MANAGE_REPORTS",

  // Website requests — the public site's get-started + contact submissions.
  // No VIEW_..._ALL sibling: a request belongs to nobody until someone picks it
  // up, so the queue is shared by everyone who can see it.
  VIEW_WEBSITE_REQUESTS: "VIEW_WEBSITE_REQUESTS",
  MANAGE_WEBSITE_REQUESTS: "MANAGE_WEBSITE_REQUESTS",

  // Support tickets — VIEW = assigned to me, VIEW_ALL = every ticket.
  VIEW_SUPPORT: "VIEW_SUPPORT",
  VIEW_SUPPORT_ALL: "VIEW_SUPPORT_ALL",
  MANAGE_SUPPORT: "MANAGE_SUPPORT",

  // Leaves — VIEW = own, VIEW_ALL = everyone's; APPROVE = decide.
  VIEW_LEAVES: "VIEW_LEAVES",
  VIEW_LEAVES_ALL: "VIEW_LEAVES_ALL",
  REQUEST_LEAVE: "REQUEST_LEAVE",
  APPROVE_LEAVES: "APPROVE_LEAVES",

  // Finance.
  VIEW_FINANCE: "VIEW_FINANCE",
  MANAGE_LEDGER: "MANAGE_LEDGER", // create income entries
  MANAGE_LEDGER_EXPENSE: "MANAGE_LEDGER_EXPENSE", // create expense entries directly (admin)
  CREATE_SPEND_REQUEST: "CREATE_SPEND_REQUEST",
  APPROVE_SPEND_REQUESTS: "APPROVE_SPEND_REQUESTS",
  VIEW_PAYROLL: "VIEW_PAYROLL",
  MANAGE_PAYROLL: "MANAGE_PAYROLL",
  APPROVE_PAYROLL: "APPROVE_PAYROLL",
  VIEW_SUBSCRIPTIONS: "VIEW_SUBSCRIPTIONS",
  MANAGE_SUBSCRIPTIONS: "MANAGE_SUBSCRIPTIONS",
  VIEW_INVOICES: "VIEW_INVOICES",
  MANAGE_INVOICES: "MANAGE_INVOICES",
  VIEW_ARCHIVE: "VIEW_ARCHIVE",

  // Partners.
  VIEW_PARTNERS: "VIEW_PARTNERS",
  MANAGE_PARTNERS: "MANAGE_PARTNERS",
  MANAGE_DISTRIBUTIONS: "MANAGE_DISTRIBUTIONS",

  // Careers (recruiting — job postings + candidate applications).
  VIEW_CAREERS: "VIEW_CAREERS",
  MANAGE_CAREERS: "MANAGE_CAREERS",

  // Administration.
  MANAGE_USERS: "MANAGE_USERS",
  MANAGE_SETTINGS: "MANAGE_SETTINGS",
  MANAGE_BRANDING: "MANAGE_BRANDING",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS);

const P = PERMISSIONS;

/** Default permission set per role (see followup-spec §2). ADMIN = full catalog. */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: ALL_PERMISSIONS,
  ACCOUNTANT: [
    P.VIEW_DASHBOARD,
    P.VIEW_FINANCE,
    P.MANAGE_LEDGER,
    P.CREATE_SPEND_REQUEST,
    P.VIEW_PAYROLL,
    P.MANAGE_PAYROLL,
    P.VIEW_SUBSCRIPTIONS,
    P.MANAGE_SUBSCRIPTIONS,
    P.VIEW_INVOICES,
    P.MANAGE_INVOICES,
    P.VIEW_ARCHIVE,
    P.VIEW_REPORTS,
    P.MANAGE_REPORTS,
    P.VIEW_LEAVES,
    P.VIEW_LEAVES_ALL,
    P.REQUEST_LEAVE,
  ],
  EMPLOYEE: [
    P.VIEW_DASHBOARD,
    P.VIEW_PIPELINE,
    P.MANAGE_PIPELINE,
    // Website requests sit with the pipeline: the same people who work leads
    // are the ones who answer the site's "request a demo".
    P.VIEW_WEBSITE_REQUESTS,
    P.MANAGE_WEBSITE_REQUESTS,
    P.VIEW_PROJECTS,
    P.VIEW_SUPPORT,
    P.MANAGE_SUPPORT,
    P.VIEW_REPORTS,
    P.MANAGE_REPORTS,
    P.VIEW_LEAVES,
    P.REQUEST_LEAVE,
  ],
  DEVELOPER: [
    P.VIEW_DASHBOARD,
    P.VIEW_PROJECTS,
    P.VIEW_REPORTS,
    P.MANAGE_REPORTS,
    P.VIEW_LEAVES,
    P.REQUEST_LEAVE,
  ],
  DESIGNER: [
    P.VIEW_DASHBOARD,
    P.VIEW_PROJECTS,
    P.VIEW_REPORTS,
    P.MANAGE_REPORTS,
    P.VIEW_LEAVES,
    P.REQUEST_LEAVE,
  ],
  SYSADMIN: [
    P.VIEW_DASHBOARD,
    P.VIEW_PROJECTS,
    P.VIEW_SERVERS,
    P.MANAGE_SERVERS,
    P.VIEW_REPORTS,
    P.MANAGE_REPORTS,
    P.VIEW_LEAVES,
    P.REQUEST_LEAVE,
  ],
};

/**
 * Effective permissions for a user: their role defaults ∪ any per-user override
 * grants. Unknown roles fall back to an empty set (deny-by-default).
 */
export function resolvePermissions(
  role: Role | string | null | undefined,
  overrides?: string[] | null,
): string[] {
  const base = role && role in ROLE_PERMISSIONS ? ROLE_PERMISSIONS[role as Role] : [];
  return Array.from(new Set([...base, ...(overrides ?? [])]));
}

/* ────────────────────────────── can() predicate ─────────────────────────── */

/** Does the current user hold this permission code? */
export type Can = (code: string) => boolean;

/**
 * Build a `Can` from a permission list. `undefined` (profile not loaded yet) is
 * treated as deny so the sidebar doesn't flash items the user may not have.
 */
export function makeCan(permissions: string[] | undefined): Can {
  const set = new Set(permissions ?? []);
  return (code: string) => set.has(code);
}

/* ─────────────────────────── Sidebar config types ────────────────────────── */

export interface SidebarItem {
  id: string;
  /** English fallback label. */
  title: string;
  /** i18n key under the `nav` namespace (resolved in the rendering component). */
  i18nKey?: string;
  icon?: LucideIcon;
  href?: string;
  children?: SidebarItem[];
  /** Permission code(s) gating this item. Array = ALL required (AND). A leaf with
   *  no permission is "basic" and always visible. */
  permission?: string | string[];
  /** Inverse gate: hide when the caller HOLDS this token. Checked first. */
  hideWhen?: string;
  /** Live attention badge key rendered by the sidebar (e.g. pending approvals). */
  badge?: string;
}

export interface SidebarGroup {
  id: string;
  label?: string;
  i18nKey?: string;
  items: SidebarItem[];
}

export interface SidebarConfig {
  logo?: { icon: React.ReactNode; text: React.ReactNode };
  groups: SidebarGroup[];
}

function hasPermission(permission: string | string[], can: Can): boolean {
  return Array.isArray(permission)
    ? permission.every((code) => can(code))
    : can(permission);
}

function filterItem(item: SidebarItem, can: Can): SidebarItem | null {
  if (item.hideWhen && can(item.hideWhen)) return null;
  if (item.permission && !hasPermission(item.permission, can)) return null;

  if (item.children && item.children.length > 0) {
    const children = item.children
      .map((child) => filterItem(child, can))
      .filter((c): c is SidebarItem => c !== null);
    if (children.length === 0) return null;
    return { ...item, children };
  }
  return item;
}

/** Prune the sidebar config to only what the caller can reach. Pure. */
export function filterSidebarConfig(
  config: SidebarConfig,
  can: Can,
): SidebarConfig {
  const groups = config.groups
    .map((group) => ({
      ...group,
      items: group.items
        .map((item) => filterItem(item, can))
        .filter((i): i is SidebarItem => i !== null),
    }))
    .filter((group) => group.items.length > 0);
  return { ...config, groups };
}
