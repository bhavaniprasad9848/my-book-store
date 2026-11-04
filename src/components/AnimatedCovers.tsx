import type { CSSProperties, ReactNode } from "react";
import { slugify } from "@/lib/slug";

/* Animated SVG scenes, one per seeded book title. Animations live in globals.css (.a-*). */

const v = (t: string, dl = "0s", extra: Record<string, string> = {}) =>
  ({ "--t": t, "--dl": dl, ...extra }) as CSSProperties;

/** Rotate around a fixed point in the 320x200 scene (for clock hands, orbits, beams). */
const pivot = (x: number, y: number, t: string, dl = "0s") =>
  ({ ...v(t, dl), transformBox: "view-box", transformOrigin: `${x}px ${y}px` }) as CSSProperties;

function Sky({ id, top, bottom }: { id: string; top: string; bottom: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill={`url(#${id}-sky)`} />
    </>
  );
}

function Stars({ n = 10, seed = 1 }: { n?: number; seed?: number }) {
  return (
    <g fill="#fff">
      {Array.from({ length: n }, (_, i) => {
        const x = (i * 73 + seed * 41) % 310 + 5;
        const y = (i * 37 + seed * 17) % 90 + 6;
        return (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.8 : 1.1} className="a-twinkle" style={v(`${2 + (i % 4) * 0.6}s`, `${(i % 5) * 0.4}s`)} />
        );
      })}
    </g>
  );
}

function Cloud({ y, t, dl, s = 1, o = 0.95 }: { y: number; t: string; dl: string; s?: number; o?: number }) {
  return (
    <g transform={`translate(0 ${y}) scale(${s})`}>
      <g className="a-drift" style={v(t, dl)} opacity={o} fill="#fff">
        <ellipse cx="30" cy="12" rx="26" ry="11" />
        <ellipse cx="46" cy="6" rx="16" ry="11" />
        <ellipse cx="16" cy="8" rx="12" ry="9" />
      </g>
    </g>
  );
}

function Bird({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return <path d={`M${x} ${y} q${5 * s} ${-5 * s} ${10 * s} 0 q${5 * s} ${-5 * s} ${10 * s} 0`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />;
}

/* ---------------- Kids ---------------- */

function MoonlitTreehouse({ id }: { id: string }) {
  return (
    <>
      <Sky id={id} top="#141d3b" bottom="#3e3a78" />
      <Stars n={14} seed={2} />
      <circle cx="262" cy="42" r="30" fill="#fff6c9" opacity="0.18" className="a-pulse" style={v("4s")} />
      <circle cx="262" cy="42" r="18" fill="#fff3b8" />
      <circle cx="270" cy="36" r="16" fill="#3e3a78" opacity="0.35" />
      <path d="M0 200 V160 Q80 140 160 158 T320 150 V200Z" fill="#1d2747" />
      <rect x="92" y="78" width="16" height="100" fill="#4b3424" />
      <g fill="#24543f">
        <circle cx="100" cy="64" r="40" />
        <circle cx="68" cy="82" r="28" />
        <circle cx="132" cy="82" r="28" />
      </g>
      <g transform="translate(76 86)">
        <polygon points="-4,0 24,-18 52,0" fill="#8a3b2e" />
        <rect x="0" y="0" width="48" height="30" fill="#b9874f" />
        <rect x="16" y="8" width="16" height="13" rx="2" fill="#ffd56b" className="a-blink" style={v("3.5s")} />
        <line x1="10" y1="30" x2="10" y2="72" stroke="#c9a77a" strokeWidth="2" />
        <line x1="20" y1="30" x2="20" y2="72" stroke="#c9a77a" strokeWidth="2" />
        {[40, 50, 60].map((yy) => (
          <line key={yy} x1="10" y1={yy} x2="20" y2={yy} stroke="#c9a77a" strokeWidth="2" />
        ))}
      </g>
      {[
        [40, 120, "0s"], [170, 110, "0.8s"], [210, 132, "1.6s"], [150, 140, "2.2s"], [58, 96, "1.2s"],
      ].map(([x, y, d], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <g className="a-wander" style={v(`${5 + i}s`, d as string)}>
            <circle r="5" fill="#fff59d" opacity="0.25" />
            <circle r="2" fill="#fff59d" className="a-twinkle" style={v("1.4s", d as string)} />
          </g>
        </g>
      ))}
    </>
  );
}

function BunnyBus({ id }: { id: string }) {
  return (
    <>
      <Sky id={id} top="#8fd3ff" bottom="#e6f7ff" />
      {["#ef6f6c", "#f7b32b", "#ffe066", "#5bbf7a", "#4aa3df", "#8e7cc3"].map((c, i) => (
        <path key={c} d={`M${30 + i * 8} 150 A ${130 - i * 8} ${110 - i * 8} 0 0 1 ${290 - i * 8} 150`} fill="none" stroke={c} strokeWidth="8" opacity="0.85" />
      ))}
      <Cloud y={20} t="22s" dl="-6s" />
      <Cloud y={48} t="30s" dl="-18s" s={0.7} />
      <rect x="0" y="150" width="320" height="50" fill="#7cc576" />
      <rect x="0" y="160" width="320" height="16" fill="#5f6b7a" />
      <g transform="translate(0 112)">
        <g className="a-drive" style={v("8s", "-3.5s")}>
          <g className="a-bob" style={v("0.5s", "0s", { "--amp": "-2px" })}>
            <ellipse cx="34" cy="-4" rx="5" ry="14" fill="#fff" stroke="#f3a6b8" strokeWidth="2" />
            <ellipse cx="50" cy="-4" rx="5" ry="14" fill="#fff" stroke="#f3a6b8" strokeWidth="2" />
            <rect x="0" y="6" width="90" height="40" rx="10" fill="#ffcb3d" />
            {[10, 32, 54].map((x) => (
              <rect key={x} x={x} y="13" width="16" height="13" rx="3" fill="#bfe8ff" />
            ))}
            <rect x="74" y="13" width="10" height="22" rx="2" fill="#bfe8ff" />
            <rect x="0" y="32" width="90" height="4" fill="#ef6f6c" />
          </g>
          {[20, 70].map((x) => (
            <g key={x} transform={`translate(${x} 48)`}>
              <g className="a-spin" style={v("0.7s")}>
                <circle r="8" fill="#2b2b2b" />
                <line x1="-6" y1="0" x2="6" y2="0" stroke="#bbb" strokeWidth="2" />
              </g>
            </g>
          ))}
        </g>
      </g>
    </>
  );
}

function CountingClouds({ id }: { id: string }) {
  return (
    <>
      <Sky id={id} top="#5aa9e6" bottom="#d6efff" />
      <g transform="translate(270 40)">
        <g className="a-spin" style={v("24s")}>
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1="0" y1="-30" x2="0" y2="-40" stroke="#ffe27a" strokeWidth="3" strokeLinecap="round" transform={`rotate(${i * 30})`} />
          ))}
        </g>
        <circle r="22" fill="#ffd84d" />
      </g>
      {[
        [16, "18s", "-6s", 1, "1"],
        [60, "22s", "-4s", 1.15, "2"],
        [102, "26s", "-17s", 0.9, "3"],
        [36, "30s", "-25s", 0.75, "4"],
      ].map(([y, t, dl, s, num]) => (
        <g key={num as string} transform={`translate(0 ${y}) scale(${s})`}>
          <g className="a-drift" style={v(t as string, dl as string)}>
            <g fill="#fff">
              <ellipse cx="30" cy="12" rx="28" ry="13" />
              <ellipse cx="48" cy="5" rx="17" ry="12" />
              <ellipse cx="15" cy="7" rx="13" ry="10" />
            </g>
            <text x="30" y="19" textAnchor="middle" fontSize="16" fontWeight="800" fill="#4aa3df" fontFamily="system-ui, sans-serif">
              {num}
            </text>
          </g>
        </g>
      ))}
      <path d="M0 200 V170 Q80 150 160 168 T320 160 V200Z" fill="#8fd18a" />
    </>
  );
}

