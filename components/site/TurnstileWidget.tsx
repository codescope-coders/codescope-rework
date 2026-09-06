"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

/**
 * The Cloudflare Turnstile widget, in managed mode.
 *
 * ── It renders only when there is a site key ────────────────────────────────
 * `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is inlined into this bundle at build time.
 * With no key the component returns `null` and no script is fetched, so a
 * deployment that has not been given one behaves exactly as it did before
 * Turnstile existed — no widget, no reserved space, no token. `turnstileActive`
 * is exported so the forms can gate their own submit button on the same fact
 * rather than re-deriving it (and drifting).
 *
 * ── Explicit render, not the auto `.cf-turnstile` scan ──────────────────────
 * The auto mode reads its options off DOM attributes at script load, which
 * loses every widget mounted afterwards — i.e. every client-side navigation
 * into the contact or get-started page. Rendering explicitly also lets the
 * theme and language come from React rather than being frozen in markup, and
 * gives back a widget id, which is what `turnstile.reset()` needs when the
 * server rejects a token and the visitor deserves a second attempt.
 */

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export const TURNSTILE_SITE_KEY = (
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""
).trim();

/** Build-time constant, so it is identical on server and client — gating a
 *  form's markup on it cannot produce a hydration mismatch. */
export const turnstileActive = TURNSTILE_SITE_KEY.length > 0;

interface TurnstileRenderOptions {
  sitekey: string;
  theme?: "light" | "dark" | "auto";
  language?: string;
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
  "timeout-callback"?: () => void;
}

interface TurnstileApi {
  render: (
    element: HTMLElement,
    options: TurnstileRenderOptions,
  ) => string | undefined;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/** Module-scoped so N mounts across the session share ONE script tag and one
 *  in-flight load. Without this, navigating contact → get-started appends a
 *  second copy of the API and races two initialisations. */
let scriptLoad: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptLoad) return scriptLoad;

  scriptLoad = new Promise<void>((resolve, reject) => {
    // A tag can already be in the document from a previous page in this session
    // even while `scriptLoad` is null (a hard navigation resets the module, the
    // DOM survives a soft one) — adopt it instead of adding a duplicate.
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-turnstile="1"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("turnstile script failed")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = "1";
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("turnstile script failed")),
      { once: true },
    );
    document.head.appendChild(script);
  }).catch((error) => {
    // Let a later mount retry rather than caching the failure forever.
    scriptLoad = null;
    throw error;
  });

  return scriptLoad;
}

/** Cloudflare's own locale list uses a region for Arabic; plain `ar` falls back
 *  to auto-detection, which on an Arabic page served to an English browser
 *  shows the widget in the wrong language. */
function turnstileLanguage(locale: string) {
  return locale === "ar" ? "ar-eg" : "en";
}

interface Props {
  /** Called with the solved token, and with `null` whenever it stops being
   *  valid (expiry, error, or an explicit reset). */
  onToken: (token: string | null) => void;
  /** Change this to force a fresh challenge — the forms bump it when the
   *  server rejects a token, so a single-use token is never re-submitted. */
  resetSignal?: number;
  className?: string;
}

export default function TurnstileWidget({
  onToken,
  resetSignal = 0,
  className,
}: Props) {
  const locale = useLocale();
  // `common`, not the two forms' own namespaces: one widget, one string, no
  // chance of the contact and get-started copies drifting apart.
  const t = useTranslations("common");
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [failed, setFailed] = useState(false);

  // The callback identity changes on every parent render; holding it in a ref
  // keeps it out of the mount effect's deps, which would otherwise tear down
  // and re-render the widget (and drop a solved token) on each keystroke.
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  const language = turnstileLanguage(locale);

  useEffect(() => {
    if (!turnstileActive) return;

    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !window.turnstile) return;
        widgetIdRef.current =
          window.turnstile.render(container, {
            sitekey: TURNSTILE_SITE_KEY,
            theme: "dark",
            language,
            callback: (token) => onTokenRef.current(token),
            "expired-callback": () => onTokenRef.current(null),
            "error-callback": () => onTokenRef.current(null),
            "timeout-callback": () => onTokenRef.current(null),
          }) ?? null;
      })
      .catch(() => {
        if (cancelled) return;
        // The script itself never arrived (blocked, offline). Say so instead of
        // leaving an empty box above a submit button the form has disabled: the
        // server fails open on an unreachable Cloudflare, so the visitor's real
        // recourse is a reload, not a wait.
        setFailed(true);
      });

    return () => {
      cancelled = true;
      const id = widgetIdRef.current;
      widgetIdRef.current = null;
      if (id && window.turnstile) {
        try {
          window.turnstile.remove(id);
        } catch {
          // Already gone (React 18 double-invoke in dev, or a torn-down iframe).
        }
      }
    };
    // `language` is a dep on purpose: switching locale re-renders the widget in
    // the new language, which is the whole reason it is passed explicitly.
  }, [language]);

  useEffect(() => {
    if (!turnstileActive || resetSignal === 0) return;
    const id = widgetIdRef.current;
    if (!id || !window.turnstile) return;
    onTokenRef.current(null);
    try {
      window.turnstile.reset(id);
    } catch {
      // A widget mid-teardown has nothing to reset.
    }
  }, [resetSignal]);

  if (!turnstileActive) return null;

  return (
    <div className={className}>
      {/* `min-h` matches the managed widget's rendered height so the iframe
          arriving does not push the submit button down the page. Reserved only
          on this branch — with no site key the component renders nothing at
          all, and an empty 65px gap would be a hole in the form. */}
      <div ref={containerRef} className="min-h-[65px]" />
      {/* Only reachable when Cloudflare's own script is blocked or offline. The
          server fails open on an unreachable Cloudflare, so the visitor's
          recourse is a reload — saying nothing would leave them staring at a
          disabled button with no explanation. */}
      {failed && (
        <p role="alert" className="mt-2 text-xs text-zinc-400">
          {t("captchaUnavailable")}
        </p>
      )}
    </div>
  );
}
