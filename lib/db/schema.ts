import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

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

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
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

export const jobRelations = relations(jobs, ({ many }) => ({
  applications: many(applications),
}));

export const applicationRelations = relations(applications, ({ one }) => ({
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
}));
