import { publicUrl, SITE_URL, type PublicPath } from "@/lib/site-urls";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
export function OrganizationData() {
  return <JsonLd data={{
    "@context": "https://schema.org", "@type": "Organization", "@id": `${SITE_URL}/#organization`,
    name: "CodeScope", url: SITE_URL, logo: `${SITE_URL}/Branding/logomark.svg`,
    email: "info@codescope.dev",
  }} />;
}
const labels: Record<PublicPath, [string, string]> = {
  "/": ["Home", "الرئيسية"], "/tourscope": ["Tourscope", "تورسكوب"],
  "/pricing": ["Pricing", "الأسعار"], "/services": ["Engineering", "التطوير"],
  "/about": ["About", "عن كودسكوب"], "/contact": ["Contact", "تواصل معنا"],
  "/get-started": ["Request a demo", "اطلب عرضًا توضيحيًا"], "/jobs": ["Careers", "الوظائف"],
};
export function BreadcrumbData({ path, locale, jobTitle }: { path: string; locale: string; jobTitle?: string }) {
  if (path === "/") return null;
  const language = locale === "ar" ? 1 : 0;
  const items = [{ path: "/", name: labels["/"][language] }];
  if (jobTitle) items.push({ path: "/jobs", name: labels["/jobs"][language] });
  items.push({ path, name: jobTitle ?? labels[path as PublicPath]?.[language] ?? labels["/jobs"][language] });
  return <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: publicUrl(item.path, locale) })),
  }} />;
}
export function TourscopeData({ locale }: { locale: string }) {
  return <JsonLd data={{
    "@context": "https://schema.org", "@type": "SoftwareApplication", "@id": `${SITE_URL}/#tourscope`,
    name: "Tourscope", url: publicUrl("/tourscope", locale), applicationCategory: "BusinessApplication",
    operatingSystem: "Web", inLanguage: locale,
    description: locale === "ar" ? "منصة حجز سفر بعلامة الوكالة لإدارة الحجوزات والمورّدين والمدفوعات." : "A white-label travel booking platform for managing agency bookings, suppliers and payments.",
    screenshot: `${SITE_URL}/Mockups/platform-devices.png`,
    provider: { "@id": `${SITE_URL}/#organization` },
  }} />;
}
