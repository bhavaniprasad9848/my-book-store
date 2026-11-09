"use client";


import Link from "next/link";
import { FormEvent, useState } from "react";
import { SignedInNotice } from "@/components/SignedInNotice";
import { AuthShowcase } from "@/components/AuthShowcase";
import { AuthBackdrop } from "@/components/AuthBackdrop";
import { ErrorNote, PasswordField, Spinner, TextField } from "@/components/AuthFields";
import { OtpCodeForm, type OtpRequestResult } from "@/components/OtpCodeForm";
import { requestLoginOtp, verifyLoginOtp } from "@/lib/loginOtp";

type Kind = "customer" | "seller";

const COPY = {
  customer: {
    heroTitle: "Start your own shelf.",
    heroSubtitle: "A free account keeps your cart, lets you check out securely and sends a receipt by email.",
    title: "Create an account",
    intro: "It takes less than a minute.",
    button: "Create account",
    after: "/shop",
    login: "/login",
  },
  seller: {
    heroTitle: "Sell the books you've finished.",
    heroSubtitle: "List your books on My Book Store, keep track of your stock and see what you've earned.",
    title: "Create a seller account",
    intro: "Seller accounts can list books. To buy books, use a separate customer account.",
    button: "Create seller account",
    after: "/seller",
    login: "/seller/login",
  },
} as const;

/** Sign-up for customers (/register) and sellers (/seller/register). Both confirm the email with a code. */
export function RegisterForm({ kind }: { kind: Kind }) {
  const copy = COPY[kind];
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [failures, setFailures] = useState(0);
  const [step, setStep] = useState<"details" | "code">("details");
  const [creds, setCreds] = useState({ email: "", password: "" });
  const [otpInfo, setOtpInfo] = useState<OtpRequestResult>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
    };

    let res: Response;
    try {
      res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, accountType: kind }),
      });
    } catch {
      setBusy(false);
      setError("Network error. Please try again.");
      return;
    }
    const data = await res.json().catch(() => ({ error: "Server error. Please try again." }));
    if (!res.ok) {
      setBusy(false);
      setError(data.error || "Registration failed");
      setFailures((n) => n + 1);
      return;
    }

    // Verify the email address with a one-time code before signing in.
    const otp = await requestLoginOtp(payload.email, payload.password, kind);
    setBusy(false);
    if (!otp.ok) {
      setError(`Account created, but we couldn't send a code: ${otp.error}. Try signing in.`);
      setFailures((n) => n + 1);
      return;
    }
    setCreds({ email: payload.email, password: payload.password });
    setOtpInfo(otp);
    setStep("code");
  }

  async function onVerify(code: string) {
    const message = await verifyLoginOtp(creds.email, creds.password, code, kind);
    if (message) {
      setFailures((n) => n + 1);
      return message;
    }
    // Full page load so the whole site starts fresh as the account that just signed in.
    window.location.replace(copy.after);
    return null;
  }

  return (
    <>
    <AuthBackdrop />
    <main className="mx-auto grid min-h-screen w-[min(1120px,calc(100%-2rem))] items-stretch gap-5 py-6 lg:grid-cols-[1.1fr_0.9fr]">
      <AuthShowcase title={copy.heroTitle} subtitle={copy.heroSubtitle} />

      {step === "code" ? (
        <div className={`panel auth-form flex flex-col justify-center p-8 sm:p-10 ${failures ? (failures % 2 ? "shake-a" : "shake-b") : ""}`}>
          <OtpCodeForm
            title="Verify your email"
            description="Your account is ready. Enter the 6-digit code to confirm your email and sign in."
            sentTo={otpInfo.sentTo}
            devCode={otpInfo.devCode}
            submitLabel="Verify and continue"
            busyLabel="Verifying..."
            onVerify={onVerify}
            onResend={() => requestLoginOtp(creds.email, creds.password, kind)}
          />
        </div>
      ) : (
        <form onSubmit={onSubmit} className={`panel auth-form flex flex-col justify-center p-8 sm:p-10 ${failures ? (failures % 2 ? "shake-a" : "shake-b") : ""} ${busy ? "is-busy" : ""}`}>
          <SignedInNotice />
          <span className="form-progress" aria-hidden="true" />
          {kind === "seller" ? (
            <span className="mb-3 inline-flex w-fit items-center rounded-full bg-forest px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
              Seller
            </span>
          ) : null}
          <h1 className="font-display text-3xl">{copy.title}</h1>
          <p className="mt-2 text-ink-soft">{copy.intro}</p>
          <div className="mt-6 grid gap-4">
            <TextField label="Full name" name="name" kind="user" placeholder="Your name" autoComplete="name" />
            <TextField label="Email / Gmail" name="email" type="email" kind="mail" placeholder="you@gmail.com" autoComplete="email" />
            <PasswordField autoComplete="new-password" showStrength />
            <ErrorNote message={error} />
            <button className="btn-primary h-12 text-base" type="submit" disabled={busy}>
              {busy ? (<><Spinner />Creating account...</>) : copy.button}
            </button>
          </div>
          <p className="mt-6 text-sm text-ink-soft">
            Already have an account?{" "}
            <Link href={copy.login} className="font-semibold text-forest underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </main>
    </>
  );
}
