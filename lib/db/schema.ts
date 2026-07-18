import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  pgEnum,
  date,
  numeric,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* ─────────────────────────── Existing (careers) enums ─────────────────────── */

export const applicationStatusEnum = pgEnum("application_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "INTERVIEWED",
]);

export const expectedSalaryEnum = pgEnum("expected_salary", [
  "RANGE_400_600",
  "RANGE_700_900",
  "RANGE_1000_1500",
  "RANGE_1500_2000",
  "OTHER",
]);

export const jobStatusEnum = pgEnum("job_status", ["AVAILABLE", "CLOSED"]);

export const jobTypeEnum = pgEnum("job_type", [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "FREELANCE",
  "INTERNSHIP",
  "TEMPORARY",
]);

export const educationLevelEnum = pgEnum("education_level", [
  "NO_FORMAL_EDUCATION",
  "PRIMARY",
  "INTERMEDIATE",
  "SECONDARY",
  "DIPLOMA",
  "BACHELORS",
  "MASTERS",
  "DOCTORATE",
  "POSTDOCTORATE",
  "CERTIFICATE",
  "PROFESSIONAL_CERTIFICATION",
]);

/* ─────────────────────── Follow-up dashboard: roles ───────────────────────
 * The six console roles from the source. `admins` doubles as the console
 * USERS table (managed from the Users module); OTP login stamps role +
 * effective permissions into the JWT. */
export const roleEnum = pgEnum("user_role", [
  "ADMIN",
  "ACCOUNTANT",
  "EMPLOYEE",
  "DEVELOPER",
  "DESIGNER",
  "SYSADMIN",
]);

/* Console users. Login is email-OTP (no password needed); `password` is kept
 * nullable for backward-compatibility with the seed. `permissions` holds
 * optional per-user grants layered on top of the role defaults. */
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }),
  name: varchar("name", { length: 255 }),
  role: roleEnum("role").default("ADMIN").notNull(),
  permissions: text("permissions").array().default([]).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// One row per issued email OTP. The code itself is stored hashed (bcrypt) —
