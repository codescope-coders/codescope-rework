import type { EducationLevel, ExpectedSalary } from "@/services/applications";

/**
 * Public-facing (Arabic) labels for the candidate application form. Kept in a
 * client-safe module — `import type` above erases at compile, so importing these
 * maps never pulls the server-only `services/applications` runtime (db, fs) into
 * a client bundle. The admin dashboard uses its own bilingual dict instead.
 */
export const expectedSalaryLabel: Record<ExpectedSalary, string> = {
  RANGE_400_600: "400 - 600 ألف دينار",
  RANGE_700_900: "700 - 900 ألف دينار",
  RANGE_1000_1500: "1 - 1.5 مليون دينار",
  RANGE_1500_2000: "1.5 - 2 مليون دينار",
  OTHER: "قابل للتفاوض",
};

export const educationLevelLabel: Record<EducationLevel, string> = {
  NO_FORMAL_EDUCATION: "بدون تعليم رسمي",
  PRIMARY: "المرحلة الابتدائية",
  INTERMEDIATE: "المرحلة المتوسطة",
  SECONDARY: "المرحلة الثانوية / الإعدادية",
  DIPLOMA: "دبلوم",
  BACHELORS: "بكالوريوس",
  MASTERS: "ماجستير",
  DOCTORATE: "دكتوراه (PhD)",
  POSTDOCTORATE: "ما بعد الدكتوراه",
  CERTIFICATE: "شهادة",
  PROFESSIONAL_CERTIFICATION: "شهادة مهنية",
};
