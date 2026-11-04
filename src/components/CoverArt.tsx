import type { ReactNode } from "react";

/** Small deterministic hash so each title gets its own stable variation. */
export function hashString(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function shade(hex: string, amount: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp((n >> 16) + amount);
  const g = clamp(((n >> 8) & 255) + amount);
  const b = clamp((n & 255) + amount);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

type SceneProps = { accent: string; seed: number };

function KidsScene({ accent, seed }: SceneProps) {
  const sunX = 60 + (seed % 5) * 40;
  return (
    <g>
      <circle cx={sunX} cy="52" r="26" fill="#fff6c9" opacity="0.95" />
      <circle cx={sunX} cy="52" r="38" fill="#fff6c9" opacity="0.25" />
      <g fill="#fff" opacity="0.92">
        <ellipse cx="230" cy="44" rx="30" ry="12" />
        <ellipse cx="248" cy="38" rx="20" ry="11" />
        <ellipse cx="120" cy="82" rx="26" ry="10" />
        <ellipse cx="136" cy="77" rx="16" ry="9" />
      </g>
      {["#ef6f6c", "#f7b32b", "#5bbf7a", "#4aa3df"].map((c, i) => (
        <path
          key={c}
          d={`M${40 + i * 9} 190 A ${110 - i * 9} ${110 - i * 9} 0 0 1 ${280 - i * 9} 190`}
          fill="none"
          stroke={c}
          strokeWidth="8"
          opacity="0.9"
        />
      ))}
      <path d="M0 190 Q80 140 160 170 T320 160 V200 H0Z" fill={shade(accent, -40)} opacity="0.55" />
      <g fill="#fff" opacity="0.9">
        <path d="M30 120 l4 10 11 1 -8 7 3 11 -10 -6 -10 6 3 -11 -8 -7 11 -1z" />
        <path d="M280 110 l3 8 9 1 -7 5 2 9 -7 -5 -8 5 2 -9 -7 -5 9 -1z" />
      </g>
    </g>
  );
}

function SchoolScene({ accent, seed }: SceneProps) {
  const lines = Array.from({ length: 9 }, (_, i) => 24 + i * 18);
  return (
    <g>
      <g stroke="#fff" opacity="0.16" strokeWidth="1">
        {lines.map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="320" y2={y} />
        ))}
        {Array.from({ length: 17 }, (_, i) => (
          <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="200" />
        ))}
      </g>
      <g transform={`rotate(${-18 + (seed % 12)} 110 120)`}>
        <rect x="40" y="108" width="150" height="20" rx="3" fill="#ffd34d" />
        <rect x="40" y="108" width="150" height="6" fill="#f0b400" />
        <polygon points="190,108 190,128 218,118" fill="#f6d9b0" />
        <polygon points="206,113 206,123 218,118" fill="#2b2b2b" />
        <rect x="26" y="108" width="14" height="20" rx="2" fill="#ef8f8f" />
      </g>
      <g transform="translate(235 70)" fill="none" stroke="#fff" strokeWidth="3" opacity="0.95">
        <ellipse rx="34" ry="13" />
        <ellipse rx="34" ry="13" transform="rotate(60)" />
        <ellipse rx="34" ry="13" transform="rotate(120)" />
        <circle r="5" fill="#fff" />
      </g>
      <g fill="#fff" opacity="0.9" fontFamily="Georgia, serif" fontStyle="italic">
        <text x="30" y="60" fontSize="26">E = mc²</text>
                <text x="30" y="96" fontSize="20" fill={shade(accent, 90)}>∑ π √</text>
      </g>
    </g>
  );
}

function HistoryScene({ accent, seed }: SceneProps) {
  return (
    <g>
      <circle cx={80 + (seed % 4) * 55} cy="56" r="30" fill="#ffe3a3" opacity="0.9" />
      <g fill="#f3e4c6">
        <polygon points="70,68 160,36 250,68" />
        <rect x="70" y="68" width="180" height="10" />
        {[84, 120, 156, 192, 228].map((x) => (
          <g key={x}>
            <rect x={x} y="80" width="14" height="70" />
            <rect x={x - 3} y="78" width="20" height="6" />
            <rect x={x - 3} y="146" width="20" height="6" />
          </g>
        ))}
        <rect x="60" y="152" width="200" height="8" />
        <rect x="50" y="160" width="220" height="10" />
      </g>
      <g stroke={shade(accent, -50)} strokeWidth="2" opacity="0.5">
        {[91, 127, 163, 199, 235].map((x) => (
          <line key={x} x1={x} y1="84" x2={x} y2="146" />
        ))}
      </g>
      <path d="M0 200 L0 176 Q80 168 160 176 T320 172 V200Z" fill={shade(accent, -55)} opacity="0.7" />
    </g>
  );
}

