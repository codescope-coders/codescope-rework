import type { MetadataRoute } from "next";
import { getPublicJobs } from "@/lib/public-jobs";
import { PUBLIC_PATHS, publicUrl } from "@/lib/site-urls";

export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await getPublicJobs();
  const routes: { path: string; lastModified?: string }[] = [
    ...PUBLIC_PATHS.map(path => ({ path })),
    ...(jobs ?? []).filter(job => job.status === "AVAILABLE").map(job => ({ path: `/jobs/${job.id}`, lastModified: job.updatedAt })),
  ];
  return routes.flatMap(({ path, lastModified }) => ["en", "ar"].map(locale => ({
    url: publicUrl(path, locale), ...(lastModified ? { lastModified } : {}),
    alternates: { languages: { en: publicUrl(path, "en"), ar: publicUrl(path, "ar"), "x-default": publicUrl(path, "en") } },
  })));
}
