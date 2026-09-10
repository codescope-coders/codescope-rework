import "server-only";
import { cache } from "react";
import { Pool } from "pg";
import type { JobDto } from "@/services/jobs";

// A small, bounded read pool keeps metadata outages away from dashboard writes.
// Only public job columns are selected; applications and applicant data never enter HTML.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2, connectionTimeoutMillis: 2000, statement_timeout: 2000,
  idleTimeoutMillis: 10000, allowExitOnIdle: true,
});
pool.on("error", () => console.error("[public-jobs] idle connection unavailable"));
const columns = `id, position, location, description, status, type, requirements,
  responsibilities, created_at AS "createdAt", updated_at AS "updatedAt"`;
function serialize(row: JobDto): JobDto {
  return { ...row, responsibilities: row.responsibilities ?? [],
    createdAt: new Date(row.createdAt).toISOString(), updatedAt: new Date(row.updatedAt).toISOString() };
}
export const getPublicJobs = cache(async (): Promise<JobDto[] | null> => {
  if (!process.env.DATABASE_URL) return null;
  try {
    const { rows } = await pool.query(`SELECT ${columns} FROM jobs ORDER BY (status = 'AVAILABLE') DESC, created_at DESC`);
    return rows.map(serialize);
  } catch {
    console.error("[public-jobs] list unavailable");
    return null;
  }
});
export const getPublicJob = cache(async (id: string): Promise<{ job: JobDto | null; unavailable: boolean }> => {
  if (!/^[1-9]\d{0,9}$/.test(id) || Number(id) > 2147483647) return { job: null, unavailable: false };
  if (!process.env.DATABASE_URL) return { job: null, unavailable: true };
  try {
    const { rows } = await pool.query(`SELECT ${columns} FROM jobs WHERE id = $1 LIMIT 1`, [id]);
    return { job: rows[0] ? serialize(rows[0]) : null, unavailable: false };
  } catch {
    console.error("[public-jobs] detail unavailable");
    return { job: null, unavailable: true };
  }
});
