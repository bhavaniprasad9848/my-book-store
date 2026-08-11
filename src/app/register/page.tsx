"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
      return;
    }
    router.push("/shop");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen w-[min(560px,calc(100%-2rem))] items-center py-10">
      <form onSubmit={onSubmit} className="panel w-full p-8">
        <h1 className="font-display text-3xl">Create account</h1>
        <p className="mt-2 text-ink-soft">Register to buy books from the house collection.</p>
        <div className="mt-5 grid gap-3">
          <label className="grid gap-1 text-sm">
            Full name
            <input className="input" name="name" required />
          </label>
          <label className="grid gap-1 text-sm">
            Email / Gmail
            <input className="input" name="email" type="email" required />
          </label>
          <label className="grid gap-1 text-sm">
            Password
            <input className="input" name="password" type="password" minLength={6} required />
          </label>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? "Creating..." : "Create account"}
          </button>
        </div>
        <p className="mt-4 text-sm text-ink-soft">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-forest underline">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}
