import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { homeFor } from "@/lib/portal";
import CartClient from "./CartClient";

export default async function CartPage() {
  const session = await auth();
  // Only customers have a cart.
  if (session?.user && session.user.role !== Role.CUSTOMER) redirect(homeFor(session.user.role));
  return (
    <Suspense fallback={<main className="p-8">Loading cart...</main>}>
      <CartClient />
    </Suspense>
  );
}
