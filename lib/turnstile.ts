/**
 * Cloudflare Turnstile verification for the site's two public, unauthenticated
 * write surfaces — `/api/contact` and `/api/package-requests`.
 *
 * ── The gate is env, and it fails toward "the form still works" ─────────────
 * Turnstile is enforced only when BOTH halves are configured as this process
 * sees them: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (what renders the widget) and
 * `TURNSTILE_SECRET_KEY` (what verifies its token). With either missing, this
 * module answers `ok` without calling Cloudflare and warns ONCE per process.
 *
 * Requiring both — rather than the secret alone — is the load-bearing choice.
 * The site key is a CLIENT value, so it is baked into the JavaScript bundle at
 * image-build time; the secret is a server value read from the container's
 * environment. Those are two different delivery paths that can be configured
 * independently, and "secret present, site key absent" means every visitor
 * gets a form with no widget, no token, and — under a secret-only rule — a
 * rejection they cannot possibly clear. That is not a hardened form, it is a
 * dead lead path. So a half-configured deployment degrades to exactly today's
 * behaviour (honeypot + validation) and says so in the logs.
 *
 * ── A Cloudflare outage must not take lead capture with it ──────────────────
 * `verifyTurnstile` FAILS OPEN when siteverify is unreachable, non-2xx, or
 * slower than `VERIFY_TIMEOUT_MS` — the request is allowed through with a loud
 * warn. A token Cloudflare actively rejects is a different thing and is
 * refused. The trade is deliberate: an unreachable third party should cost us
 * spam, never a customer who cannot reach us at all.
 */

const SITE_KEY = (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "").trim();
const SECRET_KEY = (process.env.TURNSTILE_SECRET_KEY ?? "").trim();

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Short on purpose: this sits in front of a form submit, and a visitor
 *  waiting on a stalled third party is worse than one wave of unchecked spam
 *  (see the fail-open note above). */
const VERIFY_TIMEOUT_MS = 5_000;

/** Whether this process will actually verify tokens. Both halves or neither. */
export const turnstileEnforced = Boolean(SITE_KEY && SECRET_KEY);

export type TurnstileVerdict = { ok: true } | { ok: false; reason: string };

let warned = false;

/** One line per process, not per submission — a warning printed on every lead
 *  is noise nobody reads, and this state is a deployment fact, not an event. */
function warnDisabledOnce() {
  if (warned) return;
  warned = true;

  const detail = SECRET_KEY
    ? "TURNSTILE_SECRET_KEY is set but NEXT_PUBLIC_TURNSTILE_SITE_KEY is not — " +
      "the widget cannot render, so tokens are not required (see lib/turnstile.ts). " +
      "The site key must be present at IMAGE BUILD TIME, not only at runtime."
    : SITE_KEY
      ? "NEXT_PUBLIC_TURNSTILE_SITE_KEY is set but TURNSTILE_SECRET_KEY is not — " +
        "the widget renders but its token is not verified."
      : "neither NEXT_PUBLIC_TURNSTILE_SITE_KEY nor TURNSTILE_SECRET_KEY is set.";

  // eslint-disable-next-line no-console
  console.warn(`[turnstile] verification DISABLED: ${detail}`);
}

/** Best-effort originating IP. Cloudflare treats `remoteip` as optional extra
 *  evidence, so it is sent only when a proxy actually named one — inventing a
 *  container-internal address would be a claim we cannot stand behind. */
function clientIpFrom(request: Request): string | null {
  const direct =
    request.headers.get("cf-connecting-ip") ?? request.headers.get("x-real-ip");
  if (direct?.trim()) return direct.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first ? first : null;
}

interface SiteverifyResponse {
  success?: boolean;
  "error-codes"?: string[];
}

/**
 * Verify a widget token. Returns `{ ok: true }` whenever the submission should
 * be allowed to proceed — including every disabled and degraded path — so the
 * caller only has to handle an explicit refusal.
 */
export async function verifyTurnstile(
  token: unknown,
  request: Request,
): Promise<TurnstileVerdict> {
  if (!turnstileEnforced) {
    warnDisabledOnce();
    return { ok: true };
  }

  const response = typeof token === "string" ? token.trim() : "";
  if (!response) return { ok: false, reason: "missing_token" };

  const form = new URLSearchParams({ secret: SECRET_KEY, response });
  const ip = clientIpFrom(request);
  if (ip) form.set("remoteip", ip);

  let result: SiteverifyResponse;
  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: form,
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`siteverify ${res.status}`);
    result = (await res.json()) as SiteverifyResponse;
  } catch (error: unknown) {
    // Fail OPEN — see the header comment. Loud, because a persistent version of
    // this means the site is accepting unverified submissions.
    // eslint-disable-next-line no-console
    console.warn(
      "[turnstile] siteverify unreachable — allowing submission unverified:",
      error,
    );
    return { ok: true };
  }

  if (result.success) return { ok: true };

  const codes = result["error-codes"] ?? [];
  // eslint-disable-next-line no-console
  console.warn("[turnstile] token rejected:", codes.join(", ") || "no codes");
  return { ok: false, reason: codes.join(",") || "rejected" };
}
