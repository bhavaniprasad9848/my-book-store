"use client";

import { useState } from "react";

const icon = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function Icon({ kind }: { kind: "mail" | "lock" | "user" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true" {...icon}>
      {kind === "mail" && (<><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3.5 7l8.5 6 8.5-6" /></>)}
      {kind === "lock" && (<><rect x="4.5" y="10.5" width="15" height="10" rx="3" /><path d="M8 10.5V8a4 4 0 018 0v2.5" /></>)}
      {kind === "user" && (<><circle cx="12" cy="8" r="4" /><path d="M4.5 20c1.2-3.6 4-5 7.5-5s6.3 1.4 7.5 5" /></>)}
    </svg>
  );
}

export function TextField({
  label, name, type = "text", kind, placeholder, autoComplete,
}: {
  label: string; name: string; type?: string; kind: "mail" | "user"; placeholder?: string; autoComplete?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      <span className="field">
        <span className="field-icon"><Icon kind={kind} /></span>
        <input className="input pl-11" name={name} type={type} required placeholder={placeholder} autoComplete={autoComplete} />
      </span>
    </label>
  );
}

export function PasswordField({
  label = "Password", name = "password", autoComplete, showStrength = false,
}: {
  label?: string; name?: string; autoComplete?: string; showStrength?: boolean;
}) {
  const [show, setShow] = useState(false);
  const [value, setValue] = useState("");
  const score = Math.min(
    4,
    (value.length >= 6 ? 1 : 0) + (value.length >= 10 ? 1 : 0) + (/[A-Z]/.test(value) && /[a-z]/.test(value) ? 1 : 0) + (/\d|\W/.test(value) ? 1 : 0)
  );
  const labels = ["Too short", "Weak", "Okay", "Good", "Strong"];
  const colors = ["#d1d5db", "#ef4444", "#f59e0b", "#84cc16", "#16a34a"];

  return (
    <div className="grid gap-1.5 text-sm font-medium">
      <label htmlFor={name}>{label}</label>
      <span className="field">
        <span className="field-icon"><Icon kind="lock" /></span>
        <input
          id={name}
          className="input pl-11 pr-12"
          name={name}
          type={show ? "text" : "password"}
          required
          minLength={6}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-1 text-xs font-semibold text-ink-soft hover:bg-black/5"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? "Hide" : "Show"}
        </button>
      </span>
      {showStrength && value ? (
        <span className="flex items-center gap-2" aria-live="polite">
          <span className="flex flex-1 gap-1">
            {[1, 2, 3, 4].map((n) => (
              <span key={n} className="h-1.5 flex-1 rounded-full" style={{ background: n <= score ? colors[score] : "#e5e7eb" }} />
            ))}
          </span>
          <span className="text-xs font-normal text-ink-soft">{labels[score]}</span>
        </span>
      ) : null}
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  );
}

export function Spinner() {
  return <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />;
}