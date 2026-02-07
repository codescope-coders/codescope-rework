import { ApiError } from "next/dist/server/api-utils";
import { NextResponse } from "next/server";

export const handleError = async (error: any) => {
  const status = error instanceof ApiError ? error.statusCode : 500;
  return NextResponse.json({ message: error.message }, { status });
};
