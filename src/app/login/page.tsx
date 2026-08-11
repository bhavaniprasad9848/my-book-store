"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
      return;
    }
    router.push("/shop");
    router.refresh();
  }

  return (
    <main className="mx-auto grid min-h-screen w-[min(1120px,calc(100%-2rem))] items-stretch gap-5 py-6 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="relative flex flex-col justify-end overflow-hidden rounded-[28px] bg-gradient-to-br from-[#173b2d] to-[#245c45] p-8 text-[#f6f1e7]">
        <p className="text-xs uppercase tracking-[0.16em] opacity-80">House collection · Online shop</p>
        <h1 className="mt-3 max-w-[10ch] font-display text-5xl font-bold leading-none md:text-6xl">
          MY BOOK STORE
        </h1>
        <p className="mt-4 max-w-[34ch] text-base text-[#f6f1e7]/[86]">
          Real accounts, database inventory, Stripe Checkout, and Gmail receipts.
        </p>
      </section>

      <form onSubmit={onSubmit} className="panel flex flex-col justify-center p-8">
        <h2 className="font-display text-3xl">Customer login</h2>
        <p className="mt-2 text-ink-soft">Sign in with email and password to shop.</p>
        <div className="mt-5 grid gap-3">
          <label className="grid gap-1 text-sm">
            Email
            <input className="input" name="email" type="email" required placeholder="you@gmail.com" />
          </label>
          <label className="grid gap-1 text-sm">
            Password
            <input className="input" name="password" type="password" required minLength={6} />
          </label>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? "Signing in..." : "Enter the bookstore"}
          </button>
        </div>
        <p className="mt-4 text-sm text-ink-soft">
          New here?{" "}
          <Link href="/register" className="font-medium text-forest underline">
            Create an account
          </Link>
        </p>
      </form>
    </main>
  );
}