// never in plaintext. A row is invalidated by setting `consumedAt` (on a
// successful verify) or by being superseded when a newer code is issued for the
// same email. `attempts` caps brute-force guessing per code.
export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  codeHash: varchar("code_hash", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  attempts: integer("attempts").default(0).notNull(),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  position: varchar("position", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  description: text("description"),
  status: jobStatusEnum("status").default("AVAILABLE").notNull(),
  type: jobTypeEnum("type").default("FULL_TIME").notNull(),
  requirements: text("requirements").array().notNull(),
  responsibilities: text("responsibilities").array().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),

  jobId: integer("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),

  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 50 }),
  currentCity: varchar("current_city", { length: 255 }).notNull(),
  nationality: varchar("nationality", { length: 100 }).notNull(),

  date_of_birth: varchar("date_of_birth").notNull(),
  availabilityToStart: varchar("availability_to_start"),

  yearsOfExperience: integer("years_of_experience"),
  lastJobTitle: varchar("last_job_title", { length: 255 }),
  lastCompanyName: varchar("last_company_name", { length: 255 }),

  highestEducationLevel: educationLevelEnum("highest_education_level"),
  fieldOfStudy: varchar("field_of_study", { length: 255 }),
  graduationYear: integer("graduation_year"),

  expectedSalary: expectedSalaryEnum("expected_salary"),

  links: text("links").array().default([]),
  cvUrl: text("cv_url").notNull(),

  status: applicationStatusEnum("status").default("PENDING").notNull(),

  appliedAt: timestamp("applied_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* ══════════════════════════════════════════════════════════════════════════
   FOLLOW-UP DASHBOARD (كودسكوب متابعة) — enums
   ══════════════════════════════════════════════════════════════════════════ */

export const currencyEnum = pgEnum("currency", ["IQD", "USD"]);
export const billingCycleEnum = pgEnum("billing_cycle", ["MONTHLY", "YEARLY"]);
// Package tiers: CHARTER=تشارتر · STANDARD=الباقة القياسية · ADVANCED=الباقة المتقدمة
export const packageTierEnum = pgEnum("package_tier", [
  "CHARTER",
  "STANDARD",
  "ADVANCED",
]);
// Sales pipeline: تواصل أولي · عرض تقديمي · تفاوض · عقد موقع · تم الرفض
export const pipelineStageEnum = pgEnum("pipeline_stage", [
  "INITIAL_CONTACT",
  "PROPOSAL",
  "NEGOTIATION",
  "SIGNED",
  "REJECTED",
]);
// Delivery: حجز الدومين · تصميم البراند · براند جاهز · بانتظار موافقة البراند
//           · تحويل للبرمجة · برمجة النظام · التسليم والرفع
export const projectStageEnum = pgEnum("project_stage", [
  "DOMAIN",
  "BRAND_DESIGN",
  "BRAND_READY",
  "BRAND_APPROVAL",
  "DEV_HANDOFF",
  "DEVELOPMENT",
  "DELIVERY",
]);
export const serverStatusEnum = pgEnum("server_status", [
  "ACTIVE",
  "MAINTENANCE",
  "DOWN",
]);
export const leaveTypeEnum = pgEnum("leave_type", [
  "REGULAR",
  "SICK",
  "EMERGENCY",
  "UNPAID",
]);
export const leaveStatusEnum = pgEnum("leave_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);
export const ticketStatusEnum = pgEnum("ticket_status", [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
]);
export const ticketPriorityEnum = pgEnum("ticket_priority", [
  "LOW",
  "MEDIUM",
  "HIGH",
]);
// Ledger direction: وارد (income) / صادر (expense)
export const ledgerTypeEnum = pgEnum("ledger_type", ["INCOME", "EXPENSE"]);
export const requestStatusEnum = pgEnum("request_status", [
  "PENDING",
  "PAID",
  "REJECTED",
]);
export const sheetStatusEnum = pgEnum("sheet_status", [
  "PENDING",
  "PAID",
  "REJECTED",
]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "ACTIVE",
  "PENDING_ACTIVATION",
  "STOPPED",
]);

/* ══════════════════════════════════════════════════════════════════════════
   FOLLOW-UP DASHBOARD — tables
   ══════════════════════════════════════════════════════════════════════════ */

/* Sales pipeline — one card per prospective tour company. */
export const pipelineLeads = pgTable("pipeline_leads", {
  id: serial("id").primaryKey(),
  company: varchar("company", { length: 255 }).notNull(),
  contact: varchar("contact", { length: 255 }),
  phone: varchar("phone", { length: 60 }),
  address: varchar("address", { length: 500 }),
  stage: pipelineStageEnum("stage").default("INITIAL_CONTACT").notNull(),
  employeeId: integer("employee_id").references(() => admins.id, {
    onDelete: "set null",
  }),
  package: packageTierEnum("package").default("STANDARD").notNull(),
  cycle: billingCycleEnum("cycle").default("MONTHLY").notNull(),
  nextAction: text("next_action"),
  nextDate: date("next_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* Tourscope subscriptions — the signed customers. Auto-created (PENDING_ACTIVATION)
 * when a lead reaches the SIGNED stage. */
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  company: varchar("company", { length: 255 }).notNull(),
  systemName: varchar("system_name", { length: 255 }),
  phone: varchar("phone", { length: 60 }),
  address: varchar("address", { length: 500 }),
  package: packageTierEnum("package").default("STANDARD").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }),
  currency: currencyEnum("currency").default("IQD").notNull(),
  cycle: billingCycleEnum("cycle").default("MONTHLY").notNull(),
  startDate: date("start_date"),
  nextDue: date("next_due"),
  status: subscriptionStatusEnum("status").default("ACTIVE").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* Servers that host customer systems. */
export const servers = pgTable("servers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }),
  ip: varchar("ip", { length: 120 }),
  specs: varchar("specs", { length: 500 }),
  sysAdmin: varchar("sys_admin", { length: 255 }),
  status: serverStatusEnum("status").default("ACTIVE").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* Delivery pipeline — one card per signed project. */
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  company: varchar("company", { length: 255 }).notNull(),
  systemName: varchar("system_name", { length: 255 }),
  contact: varchar("contact", { length: 255 }),
  phone: varchar("phone", { length: 60 }),
  domain: varchar("domain", { length: 255 }),
  stage: projectStageEnum("stage").default("DOMAIN").notNull(),
  assignedToId: integer("assigned_to_id").references(() => admins.id, {
    onDelete: "set null",
  }),
  developerId: integer("developer_id").references(() => admins.id, {
    onDelete: "set null",
  }),
  designerId: integer("designer_id").references(() => admins.id, {
    onDelete: "set null",
  }),
  serverId: integer("server_id").references(() => servers.id, {
    onDelete: "set null",
  }),
  brandFile: varchar("brand_file", { length: 500 }),
  startDate: date("start_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* Weekly employee reports. */
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  employeeId: integer("employee_id").references(() => admins.id, {
    onDelete: "set null",
  }),
  done: text("done"),
  ongoing: text("ongoing"),
  blockers: text("blockers"),
  plan: text("plan"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* Support tickets for existing customers. */
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 60 }),
  subject: varchar("subject", { length: 500 }).notNull(),
  description: text("description"),
  priority: ticketPriorityEnum("priority").default("MEDIUM").notNull(),
  status: ticketStatusEnum("status").default("OPEN").notNull(),
  assignedToId: integer("assigned_to_id").references(() => admins.id, {
    onDelete: "set null",
  }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* Leave requests + their approval decision. */
export const leaves = pgTable("leaves", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => admins.id, {
    onDelete: "set null",
  }),
  type: leaveTypeEnum("type").default("REGULAR").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  reason: text("reason"),
  status: leaveStatusEnum("status").default("PENDING").notNull(),
  decidedById: integer("decided_by_id").references(() => admins.id, {
    onDelete: "set null",
  }),
  decidedDate: date("decided_date"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* Payroll roster — one row per salaried employee. */
export const payrollEmployees = pgTable("payroll_employees", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => admins.id, {
    onDelete: "set null",
  }),
  name: varchar("name", { length: 255 }).notNull(),
  position: varchar("position", { length: 255 }),
  salary: numeric("salary", { precision: 14, scale: 2 }).notNull(),
  currency: currencyEnum("currency").default("IQD").notNull(),
  lastPaid: date("last_paid"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* Payroll monthly sheets + their line items. */
export const payrollSheets = pgTable("payroll_sheets", {
  id: serial("id").primaryKey(),
  month: varchar("month", { length: 7 }).notNull(), // YYYY-MM
  date: date("date").notNull(),
  createdById: integer("created_by_id").references(() => admins.id, {
    onDelete: "set null",
  }),
  status: sheetStatusEnum("status").default("PENDING").notNull(),
  decidedById: integer("decided_by_id").references(() => admins.id, {
    onDelete: "set null",
  }),
  decidedDate: date("decided_date"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const payrollSheetItems = pgTable("payroll_sheet_items", {
  id: serial("id").primaryKey(),
  sheetId: integer("sheet_id")
    .notNull()
    .references(() => payrollSheets.id, { onDelete: "cascade" }),
  payrollEmployeeId: integer("payroll_employee_id").references(
    () => payrollEmployees.id,
    { onDelete: "set null" },
  ),
  name: varchar("name", { length: 255 }).notNull(),
  position: varchar("position", { length: 255 }),
  salary: numeric("salary", { precision: 14, scale: 2 }).notNull(),
  currency: currencyEnum("currency").default("IQD").notNull(),
  deduction: numeric("deduction", { precision: 14, scale: 2 })
    .default("0")
    .notNull(),
  deductionReason: varchar("deduction_reason", { length: 255 }),
  bonus: numeric("bonus", { precision: 14, scale: 2 }).default("0").notNull(),
});

/* Partners + profit distributions. */
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  percentage: numeric("percentage", { precision: 5, scale: 2 })
    .default("0")
    .notNull(),
  phone: varchar("phone", { length: 60 }),
  joinDate: date("join_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const distributions = pgTable("distributions", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  currency: currencyEnum("currency").default("IQD").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const distributionShares = pgTable("distribution_shares", {
  id: serial("id").primaryKey(),
  distributionId: integer("distribution_id")
    .notNull()
    .references(() => distributions.id, { onDelete: "cascade" }),
  partnerId: integer("partner_id").references(() => partners.id, {
    onDelete: "set null",
  }),
  name: varchar("name", { length: 255 }).notNull(),
  percentage: numeric("percentage", { precision: 5, scale: 2 }).notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
});

/* Spend requests — require admin approval; approval posts an EXPENSE to the ledger. */
export const spendRequests = pgTable("spend_requests", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  requestedById: integer("requested_by_id").references(() => admins.id, {
    onDelete: "set null",
  }),
  reason: text("reason"),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  currency: currencyEnum("currency").default("IQD").notNull(),
  status: requestStatusEnum("status").default("PENDING").notNull(),
  decidedById: integer("decided_by_id").references(() => admins.id, {
    onDelete: "set null",
  }),
  decidedDate: date("decided_date"),
  payrollId: integer("payroll_id").references(() => payrollEmployees.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* The financial ledger — income (وارد) and expense (صادر). Rows carrying a
 * source id (requestId / sheetId / distributionId) are system-managed and are
 * read-only in the ledger UI. */
export const ledgerEntries = pgTable("ledger_entries", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  type: ledgerTypeEnum("type").notNull(),
  category: varchar("category", { length: 255 }),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  currency: currencyEnum("currency").default("IQD").notNull(),
  notes: text("notes"),
  requestId: integer("request_id").references(() => spendRequests.id, {
    onDelete: "set null",
  }),
  sheetId: integer("sheet_id").references(() => payrollSheets.id, {
    onDelete: "set null",
  }),
  distributionId: integer("distribution_id").references(
    () => distributions.id,
    { onDelete: "set null" },
  ),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* Invoices — number auto-increments from 1001 (computed in the service). */
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull().unique(),
  date: date("date").notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  systemName: varchar("system_name", { length: 255 }),
  phone: varchar("phone", { length: 60 }),
  address: varchar("address", { length: 500 }),
  package: packageTierEnum("package").default("STANDARD").notNull(),
  currency: currencyEnum("currency").default("IQD").notNull(),
  total: numeric("total", { precision: 14, scale: 2 }).notNull(),
  paid: numeric("paid", { precision: 14, scale: 2 }).default("0").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* Singleton settings (id = 1): editable finance category lists. */
export const appSettings = pgTable("app_settings", {
  id: serial("id").primaryKey(),
  incomeCategories: text("income_categories").array().default([]).notNull(),
  expenseCategories: text("expense_categories").array().default([]).notNull(),
  deductionReasons: text("deduction_reasons").array().default([]).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* Singleton branding (id = 1). */
export const branding = pgTable("branding", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  tagline: varchar("tagline", { length: 255 }),
  logoUrl: text("logo_url"),
  logoText: varchar("logo_text", { length: 8 }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* ─────────────────────────────── Relations ────────────────────────────────
 * Only the parent/child collections that the services read with `with:`. User
 * name lookups are done with explicit leftJoins in the services. */

export const jobRelations = relations(jobs, ({ many }) => ({
  applications: many(applications),
}));

export const applicationRelations = relations(applications, ({ one }) => ({
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
}));

export const payrollSheetRelations = relations(payrollSheets, ({ many }) => ({
  items: many(payrollSheetItems),
}));

export const payrollSheetItemRelations = relations(
  payrollSheetItems,
  ({ one }) => ({
    sheet: one(payrollSheets, {
      fields: [payrollSheetItems.sheetId],
      references: [payrollSheets.id],
    }),
  }),
);

export const distributionRelations = relations(distributions, ({ many }) => ({
  shares: many(distributionShares),
}));

export const distributionShareRelations = relations(
  distributionShares,
  ({ one }) => ({
    distribution: one(distributions, {
      fields: [distributionShares.distributionId],
      references: [distributions.id],
    }),
  }),
);
