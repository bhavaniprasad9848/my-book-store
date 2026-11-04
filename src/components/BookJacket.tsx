import { hashString } from "@/components/CoverArt";

/*
 * A printed book jacket in the style of a publisher's series:
 * each category has its own palette and pattern, each title its own color within it.
 */

const SERIES: Record<string, { colors: string[]; ink: string }> = {
  kids: { colors: ["#D9973A", "#C9603D", "#3F8A78", "#4C6BA0", "#B4566B", "#6E8A3A"], ink: "#FFF9EE" },
  school: { colors: ["#2E4A6B", "#5B4A3F", "#3B5D56", "#7A3B3B", "#46466A", "#56623A"], ink: "#F3F1EA" },
  history: { colors: ["#5A2D29", "#2E3B33", "#6A4A2C", "#3D2F44", "#24384A", "#6B5A2E"], ink: "#EFE4CF" },
  nature: { colors: ["#2E5B45", "#2A4A4F", "#4B6939", "#6B5B3A", "#3E5E6E", "#5F6E36"], ink: "#EEF2E6" },
  adventure: { colors: ["#86391F", "#2E3D55", "#6B5130", "#2F4A3E", "#3E2A2A", "#9A6A2A"], ink: "#F4EBDD" },
  mix: { colors: ["#755A3D", "#2D4C56", "#4A3B5A", "#3A3A38", "#7A3F3A", "#4F5E3A"], ink: "#F1EEE8" },
};

function Pattern({ category, ink }: { category: string; ink: string }) {
  const s = { stroke: ink, fill: "none", strokeWidth: 1 };
  switch (category) {
    case "kids":
      return (
        <g opacity="0.32">
          {[[60, 70, 40], [120, 54, 30], [150, 110, 46], [80, 128, 26], [30, 116, 18]].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill={ink} opacity={0.35 + (i % 3) * 0.2} />
          ))}
        </g>
      );
    case "school":
      return (
        <g opacity="0.22" {...s}>
          {Array.from({ length: 11 }, (_, i) => (
            <line key={`h${i}`} x1="16" y1={20 + i * 14} x2="184" y2={20 + i * 14} />
          ))}
          {Array.from({ length: 13 }, (_, i) => (
            <line key={`v${i}`} x1={16 + i * 14} y1="20" x2={16 + i * 14} y2="160" />
          ))}
          <circle cx="100" cy="90" r="44" strokeWidth="2" opacity="0.9" />
        </g>
      );
    case "history":
      return (
        <g opacity="0.3" {...s} strokeWidth="1.5">
          <path d="M50 160 V80 A50 50 0 0 1 150 80 V160" />
          <path d="M66 160 V84 A34 34 0 0 1 134 84 V160" />
          <path d="M82 160 V88 A18 18 0 0 1 118 88 V160" />
          <line x1="30" y1="160" x2="170" y2="160" />
        </g>
      );
    case "nature":
      return (
        <g opacity="0.28" {...s}>
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse key={i} cx="100" cy="92" rx={14 + i * 11} ry={8 + i * 8} transform={`rotate(${-18 + i * 2} 100 92)`} />
          ))}
        </g>
      );
    case "adventure":
      return (
        <g opacity="0.3" {...s}>
          {Array.from({ length: 7 }, (_, i) => (
            <path key={i} d={`M0 ${160 - i * 6} L46 ${100 - i * 9} L78 ${128 - i * 6} L120 ${70 - i * 8} L200 ${150 - i * 6}`} />
          ))}
        </g>
      );
    default:
      return (
        <g opacity="0.2" stroke={ink} strokeWidth="6">
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={-60 + i * 26} y1="170" x2={40 + i * 26} y2="10" />
          ))}
        </g>
      );
  }
}

function wrap(text: string, max: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

export function BookJacket({
  title,
  author,
  category,
  className,
  variant,
}: {
  title: string;
  author: string;
  category: string;
  className?: string;
  /** Position on its shelf; neighbours get different colors and layouts. */
  variant?: number;
}) {
  const series = SERIES[category] || SERIES.mix;
  const seed = hashString(title);
  const v = variant ?? seed;
  const bg = series.colors[v % series.colors.length];
  const titleOnTop = v % 2 === 1;
  const patternTransform = `rotate(${((seed % 5) - 2) * 7} 100 90) translate(${(seed >> 3) % 28 - 14} ${(seed >> 6) % 18 - 9})`;
  let lines = wrap(title, 15);
  let titleSize = 19;
  if (lines.length > 3) {
    lines = wrap(title, 19);
    titleSize = 15;
  }
  const id = `j${seed}`;
  const titleTop = titleOnTop ? 52 : 200;
  const ruleY = titleOnTop ? titleTop + (lines.length - 1) * (titleSize + 3) + 18 : 174;

  return (
    <svg viewBox="0 0 200 300" className={className} role="img" aria-label={`${title} by ${author}`}>
      <defs>
        <linearGradient id={`${id}-spine`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.35" />
          <stop offset="0.05" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="0.09" stopColor="#000" stopOpacity="0.08" />
          <stop offset="0.2" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-light`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.12" />
        </linearGradient>
        <clipPath id={`${id}-art`}>
          {titleOnTop ? <rect x="0" y={ruleY + 8} width="200" height={250 - ruleY} /> : <rect x="0" y="0" width="200" height="166" />}
        </clipPath>
      </defs>
      <rect width="200" height="300" fill={bg} />
      <g clipPath={`url(#${id}-art)`}>
        <g transform={titleOnTop ? `translate(0 ${ruleY - 2})` : undefined}>
          <g transform={patternTransform}>
            <Pattern category={category} ink={series.ink} />
          </g>
        </g>
      </g>
      <line x1="22" y1={ruleY} x2="178" y2={ruleY} stroke={series.ink} strokeOpacity="0.55" />
      <g fill={series.ink} style={{ fontFamily: "var(--ff-serif), Georgia, serif" }}>
        {lines.map((line, i) => (
          <text key={i} x="22" y={titleTop + i * (titleSize + 3)} fontSize={titleSize} fontWeight="600">
            {line}
          </text>
        ))}
        <text x="22" y="276" fontSize="10.5" fontStyle="italic" opacity="0.85">
          {author}
        </text>
      </g>
      <g fill={series.ink} opacity="0.7" style={{ fontFamily: "var(--ff-sans), system-ui, sans-serif" }}>
        <circle cx="172" cy="273" r="7" fill="none" stroke={series.ink} />
        <text x="172" y="275.5" fontSize="7" textAnchor="middle" fontWeight="600">
          M
        </text>
      </g>
      <rect width="200" height="300" fill={`url(#${id}-light)`} />
      <rect width="200" height="300" fill={`url(#${id}-spine)`} />
    </svg>
  );
}
