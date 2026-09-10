"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { CONSENT_KEY, readAnalyticsConsent, saveAnalyticsConsent, startPublicAnalytics, stopPublicAnalytics, trackPublicPage, trackDemoClick, revokeAnalyticsConsent } from "@/lib/public-analytics";
import { isPublicPath, unlocalizedPath } from "@/lib/site-urls";

function subscribeConsent(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("codescope-consent-change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("codescope-consent-change", onChange);
  };
}
/** Mounted only in the marketing layout; absent entirely without deployment configuration. */
export function PublicAnalytics({ measurementId, debug = false }: { measurementId: string; debug?: boolean }) {
  const pathname = usePathname();
  const ar = useLocale() === "ar";
  const storedConsent = useSyncExternalStore(subscribeConsent, readAnalyticsConsent, () => null);
  const ready = useSyncExternalStore(subscribeConsent, () => true, () => false);
  const [sessionChoice, setSessionChoice] = useState<"granted" | "denied" | null>(null);
  const consent = sessionChoice ?? storedConsent;
  const [settings, setSettings] = useState(false);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== CONSENT_KEY) return;
      const next = readAnalyticsConsent();
      if (next !== "granted") revokeAnalyticsConsent();
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    if (consent !== "granted" || !isPublicPath(pathname)) { stopPublicAnalytics(); return; }
    startPublicAnalytics(measurementId, debug);
    trackPublicPage();
    function onClick(event: MouseEvent) {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element)?.closest?.("a[href]");
      if (!anchor) return;
      const url = new URL(anchor.getAttribute("href")!, window.location.href);
      if (url.origin === window.location.origin && unlocalizedPath(url.pathname) === "/get-started") trackDemoClick();
    }
    document.addEventListener("click", onClick);
    return () => { document.removeEventListener("click", onClick); stopPublicAnalytics(); };
  }, [consent, pathname, measurementId, debug]);
  function choose(value: "granted" | "denied") {
    saveAnalyticsConsent(value);
    setSettings(false);
    setSessionChoice(value);
    if (value === "denied" && consent === "granted") revokeAnalyticsConsent();
  }
  if (!ready) return null;
  const button = "min-h-11 rounded-lg border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-cs-teal";
  return <>
    <div className="px-6 pb-5 text-center">
      <button className="min-h-11 text-sm text-zinc-400 underline underline-offset-4" onClick={() => setSettings(true)}>
        {ar ? "إعدادات الخصوصية" : "Privacy settings"}
      </button>
    </div>
    {(consent === null || settings) && <section aria-label={ar ? "خيارات التحليلات" : "Analytics choices"} className="fixed bottom-3 start-3 end-3 z-[100] mx-auto max-w-xl rounded-2xl border border-white/15 bg-zinc-950 p-4 shadow-xl sm:bottom-6 sm:p-5">
      <h2 className="text-base font-semibold text-white">{ar ? "هل تسمح بملفات تعريف الارتباط للتحليلات؟" : "Allow analytics cookies?"}</h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-300">
        {ar ? "نستخدم Google Analytics لفهم زيارات الصفحات وطلبات التواصل الناجحة. لا نرسل محتوى النماذج أو معلومات التواصل. التحليلات اختيارية، ويمكنك تغيير قرارك من إعدادات الخصوصية." : "We use Google Analytics to understand page visits and successful enquiries. We do not send form contents or contact details. Analytics is optional; change your choice in Privacy settings."}
        {" "}<a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{ar ? "كيف تستخدم Google البيانات" : "How Google uses data"}</a>
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button className={button} onClick={() => choose("denied")}>{ar ? "رفض التحليلات" : "Reject analytics"}</button>
        <button className={button} onClick={() => choose("granted")}>{ar ? "السماح بالتحليلات" : "Allow analytics"}</button>
      </div>
    </section>}
  </>;
}
