import type { Metadata } from "next";
import { publicUrl, SITE_URL, type PublicPath } from "@/lib/site-urls";

// Describes existing page content. No search volume, customer or growth claims.
export const PAGE_COPY: Record<PublicPath, { en: [string, string]; ar: [string, string] }> = {
  "/": {
    en: ["CodeScope — Travel software & product engineering", "Meet CodeScope, the team behind Tourscope. Explore white-label travel booking software for agencies and the product engineering that powers it."],
    ar: ["كودسكوب — برمجيات السفر وتطوير المنتجات", "تعرّف على كودسكوب، الفريق وراء تورسكوب. اكتشف منصة حجز سفر بعلامة وكالتك، وخبرتنا في تصميم المنتجات البرمجية وتطويرها."],
  },
  "/tourscope": {
    en: ["Tourscope — White-label travel platform & B2B booking software", "Launch a booking website under your agency’s brand. Manage flights, hotels, suppliers and payments in one Tourscope dashboard. Request a demo."],
    ar: ["تورسكوب — منصة سفر بعلامة بيضاء وبرمجيات حجز B2B", "أطلق موقع حجز بعلامة وكالتك مع تورسكوب. أدر حجوزات الطيران والفنادق والمورّدين والمدفوعات من لوحة واحدة. اطلب عرضًا توضيحيًا."],
  },
  "/pricing": {
    en: ["Tourscope pricing & packages | CodeScope", "Compare Tourscope Charter, Standard and Advanced packages. Review setup, subscription terms and add-ons for your travel agency’s booking platform."],
    ar: ["أسعار تورسكوب وباقات وكالات السفر — كودسكوب", "قارن باقات تورسكوب: تشارتر وستاندرد وأدفانسد. تعرّف على تكاليف الإعداد ومدد الاشتراك والإضافات، واختر ما يناسب منصة الحجز لوكالتك."],
  },
  "/services": {
    en: ["Product engineering behind Tourscope | CodeScope", "Explore how CodeScope builds travel software: booking workflows, system architecture and interface design for agency operations."],
    ar: ["تطوير برمجيات السفر في كودسكوب", "اكتشف كيف تطوّر كودسكوب برمجيات السفر، من مسارات الحجز وبنية الأنظمة إلى تصميم الواجهات التي تدعم عمل وكالات السفر."],
  },
  "/about": {
    en: ["About CodeScope — The team behind Tourscope", "Meet CodeScope, the product engineering company building Tourscope from Iraq. Learn about our team, approach and travel technology experience."],
    ar: ["عن كودسكوب — الفريق وراء تورسكوب", "تعرّف على كودسكوب، شركة تطوير المنتجات البرمجية التي تبني تورسكوب من العراق، وعلى فريقنا وطريقة عملنا وخبرتنا في تقنيات السفر."],
  },
  "/contact": {
    en: ["Contact CodeScope — Product & partnership enquiries", "Contact the CodeScope team about Tourscope, product engineering or partnerships. Send your enquiry or reach us directly by email."],
    ar: ["تواصل مع كودسكوب — استفسارات المنتجات والشراكات", "تواصل مع فريق كودسكوب للاستفسار عن تورسكوب أو تطوير المنتجات البرمجية أو الشراكات. أرسل رسالتك عبر النموذج أو البريد الإلكتروني."],
  },
  "/get-started": {
    en: ["Request a Tourscope demo for your agency | CodeScope", "Tell us about your travel agency and request a Tourscope demo. Discuss booking workflows, packages and the setup your team needs."],
    ar: ["اطلب عرضًا توضيحيًا لتورسكوب — كودسكوب", "أخبرنا عن وكالة السفر الخاصة بك واطلب عرضًا توضيحيًا لتورسكوب. ناقش مسارات الحجز والباقات والإعداد المناسب لاحتياجات فريقك."],
  },
  "/jobs": {
    en: ["Careers at CodeScope — Open roles", "Explore open roles at CodeScope, the team behind Tourscope. Read job requirements and responsibilities, and apply for a role that fits your skills."],
    ar: ["وظائف كودسكوب — فرص العمل المتاحة", "استكشف فرص العمل في كودسكوب، الفريق وراء تورسكوب. اطّلع على متطلبات الوظائف ومسؤولياتها، وقدّم على الفرصة المناسبة لمهاراتك."],
  },
};

export function pageMetadata(path: PublicPath, locale: string): Metadata {
  const [title, description] = PAGE_COPY[path][locale === "ar" ? "ar" : "en"];
  return publicMetadata({ path, locale, title, description });
}

export function publicMetadata({ path, locale, title, description, index = true }: {
  path: string; locale: string; title: string; description: string; index?: boolean;
}): Metadata {
  const url = publicUrl(path, locale);
  // The existing product composite is large enough for sharing cards. The
  // 461×49 footer wordmark is too short for social image requirements.
  const image = {
    url: "/Mockups/platform-devices.png", width: 1742, height: 903,
    alt: locale === "ar" ? "تورسكوب من كودسكوب على الحاسوب والجهاز اللوحي والهاتف" : "Tourscope by CodeScope on desktop, tablet and mobile",
  };
  return {
    metadataBase: new URL(SITE_URL),
    title: { absolute: title }, description,
    alternates: {
      canonical: url,
      languages: index ? { en: publicUrl(path, "en"), ar: publicUrl(path, "ar"), "x-default": publicUrl(path, "en") } : undefined,
    },
    robots: { index, follow: true },
    openGraph: {
      type: "website", siteName: "CodeScope", url, title, description,
      locale: locale === "ar" ? "ar_IQ" : "en_US",
      alternateLocale: locale === "ar" ? "en_US" : "ar_IQ", images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