function DinosaurPicnic({ id }: { id: string }) {
  return (
    <>
      <Sky id={id} top="#9ad9ff" bottom="#e9f8ff" />
      <circle cx="48" cy="38" r="20" fill="#ffd84d" className="a-pulse" style={v("3s")} />
      <Cloud y={18} t="26s" dl="-8s" s={0.8} />
      <rect x="0" y="130" width="320" height="70" fill="#86c96b" />
      <g transform="translate(150 132) skewX(-20)">
        {Array.from({ length: 6 }, (_, i) =>
          Array.from({ length: 3 }, (_, j) => (
            <rect key={`${i}-${j}`} x={i * 16} y={j * 10} width="16" height="10" fill={(i + j) % 2 ? "#fff" : "#ef4444"} />
          ))
        )}
      </g>
      <g transform="translate(70 70)">
        <g className="a-bob" style={v("2.2s", "0s", { "--amp": "-5px" })}>
          <path d="M10 60 Q0 30 30 26 L70 24 Q96 22 98 44 L98 62 Z" fill="#4caf50" />
          <path d="M10 56 Q-20 52 -26 66 Q2 66 14 62Z" fill="#4caf50" />
          <circle cx="84" cy="22" r="20" fill="#4caf50" />
          <circle cx="90" cy="16" r="4" fill="#fff" />
          <circle cx="91" cy="16" r="2" fill="#1b1b1b" />
          <path d="M84 30 q8 6 16 0" fill="none" stroke="#1b1b1b" strokeWidth="2" strokeLinecap="round" />
          {[34, 48, 62].map((x) => (
            <polygon key={x} points={`${x},26 ${x + 6},12 ${x + 12},26`} fill="#2e7d32" />
          ))}
          <rect x="30" y="58" width="12" height="16" rx="4" fill="#388e3c" />
          <rect x="70" y="58" width="12" height="16" rx="4" fill="#388e3c" />
        </g>
      </g>
      <g transform="translate(190 118)">
        <rect width="30" height="8" rx="3" fill="#e2b46b" />
        <rect y="8" width="30" height="5" fill="#7ac143" />
        <rect y="13" width="30" height="8" rx="3" fill="#e2b46b" />
      </g>
      {[[240, 70, "0s", "#f472b6"], [120, 40, "1.2s", "#a78bfa"]].map(([x, y, d, c], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <g className="a-wander" style={v("6s", d as string)}>
            <ellipse cx="-4" cy="0" rx="5" ry="7" fill={c as string} className="a-flap" style={v("0.3s")} />
            <ellipse cx="4" cy="0" rx="5" ry="7" fill={c as string} className="a-flap" style={v("0.3s")} />
          </g>
        </g>
      ))}
    </>
  );
}

/* ---------------- School ---------------- */