function NatureScene({ accent, seed }: SceneProps) {
  const trees = [30, 78, 126, 214, 262];
  return (
    <g>
      <circle cx={240 - (seed % 4) * 40} cy="48" r="22" fill="#fdf3c4" opacity="0.9" />
      <path d="M-10 150 L70 70 L130 130 L190 60 L270 140 L330 100 V200 H-10Z" fill={shade(accent, -30)} opacity="0.6" />
      <path d="M70 70 L84 86 L70 82 L58 88Z" fill="#fff" opacity="0.85" />
      <path d="M190 60 L206 80 L190 76 L176 82Z" fill="#fff" opacity="0.85" />
      {trees.map((x, i) => {
        const h = 50 + ((seed >> i) % 4) * 8;
        return (
          <g key={x} transform={`translate(${x} ${190 - h})`} fill={shade(accent, -70 + i * 6)}>
            <polygon points={`0,${h} 18,${h * 0.55} 6,${h * 0.55} 20,${h * 0.2} 8,${h * 0.2} 22,-6 36,${h * 0.2} 24,${h * 0.2} 38,${h * 0.55} 26,${h * 0.55} 44,${h}`} />
            <rect x="19" y={h} width="6" height="10" fill="#5b3a22" />
          </g>
        );
      })}
      <g fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.9">
        <path d="M100 38 q6 -8 12 0 q6 -8 12 0" />
        <path d="M140 58 q5 -7 10 0 q5 -7 10 0" />
      </g>
      <rect x="0" y="186" width="320" height="14" fill={shade(accent, -80)} />
    </g>
  );
}

function AdventureScene({ accent, seed }: SceneProps) {
  return (
    <g>
      <circle cx="250" cy="50" r="26" fill="#ffd27a" opacity="0.9" />
      <path d="M-10 170 L60 80 L100 120 L150 50 L220 150 L260 110 L330 170 V200 H-10Z" fill={shade(accent, -55)} opacity="0.85" />
      <path d="M150 50 L170 82 L150 76 L132 84Z" fill="#fff" opacity="0.9" />
      <path d="M60 80 L74 100 L60 96 L48 102Z" fill="#fff" opacity="0.9" />
      <path
        d="M30 190 C80 150 110 175 150 150 S 230 130 280 90"
        fill="none"
        stroke="#fff"
        strokeWidth="3"
        strokeDasharray="2 9"
        strokeLinecap="round"
      />
      <g transform="translate(272 84)">
        <line x1="0" y1="0" x2="0" y2="-26" stroke="#fff" strokeWidth="3" />
        <polygon points="0,-26 20,-19 0,-12" fill="#ef4444" />
      </g>
      <g transform={`translate(44 ${44 + (seed % 3) * 4})`}>
        <circle r="22" fill="#fff" opacity="0.95" />
        <circle r="17" fill="none" stroke={accent} strokeWidth="2" />
        <polygon points="0,-13 4,0 0,13 -4,0" fill="#ef4444" />
        <polygon points="-13,0 0,-4 13,0 0,4" fill={shade(accent, -60)} />
      </g>
    </g>
  );
}

