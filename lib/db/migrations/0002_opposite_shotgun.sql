CREATE TYPE "public"."billing_cycle" AS ENUM('MONTHLY', 'YEARLY');--> statement-breakpoint
CREATE TYPE "public"."currency" AS ENUM('IQD', 'USD');--> statement-breakpoint
CREATE TYPE "public"."leave_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."leave_type" AS ENUM('REGULAR', 'SICK', 'EMERGENCY', 'UNPAID');--> statement-breakpoint
CREATE TYPE "public"."ledger_type" AS ENUM('INCOME', 'EXPENSE');--> statement-breakpoint
CREATE TYPE "public"."package_tier" AS ENUM('CHARTER', 'STANDARD', 'ADVANCED');--> statement-breakpoint
CREATE TYPE "public"."pipeline_stage" AS ENUM('INITIAL_CONTACT', 'PROPOSAL', 'NEGOTIATION', 'SIGNED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."project_stage" AS ENUM('DOMAIN', 'BRAND_DESIGN', 'BRAND_READY', 'BRAND_APPROVAL', 'DEV_HANDOFF', 'DEVELOPMENT', 'DELIVERY');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('PENDING', 'PAID', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'ACCOUNTANT', 'EMPLOYEE', 'DEVELOPER', 'DESIGNER', 'SYSADMIN');--> statement-breakpoint
CREATE TYPE "public"."server_status" AS ENUM('ACTIVE', 'MAINTENANCE', 'DOWN');--> statement-breakpoint
CREATE TYPE "public"."sheet_status" AS ENUM('PENDING', 'PAID', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('ACTIVE', 'PENDING_ACTIVATION', 'STOPPED');--> statement-breakpoint
CREATE TYPE "public"."ticket_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED');--> statement-breakpoint
CREATE TABLE "app_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"income_categories" text[] DEFAULT '{}' NOT NULL,
	"expense_categories" text[] DEFAULT '{}' NOT NULL,
	"deduction_reasons" text[] DEFAULT '{}' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "branding" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"tagline" varchar(255),
	"logo_url" text,
	"logo_text" varchar(8),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "distribution_shares" (
	"id" serial PRIMARY KEY NOT NULL,
	"distribution_id" integer NOT NULL,
	"partner_id" integer,
	"name" varchar(255) NOT NULL,
	"percentage" numeric(5, 2) NOT NULL,
	"amount" numeric(14, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "distributions" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"currency" "currency" DEFAULT 'IQD' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" integer NOT NULL,
	"date" date NOT NULL,
	"company" varchar(255) NOT NULL,
	"system_name" varchar(255),
	"phone" varchar(60),
	"address" varchar(500),
	"package" "package_tier" DEFAULT 'STANDARD' NOT NULL,
	"currency" "currency" DEFAULT 'IQD' NOT NULL,
	"total" numeric(14, 2) NOT NULL,
	"paid" numeric(14, 2) DEFAULT '0' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "leaves" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer,
	"type" "leave_type" DEFAULT 'REGULAR' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"reason" text,
	"status" "leave_status" DEFAULT 'PENDING' NOT NULL,
	"decided_by_id" integer,
	"decided_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ledger_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"type" "ledger_type" NOT NULL,
	"category" varchar(255),
	"amount" numeric(14, 2) NOT NULL,
	"currency" "currency" DEFAULT 'IQD' NOT NULL,
	"notes" text,
	"request_id" integer,
	"sheet_id" integer,
	"distribution_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"percentage" numeric(5, 2) DEFAULT '0' NOT NULL,
	"phone" varchar(60),
	"join_date" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll_employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" varchar(255) NOT NULL,
	"position" varchar(255),
	"salary" numeric(14, 2) NOT NULL,
	"currency" "currency" DEFAULT 'IQD' NOT NULL,
	"last_paid" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll_sheet_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"sheet_id" integer NOT NULL,
	"payroll_employee_id" integer,
	"name" varchar(255) NOT NULL,
	"position" varchar(255),
	"salary" numeric(14, 2) NOT NULL,
	"currency" "currency" DEFAULT 'IQD' NOT NULL,
	"deduction" numeric(14, 2) DEFAULT '0' NOT NULL,
	"deduction_reason" varchar(255),
	"bonus" numeric(14, 2) DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll_sheets" (
	"id" serial PRIMARY KEY NOT NULL,
	"month" varchar(7) NOT NULL,
	"date" date NOT NULL,
	"created_by_id" integer,
	"status" "sheet_status" DEFAULT 'PENDING' NOT NULL,
	"decided_by_id" integer,
	"decided_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipeline_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"company" varchar(255) NOT NULL,
	"contact" varchar(255),
	"phone" varchar(60),
	"address" varchar(500),
	"stage" "pipeline_stage" DEFAULT 'INITIAL_CONTACT' NOT NULL,
	"employee_id" integer,
	"package" "package_tier" DEFAULT 'STANDARD' NOT NULL,
	"cycle" "billing_cycle" DEFAULT 'MONTHLY' NOT NULL,
	"next_action" text,
	"next_date" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"company" varchar(255) NOT NULL,
	"system_name" varchar(255),
	"contact" varchar(255),
	"phone" varchar(60),
	"domain" varchar(255),
	"stage" "project_stage" DEFAULT 'DOMAIN' NOT NULL,
	"assigned_to_id" integer,
	"developer_id" integer,
	"designer_id" integer,
	"server_id" integer,
	"brand_file" varchar(500),
	"start_date" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"employee_id" integer,
	"done" text,
	"ongoing" text,
	"blockers" text,
	"plan" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "servers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"provider" varchar(255),
	"ip" varchar(120),
	"specs" varchar(500),
	"sys_admin" varchar(255),
	"status" "server_status" DEFAULT 'ACTIVE' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spend_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"requested_by_id" integer,
	"reason" text,
	"amount" numeric(14, 2) NOT NULL,
	"currency" "currency" DEFAULT 'IQD' NOT NULL,
	"status" "request_status" DEFAULT 'PENDING' NOT NULL,
	"decided_by_id" integer,
	"decided_date" date,
	"payroll_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"company" varchar(255) NOT NULL,
	"system_name" varchar(255),
	"phone" varchar(60),
	"address" varchar(500),
	"package" "package_tier" DEFAULT 'STANDARD' NOT NULL,
	"amount" numeric(14, 2),
	"currency" "currency" DEFAULT 'IQD' NOT NULL,
	"cycle" "billing_cycle" DEFAULT 'MONTHLY' NOT NULL,
	"start_date" date,
	"next_due" date,
	"status" "subscription_status" DEFAULT 'ACTIVE' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"company" varchar(255) NOT NULL,
	"phone" varchar(60),
	"subject" varchar(500) NOT NULL,
	"description" text,
	"priority" "ticket_priority" DEFAULT 'MEDIUM' NOT NULL,
	"status" "ticket_status" DEFAULT 'OPEN' NOT NULL,
	"assigned_to_id" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admins" ALTER COLUMN "password" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "name" varchar(255);--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "role" "user_role" DEFAULT 'ADMIN' NOT NULL;--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "permissions" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "distribution_shares" ADD CONSTRAINT "distribution_shares_distribution_id_distributions_id_fk" FOREIGN KEY ("distribution_id") REFERENCES "public"."distributions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "distribution_shares" ADD CONSTRAINT "distribution_shares_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_employee_id_admins_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_decided_by_id_admins_id_fk" FOREIGN KEY ("decided_by_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_request_id_spend_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."spend_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_sheet_id_payroll_sheets_id_fk" FOREIGN KEY ("sheet_id") REFERENCES "public"."payroll_sheets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_distribution_id_distributions_id_fk" FOREIGN KEY ("distribution_id") REFERENCES "public"."distributions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_employees" ADD CONSTRAINT "payroll_employees_user_id_admins_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_sheet_items" ADD CONSTRAINT "payroll_sheet_items_sheet_id_payroll_sheets_id_fk" FOREIGN KEY ("sheet_id") REFERENCES "public"."payroll_sheets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_sheet_items" ADD CONSTRAINT "payroll_sheet_items_payroll_employee_id_payroll_employees_id_fk" FOREIGN KEY ("payroll_employee_id") REFERENCES "public"."payroll_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_sheets" ADD CONSTRAINT "payroll_sheets_created_by_id_admins_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_sheets" ADD CONSTRAINT "payroll_sheets_decided_by_id_admins_id_fk" FOREIGN KEY ("decided_by_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_leads" ADD CONSTRAINT "pipeline_leads_employee_id_admins_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_assigned_to_id_admins_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_developer_id_admins_id_fk" FOREIGN KEY ("developer_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_designer_id_admins_id_fk" FOREIGN KEY ("designer_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_employee_id_admins_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spend_requests" ADD CONSTRAINT "spend_requests_requested_by_id_admins_id_fk" FOREIGN KEY ("requested_by_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spend_requests" ADD CONSTRAINT "spend_requests_decided_by_id_admins_id_fk" FOREIGN KEY ("decided_by_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spend_requests" ADD CONSTRAINT "spend_requests_payroll_id_payroll_employees_id_fk" FOREIGN KEY ("payroll_id") REFERENCES "public"."payroll_employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assigned_to_id_admins_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE no action;