function ScienceLab({ id }: { id: string }) {
  return (
    <>
      <Sky id={id} top="#0f3b4f" bottom="#1d6b7f" />
      <g stroke="#fff" opacity="0.08">
        {Array.from({ length: 16 }, (_, i) => (
          <line key={i} x1={i * 20} y1="0" x2={i * 20} y2="200" />
        ))}
      </g>
      <g transform="translate(240 60)">
        <g className="a-spin" style={v("6s")}>
          <ellipse rx="40" ry="14" fill="none" stroke="#9be7ff" strokeWidth="2" />
        </g>
        <g className="a-spin-rev" style={v("8s")}>
          <ellipse rx="40" ry="14" fill="none" stroke="#9be7ff" strokeWidth="2" transform="rotate(60)" />
        </g>
        <g className="a-spin" style={v("10s")}>
          <ellipse rx="40" ry="14" fill="none" stroke="#9be7ff" strokeWidth="2" transform="rotate(120)" />
        </g>
        <circle r="7" fill="#ffd166" className="a-pulse" style={v("1.6s")} />
      </g>
      <g transform="translate(70 30)">
        <path d="M22 0 h20 v36 l30 60 q4 10 -8 10 h-64 q-12 0 -8 -10 l30 -60z" fill="#e8f7ff" opacity="0.92" />
        <path d="M6 76 h52 l12 22 q3 8 -6 8 h-64 q-9 0 -6 -8z" fill="#5eead4" />
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={20 + i * 7} cy="96" r={2 + (i % 3)} fill="#d1fae5" className="a-rise" style={v(`${1.8 + i * 0.3}s`, `${i * 0.4}s`)} />
        ))}
      </g>
      <rect x="0" y="150" width="320" height="50" fill="#0b2a38" />
    </>
  );
}

function AlgebraBoard({ id }: { id: string }) {
  const symbols = [
    ["x\u00b2", 40, 50, "0s"], ["\u03c0", 120, 36, "0.6s"], ["\u221a", 200, 56, "1.2s"],
    ["=", 270, 40, "0.3s"], ["\u00f7", 80, 100, "0.9s"], ["y", 160, 92, "1.5s"], ["+", 240, 104, "0.4s"],
  ] as const;
  return (
    <>
      <Sky id={id} top="#22433a" bottom="#2f5a4d" />
      <rect x="8" y="8" width="304" height="184" rx="6" fill="none" stroke="#8a6a44" strokeWidth="8" />
      {symbols.map(([s, x, y, d]) => (
        <g key={s} transform={`translate(${x} ${y})`}>
          <text className="a-bob" style={v("3s", d, { "--amp": "-8px" })} textAnchor="middle" fontSize="30" fill="#f1f5ee" fontFamily="Georgia, serif" fontStyle="italic">
            {s}
          </text>
        </g>
      ))}
      <path d="M40 150 Q90 120 140 150 T240 150" fill="none" stroke="#f1f5ee" strokeWidth="3" strokeDasharray="300" className="a-draw" style={v("4s")} opacity="0.8" />
    </>
  );
}

function SpinningGlobe({ id }: { id: string }) {
  return (
    <>
      <Sky id={id} top="#1e3a8a" bottom="#3b82f6" />
      <Stars n={10} seed={5} />
      <defs>
        <clipPath id={`${id}-globe`}>
          <circle cx="160" cy="80" r="52" />
        </clipPath>
      </defs>
      <circle cx="160" cy="80" r="52" fill="#38bdf8" />
      <g clipPath={`url(#${id}-globe)`}>
        <g className="a-scroll" style={v("10s", "0s", { "--dist": "-160px" })}>
          {[0, 160].map((off) => (
            <g key={off} transform={`translate(${off} 0)`} fill="#4ade80">
              <path d="M100 50 q20 -14 36 0 q10 14 -6 26 q-20 6 -30 -8z" />
              <path d="M150 90 q14 -6 22 8 q4 18 -12 22 q-14 -6 -10 -30z" />
              <path d="M190 40 q30 -6 40 14 q-6 18 -30 12 q-14 -10 -10 -26z" />
              <path d="M210 92 q16 0 18 12 q-10 10 -20 0z" />
            </g>
          ))}
        </g>
        <ellipse cx="160" cy="80" rx="52" ry="18" fill="none" stroke="#fff" opacity="0.3" />
        <line x1="108" y1="80" x2="212" y2="80" stroke="#fff" opacity="0.3" />
      </g>
      <circle cx="140" cy="60" r="18" fill="#fff" opacity="0.18" />
      <path d="M160 132 v16 M136 152 h48" stroke="#c9a77a" strokeWidth="6" strokeLinecap="round" />
      <g className="a-orbit" style={pivot(160, 80, "7s")}>
        <g transform="translate(160 14)">
          <path d="M-10 0 l20 0 M0 -6 l0 12 M-4 6 l8 0" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </g>
    </>
  );
}

function GrammarPage({ id }: { id: string }) {
  const letters = ["A", "b", "C", ",", "?", "!", "the"];
  return (
    <>
      <Sky id={id} top="#fffaf0" bottom="#f4ead6" />
      <g stroke="#93c5fd" opacity="0.6">
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1="0" y1={24 + i * 20} x2="320" y2={24 + i * 20} />
        ))}
      </g>
      <line x1="34" y1="0" x2="34" y2="200" stroke="#fca5a5" strokeWidth="2" />
      {letters.map((l, i) => (
        <text key={l} x={52 + i * 36} y={i % 2 ? 78 : 60} fontSize={l.length > 1 ? 22 : 30} fill="#1e3a8a" fontFamily="Georgia, serif" className="a-type" style={v("4.2s", `${i * 0.45}s`)}>
          {l}
        </text>
      ))}
      <path d="M52 92 H290" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeDasharray="240" className="a-draw" style={v("4.2s")} />
      <g transform="translate(250 96)">
        <g className="a-write" style={v("1.2s")}>
          <path d="M0 30 L40 -20 Q48 -26 44 -12 L6 34 Z" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" />
          <path d="M0 30 l6 4 -8 4z" fill="#1e3a8a" />
        </g>
      </g>
    </>
  );
}

