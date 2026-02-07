CREATE TYPE "public"."application_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."education_level" AS ENUM('NO_FORMAL_EDUCATION', 'PRIMARY', 'INTERMEDIATE', 'SECONDARY', 'DIPLOMA', 'BACHELORS', 'MASTERS', 'DOCTORATE', 'POSTDOCTORATE', 'CERTIFICATE', 'PROFESSIONAL_CERTIFICATION');--> statement-breakpoint
CREATE TYPE "public"."expected_salary" AS ENUM('RANGE_400_600', 'RANGE_700_900', 'RANGE_1000_1500', 'RANGE_1500_2000', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('AVAILABLE', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."job_type" AS ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP', 'TEMPORARY');--> statement-breakpoint
CREATE TABLE "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone_number" varchar(50),
	"current_city" varchar(255),
	"date_of_birth" timestamp with time zone,
	"nationality" varchar(100),
	"expected_salary" "expected_salary",
	"availability_to_start" timestamp with time zone,
	"years_of_experience" integer,
	"last_job_title" varchar(255),
	"last_company_name" varchar(255),
	"links" text[] DEFAULT '{}',
	"cv_url" text,
	"highest_education_level" "education_level",
	"field_of_study" varchar(255),
	"graduation_year" integer,
	"status" "application_status" DEFAULT 'PENDING' NOT NULL,
	"applied_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"position" varchar(255) NOT NULL,
	"location" varchar(255),
	"description" text,
	"status" "job_status" DEFAULT 'AVAILABLE' NOT NULL,
	"type" "job_type" DEFAULT 'FULL_TIME' NOT NULL,
	"requirements" text[] NOT NULL,
	"responsibilities" text[] DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;