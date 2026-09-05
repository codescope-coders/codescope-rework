CREATE TYPE "public"."website_request_kind" AS ENUM('PACKAGE', 'CONTACT');--> statement-breakpoint
CREATE TYPE "public"."website_request_status" AS ENUM('NEW', 'CONTACTED', 'CONVERTED', 'CLOSED');--> statement-breakpoint
CREATE TABLE "package_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" "website_request_kind" DEFAULT 'PACKAGE' NOT NULL,
	"package" "package_tier",
	"name" varchar(255) NOT NULL,
	"agency" varchar(255),
	"email" varchar(320) NOT NULL,
	"phone" varchar(60),
	"message" text NOT NULL,
	"locale" varchar(5) DEFAULT 'en' NOT NULL,
	"status" "website_request_status" DEFAULT 'NEW' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
