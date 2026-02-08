import { db } from "@/lib/db";
import { admins } from "@/lib/db/schema";
import { ApiError } from "@/lib/errors/api-error";
import { generateJWT } from "@/lib/jwt";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  payload: {
    email: string;
  };
}

export const login = async ({ email, password }: LoginDto) => {
  try {
    let admin = await db.query.admins.findFirst({
      where: (admins, { eq }) => eq(admins.email, email),
    });
    if (!admin) {
      const [createdAdmin] = await db
        .insert(admins)
        .values({
          email,
          password: await bcrypt.hash(password, 10),
        })
        .returning();

      admin = createdAdmin;
    } else {
      const passwordMatch = await bcrypt.compare(password, admin.password);

      if (!passwordMatch) {
        return NextResponse.json(
          {
            fieldErrors: {
              password: "Password is not correct.",
            },
          },
          { status: 401 },
        );
      }
    }
    const token = await generateJWT({
      id: admin.id,
      email: admin.email,
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
      payload: {
        email: admin.email,
      },
    });
  } catch (error: any) {
    throw new ApiError(error, 500);
  }
};
