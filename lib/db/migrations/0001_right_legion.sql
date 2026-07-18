ALTER TYPE "public"."application_status" ADD VALUE 'INTERVIEWED';--> statement-breakpoint
CREATE TABLE "otp_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"code_hash" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "current_city" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "date_of_birth" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "date_of_birth" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "nationality" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "availability_to_start" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "cv_url" SET NOT NULL;