import { sendOtp } from "@/services/otp";
import { ApiError } from "@/lib/errors/api-error";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  const contentType = req.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return NextResponse.json(
      { message: "Expected application/json" },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const { email } = (body ?? {}) as { email?: unknown };

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "Email is required.", fieldErrors: { email: "Email is required." } },
        { status: 400 },
      );
    }

    return await sendOtp(email);
  } catch (error: any) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message, code: error.code },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
};
