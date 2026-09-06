import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";
import { db } from "@/lib/db";
import { packageRequests } from "@/lib/db/schema";
import { verifyTurnstile } from "@/lib/turnstile";

/**
 * The contact form's delivery target, in priority order:
 *
 *   1. SendGrid email to CONTACT_TO_EMAIL (default info@codescope.dev), when
 *      SENDGRID_API_KEY is set. This repo already talks to SendGrid for the
 *      dashboard's sign-in codes, so the sender is verified and there is no new
 *      moving part to operate.
 *   2. CONTACT_WEBHOOK_URL — any endpoint that accepts a JSON POST (Slack
 *      incoming webhook, Zapier/n8n/Make hook, a small mail relay).
 *
 * With neither configured this route answers 503 and the form shows its honest
 * error state ("email us directly at info@codescope.dev") — deliberately NOT a
 * fake success: a demo request that silently vanishes is the most expensive bug
 * this site can have. That is also why a failed SendGrid send falls THROUGH to
 * the webhook rather than returning: two configured channels should mean two
 * chances of the message arriving, not one with a spare nobody tries.
 *
 * The send is written here rather than in `lib/email.ts` because that module
 * exposes exactly one shape (`sendOtpEmail`) and nothing this needs; the
 * SendGrid conventions below — guarded `setApiKey`, the `EMAIL_FROM` default,
 * the `response.body` error detail — are copied from it so the two agree.
 */

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM ?? "noreply@codescope.dev";
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "info@codescope.dev";
const FROM_NAME = "Codescope";

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

/** The submission is rendered into an HTML mail body, so it has to be escaped.
 *  A name of `<img onerror=…>` is otherwise live markup in whoever opens it. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface Submission {
  name: string;
  email: string;
  message: string;
}

/**
 * Also record the message as a `CONTACT` row so it shows up in the dashboard's
 * "Website requests" module beside the package requests — one inbox for
 * everything the site produced.
 *
 * BEST-EFFORT, unlike `/api/package-requests` where the insert is mandatory.
 * The asymmetry is deliberate and is about what each route promised BEFORE the
 * table existed: email was this form's only channel and still is its contract,
 * so a database that is down must not start losing messages that used to
 * arrive. The package form had no channel before the row, so there the row is
 * the thing that must not fail.
 */
async function recordContactRequest({ name, email, message }: Submission, locale: string) {
  try {
    await db.insert(packageRequests).values({
      kind: "CONTACT",
      // No tier and no phone: the contact form asks for neither, and inventing
      // a "not sure" package for a general message would put it in the sales
      // funnel it isn't in.
      package: null,
      name,
      email,
      phone: null,
      message,
      locale,
    });
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("[contact] request row insert failed:", error);
  }
}

async function deliverByEmail({ name, email, message }: Submission) {
  if (!SENDGRID_API_KEY) return false;

  try {
    await sgMail.send({
      to: CONTACT_TO_EMAIL,
      from: { email: EMAIL_FROM, name: FROM_NAME },
      // Replying goes to the person who wrote in, not to the noreply sender.
      replyTo: { email, name },
      subject: `New demo request from ${name}`,
      text: `New demo request from ${name} <${email}>\n\n${message}`,
      html: `<!doctype html>
<html>
  <body style="margin:0;background:#e4e4e4;font-family:Arial,Helvetica,sans-serif;color:#1b1b1b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;padding:40px 32px;">
            <tr><td style="font-size:20px;font-weight:700;color:#08baa8;padding-bottom:8px;">Codescope</td></tr>
            <tr><td style="font-size:15px;line-height:1.5;padding-bottom:24px;">New demo request from codescope.dev/contact.</td></tr>
            <tr><td style="font-size:14px;padding-bottom:6px;"><strong>Name</strong><br>${escapeHtml(name)}</td></tr>
            <tr><td style="font-size:14px;padding-bottom:18px;"><strong>Email</strong><br><a href="mailto:${escapeHtml(email)}" style="color:#08baa8;">${escapeHtml(email)}</a></td></tr>
            <tr><td style="font-size:14px;line-height:1.6;white-space:pre-wrap;background:#f4f4f5;border-radius:12px;padding:18px;">${escapeHtml(message)}</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    });
    return true;
  } catch (error: unknown) {
    const detail =
      (error as { response?: { body?: unknown } })?.response?.body ??
      (error as { message?: string })?.message ??
      error;
    // eslint-disable-next-line no-console
    console.error("[contact] SendGrid send failed:", detail);
    return false;
  }
}

async function deliverByWebhook({ name, email, message }: Submission) {
  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (!webhook) return false;

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        source: "codescope.dev/contact",
        receivedAt: new Date().toISOString(),
        name,
        email,
        message,
        // Slack-compatible fallback rendering for incoming-webhook targets.
        text: `New demo request from ${name} <${email}>\n\n${message}`,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`webhook ${res.status}`);
    return true;
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("[contact] webhook delivery failed:", error);
    return false;
  }
}

export async function POST(request: Request) {
  let body: {
    name?: string;
    email?: string;
    message?: string;
    locale?: string;
    turnstileToken?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Before the row, before the mail, before the webhook — a challenge that runs
  // after any of those has already paid the cost it exists to avoid. Answers
  // `ok: true` untouched when Turnstile is unconfigured or Cloudflare is
  // unreachable (see lib/turnstile.ts), so this line is inert on a deployment
  // that has no keys.
  const captcha = await verifyTurnstile(body.turnstileToken, request);
  if (!captcha.ok) {
    return NextResponse.json(
      { ok: false, error: "captcha_failed" },
      { status: 400 },
    );
  }

  const name = (body.name ?? "").toString().trim().slice(0, 200);
  const email = (body.email ?? "").toString().trim().slice(0, 320);
  const message = (body.message ?? "").toString().trim().slice(0, 5000);
  const locale = (body.locale ?? "").toString().trim() === "ar" ? "ar" : "en";
  if (!name || !email || !message) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Recorded BEFORE the delivery attempt, and before the `not_configured`
  // check, so a valid message is never lost to an email outage or an unset
  // env var. Every status code below is exactly what it was — this route's
  // answer still describes whether the EMAIL got out, because that is what
  // the visitor was promised.
  await recordContactRequest({ name, email, message }, locale);

  const configured = Boolean(SENDGRID_API_KEY || process.env.CONTACT_WEBHOOK_URL);
  if (!configured) {
    return NextResponse.json(
      { ok: false, reason: "not_configured" },
      { status: 503 },
    );
  }

  const submission: Submission = { name, email, message };
  // Both are attempted: a SendGrid outage should not swallow a lead when a
  // webhook is also configured.
  const delivered =
    (await deliverByEmail(submission)) || (await deliverByWebhook(submission));

  return delivered
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ ok: false }, { status: 502 });
}
