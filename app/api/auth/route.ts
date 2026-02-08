import { login } from "@/services/admin";
import { ApiError } from "next/dist/server/api-utils";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  const contentType = req.headers.get("content-type");
  if (!contentType) {
    return NextResponse.json(
      {
        message: "There's no body in your request!",
      },
      { status: 400 },
    );
  }
  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      {
        message: "Expected application/json",
      },
      { status: 400 },
    );
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      let fieldErrors: Record<string, string> = {};

      if (!email) fieldErrors.email = "Email is required.";
      if (!password) fieldErrors.password = "Password is required.";
      return NextResponse.json(
        {
          message: "Invalid params",
          fieldErrors,
        },
        { status: 401 },
      );
    }
    return await login({ email, password });
  } catch (error: any) {
    const status = error instanceof ApiError ? error.statusCode : 500;
    return NextResponse.json(
      {
        message: error.message,
      },
      { status },
    );
  }
};
