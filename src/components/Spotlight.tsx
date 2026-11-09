"use client";

import { useEffect } from "react";

/**
 * One shared, throttled pointer listener that lets a soft light follow the cursor across any
 * element with the "spotlight" class. Skipped entirely for touch screens and reduced motion.
 */
export function Spotlight() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce), (hover: none)").matches) return;
    let frame = 0;
    let last: PointerEvent | null = null;
    const apply = () => {
      frame = 0;
      if (!last) return;
      const target = (last.target as Element | null)?.closest?.(".spotlight") as HTMLElement | null;
      if (!target) return;
      const r = target.getBoundingClientRect();
      target.style.setProperty("--sx", `${last.clientX - r.left}px`);
      target.style.setProperty("--sy", `${last.clientY - r.top}px`);
    };
    const onMove = (e: PointerEvent) => {
      last = e;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}
