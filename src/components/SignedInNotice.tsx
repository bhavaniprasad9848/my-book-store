"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";

const ROLE_LABEL: Record<string, string> = { ADMIN: "Admin", SELLER: "Seller", CUSTOMER: "Customer" };
const HOME: Record<string, string> = { ADMIN: "/admin", SELLER: "/seller", CUSTOMER: "/shop" };

/**
 * Shown on the sign-in and register pages when an account is already signed in in this browser,
 * so it's always clear which account is active before signing in with another one.
 */
export function SignedInNotice() {
  const { data, status } = useSession();
  const [busy, setBusy] = useState(false);
  if (status !== "authenticated" || !data?.user) return null;
  const role = String(data.user.role || "CUSTOMER");

  return (
    <div className="signed-in-notice" role="status">
      <p>
        You&apos;re already signed in as <strong>{data.user.name || data.user.email}</strong> ({ROLE_LABEL[role] ?? role}).
        To use a different account, sign out first.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary h-9 px-3 text-sm"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            // Sign out without leaving this page, then reload so nothing from the old account remains.
            await signOut({ redirect: false });
            window.location.reload();
          }}
        >
          {busy ? "Signing out..." : "Sign out"}
        </button>
        <a href={HOME[role] ?? "/shop"} className="btn-secondary h-9 px-3 text-sm">
          Continue as {ROLE_LABEL[role] ?? "this account"}
        </a>
      </div>
    </div>
  );
}
