"use client";
import { isPublicPath, publicUrl, unlocalizedPath } from "@/lib/site-urls";
import { PAGE_COPY } from "@/lib/site-meta";
import type { PublicPath } from "@/lib/site-urls";

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window { dataLayer?: unknown[]; gtag?: Gtag; }
}
export const CONSENT_KEY = "codescope.analytics-consent.v1";
type Consent = "granted" | "denied";
let activeId: string | undefined;
let initializedId: string | undefined;
let debugMode = false;
let lastPage: string | undefined;
let currentReferrer: string | undefined;
const leadIds = new Set<string>();
const denied = { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" };
function disable(id: string, value: boolean) {
  (window as unknown as Record<string, unknown>)[`ga-disable-${id}`] = value;
}
export function readAnalyticsConsent(): Consent | null {
  try {
    const record = JSON.parse(localStorage.getItem(CONSENT_KEY) ?? "null");
    return record?.expires > Date.now() && ["granted", "denied"].includes(record.value) ? record.value : null;
  } catch { return null; }
}
export function saveAnalyticsConsent(value: Consent) {
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ value, expires: Date.now() + 180 * 86400000 })); } catch { /* Choice still applies to this page. */ }
  window.dispatchEvent(new Event("codescope-consent-change"));
}
function pageContext(pathname = window.location.pathname) {
  const locale = pathname === "/ar" || pathname.startsWith("/ar/") ? "ar" : "en";
  const path = unlocalizedPath(pathname);
  const copy = PAGE_COPY[path as PublicPath] ?? PAGE_COPY["/jobs"];
  return { page_location: publicUrl(path, locale), page_title: copy[locale][0], language: locale };
}
function safeReferrer() {
  try {
    const ref = new URL(document.referrer);
    // External referrer paths, queries and fragments can contain personal data.
    return ref.origin === window.location.origin && isPublicPath(ref.pathname)
      ? pageContext(ref.pathname).page_location : ref.origin;
  } catch { return ""; }
}
export function stopPublicAnalytics() {
  if (activeId) disable(activeId, true);
  activeId = undefined;
  if (!isPublicPath(window.location.pathname)) { lastPage = undefined; currentReferrer = undefined; }
}
export function startPublicAnalytics(id: string, debug: boolean) {
  if (!/^G-[A-Z0-9]+$/.test(id) || !isPublicPath(window.location.pathname)) return;
  activeId = id;
  debugMode = debug;
  disable(id, false);
  if (!initializedId) {
    // No tag request, data queue or analytics cookie exists before opt-in.
    window.dataLayer ??= [];
    // Google’s queue consumes the Arguments object used by its official snippet.
    // eslint-disable-next-line prefer-rest-params
    window.gtag = function () { window.dataLayer!.push(arguments); };
    window.gtag("consent", "default", denied);
    window.gtag("consent", "update", { ...denied, analytics_storage: "granted" });
    window.gtag("js", new Date());
    window.gtag("config", id, {
      send_page_view: false,
      allow_google_signals: false, allow_ad_personalization_signals: false,
      ...pageContext(), page_referrer: safeReferrer(),
      ...(debug ? { debug_mode: true } : {}),
    });
    const script = document.createElement("script");
    script.id = "codescope-ga4";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(script);
    initializedId = id;
  }
}
function send(name: "page_view" | "demo_cta_click" | "generate_lead", params: Record<string, string> = {}) {
  if (!activeId || !isPublicPath(window.location.pathname) || !window.gtag) return false;
  window.gtag("event", name, {
    send_to: activeId, ...pageContext(), page_referrer: currentReferrer ?? safeReferrer(), ...params,
    ...(debugMode ? { debug_mode: true } : {}),
  });
  return true;
}
export function trackPublicPage() {
  const url = pageContext().page_location;
  if (url === lastPage) return;
  const referrer = lastPage ?? safeReferrer();
  if (send("page_view", { page_referrer: referrer })) {
    lastPage = url;
    currentReferrer = referrer;
  }
}
export function trackDemoClick() { send("demo_cta_click", { destination: "/get-started" }); }
/** Called ONLY after the form's API confirms success. The random local token is never sent. */
export function trackSuccessfulLead(type: "contact" | "demo_request", submissionId: string) {
  if (leadIds.has(submissionId)) return;
  leadIds.add(submissionId); // No replay if consent is granted after the submission.
  send("generate_lead", { lead_type: type });
}
export function revokeAnalyticsConsent() {
  stopPublicAnalytics();
  window.gtag?.("consent", "update", denied);
  // Clear GA's first-party cookies for this host and parent-domain variants.
  const parts = window.location.hostname.split(".");
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.trim().split("=")[0];
    if (!/^_ga(?:_|$)/.test(name)) continue;
    document.cookie = `${name}=; Max-Age=0; path=/`;
    for (let i = 0; i < parts.length - 1; i++) {
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.${parts.slice(i).join(".")}`;
    }
  }
  // Unload automatic Google listeners as well as stopping our explicit events.
  window.location.reload();
}
