/** Decorative, non-interactive background layer: floating books, leaves and stars. */
const ITEMS = [
  { kind: "book", x: 4, y: 12, s: 1.1, r: -14, d: 0 },
  { kind: "leaf", x: 90, y: 8, s: 1, r: 20, d: 2 },
  { kind: "star", x: 22, y: 34, s: 0.8, r: 0, d: 4 },
  { kind: "open", x: 84, y: 30, s: 1.2, r: 8, d: 1 },
  { kind: "feather", x: 8, y: 58, s: 1, r: 25, d: 3 },
  { kind: "star", x: 94, y: 52, s: 0.7, r: 0, d: 5 },
  { kind: "leaf", x: 3, y: 84, s: 1.1, r: -30, d: 6 },
  { kind: "book", x: 88, y: 76, s: 1, r: 12, d: 2.5 },
  { kind: "star", x: 50, y: 92, s: 0.6, r: 0, d: 1.5 },
  { kind: "open", x: 16, y: 96, s: 0.9, r: -6, d: 4.5 },
];

function Shape({ kind }: { kind: string }) {
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "book":
      return (
        <g {...stroke}>
          <rect x="6" y="4" width="36" height="48" rx="3" />
          <path d="M12 4v48M18 16h18M18 22h14" />
        </g>
      );
    case "open":
      return (
        <g {...stroke}>
          <path d="M4 12c8-4 16-4 22 2v34c-6-6-14-6-22-2V12z" />
          <path d="M48 12c-8-4-16-4-22 2v34c6-6 14-6 22-2V12z" />
          <path d="M10 20h10M10 26h10M32 20h10M32 26h10" />
        </g>
      );
    case "leaf":
      return (
        <g {...stroke}>
          <path d="M8 44C8 20 24 6 46 6c0 22-14 38-38 38z" />
          <path d="M8 44L36 16" />
        </g>
      );
    case "feather":
      return (
        <g {...stroke}>
          <path d="M40 6C22 8 10 22 10 46l4-4c10-2 22-10 26-36z" />
          <path d="M10 46L32 18M16 34h10M20 26h10" />
        </g>
      );
    default:
      return (
        <path
          d="M26 6l5 12 13 1-10 8 3 13-11-7-11 7 3-13-10-8 13-1z"
          fill="currentColor"
          opacity="0.6"
        />
      );
  }
}

export function BackgroundDecor() {
  return (
    <div className="bg-decor" aria-hidden="true">
      {ITEMS.map((item, i) => (
        <svg
          key={i}
          viewBox="0 0 52 56"
          className="bg-decor-item"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            width: `${52 * item.s}px`,
            transform: `rotate(${item.r}deg)`,
            animationDelay: `${item.d}s`,
          }}
        >
          <Shape kind={item.kind} />
        </svg>
      ))}
    </div>
  );
}
