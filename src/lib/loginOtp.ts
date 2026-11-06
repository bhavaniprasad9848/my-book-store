"use client";

import { signIn } from "next-auth/react";
import { readOtpResponse, type OtpRequestResult } from "@/components/OtpCodeForm";

/** "customer" = /login, "seller" = /seller/login, "admin" = /admin/login. The server only lets the matching role in. */
export type LoginPortal = "customer" | "seller" | "admin";

/** Step 1: checks the password and role on the server, then emails a sign-in code. */
export async function requestLoginOtp(email: string, password: string, portal: LoginPortal): Promise<OtpRequestResult> {
  try {
    const res = await fetch("/api/otp/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, portal }),
    });
    return await readOtpResponse(res);
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

/** Step 2: signs in with password + code. Returns an error message or null. */
export async function verifyLoginOtp(email: string, password: string, otp: string, portal: LoginPortal) {
  const result = await signIn("credentials", { email, password, otp, portal, redirect: false });
  if (!result?.error) return null;
  if (result.code && result.code !== "credentials") return result.code;
  return "Sign-in failed. Please start again.";
}
