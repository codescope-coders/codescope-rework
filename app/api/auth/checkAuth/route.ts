import { ApiError } from "@/lib/errors/api-error";
import { verifyJWT } from "@/lib/jwt";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    await verifyJWT(token);
    return NextResponse.json(
      {
        message: "Authorization successful",
      },
      { status: 200 },
    );
  } catch (error: any) {
    const status = error instanceof ApiError ? error.statusCode : 401;
    return NextResponse.json(
      {
        message: error.message,
      },
      { status },
    );
  }
};
