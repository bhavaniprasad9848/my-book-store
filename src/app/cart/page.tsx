import { Suspense } from "react";
import CartClient from "./CartClient";

export default function CartPage() {
  return (
    <Suspense fallback={<main className="p-8">Loading cart...</main>}>
      <CartClient />
    </Suspense>
  );
}
