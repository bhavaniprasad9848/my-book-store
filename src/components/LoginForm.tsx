"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { SignedInNotice } from "@/components/SignedInNotice";
import { AuthShowcase } from "@/components/AuthShowcase";
import { AuthBackdrop } from "@/components/AuthBackdrop";
import { ErrorNote, PasswordField, Spinner, TextField } from "@/components/AuthFields";
import { OtpCodeForm, type OtpRequestResult } from "@/components/OtpCodeForm";
import { requestLoginOtp, verifyLoginOtp, type LoginPortal } from "@/lib/loginOtp";

const COPY = {
  customer: {
    heroTitle: "Good books deserve a second reader.",
    heroSubtitle: "Sign in to browse the shelves, keep your cart and check out securely.",
    badge: "Customer",
    title: "Sign in",
    intro: "Enter your email and password. We'll email you a 6-digit code to finish signing in.",
    codeHint: "Enter the 6-digit code to finish signing in.",
    after: "/shop",
  },
  seller: {
    heroTitle: "Give your books a second reader.",
    heroSubtitle: "Seller sign-in to list your books, watch your stock and see what you've earned.",
    badge: "Seller",
    title: "Seller sign in",
    intro: "For sellers who list books on My Book Store. After your password, we'll email a 6-digit code.",
    codeHint: "Enter the 6-digit code to open your seller dashboard.",
    after: "/seller",
  },
  admin: {
    heroTitle: "Run the whole store from one place.",
    heroSubtitle: "Admin sign-in for every book, seller, category and customer order.",
    badge: "Admin",
    title: "Admin sign in",
    intro: "For the store admin only. After your password, we'll email a 6-digit code to confirm it's you.",
    codeHint: "Enter the 6-digit code to open the admin dashboard.",
    after: "/admin",
  },
} as const;

const linkCls = "font-semibold text-forest underline underline-offset-4";

function PortalLinks({ portal }: { portal: LoginPortal }) {
  if (portal === "customer") {
    return (
      <div className="mt-6 grid gap-2 text-sm text-ink-soft">
        <p>
          New here?{" "}
          <Link href="/register" className={linkCls}>Create an account</Link>
        </p>
        <p className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/seller/login" className="underline underline-offset-4">Sell your books? Seller sign in</Link>
          <Link href="/admin/login" className="underline underline-offset-4">Admin</Link>
        </p>
      </div>
    );
  }
  if (portal === "seller") {
    return (
      <div className="mt-6 grid gap-2 text-sm text-ink-soft">
        <p>
          New seller?{" "}
          <Link href="/seller/register" className={linkCls}>Create a seller account</Link>
        </p>
        <p>
          Here to buy?{" "}
          <Link href="/login" className="underline underline-offset-4">Customer sign in</Link>
        </p>
      </div>
    );
  }
  return (
    <p className="mt-6 text-sm text-ink-soft">
      Not the admin?{" "}
      <Link href="/login" className={linkCls}>Customer sign in</Link>
      {" · "}
      <Link href="/seller/login" className="underline underline-offset-4">Seller sign in</Link>
    </p>
  );
}

export function LoginForm({ portal }: { portal: LoginPortal }) {
  const copy = COPY[portal];
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [failures, setFailures] = useState(0);
  const [step, setStep] = useState<"password" | "code">("password");
  const [creds, setCreds] = useState({ email: "", password: "" });
  const [otpInfo, setOtpInfo] = useState<OtpRequestResult>({});
  const shake = failures ? (failures % 2 ? "shake-a" : "shake-b") : "";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const result = await requestLoginOtp(email, password, portal);
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
    const message = await verifyLoginOtp(creds.email, creds.password, code, portal);
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
          <div className={`panel auth-form flex flex-col justify-center p-8 sm:p-10 ${shake}`}>
            <OtpCodeForm
              title="Check your email"
              description={copy.codeHint}
              sentTo={otpInfo.sentTo}
              devCode={otpInfo.devCode}
              submitLabel="Verify and sign in"
              busyLabel="Verifying..."
              onVerify={onVerify}
              onResend={() => requestLoginOtp(creds.email, creds.password, portal)}
              onBack={() => { setStep("password"); setError(""); }}
              backLabel="Use a different account"
            />
          </div>
        ) : (
          <form onSubmit={onSubmit} className={`panel auth-form flex flex-col justify-center p-8 sm:p-10 ${shake} ${busy ? "is-busy" : ""}`}>
            <span className="form-progress" aria-hidden="true" />
            <SignedInNotice />
            <span
              className={`mb-3 inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                portal === "admin" ? "bg-ink text-white" : portal === "seller" ? "bg-forest text-white" : "bg-black/5 text-ink-soft"
              }`}
            >
              {copy.badge}
            </span>
            <h2 className="font-display text-3xl">{copy.title}</h2>
            <p className="mt-2 text-ink-soft">{copy.intro}</p>
            <div className="mt-6 grid gap-4">
              <TextField label="Email" name="email" type="email" kind="mail" placeholder="you@gmail.com" autoComplete="email" />
              <PasswordField autoComplete="current-password" />
              <ErrorNote message={error} />
              <button className="btn-primary h-12 text-base" type="submit" disabled={busy}>
                {busy ? (<><Spinner />Sending code...</>) : "Continue"}
              </button>
            </div>
            <PortalLinks portal={portal} />
          </form>
        )}
      </main>
    </>
  );
}
