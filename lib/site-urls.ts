/** One source of truth for public canonical URLs, navigation and analytics. */
export const SITE_URL = "https://codescope.dev";
export const PUBLIC_PATHS = ["/", "/tourscope", "/pricing", "/services", "/about", "/contact", "/get-started", "/jobs"] as const;
export type PublicPath = (typeof PUBLIC_PATHS)[number];
export function unlocalizedPath(path: string) {
  return path.replace(/^\/(en|ar)(?=\/|$)/, "") || "/";
}
export function localizedPath(path: string, locale: string) {
  const bare = unlocalizedPath(path);
  return locale === "ar" ? `/ar${bare === "/" ? "" : bare}` : bare;
}
export function publicUrl(path: string, locale: string) {
  return SITE_URL + localizedPath(path, locale);
}
export function isPublicPath(path: string) {
  const bare = unlocalizedPath(path);
  return PUBLIC_PATHS.includes(bare as PublicPath) || /^\/jobs\/[1-9]\d*$/.test(bare);
}
