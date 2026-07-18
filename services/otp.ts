import "server-only";
import { randomInt } from "crypto";
import { and, eq, isNull, lt, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { admins, otpCodes } from "@/lib/db/schema";
import { sendOtpEmail } from "@/lib/email";
import { ApiError } from "@/lib/errors/api-error";
import { generateJWT } from "@/lib/jwt";

const CODE_LENGTH = 6;
const EXPIRY_SECONDS = 10 * 60; // code lifetime
const COOLDOWN_SECONDS = 30; // min seconds between (re)sends for one email
const MAX_ATTEMPTS = 5; // wrong guesses allowed per code

const normalizeEmail = (email: string) => email.trim().toLowerCase();

/** Only pre-seeded admins may receive a code. */
async function findAdminByEmail(email: string) {
  return db.query.admins.findFirst({
    where: (a, { eq }) => eq(a.email, email),
  });
}

/**
 * Issue and email a fresh 6-digit code for a known admin email. Gated on the
 * `admins` table (no code is ever sent to an unknown email), rate-limited by a
 * per-email cooldown, and supersedes any earlier code for that email. Returns a
 * NextResponse carrying `{ email, expiresIn, cooldown }` for the client timers.
 */
export const sendOtp = async (rawEmail: string) => {
  const email = normalizeEmail(rawEmail);

  const admin = await findAdminByEmail(email);
  if (!admin || !admin.active) {
    throw new ApiError(
      "This email doesn't have console access.",
      403,
      "NO_CONSOLE_ACCESS",
    );
  }

  // Cooldown: reject a resend that arrives before the previous one cools down.
  const latest = await db.query.otpCodes.findFirst({
    where: (c, { eq }) => eq(c.email, email),
    orderBy: (c, { desc }) => desc(c.createdAt),
  });
  if (latest) {
    const elapsed = (Date.now() - latest.createdAt.getTime()) / 1000;
    if (elapsed < COOLDOWN_SECONDS) {
      throw new ApiError(
        "Please wait before requesting another code.",
        429,
        "OTP_RATE_LIMITED",
      );
    }
  }

  // Only the newest code is ever valid — clear prior codes for this email.
  await db.delete(otpCodes).where(eq(otpCodes.email, email));

  const code = String(randomInt(0, 10 ** CODE_LENGTH)).padStart(
    CODE_LENGTH,
    "0",
  );
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + EXPIRY_SECONDS * 1000);

  await db.insert(otpCodes).values({ email, codeHash, expiresAt });

  await sendOtpEmail({ to: email, code, expiresInMinutes: EXPIRY_SECONDS / 60 });

  return NextResponse.json({
    message: "Verification code sent.",
    payload: {
      email,
      expiresIn: EXPIRY_SECONDS,
      cooldown: COOLDOWN_SECONDS,
    },
  });
};

/**
 * Verify a submitted code against the newest unconsumed code for the email. On
 * success: consume the code, mint the same JWT + `token` cookie the app already
 * uses, and return `{ email }`. Every failure throws an ApiError with a code the
 * client maps to localized copy.
 */
export const verifyOtp = async (rawEmail: string, rawCode: string) => {
  const email = normalizeEmail(rawEmail);
  const code = rawCode.trim();

  const record = await db.query.otpCodes.findFirst({
    where: (c, { eq, and, isNull }) =>
      and(eq(c.email, email), isNull(c.consumedAt)),
    orderBy: (c, { desc }) => desc(c.createdAt),
  });

  if (!record) {
    throw new ApiError("Invalid or expired code.", 401, "INVALID_OTP");
  }

  if (record.expiresAt.getTime() < Date.now()) {
    await db.delete(otpCodes).where(eq(otpCodes.id, record.id));
    throw new ApiError("This code has expired.", 401, "OTP_EXPIRED");
  }

  // Atomically CLAIM one attempt slot BEFORE the (slow) bcrypt compare. This is
  // the brute-force rail: the single conditional UPDATE increments only while
  // `attempts < MAX_ATTEMPTS` and the row is unconsumed, so N concurrent verifies
  // each consume a distinct slot — the cap holds regardless of concurrency (no
  // TOCTOU on a stale in-memory `attempts`).
  const [claimed] = await db
    .update(otpCodes)
    .set({ attempts: sql`${otpCodes.attempts} + 1` })
    .where(
      and(
        eq(otpCodes.id, record.id),
        isNull(otpCodes.consumedAt),
        lt(otpCodes.attempts, MAX_ATTEMPTS),
      ),
    )
    .returning({ id: otpCodes.id });

  if (!claimed) {
    // Cap exhausted or the code was already consumed by a racing request.
    throw new ApiError(
      "Too many attempts. Request a new code.",
      429,
      "OTP_TOO_MANY_ATTEMPTS",
    );
  }

  const match = await bcrypt.compare(code, record.codeHash);
  if (!match) {
    // The attempt was already counted by the atomic claim above.
    throw new ApiError("Invalid or expired code.", 401, "INVALID_OTP");
  }

  // Re-check the admin still exists and is active (defense in depth).
  const admin = await findAdminByEmail(email);
  if (!admin || !admin.active) {
    await db.delete(otpCodes).where(eq(otpCodes.id, record.id));
    throw new ApiError(
      "This email doesn't have console access.",
      403,
      "NO_CONSOLE_ACCESS",
    );
  }

  // Atomically consume — only the FIRST successful verify claims the code, so two
  // correct guesses racing can't both mint a session.
  const [consumed] = await db
    .update(otpCodes)
    .set({ consumedAt: new Date() })
    .where(and(eq(otpCodes.id, record.id), isNull(otpCodes.consumedAt)))
    .returning({ id: otpCodes.id });

  if (!consumed) {
    throw new ApiError("Invalid or expired code.", 401, "INVALID_OTP");
  }

  // Stamp identity + role into the session. Effective permissions are resolved
  // from the role by the API guards and re-read fresh by /api/auth/me for the UI.
  const token = await generateJWT({
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });

  (await cookies()).set("token", token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({
    message: "Logged in successfully.",
    payload: { email: admin.email },
  });
};