/* ---------------- History ---------------- */

function SilkRoad({ id }: { id: string }) {
  return (
    <>
      <Sky id={id} top="#f59e0b" bottom="#fde68a" />
      <circle cx="240" cy="64" r="26" fill="#fff4cc" className="a-pulse" style={v("5s")} />
      <path d="M0 140 Q80 110 160 136 T320 124 V200 H0Z" fill="#e0a458" />
      <path d="M0 160 Q100 140 200 160 T320 154 V200 H0Z" fill="#c98a3d" />
      <g transform="translate(0 104)">
        <g className="a-drift" style={v("26s", "-8s")}>
          {[0, 46, 92].map((x, i) => (
            <g key={x} transform={`translate(${x} 0)`}>
              <g className="a-bob" style={v("0.9s", `${i * 0.3}s`, { "--amp": "-2px" })} fill="#5b3a1e">
                <path d="M4 22 q6 -16 16 -10 q6 -14 16 -2 q6 0 8 -10 l6 0 q2 12 -6 22 l0 22 h-4 v-18 h-22 v18 h-4 v-18 h-4 v18 h-4z" />
                <circle cx="49" cy="0" r="3" />
              </g>
            </g>
          ))}
        </g>
      </g>
    </>
  );
}

function IndependenceLetters({ id }: { id: string }) {
  return (
    <>
      <Sky id={id} top="#f6e7c8" bottom="#e7d1a6" />
      {[[40, 26, -12, "0s"], [120, 40, 8, "0.7s"], [200, 22, -6, "1.4s"]].map(([x, y, r, d], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
          <g className="a-sway-c" style={v("3.4s", d as string)}>
            <rect width="70" height="50" rx="3" fill="#fffaf0" stroke="#b08850" />
            {[12, 22, 32].map((yy) => (
              <path key={yy} d={`M8 ${yy} q14 -4 28 0 t26 0`} fill="none" stroke="#6b4f2a" strokeWidth="1.4" />
            ))}
          </g>
        </g>
      ))}
      <g transform="translate(270 90)">
        <circle r="16" fill="#b91c1c" className="a-pulse" style={v("2.4s")} />
        <text y="5" textAnchor="middle" fontSize="14" fill="#fde68a" fontFamily="Georgia, serif" fontWeight="700">
          V
        </text>
      </g>
      <line x1="40" y1="90" x2="40" y2="200" stroke="#5b3a1e" strokeWidth="4" />
      <g transform="translate(42 92)">
        <path className="a-wave" style={v("2.2s")} d="M0 0 Q20 -6 40 0 T80 0 V40 Q60 34 40 40 T0 40Z" fill="#2563eb" />
      </g>
    </>
  );
}

function AncientCities({ id }: { id: string }) {
  return (
    <>
      <Sky id={id} top="#fbbf77" bottom="#fde7c2" />
      <g transform="translate(250 70)">
        <g className="a-sunrise" style={v("8s")}>
          <circle r="22" fill="#fff1c1" />
        </g>
      </g>
      <g fill="#e9d5b0" stroke="#b89466" strokeWidth="1">
        <polygon points="70,58 150,34 230,58" />
        <rect x="70" y="58" width="160" height="9" />
        {[82, 116, 150, 184].map((x) => (
          <rect key={x} x={x} y="67" width="14" height="70" />
        ))}
        <rect x="214" y="100" width="14" height="37" />
        <rect x="60" y="137" width="180" height="8" />
      </g>
      <path d="M0 200 V150 Q90 140 160 150 T320 146 V200Z" fill="#c79a5b" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} cx={30 + i * 50} cy={150} r={1.8} fill="#fff7e6" className="a-dust" style={v(`${5 + i}s`, `${i * 0.8}s`)} />
      ))}
    </>
  );
}

function ClockmakersVienna({ id }: { id: string }) {
  const gear = (r: number, teeth: number) =>
    Array.from({ length: teeth }, (_, i) => (
      <rect key={i} x={-3} y={-r - 6} width="6" height="8" rx="1" transform={`rotate(${(360 / teeth) * i})`} />
    ));
  return (
    <>
      <Sky id={id} top="#3b2416" bottom="#6b4226" />
      <g transform="translate(70 70)" fill="#d4a24c">
        <g className="a-spin" style={v("8s")}>
          {gear(30, 12)}
          <circle r="30" />
          <circle r="10" fill="#3b2416" />
        </g>
      </g>
      <g transform="translate(116 112)" fill="#b8862f">
        <g className="a-spin-rev" style={v("5.4s")}>
          {gear(18, 8)}
          <circle r="18" />
          <circle r="6" fill="#3b2416" />
        </g>
      </g>
      <circle cx="230" cy="74" r="50" fill="#f5ead2" stroke="#d4a24c" strokeWidth="6" />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1="230" y1="30" x2="230" y2="36" stroke="#3b2416" strokeWidth="2" transform={`rotate(${i * 30} 230 74)`} />
      ))}
      <line x1="230" y1="74" x2="230" y2="46" stroke="#3b2416" strokeWidth="3" strokeLinecap="round" className="a-orbit" style={pivot(230, 74, "60s")} />
      <line x1="230" y1="74" x2="230" y2="34" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" className="a-orbit" style={pivot(230, 74, "5s")} />
      <circle cx="230" cy="74" r="3.5" fill="#3b2416" />
      <g className="a-pendulum" style={pivot(230, 124, "1.6s")}>
        <line x1="230" y1="124" x2="230" y2="176" stroke="#d4a24c" strokeWidth="2" />
        <circle cx="230" cy="180" r="8" fill="#d4a24c" />
      </g>
    </>
  );
}

