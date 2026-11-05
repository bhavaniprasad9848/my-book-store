"use client";

import { useState } from "react";

const STAR = "M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z";

/** Read-only stars with partial fill for averages like 4.3. */
export function Stars({ value, size = 15 }: { value: number; size?: number }) {
  return (
    <span className="stars" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="star" style={{ width: size, height: size }}>
            <svg viewBox="0 0 24 24" width={size} height={size} className="star-empty">
              <path d={STAR} />
            </svg>
            <span className="star-fill" style={{ width: `${fill * 100}%` }}>
              <svg viewBox="0 0 24 24" width={size} height={size}>
                <path d={STAR} />
              </svg>
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** One line under a book: average stars and how many buyers rated it. */
export function RatingLine({ avg, count }: { avg?: number; count?: number }) {
  if (!count) return <p className="rating-line text-ink-soft">No ratings yet</p>;
  return (
    <p className="rating-line" aria-label={`Rated ${avg} out of 5 by ${count} ${count === 1 ? "buyer" : "buyers"}`}>
      <Stars value={avg ?? 0} />
      <span className="rating-avg">{avg?.toFixed(1)}</span>
      <span className="text-ink-soft">({count})</span>
    </p>
  );
}

/** Clickable 1-5 stars for buyers. */
export function StarInput({
  value,
  onRate,
  disabled,
  label,
}: {
  value: number;
  onRate: (stars: number) => void;
  disabled?: boolean;
  label: string;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="star-input" role="radiogroup" aria-label={label} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
          disabled={disabled}
          className={`star-btn ${n <= shown ? "is-on" : ""} ${value === n ? "is-chosen" : ""}`}
          onMouseEnter={() => setHover(n)}
          onFocus={() => setHover(n)}
          onBlur={() => setHover(0)}
          onClick={() => onRate(n)}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d={STAR} />
          </svg>
        </button>
      ))}
    </div>
  );
}
