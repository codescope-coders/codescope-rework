import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";
import { db } from "@/lib/db";
import { packageRequests } from "@/lib/db/schema";
import { verifyTurnstile } from "@/lib/turnstile";

/**
 * The public `/get-started` form's submission endpoint.
 *
 * ── Why not `POST /api/requests` (as the P7 spec wrote it) ─────────────────
 * `/api/requests` already exists and is the dashboard's SPEND REQUESTS
 * resource, with a `requirePermission(CREATE_SPEND_REQUEST)` POST on it.
 * Hanging a public, unauthenticated POST off that path was not available. This
 * route is named after the table it writes (`package_requests`) and lives in
 * its own file so the public/guarded boundary is structural: nobody can add a
 * blanket guard to the dashboard's `/api/website-requests` and silently take
 * the marketing site's only lead path down with it.
 *
 * ── The row is the source of truth; the email is a courtesy ────────────────
 * Inverted from `app/api/contact/route.ts`, and deliberately: until this route
 * existed, an email WAS the whole record, so a SendGrid outage lost the lead.
 * Here the INSERT is mandatory (a failure is a 500 and the form says so), and
 * the alert to info@codescope.dev is best-effort — a dropped notification costs
 * someone a refresh of the dashboard; a dropped row costs a customer.
 */

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM ?? "noreply@codescope.dev";
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "info@codescope.dev";
const FROM_NAME = "Codescope";

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

const PACKAGES = ["CHARTER", "STANDARD", "ADVANCED"] as const;
type PackageTier = (typeof PACKAGES)[number];

/** Deliberately lenient — an international phone number is not a regex problem
 *  worth solving, and a rejected real customer costs more than a junk row. It
 *  must merely be plausible: only digits and the punctuation numbers are
 *  written with, and enough digits to actually dial. */
const PHONE_SHAPE = /^[0-9+()\-.\s]{7,32}$/;
const MIN_PHONE_DIGITS = 7;

