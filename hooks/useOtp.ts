import ApiClient from "@/lib/apiClient";
import { useMutation } from "@tanstack/react-query";

export interface SendOtpResponse {
  message: string;
  payload: {
    email: string;
    expiresIn: number;
    cooldown: number;
  };
}

export interface VerifyOtpResponse {
  message: string;
  payload: {
    email: string;
  };
}

/**
 * Shape thrown by `ApiClient` on failure — it re-throws `err.response.data`, so
 * callers read the server body directly: a localizable `code`, a human message,
 * and optional per-field errors.
 */
export interface OtpError {
  message?: string;
  code?: string;
  fieldErrors?: Record<string, string>;
}

const sendApi = new ApiClient<{ email: string }, SendOtpResponse>(
  "/auth/otp/send",
);
const verifyApi = new ApiClient<
  { email: string; code: string },
  VerifyOtpResponse
>("/auth/otp/verify");

export const useSendOtp = () =>
  useMutation({
    mutationKey: ["otp", "send"],
    mutationFn: (email: string) => sendApi.post({ email }),
  });

export const useVerifyOtp = () =>
  useMutation({
    mutationKey: ["otp", "verify"],
    mutationFn: (vars: { email: string; code: string }) => verifyApi.post(vars),
  });