function MixScene({ accent, seed }: SceneProps) {
  const palette = ["#f7b32b", "#ef6f6c", "#4aa3df", "#5bbf7a", "#fff"];
  return (
    <g>
      {Array.from({ length: 16 }, (_, i) => {
        const v = hashString(`${seed}-${i}`);
        const x = (v % 300) + 10;
        const y = ((v >> 8) % 170) + 10;
        const s = 10 + ((v >> 4) % 22);
        const c = palette[v % palette.length];
        const kind = (v >> 12) % 3;
        return kind === 0 ? (
          <circle key={i} cx={x} cy={y} r={s / 2} fill={c} opacity="0.85" />
        ) : kind === 1 ? (
          <rect key={i} x={x} y={y} width={s} height={s} rx="3" fill={c} opacity="0.8" transform={`rotate(${v % 60} ${x} ${y})`} />
        ) : (
          <polygon key={i} points={`${x},${y - s / 2} ${x + s / 2},${y + s / 2} ${x - s / 2},${y + s / 2}`} fill={c} opacity="0.85" />
        );
      })}
      <circle cx="160" cy="100" r="48" fill={shade(accent, -40)} opacity="0.55" />
      <path d="M135 100 h50 M160 75 v50" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
    </g>
  );
}

const SCENES: Record<string, (p: SceneProps) => ReactNode> = {
  kids: KidsScene,
  school: SchoolScene,
  history: HistoryScene,
  nature: NatureScene,
  adventure: AdventureScene,
  mix: MixScene,
};

type CoverArtProps = {
  category: string;
  accent: string;
  title: string;
  author?: string;
  className?: string;
};

/** Illustrated book cover: category scene + title plaque, unique per title. */
export function CoverArt({ category, accent, title, author, className }: CoverArtProps) {
  const seed = hashString(title);
  const Scene = SCENES[category] || MixScene;
  const id = `c${seed}`;
  const words = title.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > 20 && current) {
      lines.push(current);
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) lines.push(current);
  const shown = lines.slice(0, 3);
  const plaqueH = 18 + shown.length * 19 + (author ? 14 : 0);

  return (
    <svg
      viewBox="0 0 320 200"
      className={className}
      role="img"
      aria-label={`Cover art for ${title}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={shade(accent, 45)} />
          <stop offset="1" stopColor={shade(accent, -45)} />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.28" />
          <stop offset="0.07" stopColor="#fff" stopOpacity="0.14" />
          <stop offset="0.12" stopColor="#000" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill={`url(#${id}-bg)`} />
      <g transform="translate(16 -8) scale(0.95)">
        <Scene accent={accent} seed={seed} />
      </g>
      <g>
        <rect x="22" y={200 - plaqueH - 14} width="276" height={plaqueH} rx="8" fill="#10151c" opacity="0.55" />
        {shown.map((line, i) => (
          <text
            key={line}
            x="160"
            y={200 - plaqueH - 14 + 28 + i * 19}
            textAnchor="middle"
            fill="#fbf7ee"
            fontSize="17"
            fontWeight="700"
            fontFamily="Georgia, 'Fraunces', serif"
          >
            {line}
          </text>
        ))}
        {author ? (
          <text
            x="160"
            y={200 - 14 - 9}
            textAnchor="middle"
            fill="#fbf7ee"
            opacity="0.8"
            fontSize="10"
            letterSpacing="1.5"
            fontFamily="system-ui, sans-serif"
          >
            {author.toUpperCase()}
          </text>
        ) : null}
      </g>
      <rect width="320" height="200" fill={`url(#${id}-shine)`} />
    </svg>
  );
}

/** Small round category icon used on tiles and chips. */
export function CategoryIcon({ category, className }: { category: string; className?: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...common}>
      {category === "kids" && (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
        </>
      )}
      {category === "school" && (
        <>
          <path d="M3 9l9-5 9 5-9 5-9-5z" />
          <path d="M7 11.5V16c0 1.2 2.2 2.5 5 2.5s5-1.3 5-2.5v-4.5" />
        </>
      )}
      {category === "history" && (
        <>
          <path d="M3 9l9-5 9 5H3z" />
          <path d="M6 9v9M10 9v9M14 9v9M18 9v9M4 20h16" />
        </>
      )}
      {category === "nature" && (
        <>
          <path d="M12 3l5 7h-3l4 6H6l4-6H7l5-7z" />
          <path d="M12 16v5" />
        </>
      )}
      {category === "adventure" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" />
        </>
      )}
      {category !== "kids" && category !== "school" && category !== "history" && category !== "nature" && category !== "adventure" && (
        <>
          <path d="M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v5H4zM14 15h6v5h-6z" />
        </>
      )}
    </svg>
  );
}
