"use client";

import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationText } from "./notification-format";
import { HeaderMenu } from "./header/header-menu";

export function NotificationBell() {
  const t = useTranslations("dash");
  const tf = (k: string, fb: string) => (t.has(k) ? t(k) : fb);
  const router = useRouter();
  const { data } = useNotifications();
  const items = data?.payload ?? [];
  const fmt = useNotificationText();

  return (
    <HeaderMenu
      width={360}
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-label={tf("common.notifications", "الإشعارات")}
          className={cn(
            "relative flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-foreground",
            open && "bg-neutral-100 text-foreground",
          )}
        >
          <Bell className="size-4.5" />
          {items.length > 0 && (
            <span className="absolute -end-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-destructive-500 px-1 text-[10px] font-bold leading-4 text-white">
              {items.length > 99 ? "99+" : items.length}
            </span>
          )}
        </button>
      )}
    >
      {(close) => (
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b border-border/70 px-3 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              {tf("common.notifications", "الإشعارات")}
            </span>
          </div>
          {items.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-neutral-500">
              <div className="mx-auto mb-3 grid size-10 place-items-center rounded-full bg-neutral-100">
                <Bell className="size-4.5 text-neutral-400" />
              </div>
              <p className="font-medium text-foreground">
                {tf("common.no_notifications", "لا توجد إشعارات حالياً")}
              </p>
            </div>
          ) : (
            <div className="scrollbar-thin max-h-80 overflow-y-auto p-1">
              {items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    router.push(n.href);
                    close();
                  }}
                  className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-start transition-colors hover:bg-neutral-100"
                >
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden />
                  <span className="min-w-0 flex-1 text-[13px] font-medium leading-snug text-foreground">
                    {fmt(n)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </HeaderMenu>
  );
}
