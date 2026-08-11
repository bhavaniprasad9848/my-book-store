import { Suspense } from "react";
import SuccessClient from "./SuccessClient";

export default function SuccessPage() {
  return (
    <Suspense fallback={<main className="p-8">Loading receipt...</main>}>
      <SuccessClient />
    </Suspense>
  );
}