/* ---------------- Nature ---------------- */

function ForestQuiet({ id }: { id: string }) {
  return (
    <>
      <Sky id={id} top="#cfe8c4" bottom="#8cc28a" />
      {[[90, "0s"], [150, "1.2s"], [210, "2.4s"]].map(([x, d]) => (
        <polygon key={x as number} points={`${x},0 ${(x as number) + 30},0 ${(x as number) + 80},200 ${(x as number) + 10},200`} fill="#fffde7" className="a-beam" style={v("5s", d as string)} />
      ))}
      {[10, 60, 230, 280, 130].map((x, i) => (
        <g key={x} transform={`translate(${x} ${60 + (i % 2) * 12})`}>
          <g className="a-sway" style={v(`${4 + i * 0.5}s`, `${i * 0.3}s`)} fill={i % 2 ? "#2f6b45" : "#24543f"}>
            <polygon points="20,0 40,40 30,40 46,80 34,80 50,120 -10,120 6,80 -6,80 10,40 0,40" />
          </g>
        </g>
      ))}
      <rect y="180" width="320" height="20" fill="#3b6b3f" />
      {[[40, "0s", "#e9a23b"], [120, "1.5s", "#d65b2b"], [200, "3s", "#e9c33b"], [270, "4.5s", "#d65b2b"]].map(([x, d, c]) => (
        <g key={x as number} transform={`translate(${x} -10)`}>
          <path className="a-fall" style={v("7s", d as string)} d="M0 0 q6 -8 12 0 q-6 8 -12 0z" fill={c as string} />
        </g>
      ))}
    </>
  );
}

function OceanCurrents({ id }: { id: string }) {
  return (
    <>
      <Sky id={id} top="#0ea5e9" bottom="#0b3b6f" />
      {[[30, "#38bdf8", "5s", 0.5], [60, "#0ea5e9", "7s", 0.4]].map(([y, c, t, o]) => (
        <g key={y as number} transform={`translate(0 ${y})`}>
          <path className="a-scroll" style={v(t as string, "0s", { "--dist": "-80px" })} d="M0 0 q20 -10 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 V200 H0Z" fill={c as string} opacity={o as number} />
        </g>
      ))}
      {[[90, "9s", "-2s", "#fbbf24", 1], [120, "12s", "-7s", "#fb7185", 0.8], [70, "14s", "-11s", "#a3e635", 0.7]].map(([y, t, d, c, s], i) => (
        <g key={i} transform={`translate(0 ${y}) scale(${s})`}>
          <g className="a-drift" style={v(t as string, d as string)}>
            <g className="a-bob" style={v("1.2s", "0s", { "--amp": "-3px" })}>
              <ellipse cx="20" cy="0" rx="16" ry="9" fill={c as string} />
              <polygon points="4,0 -8,-8 -8,8" fill={c as string} />
              <circle cx="28" cy="-2" r="2" fill="#0b3b6f" />
            </g>
          </g>
        </g>
      ))}
      {[40, 80, 250, 290].map((x, i) => (
        <g key={x} transform={`translate(${x} 200)`}>
          <path className="a-sway" style={v(`${3 + i * 0.4}s`)} d="M0 0 q-10 -20 0 -40 q10 -20 0 -40" fill="none" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" />
        </g>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={150 + i * 18} cy={190} r={2 + (i % 2)} fill="#e0f2fe" opacity="0.8" className="a-rise-far" style={v(`${3 + i * 0.6}s`, `${i * 0.7}s`)} />
      ))}
    </>
  );
}

function WildGardens({ id }: { id: string }) {
  const flowers = [[40, "#f472b6"], [90, "#facc15"], [140, "#a78bfa"], [190, "#fb7185"], [240, "#60a5fa"], [285, "#f97316"]] as const;
  return (
    <>
      <Sky id={id} top="#bfe6ff" bottom="#f0fbff" />
      <path d="M0 140 Q80 120 160 138 T320 130 V200 H0Z" fill="#a3d977" />
      {flowers.map(([x, c], i) => (
        <g key={x} transform={`translate(${x} 200)`}>
          <g className="a-sway" style={v(`${2.6 + (i % 3) * 0.5}s`, `${i * 0.2}s`)}>
            <path d={`M0 0 Q${i % 2 ? 6 : -6} -40 0 -${80 + (i % 3) * 14}`} stroke="#3f8f3a" strokeWidth="3" fill="none" />
            <g transform={`translate(0 -${80 + (i % 3) * 14})`}>
              {[0, 72, 144, 216, 288].map((r) => (
                <ellipse key={r} cx="0" cy="-8" rx="5" ry="9" fill={c} transform={`rotate(${r})`} />
              ))}
              <circle r="4" fill="#78350f" />
            </g>
          </g>
        </g>
      ))}
      <g transform="translate(160 60)">
        <g className="a-buzz" style={v("5s")}>
          <ellipse rx="8" ry="6" fill="#facc15" />
          <path d="M-3 -6 v12 M2 -6 v12" stroke="#1f2937" strokeWidth="2" />
          <ellipse cx="-2" cy="-8" rx="5" ry="4" fill="#fff" opacity="0.8" className="a-flap" style={v("0.15s")} />
        </g>
      </g>
    </>
  );
}

