"use client";

import { useDict } from "./useDict";

/**
 * Central bilingual labels for every DB enum value + roles/packages/currencies.
 * Modules read `const L = useLabels()` and render `L.pipelineStage[value]` etc.
 * Kept in one place so a status reads identically across the whole dashboard.
 */
type Map = Record<string, string>;

interface LabelSet {
  role: Map;
  pipelineStage: Map;
  projectStage: Map;
  serverStatus: Map;
  leaveType: Map;
  leaveStatus: Map;
  ticketStatus: Map;
  ticketPriority: Map;
  ledgerType: Map;
  requestStatus: Map;
  sheetStatus: Map;
  subscriptionStatus: Map;
  invoiceStatus: Map;
  packageTier: Map;
  billingCycle: Map;
  currency: Map;
  actions: Map;
}

const en: LabelSet = {
  role: {
    ADMIN: "Admin",
    ACCOUNTANT: "Accountant",
    EMPLOYEE: "Sales & Support",
    DEVELOPER: "Developer",
    DESIGNER: "UX Designer",
    SYSADMIN: "Sysadmin",
  },
  pipelineStage: {
    INITIAL_CONTACT: "Initial contact",
    PROPOSAL: "Proposal",
    NEGOTIATION: "Negotiation",
    SIGNED: "Signed",
    REJECTED: "Rejected",
  },
  projectStage: {
    DOMAIN: "Domain reservation",
    BRAND_DESIGN: "Brand design",
    BRAND_READY: "Brand ready (PDF)",
    BRAND_APPROVAL: "Awaiting brand approval",
    DEV_HANDOFF: "Handoff to dev",
    DEVELOPMENT: "System & apps development",
    DELIVERY: "Delivery & deploy",
  },
  serverStatus: { ACTIVE: "Active", MAINTENANCE: "Maintenance", DOWN: "Down" },
  leaveType: {
    REGULAR: "Regular",
    SICK: "Sick",
    EMERGENCY: "Emergency",
    UNPAID: "Unpaid",
  },
  leaveStatus: {
    PENDING: "Pending review",
    APPROVED: "Approved",
    REJECTED: "Rejected",
  },
  ticketStatus: {
    OPEN: "Open",
    IN_PROGRESS: "In progress",
    RESOLVED: "Resolved",
  },
  ticketPriority: { LOW: "Low", MEDIUM: "Medium", HIGH: "High" },
  ledgerType: { INCOME: "Income", EXPENSE: "Expense" },
  requestStatus: {
    PENDING: "Pending review",
    PAID: "Paid",
    REJECTED: "Rejected",
  },
  sheetStatus: {
    PENDING: "Pending review",
    PAID: "Paid",
    REJECTED: "Rejected",
  },
  subscriptionStatus: {
    ACTIVE: "Active",
    PENDING_ACTIVATION: "Pending activation",
    STOPPED: "Stopped",
  },
  invoiceStatus: {
    PAID: "Paid in full",
    PARTIAL: "Partially paid",
    UNPAID: "Unpaid",
  },
  packageTier: {
    CHARTER: "Charter",
    STANDARD: "Standard package",
    ADVANCED: "Advanced package",
  },
  billingCycle: { MONTHLY: "Monthly", YEARLY: "Yearly" },
  currency: { IQD: "Iraqi Dinar", USD: "US Dollar" },
  actions: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    close: "Close",
    confirm: "Confirm",
    print: "Print / Save PDF",
    exportPdf: "Export PDF",
    none: "—",
    all: "All",
    back: "Back",
    approve: "Approve",
    reject: "Reject",
  },
};

const ar: LabelSet = {
  role: {
    ADMIN: "الإدارة",
    ACCOUNTANT: "محاسب",
    EMPLOYEE: "دعم ومبيعات",
    DEVELOPER: "مبرمج",
    DESIGNER: "مصمم تجربة مستخدم",
    SYSADMIN: "مسؤول سيرفرات",
  },
  pipelineStage: {
    INITIAL_CONTACT: "تواصل أولي",
    PROPOSAL: "عرض تقديمي",
    NEGOTIATION: "تفاوض",
    SIGNED: "عقد موقّع",
    REJECTED: "مرفوض",
  },
  projectStage: {
    DOMAIN: "حجز الدومين",
    BRAND_DESIGN: "تصميم البراند",
    BRAND_READY: "براند جاهز (PDF)",
    BRAND_APPROVAL: "بانتظار موافقة البراند",
    DEV_HANDOFF: "تحويل للبرمجة",
    DEVELOPMENT: "برمجة النظام والتطبيقات",
    DELIVERY: "التسليم والرفع على السيرفر",
  },
  serverStatus: { ACTIVE: "نشط", MAINTENANCE: "صيانة", DOWN: "متوقف" },
  leaveType: {
    REGULAR: "اعتيادية",
    SICK: "مرضية",
    EMERGENCY: "طارئة",
    UNPAID: "بدون راتب",
  },
  leaveStatus: {
    PENDING: "قيد المراجعة",
    APPROVED: "موافق عليها",
    REJECTED: "مرفوضة",
  },
  ticketStatus: {
    OPEN: "مفتوحة",
    IN_PROGRESS: "قيد المعالجة",
    RESOLVED: "محلولة",
  },
  ticketPriority: { LOW: "منخفضة", MEDIUM: "متوسطة", HIGH: "عالية" },
  ledgerType: { INCOME: "وارد", EXPENSE: "صادر" },
  requestStatus: {
    PENDING: "قيد المراجعة",
    PAID: "تم الصرف",
    REJECTED: "مرفوض",
  },
  sheetStatus: {
    PENDING: "قيد المراجعة",
    PAID: "تم الصرف",
    REJECTED: "مرفوض",
  },
  subscriptionStatus: {
    ACTIVE: "نشط",
    PENDING_ACTIVATION: "بانتظار التفعيل",
    STOPPED: "متوقف",
  },
  invoiceStatus: {
    PAID: "مدفوعة بالكامل",
    PARTIAL: "مدفوعة جزئياً",
    UNPAID: "غير مدفوعة",
  },
  packageTier: {
    CHARTER: "چارتر",
    STANDARD: "الباقة القياسية",
    ADVANCED: "الباقة المتقدمة",
  },
  billingCycle: { MONTHLY: "شهري", YEARLY: "سنوي" },
  currency: { IQD: "دينار عراقي", USD: "دولار أمريكي" },
  actions: {
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    add: "إضافة",
    close: "إغلاق",
    confirm: "تأكيد",
    print: "طباعة / حفظ PDF",
    exportPdf: "تصدير PDF",
    none: "—",
    all: "الكل",
    back: "رجوع",
    approve: "موافقة",
    reject: "رفض",
  },
};

export const LABELS = { en, ar };

export function useLabels(): LabelSet {
  return useDict(LABELS);
}
