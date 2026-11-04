"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AuthShowcase } from "@/components/AuthShowcase";
import { AuthBackdrop } from "@/components/AuthBackdrop";
import { ErrorNote, PasswordField, Spinner, TextField } from "@/components/AuthFields";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [failures, setFailures] = useState(0);

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

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setBusy(false);
      setError(data.error || "Registration failed");
      setFailures((n) => n + 1);
      return;
    }

    const login = await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });
    setBusy(false);
    if (login?.error) {
      setError("Account created, but login failed. Try signing in.");
      setFailures((n) => n + 1);
      return;
    }
    router.push("/shop");
    router.refresh();
  }

  return (
    <>
    <AuthBackdrop />
    <main className="mx-auto grid min-h-screen w-[min(1120px,calc(100%-2rem))] items-stretch gap-5 py-6 lg:grid-cols-[1.1fr_0.9fr]">
      <AuthShowcase
        title="Start your own shelf."
        subtitle="A free account keeps your cart, lets you check out securely and sends a receipt by email."
      />

      <form onSubmit={onSubmit} className={`panel auth-form flex flex-col justify-center p-8 sm:p-10 ${failures ? (failures % 2 ? "shake-a" : "shake-b") : ""} ${busy ? "is-busy" : ""}`}>
        <span className="form-progress" aria-hidden="true" />
        <h1 className="font-display text-3xl">Create an account</h1>
        <p className="mt-2 text-ink-soft">It takes less than a minute.</p>
        <div className="mt-6 grid gap-4">
          <TextField label="Full name" name="name" kind="user" placeholder="Your name" autoComplete="name" />
          <TextField label="Email / Gmail" name="email" type="email" kind="mail" placeholder="you@gmail.com" autoComplete="email" />
          <PasswordField autoComplete="new-password" showStrength />
          <ErrorNote message={error} />
          <button className="btn-primary h-12 text-base" type="submit" disabled={busy}>
            {busy ? (<><Spinner />Creating account...</>) : "Create account"}
          </button>
        </div>
        <p className="mt-6 text-sm text-ink-soft">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-forest underline underline-offset-4">
            Login
          </Link>
        </p>
      </form>
    </main>
    </>
  );
}
