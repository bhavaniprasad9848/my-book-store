/** Sign-in page background: slowly shifting color washes and a few drifting book outlines. CSS only. */
export function AuthBackdrop() {
  const books = [
    { left: "6%", top: "14%", size: 46, delay: "0s", dur: "26s", rot: -12 },
    { left: "88%", top: "10%", size: 34, delay: "-6s", dur: "30s", rot: 10 },
    { left: "48%", top: "86%", size: 40, delay: "-12s", dur: "28s", rot: -6 },
    { left: "92%", top: "70%", size: 52, delay: "-3s", dur: "34s", rot: 14 },
    { left: "3%", top: "76%", size: 36, delay: "-18s", dur: "32s", rot: 8 },
  ];
  return (
    <div className="auth-backdrop" aria-hidden="true">
      <span className="wash wash-a" />
      <span className="wash wash-b" />
      <span className="wash wash-c" />
      {books.map((b, i) => (
        <svg
          key={i}
          viewBox="0 0 48 56"
          className="drift-book"
          style={{ left: b.left, top: b.top, width: b.size, animationDelay: b.delay, animationDuration: b.dur, rotate: `${b.rot}deg` }}
        >
          {i % 2 ? (
            <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
              <path d="M4 10c8-4 14-4 20 2v34c-6-6-12-6-20-2V10z" />
              <path d="M44 10c-8-4-14-4-20 2v34c6-6 12-6 20-2V10z" />
            </g>
          ) : (
            <g fill="none" stroke="currentColor" strokeWidth="1.4">
              <rect x="8" y="4" width="32" height="46" rx="2" />
              <path d="M13 4v46M18 16h16M18 22h12" />
            </g>
          )}
        </svg>
      ))}
    </div>
  );
}
