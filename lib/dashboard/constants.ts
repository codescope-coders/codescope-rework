/**
 * Enum value orders + semantic tones for the Follow-up dashboard. Labels come
 * from i18n (namespace `dash.enums.*`); this file only owns ordering, Kanban
 * flow, and each value's status TONE (mapped to theme tokens by StatusBadge).
 */

export type Tone =
  | "neutral"
  | "primary"
  | "teal"
  | "success"
  | "warning"
  | "info"
  | "danger";

export const CURRENCIES = ["IQD", "USD"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const PACKAGE_TIERS = ["CHARTER", "STANDARD", "ADVANCED"] as const;
export const PACKAGE_TONE: Record<string, Tone> = {
  CHARTER: "neutral",
  STANDARD: "teal",
  ADVANCED: "primary",
};

export const BILLING_CYCLES = ["MONTHLY", "YEARLY"] as const;

/* ── Sales pipeline ───────────────────────────────────────────────────────── */
export const PIPELINE_STAGES = [
  "INITIAL_CONTACT",
  "PROPOSAL",
  "NEGOTIATION",
  "SIGNED",
  "REJECTED",
] as const;
export type PipelineStage = (typeof PIPELINE_STAGES)[number];
/** The forward "won" flow (rejection is off-flow / terminal). */
export const POSITIVE_PIPELINE_FLOW: PipelineStage[] = [
  "INITIAL_CONTACT",
  "PROPOSAL",
  "NEGOTIATION",
  "SIGNED",
];
export const PIPELINE_STAGE_TONE: Record<PipelineStage, Tone> = {
  INITIAL_CONTACT: "neutral",
  PROPOSAL: "teal",
  NEGOTIATION: "primary",
  SIGNED: "success",
  REJECTED: "danger",
};

/* ── Delivery (projects) ──────────────────────────────────────────────────── */
export const PROJECT_STAGES = [
  "DOMAIN",
  "BRAND_DESIGN",
  "BRAND_READY",
  "BRAND_APPROVAL",
  "DEV_HANDOFF",
  "DEVELOPMENT",
  "DELIVERY",
] as const;
export type ProjectStage = (typeof PROJECT_STAGES)[number];
export const PROJECT_STAGE_TONE: Record<ProjectStage, Tone> = {
  DOMAIN: "neutral",
  BRAND_DESIGN: "teal",
  BRAND_READY: "primary",
  BRAND_APPROVAL: "warning",
  DEV_HANDOFF: "info",
  DEVELOPMENT: "primary",
  DELIVERY: "success",
};

/* ── Servers ──────────────────────────────────────────────────────────────── */
export const SERVER_STATUSES = ["ACTIVE", "MAINTENANCE", "DOWN"] as const;
export const SERVER_STATUS_TONE: Record<string, Tone> = {
  ACTIVE: "success",
  MAINTENANCE: "warning",
  DOWN: "danger",
};

/* ── Leaves ───────────────────────────────────────────────────────────────── */
export const LEAVE_TYPES = ["REGULAR", "SICK", "EMERGENCY", "UNPAID"] as const;
export const LEAVE_TYPE_TONE: Record<string, Tone> = {
  REGULAR: "neutral",
  SICK: "info",
  EMERGENCY: "warning",
  UNPAID: "danger",
};
export const LEAVE_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export const LEAVE_STATUS_TONE: Record<string, Tone> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

/* ── Support tickets ──────────────────────────────────────────────────────── */
export const TICKET_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED"] as const;
export const TICKET_STATUS_TONE: Record<string, Tone> = {
  OPEN: "danger",
  IN_PROGRESS: "info",
  RESOLVED: "success",
};
export const TICKET_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;
export const TICKET_PRIORITY_TONE: Record<string, Tone> = {
  LOW: "neutral",
  MEDIUM: "warning",
  HIGH: "danger",
};

/* ── Finance ──────────────────────────────────────────────────────────────── */
export const LEDGER_TYPES = ["INCOME", "EXPENSE"] as const;
export const LEDGER_TYPE_TONE: Record<string, Tone> = {
  INCOME: "success",
  EXPENSE: "danger",
};
export const REQUEST_STATUSES = ["PENDING", "PAID", "REJECTED"] as const;
export const REQUEST_STATUS_TONE: Record<string, Tone> = {
  PENDING: "warning",
  PAID: "success",
  REJECTED: "danger",
};
export const SHEET_STATUSES = ["PENDING", "PAID", "REJECTED"] as const;
export const SHEET_STATUS_TONE = REQUEST_STATUS_TONE;
export const SUBSCRIPTION_STATUSES = [
  "ACTIVE",
  "PENDING_ACTIVATION",
  "STOPPED",
] as const;
export const SUBSCRIPTION_STATUS_TONE: Record<string, Tone> = {
  ACTIVE: "success",
  PENDING_ACTIVATION: "warning",
  STOPPED: "danger",
};
/** Invoice status is computed (not stored). */
export const INVOICE_STATUSES = ["PAID", "PARTIAL", "UNPAID"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
export const INVOICE_STATUS_TONE: Record<InvoiceStatus, Tone> = {
  PAID: "success",
  PARTIAL: "info",
  UNPAID: "danger",
};

export function invoiceStatus(total: number, paid: number): InvoiceStatus {
  const remaining = Number(total || 0) - Number(paid || 0);
  if (remaining <= 0) return "PAID";
  if (Number(paid || 0) > 0) return "PARTIAL";
  return "UNPAID";
}
