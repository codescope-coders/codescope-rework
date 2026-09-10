import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-urls";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard", "/ar/dashboard", "/en/dashboard"] },
    // Login is crawlable so its noindex directive can be read; dashboard still requires auth.
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
