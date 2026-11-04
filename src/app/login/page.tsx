"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AuthShowcase } from "@/components/AuthShowcase";
import { AuthBackdrop } from "@/components/AuthBackdrop";
import { ErrorNote, PasswordField, Spinner, TextField } from "@/components/AuthFields";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [failures, setFailures] = useState(0);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
      redirect: false,
    });
    setBusy(false);
    if (result?.error) {
      setError("Invalid email or password");
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
        title="Good books deserve a second reader."
        subtitle="Sign in to browse the shelves, keep your cart and check out securely."
      />

      <form onSubmit={onSubmit} className={`panel auth-form flex flex-col justify-center p-8 sm:p-10 ${failures ? (failures % 2 ? "shake-a" : "shake-b") : ""} ${busy ? "is-busy" : ""}`}>
        <span className="form-progress" aria-hidden="true" />
        <h2 className="font-display text-3xl">Sign in</h2>
        <p className="mt-2 text-ink-soft">Use the email and password you registered with.</p>
        <div className="mt-6 grid gap-4">
          <TextField label="Email" name="email" type="email" kind="mail" placeholder="you@gmail.com" autoComplete="email" />
          <PasswordField autoComplete="current-password" />
          <ErrorNote message={error} />
          <button className="btn-primary h-12 text-base" type="submit" disabled={busy}>
            {busy ? (<><Spinner />Signing in...</>) : "Sign in"}
          </button>
        </div>
        <p className="mt-6 text-sm text-ink-soft">
          New here?{" "}
          <Link href="/register" className="font-semibold text-forest underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </form>
    </main>
    </>
  );
}
