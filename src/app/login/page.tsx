"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShowcase } from "@/components/AuthShowcase";
import { AuthBackdrop } from "@/components/AuthBackdrop";
import { ErrorNote, PasswordField, Spinner, TextField } from "@/components/AuthFields";
import { OtpCodeForm, type OtpRequestResult } from "@/components/OtpCodeForm";
import { requestLoginOtp, verifyLoginOtp } from "@/lib/loginOtp";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [failures, setFailures] = useState(0);

  const [step, setStep] = useState<"password" | "code">("password");
  const [creds, setCreds] = useState({ email: "", password: "" });
  const [otpInfo, setOtpInfo] = useState<OtpRequestResult>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const result = await requestLoginOtp(email, password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error || "Invalid email or password");
      setFailures((n) => n + 1);
      return;
    }
    setCreds({ email, password });
    setOtpInfo(result);
    setStep("code");
  }

  async function onVerify(code: string) {
    const message = await verifyLoginOtp(creds.email, creds.password, code);
    if (message) {
      setFailures((n) => n + 1);
      return message;
    }
    router.push("/shop");
    router.refresh();
    return null;
  }

  return (
    <>
    <AuthBackdrop />
    <main className="mx-auto grid min-h-screen w-[min(1120px,calc(100%-2rem))] items-stretch gap-5 py-6 lg:grid-cols-[1.1fr_0.9fr]">
      <AuthShowcase
        title="Good books deserve a second reader."
        subtitle="Sign in to browse the shelves, keep your cart and check out securely."
      />

      {step === "code" ? (
        <div className={`panel auth-form flex flex-col justify-center p-8 sm:p-10 ${failures ? (failures % 2 ? "shake-a" : "shake-b") : ""}`}>
          <OtpCodeForm
            title="Check your email"
            description="Enter the 6-digit code to finish signing in."
            sentTo={otpInfo.sentTo}
            devCode={otpInfo.devCode}
            submitLabel="Verify and sign in"
            busyLabel="Verifying..."
            onVerify={onVerify}
            onResend={() => requestLoginOtp(creds.email, creds.password)}
            onBack={() => { setStep("password"); setError(""); }}
            backLabel="Use a different account"
          />
        </div>
      ) : (
        <form onSubmit={onSubmit} className={`panel auth-form flex flex-col justify-center p-8 sm:p-10 ${failures ? (failures % 2 ? "shake-a" : "shake-b") : ""} ${busy ? "is-busy" : ""}`}>
          <span className="form-progress" aria-hidden="true" />
          <h2 className="font-display text-3xl">Sign in</h2>
          <p className="mt-2 text-ink-soft">Enter your email and password. We&apos;ll email you a 6-digit code to finish signing in.</p>
          <div className="mt-6 grid gap-4">
            <TextField label="Email" name="email" type="email" kind="mail" placeholder="you@gmail.com" autoComplete="email" />
            <PasswordField autoComplete="current-password" />
            <ErrorNote message={error} />
            <button className="btn-primary h-12 text-base" type="submit" disabled={busy}>
              {busy ? (<><Spinner />Sending code...</>) : "Continue"}
            </button>
          </div>
          <p className="mt-6 text-sm text-ink-soft">
            New here?{" "}
            <Link href="/register" className="font-semibold text-forest underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </form>
      )}
    </main>
    </>
  );
}
