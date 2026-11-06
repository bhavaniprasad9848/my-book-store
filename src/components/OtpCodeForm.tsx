"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ErrorNote, Spinner } from "@/components/AuthFields";

export type OtpRequestResult = { ok?: boolean; sentTo?: string; devCode?: string; error?: string; retryAfter?: number };

/** Turns an /api/otp/* response into the shape the form expects. */
export async function readOtpResponse(res: Response): Promise<OtpRequestResult> {
  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  const data: OtpRequestResult = isJson ? await res.json() : { error: "Please log in again." };
  return res.ok ? { ...data, ok: true } : { ...data, ok: false, error: data.error || "Couldn't send the code" };
}

const COOLDOWN = 45;

export function OtpCodeForm({
  title,
  description,
  sentTo,
  devCode,
  submitLabel,
  busyLabel,
  onVerify,
  onResend,
  onBack,
  backLabel = "Back",
  className = "",
}: {
  title: string;
  description: string;
  sentTo?: string;
  devCode?: string;
  submitLabel: string;
  busyLabel: string;
  /** Returns an error message, or null when the code was accepted. */
  onVerify: (code: string) => Promise<string | null>;
  onResend: () => Promise<OtpRequestResult>;
  onBack?: () => void;
  backLabel?: string;
  className?: string;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [wait, setWait] = useState(COOLDOWN);
  const [shownCode, setShownCode] = useState(devCode);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (wait <= 0) return;
    const t = window.setTimeout(() => setWait((w) => w - 1), 1000);
    return () => window.clearTimeout(t);
  }, [wait]);

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    if (code.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    setBusy(true);
    setError("");
    const message = await onVerify(code);
    setBusy(false);
    if (message) {
      setError(message);
      setCode("");
      inputRef.current?.focus();
    }
  }

  async function resend() {
    setResending(true);
    setError("");
    setInfo("");
    const result = await onResend();
    setResending(false);
    if (!result.ok) {
      setError(result.error || "Couldn't send a new code.");
      if (result.retryAfter) setWait(result.retryAfter);
      return;
    }
    setShownCode(result.devCode);
    setInfo(`A new code was sent${result.sentTo ? ` to ${result.sentTo}` : ""}.`);
    setWait(COOLDOWN);
    setCode("");
    inputRef.current?.focus();
  }

  return (
    <form onSubmit={submit} className={`grid gap-4 ${className}`}>
      <div>
        <h2 className="font-display text-3xl">{title}</h2>
        <p className="mt-2 text-ink-soft">
          {description}
          {sentTo ? <> We sent it to <strong className="text-ink">{sentTo}</strong>.</> : null}
        </p>
      </div>

      {shownCode ? (
        <p className="rounded-xl border border-amber/30 bg-amber/10 px-3 py-2 text-sm">
          Demo mode — email isn&apos;t set up yet, so your code is shown here:{" "}
          <strong className="font-mono tracking-widest">{shownCode}</strong>
        </p>
      ) : null}

      <label className="grid gap-1.5 text-sm font-medium">
        6-digit code
        <input
          ref={inputRef}
          className="input text-center font-mono text-2xl tracking-[0.6em]"
          name="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          placeholder="••••••"
          value={code}
          onChange={(e) => {
            const next = e.target.value.replace(/\D/g, "").slice(0, 6);
            setCode(next);
            setError("");
          }}
          aria-describedby="otp-help"
        />
        <span id="otp-help" className="text-xs font-normal text-ink-soft">
          The code expires in 10 minutes. Check your spam folder if you don&apos;t see it.
        </span>
      </label>

      <ErrorNote message={error} />
      {info ? <p className="text-sm text-forest" aria-live="polite">{info}</p> : null}

      <button className="btn-primary h-12 text-base" type="submit" disabled={busy || code.length !== 6}>
        {busy ? (<><Spinner />{busyLabel}</>) : submitLabel}
      </button>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        {onBack ? (
          <button type="button" className="text-ink-soft underline underline-offset-4" onClick={onBack}>
            {backLabel}
          </button>
        ) : <span />}
        <button
          type="button"
          className="font-semibold text-forest underline underline-offset-4 disabled:text-ink-soft disabled:no-underline"
          onClick={resend}
          disabled={resending || wait > 0}
        >
          {resending ? "Sending..." : wait > 0 ? `Resend code in ${wait}s` : "Resend code"}
        </button>
      </div>
    </form>
  );
}
