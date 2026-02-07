// app/api/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authGuard } from "@/lib/authGuard";
import { GetStats } from "@/services/stats";

export const GET = async (request: NextRequest) => {
  try {
    const authResult = await authGuard(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    return await GetStats();
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      {
        message: "An error occurred while retrieving statistics.",
        payload: null,
      },
      { status: 500 },
    );
  }
};
