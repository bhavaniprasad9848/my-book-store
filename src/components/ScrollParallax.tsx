"use client";

import { useEffect } from "react";

/** Moves the matching element slightly slower than the page while it is near the top, for a sense of depth. */
export function ScrollParallax({ selector, factor = 0.12 }: { selector: string; factor?: number }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return;
    let frame = 0;
    const apply = () => {
      frame = 0;
      const y = window.scrollY;
      if (y > window.innerHeight * 1.5) return;
      el.style.translate = `0 ${(y * factor).toFixed(1)}px`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      el.style.translate = "";
    };
  }, [selector, factor]);
  return null;
}
