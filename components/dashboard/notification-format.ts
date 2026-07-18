"use client";

import { useLocale } from "next-intl";
import { useDict } from "@/lib/dashboard/useDict";
import { useLabels } from "@/lib/dashboard/labels";
import { fmtMoney, monthLabel } from "@/lib/dashboard/format";
import type { AppNotification } from "@/hooks/useNotifications";

const notifDict = {
  en: {
    pending_request: "Spend request from {by}: {money}",
    pending_sheet: "Payroll sheet for {month} awaiting approval ({count} employees)",
    pending_leave: "Leave request ({type}) from {employee}",
    project_brand: "Project {company} awaiting brand approval",
    partner_pct: "Partners' shares total {pct}% (not 100%) — review",
    sub_overdue: "Subscription {company} overdue by {days} days",
    sub_today: "Subscription {company} due today",
    sub_soon: "Subscription {company} due in {days} days",
    sub_pending: "New subscription {company} awaiting activation",
    lead_overdue: "Follow-up {company} overdue by {days} days",
    lead_today: "Follow-up {company} due today",
    open_ticket: "Open ticket: {company} — {subject}",
    report_reminder: "You haven't sent this week's report",
  },
  ar: {
    pending_request: "طلب صرف من {by}: {money}",
    pending_sheet: "مشف رواتب {month} بانتظار موافقتك ({count} موظف)",
    pending_leave: "طلب إجازة ({type}) من {employee}",
    project_brand: "مشروع {company} بانتظار موافقة العميل على البراند",
    partner_pct: "مجموع نسب الشركاء {pct}% وليس 100% — راجعها",
    sub_overdue: "اشتراك {company} متأخر {days} يوم",
    sub_today: "اشتراك {company} يستحق اليوم",
    sub_soon: "اشتراك {company} يستحق خلال {days} يوم",
    sub_pending: "اشتراك جديد من {company} بانتظار التفعيل",
    lead_overdue: "متابعة {company} متأخرة {days} يوم",
    lead_today: "متابعة {company} اليوم",
    open_ticket: "تذكرة دعم مفتوحة: {company} — {subject}",
    report_reminder: "ما أرسلت تقريرك لهذا الأسبوع",
  },
};

const sub = (tpl: string, map: Record<string, string>) =>
  Object.entries(map).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, v), tpl);

/** Returns a function that turns a structured notification into localized text. */
export function useNotificationText() {
  const locale = useLocale() as "en" | "ar";
  const d = useDict(notifDict);
  const L = useLabels();

  return (n: AppNotification): string => {
    const p = n.params;
    switch (n.kind) {
      case "pending_request":
        return sub(d.pending_request, {
          by: String(p.by),
          money: fmtMoney(p.amount as number, p.currency as "IQD" | "USD", locale),
        });
      case "pending_sheet":
        return sub(d.pending_sheet, {
          month: monthLabel(String(p.month), locale),
          count: String(p.count),
        });
      case "pending_leave":
        return sub(d.pending_leave, {
          type: L.leaveType[String(p.type)] ?? String(p.type),
          employee: String(p.employee),
        });
      case "project_brand":
        return sub(d.project_brand, { company: String(p.company) });
      case "partner_pct":
        return sub(d.partner_pct, { pct: String(p.pct) });
      case "sub_due": {
        const days = Number(p.days);
        const tpl = days < 0 ? d.sub_overdue : days === 0 ? d.sub_today : d.sub_soon;
        return sub(tpl, { company: String(p.company), days: String(Math.abs(days)) });
      }
      case "sub_pending":
        return sub(d.sub_pending, { company: String(p.company) });
      case "lead_due": {
        const days = Number(p.days);
        const tpl = days < 0 ? d.lead_overdue : d.lead_today;
        return sub(tpl, { company: String(p.company), days: String(Math.abs(days)) });
      }
      case "open_ticket":
        return sub(d.open_ticket, {
          company: String(p.company),
          subject: String(p.subject),
        });
      case "report_reminder":
        return d.report_reminder;
      default:
        return "";
    }
  };
}
