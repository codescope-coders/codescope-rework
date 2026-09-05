/**
 * Module-local bilingual strings for "Website requests" (طلبات الموقع).
 *
 * Status and kind labels live HERE rather than in `lib/dashboard/labels.ts`
 * even though that file is where DB-enum labels normally sit: this phase is
 * additive-only against the existing dashboard, and a module-local dict is the
 * convention that lets a new module ship without editing a shared file every
 * other module reads. If a second module ever renders these same enums, promote
 * them to `labels.ts` then.
 */
export const websiteRequestsDict = {
  en: {
    title: "Website requests",
    subtitle:
      "Every request the public site produced — demo requests from /get-started and messages from /contact.",
    empty: "No requests yet. They appear here the moment someone submits the site's form.",
    emptyFiltered: "No requests in this status.",
    newRequests: "New requests",
    // Status filter tabs + badges.
    statusNEW: "New",
    statusCONTACTED: "Contacted",
    statusCONVERTED: "Converted",
    statusCLOSED: "Closed",
    // Kinds.
    kindPACKAGE: "Package request",
    kindCONTACT: "Contact message",
    notSure: "Not sure yet",
    // Table headers.
    hDate: "Received",
    hPackage: "Package",
    hWho: "Name",
    hContact: "Contact",
    hLang: "Language",
    hMessage: "Message",
    hStatus: "Status",
    // Detail modal.
    detailTitle: "Request",
    fName: "Name",
    fAgency: "Agency",
    fEmail: "Email",
    fPhone: "Phone",
    fPackage: "Package",
    fLanguage: "Language",
    fReceived: "Received",
    fMessage: "Message",
    fStatus: "Status",
    fNote: "Internal note",
    notePh: "Only staff see this — what was agreed, who is following up.",
    langEn: "English",
    langAr: "Arabic",
    noAgency: "—",
    replyHint: "Reply in the language they wrote in.",
  },
  ar: {
    title: "طلبات الموقع",
    subtitle:
      "كل طلب وصل من الموقع — طلبات العرض التجريبي من /get-started ورسائل صفحة التواصل.",
    empty: "لا توجد طلبات بعد. ستظهر هنا فور إرسال أي زائر للنموذج.",
    emptyFiltered: "لا توجد طلبات بهذه الحالة.",
    newRequests: "طلبات جديدة",
    statusNEW: "جديد",
    statusCONTACTED: "تم التواصل",
    statusCONVERTED: "تحوّل إلى عميل",
    statusCLOSED: "مغلق",
    kindPACKAGE: "طلب باقة",
    kindCONTACT: "رسالة تواصل",
    notSure: "غير محدّد",
    hDate: "تاريخ الوصول",
    hPackage: "الباقة",
    hWho: "الاسم",
    hContact: "وسيلة التواصل",
    hLang: "اللغة",
    hMessage: "الرسالة",
    hStatus: "الحالة",
    detailTitle: "الطلب",
    fName: "الاسم",
    fAgency: "الوكالة",
    fEmail: "البريد الإلكتروني",
    fPhone: "رقم الهاتف",
    fPackage: "الباقة",
    fLanguage: "اللغة",
    fReceived: "تاريخ الوصول",
    fMessage: "الرسالة",
    fStatus: "الحالة",
    fNote: "ملاحظة داخلية",
    notePh: "يراها الفريق فقط — ما تم الاتفاق عليه ومن يتابع.",
    langEn: "الإنجليزية",
    langAr: "العربية",
    noAgency: "—",
    replyHint: "ردّ باللغة التي كتب بها.",
  },
};
