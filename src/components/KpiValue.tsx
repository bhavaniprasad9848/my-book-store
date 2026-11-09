"use client";

import { useEffect, useState } from "react";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { moneyFromCents } from "@/lib/catalog";

/** Dashboard number that counts up from zero when the page opens. */
export function KpiValue({ value, kind = "int" }: { value: number; kind?: "int" | "money" }) {
  const [target, setTarget] = useState(0);
  useEffect(() => {
    const id = window.setTimeout(() => setTarget(value), 150);
    return () => window.clearTimeout(id);
  }, [value]);
  return (
    <AnimatedNumber
      value={target}
      duration={1100}
      format={kind === "money" ? (n) => moneyFromCents(Math.round(n)) : (n) => String(Math.round(n))}
    />
  );
}
