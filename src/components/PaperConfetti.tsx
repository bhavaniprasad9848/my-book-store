"use client";

import { useEffect, useState } from "react";

const COLORS = ["#fbfaf6", "#f3e2bd", "#d6e5d2", "#f5d9bf", "#e9e6dc"];

/** Little paper pages that flutter down once, for a celebration moment. Removes itself afterwards. */
export function PaperConfetti({ pieces = 28 }: { pieces?: number }) {
  const [show, setShow] = useState(true);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShow(false);
      return;
    }
    const id = window.setTimeout(() => setShow(false), 5200);
    return () => window.clearTimeout(id);
  }, []);
  if (!show) return null;
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: pieces }, (_, i) => {
        const left = (i * 37 + 11) % 100;
        const delay = ((i * 53) % 900) / 1000;
        const dur = 2.6 + ((i * 29) % 140) / 100;
        const drift = ((i * 47) % 120) - 60;
        const size = 10 + ((i * 13) % 9);
        return (
          <span
            key={i}
            className="confetti-paper"
            style={
              {
                left: `${left}%`,
                width: size,
                height: size * 1.35,
                background: COLORS[i % COLORS.length],
                animationDelay: `${delay}s`,
                animationDuration: `${dur}s`,
                "--drift": `${drift}px`,
              } as React.CSSProperties
            }
          >
            <i />
            <i />
          </span>
        );
      })}
    </div>
  );
}
