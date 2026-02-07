import { NextResponse } from "next/server";
import { verifyJWT } from "./jwt";

export const authGuard = async (request: Request) => {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.substring(7);

  if (!token) {
    console.log("No token provided");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await verifyJWT(token);
    return token;
  } catch (error) {
    console.log("Token verification failed:", error);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
};