/** Not RFC 5322 — that regex accepts things no mail server does and rejects
 *  things every mail server accepts. This is the same "one @, something either
 *  side, a dot in the domain" test the browser's `type="email"` applies. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_MESSAGE = 4000;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface RequestRow {
  name: string;
  agency: string | null;
  email: string;
  phone: string;
  message: string;
  package: PackageTier | null;
  locale: string;
}

/** Best-effort heads-up so nobody has to poll the dashboard. Never throws. */
async function alertByEmail(row: RequestRow) {
  if (!SENDGRID_API_KEY) return;

  const pkgLabel = row.package
    ? row.package.charAt(0) + row.package.slice(1).toLowerCase()
    : "Not sure yet";

  try {
    await sgMail.send({
      to: CONTACT_TO_EMAIL,
      from: { email: EMAIL_FROM, name: FROM_NAME },
      replyTo: { email: row.email, name: row.name },
      subject: `New package request — ${pkgLabel} (${row.locale})`,
      text: `New package request — ${pkgLabel} (${row.locale})\n\n${row.name}${
        row.agency ? ` · ${row.agency}` : ""
      }\n${row.email}\n${row.phone}\n\n${row.message}`,
      html: `<!doctype html>
<html>
  <body style="margin:0;background:#e4e4e4;font-family:Arial,Helvetica,sans-serif;color:#1b1b1b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;padding:40px 32px;">
            <tr><td style="font-size:20px;font-weight:700;color:#08baa8;padding-bottom:8px;">Codescope</td></tr>
            <tr><td style="font-size:15px;line-height:1.5;padding-bottom:24px;">New package request from codescope.dev/get-started — <strong>${escapeHtml(pkgLabel)}</strong> · ${escapeHtml(row.locale)}</td></tr>
            <tr><td style="font-size:14px;padding-bottom:6px;"><strong>Name</strong><br>${escapeHtml(row.name)}</td></tr>
            ${row.agency ? `<tr><td style="font-size:14px;padding-bottom:6px;"><strong>Agency</strong><br>${escapeHtml(row.agency)}</td></tr>` : ""}
            <tr><td style="font-size:14px;padding-bottom:6px;"><strong>Email</strong><br><a href="mailto:${escapeHtml(row.email)}" style="color:#08baa8;">${escapeHtml(row.email)}</a></td></tr>
            <tr><td style="font-size:14px;padding-bottom:18px;"><strong>Phone</strong><br>${escapeHtml(row.phone)}</td></tr>
            <tr><td style="font-size:14px;line-height:1.6;white-space:pre-wrap;background:#f4f4f5;border-radius:12px;padding:18px;">${escapeHtml(row.message)}</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    });
  } catch (error: unknown) {
    const detail =
      (error as { response?: { body?: unknown } })?.response?.body ??
      (error as { message?: string })?.message ??
      error;
    // eslint-disable-next-line no-console
    console.error("[package-requests] SendGrid alert failed:", detail);
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_body" },
      { status: 400 },
    );
  }

  const str = (v: unknown, max: number) =>
    typeof v === "string" ? v.trim().slice(0, max) : "";

  // The honeypot: a field no human sees and no human fills. Answering 200 and
  // writing nothing is the point — a bot that gets a 400 learns which field
  // gave it away and comes back without it.
  if (str(body.company, 200)) {
    return NextResponse.json({ ok: true });
  }

  // After the honeypot (free, and its fake-200 deception is worth keeping for a
  // bot that also happens to hold a token) and before everything that costs
  // something — the insert and the alert mail. Answers `ok: true` untouched
  // when Turnstile is unconfigured or Cloudflare is unreachable, so this is
  // inert on a deployment with no keys. See lib/turnstile.ts.
  const captcha = await verifyTurnstile(body.turnstileToken, request);
  if (!captcha.ok) {
    return NextResponse.json(
      { ok: false, error: "captcha_failed" },
      { status: 400 },
    );
  }

  const name = str(body.name, 200);
  const agency = str(body.agency, 200);
  const email = str(body.email, 320);
  const phone = str(body.phone, 60);
  const message = str(body.message, MAX_MESSAGE);
  const localeRaw = str(body.locale, 5);
  const locale = localeRaw === "ar" ? "ar" : "en";

  const rawPackage = str(body.package, 20).toUpperCase();
  // "" / "NOT_SURE" both mean the visitor didn't pick one. Anything else that
  // isn't a real tier is a malformed request, not a silent downgrade to null.
  const pkg: PackageTier | null = PACKAGES.includes(rawPackage as PackageTier)
    ? (rawPackage as PackageTier)
    : null;
  const packageValid =
    pkg !== null || rawPackage === "" || rawPackage === "NOT_SURE";

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "required";
  if (!email) fieldErrors.email = "required";
  else if (!EMAIL_SHAPE.test(email)) fieldErrors.email = "invalid";
  // Phone is REQUIRED here (unlike the contact form): a package request is a
  // sales conversation, and email alone has been the slow path every time.
  if (!phone) fieldErrors.phone = "required";
  else if (
    !PHONE_SHAPE.test(phone) ||
    (phone.match(/\d/g) ?? []).length < MIN_PHONE_DIGITS
  )
    fieldErrors.phone = "invalid";
  if (!message) fieldErrors.message = "required";
  if (!packageValid) fieldErrors.package = "invalid";

  if (Object.keys(fieldErrors).length) {
    return NextResponse.json({ ok: false, fieldErrors }, { status: 400 });
  }

  const row: RequestRow = {
    name,
    agency: agency || null,
    email,
    phone,
    message,
    package: pkg,
    locale,
  };

  try {
    await db.insert(packageRequests).values({
      kind: "PACKAGE",
      package: row.package,
      name: row.name,
      agency: row.agency,
      email: row.email,
      phone: row.phone,
      message: row.message,
      locale: row.locale,
    });
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("[package-requests] insert failed:", error);
    // Loud, not a fake success. The form's error state sends the visitor to
    // info@codescope.dev, which is a working channel even when this one isn't.
    return NextResponse.json(
      { ok: false, error: "storage_unavailable" },
      { status: 500 },
    );
  }

  await alertByEmail(row);

  return NextResponse.json({ ok: true }, { status: 201 });
}
