import "server-only";
import sgMail from "@sendgrid/mail";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
// The verified sender — shared with tourscope-platform-api, so it's already
// verified on the `codescope.dev` domain in SendGrid.
const EMAIL_FROM = process.env.EMAIL_FROM ?? "noreply@codescope.dev";
const FROM_NAME = "Codescope";

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

interface SendOtpEmailArgs {
  to: string;
  code: string;
  /** Minutes until the code expires — shown in the email body. */
  expiresInMinutes: number;
}

/**
 * Deliver a 6-digit sign-in code via SendGrid. When `SENDGRID_API_KEY` is absent
 * (local dev without email set up) we DON'T fail the login flow — we log the
 * code to the server console so the OTP can still be tested end-to-end.
 */
export async function sendOtpEmail({
  to,
  code,
  expiresInMinutes,
}: SendOtpEmailArgs) {
  if (!SENDGRID_API_KEY) {
    // In production, refuse to "succeed" silently without delivering a code (that
    // would let login proceed while the user never receives anything). Only the
    // local dev fallback logs the code to the console.
    if (process.env.NODE_ENV === "production") {
      throw new Error("Email is not configured (SENDGRID_API_KEY missing).");
    }
    // eslint-disable-next-line no-console
    console.warn(
      `[email] SENDGRID_API_KEY not set — dev fallback. OTP for ${to}: ${code} (expires in ${expiresInMinutes}m)`,
    );
    return;
  }

  try {
    await sgMail.send({
      to,
      from: { email: EMAIL_FROM, name: FROM_NAME },
      subject: `Your Codescope sign-in code: ${code}`,
      text: `Your Codescope sign-in code is ${code}. It expires in ${expiresInMinutes} minutes. If you didn't request this, you can ignore this email.`,
      html: otpEmailHtml(code, expiresInMinutes),
    });
  } catch (error: unknown) {
    const detail =
      (error as { response?: { body?: unknown } })?.response?.body ??
      (error as { message?: string })?.message ??
      error;
    // eslint-disable-next-line no-console
    console.error("[email] SendGrid send failed:", detail);
    throw new Error("Failed to send sign-in email.");
  }
}

function otpEmailHtml(code: string, expiresInMinutes: number) {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#e4e4e4;font-family:Arial,Helvetica,sans-serif;color:#1b1b1b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:440px;background:#ffffff;border-radius:16px;padding:40px 32px;">
            <tr><td style="font-size:20px;font-weight:700;color:#08baa8;padding-bottom:8px;">Codescope</td></tr>
            <tr><td style="font-size:15px;line-height:1.5;padding-bottom:24px;">Use this code to sign in to your Codescope console.</td></tr>
            <tr><td align="center" style="font-size:34px;font-weight:700;letter-spacing:10px;padding:18px 0;background:#f4f4f5;border-radius:12px;">${code}</td></tr>
            <tr><td style="font-size:13px;color:#86868b;padding-top:24px;">This code expires in ${expiresInMinutes} minutes. If you didn't request it, you can safely ignore this email.</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
