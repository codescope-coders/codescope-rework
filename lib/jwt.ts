import { jwtVerify, SignJWT } from "jose";

export const generateJWT = async (payload: {}) => {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

  if (!secret) {
    throw new Error("JWT secret is not defined");
  }

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(secret);

  return token;
};

export const verifyJWT = async (token: string) => {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  if (!secret) {
    throw new Error("JWT secret is not defined");
  }
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error: any) {
    if (error.code === "ERR_JWS_INVALID") {
      throw new Error("Invalid token format.");
    }
    if (error.code === "ERR_JWT_EXPIRED") {
      throw new Error("Token expired.");
    }

    throw new Error("Token verification failed.");
  }
};