function BirdsSunrise({ id }: { id: string }) {
  return (
    <>
      <Sky id={id} top="#fb7185" bottom="#fde68a" />
      <g transform="translate(150 104)">
        <g className="a-sunrise" style={v("9s")}>
          <circle r="40" fill="#fff7d6" opacity="0.35" />
          <circle r="26" fill="#fff1b8" />
        </g>
      </g>
      <path d="M0 200 V150 Q80 130 160 148 T320 140 V200Z" fill="#7c2d12" opacity="0.65" />
      <g color="#3b1d2e">
        {[[30, "10s", "-1s", 1.1], [56, "13s", "-6s", 0.8], [42, "16s", "-10s", 0.9]].map(([y, t, d, s], i) => (
          <g key={i} transform={`translate(0 ${y})`}>
            <g className="a-drift" style={v(t as string, d as string)}>
              <g className="a-flap" style={v("0.6s")}>
                <Bird x={0} y={0} s={s as number} />
                <Bird x={22} y={8} s={(s as number) * 0.8} />
              </g>
            </g>
          </g>
        ))}
      </g>
      <path d="M210 110 Q260 100 320 112" stroke="#3b1d2e" strokeWidth="4" fill="none" />
      <g transform="translate(262 92)">
        <g className="a-bob" style={v("2s", "0s", { "--amp": "-3px" })} fill="#3b1d2e">
          <ellipse cx="0" cy="6" rx="10" ry="8" />
          <circle cx="8" cy="-2" r="5" />
          <polygon points="12,-2 18,0 12,1" fill="#f59e0b" />
        </g>
      </g>
    </>
  );
}

/* ---------------- Adventure ---------------- */

function CopperStorm({ id }: { id: string }) {
  return (
    <>
      <Sky id={id} top="#1f2937" bottom="#7c2d12" />
      <Cloud y={10} t="18s" dl="-4s" o={0.5} />
      <Cloud y={30} t="24s" dl="-14s" s={1.3} o={0.4} />
      <polygon className="a-flash" style={v("4s")} points="190,20 172,64 186,64 170,104 206,52 190,52 204,20" fill="#fde047" />
      <rect width="320" height="200" fill="#fff" className="a-flash-sky" style={v("4s")} />
      <path d="M-10 170 L60 80 L100 116 L150 46 L222 150 L262 108 L330 170 V200 H-10Z" fill="#9a3412" />
      <path d="M150 46 L170 78 L150 72 L132 80Z" fill="#fed7aa" />
      <g stroke="#cbd5e1" strokeWidth="1.5" opacity="0.6">
        <g className="a-rain" style={v("0.6s")}>
          {Array.from({ length: 22 }, (_, i) => (
            <line key={i} x1={(i * 15) % 320} y1={(i * 29) % 200 - 200} x2={(i * 15) % 320 - 6} y2={(i * 29) % 200 - 186} />
          ))}
          {Array.from({ length: 22 }, (_, i) => (
            <line key={`b${i}`} x1={(i * 15) % 320} y1={(i * 29) % 200} x2={(i * 15) % 320 - 6} y2={(i * 29) % 200 + 14} />
          ))}
        </g>
      </g>
    </>
  );
}

function HiddenHarbor({ id }: { id: string }) {
  return (
    <>
      <Sky id={id} top="#f3e2bd" bottom="#e2c891" />
      <path d="M30 150 C70 110 100 140 140 110 S210 70 250 60" fill="none" stroke="#7c2d12" strokeWidth="3" strokeDasharray="6 7" className="a-march" style={v("1.5s")} />
      <g transform="translate(250 58)">
        <g stroke="#b91c1c" strokeWidth="4" strokeLinecap="round" className="a-pulse" style={v("1.6s")}>
          <line x1="-8" y1="-8" x2="8" y2="8" />
          <line x1="8" y1="-8" x2="-8" y2="8" />
        </g>
      </g>
      <g transform="translate(60 52)">
        <circle r="26" fill="#fff8e7" stroke="#7c2d12" strokeWidth="2" />
        <g className="a-spin" style={v("14s")}>
          <polygon points="0,-22 5,0 0,22 -5,0" fill="#b91c1c" />
          <polygon points="-22,0 0,-5 22,0 0,5" fill="#7c2d12" />
        </g>
      </g>
      <path d="M0 170 q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 V200 H0Z" fill="#3b82f6" opacity="0.6" />
      <g transform="translate(170 150)">
        <g className="a-rock" style={v("3s")}>
          <path d="M-30 12 h60 l-10 14 h-40z" fill="#7c2d12" />
          <line x1="0" y1="12" x2="0" y2="-30" stroke="#3f2a1c" strokeWidth="3" />
          <path d="M2 -28 L26 6 H2Z" fill="#fff" />
          <path d="M-2 -24 L-22 6 H-2Z" fill="#fef3c7" />
        </g>
      </g>
    </>
  );
}

