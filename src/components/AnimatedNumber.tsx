"use client";

import { useEffect, useRef, useState } from "react";

/** Tweens a number to its new value and formats it. Jumps straight there for reduced motion. */
export function AnimatedNumber({
  value,
  format = (n: number) => String(Math.round(n)),
  duration = 450,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
}) {
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = fromRef.current;
    if (reduce || from === value) {
      fromRef.current = value;
      setShown(value);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (value - from) * eased;
      setShown(current);
      fromRef.current = current;
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span className="tabular-nums">{format(shown)}</span>;
}

/** Counts up from zero the first time it renders. */
export function CountUp({ to, duration = 1100 }: { to: number; duration?: number }) {
  const [target, setTarget] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setTarget(to), 250);
    return () => clearTimeout(id);
  }, [to]);
  return <AnimatedNumber value={target} duration={duration} />;
}