function NightTrain({ id }: { id: string }) {
  return (
    <>
      <Sky id={id} top="#0f172a" bottom="#3b2f5c" />
      <Stars n={10} seed={7} />
      <circle cx="50" cy="40" r="14" fill="#fef3c7" />
      <g fill="#1e1b3a">
        {[[150, 70], [176, 50], [204, 80], [230, 40], [258, 66], [286, 56]].map(([x, h]) => (
          <rect key={x} x={x} y={130 - h} width="24" height={h} />
        ))}
      </g>
      {[[156, 72], [182, 92], [210, 64], [236, 100], [262, 76], [292, 86], [236, 116], [182, 110]].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="5" height="6" fill="#fbbf24" className="a-twinkle" style={v(`${2 + (i % 3)}s`, `${i * 0.3}s`)} />
      ))}
      <rect x="0" y="146" width="320" height="4" fill="#64748b" />
      <g transform="translate(0 118)">
        <g className="a-drive" style={v("9s", "-3s")}>
          <rect x="0" y="0" width="54" height="26" rx="4" fill="#b45309" />
          <rect x="58" y="0" width="54" height="26" rx="4" fill="#92400e" />
          <path d="M116 26 V4 Q116 0 122 0 H150 Q162 0 164 14 L166 26Z" fill="#7c2d12" />
          <rect x="126" y="-12" width="10" height="14" fill="#7c2d12" />
          {[6, 22, 38, 64, 80, 96].map((x) => (
            <rect key={x} x={x} y="6" width="11" height="9" rx="1" fill="#fde68a" />
          ))}
          <circle cx="160" cy="12" r="4" fill="#fffbeb" />
          {[14, 42, 72, 100, 130, 152].map((x) => (
            <circle key={x} cx={x} cy="28" r="5" fill="#1f2937" />
          ))}
          <g transform="translate(131 -14)">
            {[0, 1, 2].map((i) => (
              <circle key={i} r={5 + i * 2} fill="#cbd5e1" opacity="0.6" className="a-rise" style={v("2s", `${i * 0.6}s`)} />
            ))}
          </g>
        </g>
      </g>
    </>
  );
}

function CanyonEchoes({ id }: { id: string }) {
  return (
    <>
      <Sky id={id} top="#fdba74" bottom="#fff1db" />
      <circle cx="160" cy="60" r="24" fill="#fff4d6" />
      <path d="M0 200 V70 L40 60 L60 90 L70 140 L110 150 L110 200Z" fill="#b4472a" />
      <path d="M320 200 V60 L280 70 L262 100 L250 140 L210 150 L210 200Z" fill="#a3391f" />
      <path d="M110 150 Q160 170 210 150 V200 H110Z" fill="#7c2d12" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx="160" cy="118" r="8" fill="none" stroke="#fff7ed" strokeWidth="1.5" opacity="0.7" className="a-echo" style={v("3s", `${i}s`)} />
      ))}
      <g className="a-orbit" style={pivot(160, 70, "9s")}>
        <g transform="translate(160 26)">
          <path d="M-14 0 q7 -7 14 0 q7 -7 14 0" fill="none" stroke="#3f2a1c" strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>
    </>
  );
}

/* ---------------- Mix ---------------- */

function KitchenSpices({ id }: { id: string }) {
  return (
    <>
      <Sky id={id} top="#fed7aa" bottom="#fdba74" />
      <g stroke="#fff" opacity="0.15">
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={i * 40} y1="0" x2={i * 40} y2="200" />
        ))}
      </g>
      {[[40, "#dc2626"], [78, "#ca8a04"], [116, "#16a34a"]].map(([x, c]) => (
        <g key={x as number} transform={`translate(${x} 40)`}>
          <rect width="26" height="36" rx="4" fill="#fffaf0" opacity="0.9" />
          <rect y="14" width="26" height="22" rx="3" fill={c as string} />
          <rect x="-2" y="-6" width="30" height="8" rx="2" fill="#78350f" />
        </g>
      ))}
      <rect x="0" y="150" width="320" height="50" fill="#7c2d12" />
      <g transform="translate(220 112)">
        <path d="M-50 0 h100 v24 q0 18 -18 18 h-64 q-18 0 -18 -18z" fill="#374151" />
        <rect x="-58" y="-4" width="116" height="8" rx="4" fill="#4b5563" />
        {[-24, 0, 24].map((x, i) => (
          <path key={x} d={`M${x} -10 q-8 -12 0 -24 q8 -12 0 -24`} fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.7" className="a-steam" style={v("2.6s", `${i * 0.5}s`)} />
        ))}
      </g>
      <g className="a-pendulum" style={pivot(226, 120, "1.4s")}>
        <line x1="226" y1="120" x2="252" y2="70" stroke="#a16207" strokeWidth="5" strokeLinecap="round" />
      </g>
    </>
  );
}

function PuzzleNights({ id }: { id: string }) {
  const piece = "M0 0 h14 q0 -8 6 -8 q6 0 6 8 h14 v14 q8 0 8 6 q0 6 -8 6 v14 h-40z";
  return (
    <>
      <Sky id={id} top="#1e1b4b" bottom="#4c1d95" />
      <Stars n={12} seed={9} />
      <circle cx="270" cy="36" r="16" fill="#fef9c3" />
      <g transform="translate(110 60)">
        {[[0, 0, "#f472b6"], [40, 0, "#60a5fa"], [0, 40, "#facc15"]].map(([x, y, c], i) => (
          <path key={i} d={piece} transform={`translate(${x} ${y})`} fill={c as string} stroke="#1e1b4b" strokeWidth="1.5" />
        ))}
        <g transform="translate(40 40)">
          <path className="a-snap" style={v("3.2s")} d={piece} fill="#4ade80" stroke="#1e1b4b" strokeWidth="1.5" />
        </g>
      </g>
      {[[40, 120, "#fb923c", "0s"], [250, 100, "#a78bfa", "1s"]].map(([x, y, c, d], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(0.7)`}>
          <path className="a-spin" style={v("12s", d as string)} d={piece} fill={c as string} opacity="0.8" />
        </g>
      ))}
    </>
  );
}

function MendAnything({ id }: { id: string }) {
  return (
    <>
      <Sky id={id} top="#93c5fd" bottom="#60a5fa" />
      <g stroke="#fff" opacity="0.12">
        {Array.from({ length: 20 }, (_, i) => (
          <line key={i} x1={i * 16} y1="0" x2={i * 16 - 60} y2="200" />
        ))}
      </g>
      <rect x="60" y="40" width="120" height="80" rx="6" fill="#f472b6" opacity="0.9" />
      <path d="M60 40 H180 V120 H60Z" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="8 8" className="a-march" style={v("1.2s")} />
      <path d="M60 80 C100 40 140 120 240 70" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeDasharray="220" className="a-draw" style={v("3.5s")} />
      <g transform="translate(232 64)">
        <g className="a-stitch" style={v("1.2s")}>
          <path d="M0 0 L40 -26" stroke="#e5e7eb" strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="36" cy="-23" rx="3" ry="1.4" fill="none" stroke="#475569" transform="rotate(-33 36 -23)" />
        </g>
      </g>
      {[[230, 120, "#facc15"], [270, 104, "#34d399"]].map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <g className="a-spin" style={v(`${6 + i * 2}s`)}>
            <circle r="12" fill={c as string} />
            {[[-4, -4], [4, -4], [-4, 4], [4, 4]].map(([a, b]) => (
              <circle key={`${a}${b}`} cx={a} cy={b} r="2" fill="#1f2937" />
            ))}
          </g>
        </g>
      ))}
    </>
  );
}

function SundayShelf({ id }: { id: string }) {
  const books = [["#e8a54b", 22, 60], ["#3d7ea6", 18, 72], ["#c45c26", 24, 56], ["#3f7d57", 20, 76], ["#5c4d7a", 22, 64]] as const;
  let x = 40;
  return (
    <>
      <Sky id={id} top="#f5efe4" bottom="#e8dcc6" />
      <rect x="30" y="108" width="190" height="8" rx="2" fill="#8b5e3c" />
      {books.map(([c, w, h], i) => {
        const bx = x;
        x += w + 4;
        return (
          <g key={i} transform={`translate(${bx} ${108 - h})`}>
            <g className={i === 3 ? "a-slide" : undefined} style={i === 3 ? v("4s") : undefined}>
              <rect width={w} height={h} rx="2" fill={c} />
              <rect x="4" y="12" width={w - 8} height="3" fill="#fff" opacity="0.6" />
            </g>
          </g>
        );
      })}
      <g transform="translate(250 82)">
        <path d="M0 0 h34 v22 q0 14 -14 14 h-6 q-14 0 -14 -14z" fill="#fff" stroke="#c4b5a0" />
        <path d="M34 6 q12 0 10 10 q-2 8 -10 6" fill="none" stroke="#c4b5a0" strokeWidth="3" />
        {[8, 18, 28].map((sx, i) => (
          <path key={sx} d={`M${sx} -4 q-6 -8 0 -16 q6 -8 0 -16`} fill="none" stroke="#b9a68c" strokeWidth="2.5" strokeLinecap="round" className="a-steam" style={v("2.4s", `${i * 0.5}s`)} />
        ))}
      </g>
      <g transform="translate(290 108)">
        <rect x="-10" y="0" width="20" height="18" rx="3" fill="#c2410c" />
        <g className="a-sway" style={v("3.6s")}>
          <path d="M0 0 q-14 -20 -4 -40 M0 0 q10 -16 8 -34 M0 0 q-2 -18 2 -46" stroke="#3f8f3a" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      </g>
      <rect y="150" width="320" height="50" fill="#d6c3a4" />
    </>
  );
}

const SCENES: Record<string, (p: { id: string }) => ReactNode> = {
  "the-moonlit-treehouse": MoonlitTreehouse,
  "bunny-bus-to-rainbow-town": BunnyBus,
  "counting-clouds": CountingClouds,
  "dinosaur-picnic-day": DinosaurPicnic,
  "grade-8-science-made-clear": ScienceLab,
  "algebra-essentials-workbook": AlgebraBoard,
  "world-geography-atlas-for-students": SpinningGlobe,
  "english-grammar-practice-pack": GrammarPage,
  "empires-along-the-silk-road": SilkRoad,
  "voices-of-independence": IndependenceLetters,
  "ancient-cities-unearthed": AncientCities,
  "the-clockmakers-of-vienna": ClockmakersVienna,
  "forest-quiet-a-field-companion": ForestQuiet,
  "ocean-currents-explained": OceanCurrents,
  "wild-gardens-of-the-valley": WildGardens,
  "birds-before-sunrise": BirdsSunrise,
  "ridge-of-the-copper-storm": CopperStorm,
  "map-of-the-hidden-harbor": HiddenHarbor,
  "night-train-to-amber-city": NightTrain,
  "canyon-echoes": CanyonEchoes,
  "kitchen-stories-spices": KitchenSpices,
  "puzzle-nights-anthology": PuzzleNights,
  "how-to-mend-almost-anything": MendAnything,
  "sunday-shelf-sampler": SundayShelf,
};

export function hasAnimatedCover(title: string) {
  return slugify(title) in SCENES;
}

/** Animated illustration for a known title, with its name overlaid. Returns null for unknown titles. */
export function AnimatedCover({ title, author, className }: { title: string; author?: string; className?: string }) {
  const slug = slugify(title);
  const Scene = SCENES[slug];
  if (!Scene) return null;
  return (
    <div className={`anim-cover relative overflow-hidden ${className || ""}`}>
      <svg viewBox="0 0 320 200" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`Animated illustration for ${title}`}>
        <Scene id={`ac-${slug}`} />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-[#f8f4ec]">
        <strong className="block font-display text-lg leading-snug drop-shadow">{title}</strong>
        {author ? <span className="mt-1 block text-[11px] uppercase tracking-[0.12em] opacity-85">{author}</span> : null}
      </div>
    </div>
  );
}
