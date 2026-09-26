import { useId, useMemo } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
 *  Panel artwork — "The Data Innings" (a floodlit night match).
 *  Realistic-leaning SVG: lit gradients, mowing stripes, pitch grain, crowds,
 *  bloom on the floodlights, depth-of-field blur. Decorative (aria-hidden);
 *  the story text lives in the caption boxes next to it.
 * ──────────────────────────────────────────────────────────────────────────── */

export const C = {
  ink: '#0b0c14',
  paper: '#f2ede1',
  blue: '#3b5bff',
  blueDeep: '#1f37b0',
  blueLight: '#7c9dff',
  cyan: '#27e0ff',
  purple: '#8b5cf6',
  pink: '#ff4fd8',
  red: '#e0201f',
};

const W = 480;
const H = 320;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const SHIRTS = ['#3b5bff', '#1f37b0', '#dfe6ff', '#27e0ff', '#7c9dff', '#141b44', '#ffffff', '#5b6bb0'];

/* ── Shared defs ─────────────────────────────────────────────────────────── */

function Defs({ p }: { p: string }) {
  return (
    <defs>
      <linearGradient id={`${p}-sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#02040d" />
        <stop offset="0.55" stopColor="#0a1233" />
        <stop offset="1" stopColor="#1d2f78" />
      </linearGradient>
      <radialGradient id={`${p}-haze`} cx="0.5" cy="0.75" r="0.6">
        <stop offset="0" stopColor="#8fb0ff" stopOpacity="0.45" />
        <stop offset="1" stopColor="#8fb0ff" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${p}-grass`} cx="0.5" cy="0.35" r="0.75">
        <stop offset="0" stopColor="#3f9a55" />
        <stop offset="0.6" stopColor="#1f6b3a" />
        <stop offset="1" stopColor="#0b3320" />
      </radialGradient>
      <pattern id={`${p}-stripes`} width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="skewX(-35)">
        <rect width="17" height="34" fill="#ffffff" fillOpacity="0.07" />
      </pattern>
      <linearGradient id={`${p}-pitch`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#cdb487" />
        <stop offset="1" stopColor="#e3cf9f" />
      </linearGradient>
      <linearGradient id={`${p}-stand`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0c1233" />
        <stop offset="1" stopColor="#1a2458" />
      </linearGradient>
      <linearGradient id={`${p}-steel`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#3a4260" />
        <stop offset="0.5" stopColor="#8a93b3" />
        <stop offset="1" stopColor="#2a3150" />
      </linearGradient>
      <linearGradient id={`${p}-stump`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#8f8672" />
        <stop offset="0.45" stopColor="#fbf7ec" />
        <stop offset="1" stopColor="#a89e88" />
      </linearGradient>
      <linearGradient id={`${p}-willow`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#b98e56" />
        <stop offset="0.4" stopColor="#f0d6a3" />
        <stop offset="1" stopColor="#a67a45" />
      </linearGradient>
      <radialGradient id={`${p}-ball`} cx="0.35" cy="0.3" r="0.75">
        <stop offset="0" stopColor="#ff8a80" />
        <stop offset="0.35" stopColor="#c81d25" />
        <stop offset="1" stopColor="#4a0306" />
      </radialGradient>
      <linearGradient id={`${p}-beam`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#eaf3ff" stopOpacity="0.55" />
        <stop offset="1" stopColor="#9fc0ff" stopOpacity="0" />
      </linearGradient>
      <radialGradient id={`${p}-glow`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
        <stop offset="0.25" stopColor="#dce8ff" stopOpacity="0.8" />
        <stop offset="1" stopColor="#7c9dff" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${p}-screen`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0d1540" />
        <stop offset="1" stopColor="#050818" />
      </linearGradient>
      <linearGradient id={`${p}-alu`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#d9dde8" />
        <stop offset="1" stopColor="#8d93a6" />
      </linearGradient>
      {/* dot-matrix LED overlay */}
      <pattern id={`${p}-led`} width="3" height="3" patternUnits="userSpaceOnUse">
        <rect width="3" height="3" fill="#000" fillOpacity="0.16" />
        <circle cx="1.5" cy="1.5" r="1.05" fill="#000" fillOpacity="0" />
        <rect x="0.4" y="0.4" width="2.2" height="2.2" rx="1.1" fill="#fff" fillOpacity="0.02" />
      </pattern>
      <pattern id={`${p}-mesh`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <path d="M0 0H8M0 0V8" stroke="#dfe6ff" strokeOpacity="0.28" strokeWidth="0.7" fill="none" />
      </pattern>
      <filter id={`${p}-grain`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer><feFuncA type="linear" slope="0.14" /></feComponentTransfer>
      </filter>
      <filter id={`${p}-bloom`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
      <filter id={`${p}-soft`} x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="1.6" />
      </filter>
      <filter id={`${p}-shadow`} x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.55" />
      </filter>
    </defs>
  );
}

function Sky({ p, stars = true }: { p: string; stars?: boolean }) {
  return (
    <>
      <rect width={W} height={H} fill={`url(#${p}-sky)`} />
      <rect width={W} height={H} fill={`url(#${p}-haze)`} />
      {stars &&
        [[40, 26], [118, 14], [206, 34], [296, 18], [388, 30], [452, 52], [80, 60], [352, 66], [160, 72], [250, 50]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.1 : 0.7} fill="#fff" fillOpacity={0.5 + (i % 4) * 0.12} />
        ))}
    </>
  );
}

/** Lattice floodlight tower with a bank of lamps, bloom and a soft beam. */
function Floodlight({ p, x, y = 40, h = 190, flip = false, beam = true }: { p: string; x: number; y?: number; h?: number; flip?: boolean; beam?: boolean }) {
  const dir = flip ? -1 : 1;
  const base = y + h;
  const braces = Array.from({ length: 9 }, (_, i) => y + 22 + i * ((h - 22) / 9));
  return (
    <g>
      {beam && (
        <polygon
          points={`${x - 16},${y + 10} ${x + 16},${y + 10} ${x + dir * 210},${H} ${x + dir * 20},${H}`}
          fill={`url(#${p}-beam)`}
          filter={`url(#${p}-soft)`}
          opacity="0.5"
        />
      )}
      {/* lattice mast */}
      <path d={`M${x - 3} ${y + 20} L${x - 8} ${base} M${x + 3} ${y + 20} L${x + 8} ${base}`} stroke={`url(#${p}-steel)`} strokeWidth="2" />
      {braces.map((by, i) => {
        const t = (by - y - 20) / (h - 20);
        const hw = 3 + t * 5;
        const t2 = (by + (h - 22) / 9 - y - 20) / (h - 20);
        const hw2 = 3 + t2 * 5;
        return <path key={i} d={`M${x - hw} ${by} L${x + hw2} ${by + (h - 22) / 9}`} stroke="#5d6688" strokeWidth="0.9" />;
      })}
      {/* lamp head */}
      <rect x={x - 24} y={y - 2} width="48" height="24" rx="2" fill="#1a1f33" stroke="#4a5270" strokeWidth="1" />
      <circle cx={x} cy={y + 10} r="34" fill={`url(#${p}-glow)`} opacity="0.85" filter={`url(#${p}-bloom)`} />
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3, 4].map((c) => <circle key={`${r}${c}`} cx={x - 18 + c * 9} cy={y + 4 + r * 7} r="2.9" fill="#ffffff" />),
      )}
    </g>
  );
}

/** Tiered stand band with a deterministic crowd, clipped to a curved path. */
function Stands({ p, top, bottom, seed = 1, blur = false }: { p: string; top: string; bottom: string; seed?: number; blur?: boolean }) {
  const clip = `${p}-standclip-${seed}`;
  const crowd = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: 900 }, () => ({
      x: r() * W,
      y: 90 + r() * 200,
      rr: 0.9 + r() * 1.1,
      c: SHIRTS[Math.floor(r() * SHIRTS.length)],
      o: 0.35 + r() * 0.5,
    }));
  }, [seed]);
  const d = `${top} ${bottom} Z`;
  return (
    <g filter={blur ? `url(#${p}-soft)` : undefined}>
      <clipPath id={clip}><path d={d} /></clipPath>
      <path d={d} fill={`url(#${p}-stand)`} />
      <g clipPath={`url(#${clip})`}>
        {crowd.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r={c.rr} fill={c.c} fillOpacity={c.o} />)}
        {/* tier lines */}
        {[0, 1, 2, 3].map((i) => <rect key={i} x="0" y={120 + i * 26} width={W} height="1.2" fill="#000" fillOpacity="0.35" />)}
      </g>
      <path d={top} fill="none" stroke="#2a356e" strokeWidth="2" />
    </g>
  );
}

/** Broadcast-style advertising boards along the boundary. */
function AdBoards({ y, text = 'THE DATA INNINGS · MANOJ KAPRI · DATA ANALYST · MIS' }: { y: number; text?: string }) {
  return (
    <g>
      <rect x="0" y={y} width={W} height="11" fill="#0b1440" />
      <rect x="0" y={y} width={W} height="11" fill={C.blue} fillOpacity="0.55" />
      <text x="6" y={y + 8.3} fontFamily="JetBrains Mono Variable, monospace" fontSize="7" fontWeight="700" fill="#e6ecff" letterSpacing="1.5">
        {`${text}  ·  ${text}`}
      </text>
    </g>
  );
}

function Field({ p, cx = 240, cy = 300, rx = 300, ry = 100 }: { p: string; cx?: number; cy?: number; rx?: number; ry?: number }) {
  const clip = `${p}-fieldclip`;
  return (
    <g>
      <clipPath id={clip}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} /></clipPath>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${p}-grass)`} />
      <g clipPath={`url(#${clip})`}>
        <rect width={W} height={H} fill={`url(#${p}-stripes)`} />
        <rect width={W} height={H} filter={`url(#${p}-grain)`} opacity="0.7" />
      </g>
      <ellipse cx={cx} cy={cy} rx={rx - 10} ry={ry - 5} fill="none" stroke="#ffffff" strokeOpacity="0.75" strokeWidth="1.3" />
    </g>
  );
}

/** Perspective pitch with creases and grain. */
function Pitch({ p, x1, x2, x3, x4, y1, y2 }: { p: string; x1: number; x2: number; x3: number; x4: number; y1: number; y2: number }) {
  const clip = `${p}-pitchclip`;
  const d = `M${x1} ${y1} L${x2} ${y1} L${x3} ${y2} L${x4} ${y2} Z`;
  const cy = y1 + (y2 - y1) * 0.12;
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const t = 0.12;
  return (
    <g>
      <clipPath id={clip}><path d={d} /></clipPath>
      <path d={d} fill={`url(#${p}-pitch)`} />
      <g clipPath={`url(#${clip})`}>
        <rect width={W} height={H} filter={`url(#${p}-grain)`} />
        <line x1={lerp(x1, x4, t) - 6} x2={lerp(x2, x3, t) + 6} y1={cy} y2={cy} stroke="#fff" strokeWidth="1.3" />
        <line x1={lerp(x1, x4, 0.9) - 6} x2={lerp(x2, x3, 0.9) + 6} y1={y1 + (y2 - y1) * 0.9} y2={y1 + (y2 - y1) * 0.9} stroke="#fff" strokeWidth="1.8" />
      </g>
    </g>
  );
}

function Stumps({ p, x, y, s = 1 }: { p: string; x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="11" cy="47" rx="16" ry="3" fill="#000" fillOpacity="0.35" />
      {[0, 9, 18].map((dx) => <rect key={dx} x={dx} y={0} width={4.4} height={46} rx="2" fill={`url(#${p}-stump)`} />)}
      <rect x={-0.5} y={-2.4} width={11.5} height={3} rx="1.5" fill="#e9dcc0" stroke="#8a7b5c" strokeWidth="0.5" />
      <rect x={10} y={-2.4} width={11.5} height={3} rx="1.5" fill="#e9dcc0" stroke="#8a7b5c" strokeWidth="0.5" />
    </g>
  );
}

function Ball({ p, x, y, r = 10 }: { p: string; x: number; y: number; r?: number }) {
  return (
    <g filter={`url(#${p}-shadow)`}>
      <circle cx={x} cy={y} r={r} fill={`url(#${p}-ball)`} />
      <path d={`M${x - r * 0.75} ${y - r * 0.55} Q${x} ${y + r * 0.1} ${x + r * 0.7} ${y + r * 0.62}`} stroke="#f7e7c8" strokeWidth={r * 0.13} fill="none" strokeDasharray={`${r * 0.12} ${r * 0.14}`} />
      <path d={`M${x - r * 0.62} ${y - r * 0.7} Q${x + r * 0.1} ${y - r * 0.05} ${x + r * 0.8} ${y + r * 0.45}`} stroke="#f7e7c8" strokeOpacity="0.55" strokeWidth={r * 0.06} fill="none" />
    </g>
  );
}

function Bat({ p, x, y, rot = 0, s = 1 }: { p: string; x: number; y: number; rot?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} filter={`url(#${p}-shadow)`}>
      <rect x="-4.5" y="-46" width="9" height="50" rx="4" fill="#20263f" />
      {Array.from({ length: 9 }).map((_, i) => <rect key={i} x="-4.5" y={-44 + i * 5} width="9" height="1.4" fill="#3b4670" />)}
      <path d="M-14 4 Q-15 60 -12 108 Q0 116 12 108 Q15 60 14 4 Q0 0 -14 4 Z" fill={`url(#${p}-willow)`} />
      <path d="M0 10 L0 104" stroke="#8a6436" strokeOpacity="0.35" strokeWidth="2" />
      <rect x="-10" y="22" width="20" height="30" rx="2" fill={C.blue} />
      <text x="0" y="41" textAnchor="middle" fontFamily="Bangers, sans-serif" fontSize="9" fill="#fff">MK</text>
    </g>
  );
}

function Frame({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {children}
      {label && (
        <g>
          <rect x="10" y="10" width={label.length * 7.6 + 18} height="22" fill={C.blue} stroke={C.ink} strokeWidth="2.5" />
          <text x="19" y="26" fontFamily="Bangers, sans-serif" fontSize="15" letterSpacing="1" fill="#fff">{label}</text>
        </g>
      )}
    </svg>
  );
}

const standBottom = 'L480 238 Q240 196 0 238';

/* 1 ─ Prologue: floodlit stadium, ball flying off the bat */
export function StadiumScene() {
  const p = useId().replace(/:/g, '');
  return (
    <Frame label="THE PROLOGUE">
      <Defs p={p} />
      <Sky p={p} />
      <Floodlight p={p} x={62} y={36} h={150} />
      <Floodlight p={p} x={418} y={36} h={150} flip />
      {/* roof canopy */}
      <path d="M0 150 Q240 86 480 150 L480 160 Q240 98 0 160 Z" fill="#070a1c" />
      <path d="M0 160 Q240 98 480 160" stroke="#bcd0ff" strokeOpacity="0.5" strokeWidth="1" fill="none" />
      <Stands p={p} top="M0 160 Q240 98 480 160" bottom={standBottom} seed={11} />
      <AdBoards y={232} />
      <Field p={p} cy={332} rx={310} ry={88} />
      <Pitch p={p} x1={226} x2={254} x3={276} x4={204} y1={260} y2={320} />
      <Stumps p={p} x={229} y={236} s={0.52} />
      {/* ball in flight with motion trail */}
      <path d="M244 252 Q300 110 420 64" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.2" strokeDasharray="3 6" />
      <path d="M372 86 Q396 72 414 66" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" opacity="0.18" filter={`url(#${p}-soft)`} />
      <path d="M386 78 Q400 70 414 66" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.3" />
      <Ball p={p} x={420} y={64} r={9} />
    </Frame>
  );
}

/* 2 ─ M3M: stadium LED scoreboard */
export function ScoreboardScene() {
  const p = useId().replace(/:/g, '');
  const rows = [
    ['TEAM', 'M3M INDIA'],
    ['ROLE', 'MIS EXECUTIVE'],
    ['FIELD', 'REAL ESTATE'],
    ['SPELL', '2023 – 2025'],
    ['DELIVERED', 'REPORTS · DASHBOARDS'],
  ];
  return (
    <Frame label="INNINGS 1">
      <Defs p={p} />
      <Sky p={p} />
      {/* blurred background stadium = depth of field */}
      <g filter={`url(#${p}-soft)`}>
        <Floodlight p={p} x={440} y={30} h={150} flip beam={false} />
        <Stands p={p} top="M0 150 Q240 110 480 150" bottom="L480 262 L0 262" seed={21} />
      </g>
      <rect x="0" y="262" width={W} height="58" fill={`url(#${p}-grass)`} />
      <rect x="0" y="262" width={W} height="58" fill={`url(#${p}-stripes)`} />
      {/* scoreboard */}
      <g filter={`url(#${p}-shadow)`}>
        <rect x="50" y="52" width="330" height="206" rx="4" fill={`url(#${p}-steel)`} />
        <rect x="58" y="60" width="314" height="190" fill={`url(#${p}-screen)`} />
        <rect x="58" y="60" width="314" height="32" fill={C.blueDeep} />
        <text x="215" y="82" textAnchor="middle" fontFamily="JetBrains Mono Variable, monospace" fontSize="15" fontWeight="700" letterSpacing="4" fill="#fff">SCOREBOARD</text>
        {rows.map(([k, v], i) => (
          <g key={k}>
            <text x="72" y={120 + i * 27} fontFamily="JetBrains Mono Variable, monospace" fontSize="12.5" fontWeight="700" fill={C.blueLight}>{k}</text>
            <text x="358" y={120 + i * 27} textAnchor="end" fontFamily="JetBrains Mono Variable, monospace" fontSize="13.5" fontWeight="700" fill={C.cyan}>{v}</text>
          </g>
        ))}
        <rect x="58" y="60" width="314" height="190" fill={`url(#${p}-led)`} />
      </g>
      <rect x="112" y="258" width="8" height="18" fill={`url(#${p}-steel)`} />
      <rect x="310" y="258" width="8" height="18" fill={`url(#${p}-steel)`} />
      <Bat p={p} x={410} y={170} rot={12} s={0.95} />
    </Frame>
  );
}

/* 3 ─ AECOM: broadcast wagon wheel over a top-down ground (= O-D routes) */
export function WagonWheelScene() {
  const p = useId().replace(/:/g, '');
  const cx = 240;
  const cy = 164;
  const shots = [[-160, -60], [-120, 46], [-60, -104], [18, -118], [96, -92], [168, -36], [154, 58], [70, 100], [-30, 110], [-176, 4], [112, 16], [-94, 78]];
  const clip = `${p}-topclip`;
  return (
    <Frame label="NEW GROUND">
      <Defs p={p} />
      <rect width={W} height={H} fill="#070b1d" />
      {/* aerial stands ring */}
      <ellipse cx={cx} cy={cy} rx="236" ry="158" fill={`url(#${p}-stand)`} />
      <Stands p={p} top={`M${cx - 236} ${cy} A236 158 0 0 1 ${cx + 236} ${cy}`} bottom={`A236 158 0 0 1 ${cx - 236} ${cy}`} seed={31} />
      <clipPath id={clip}><ellipse cx={cx} cy={cy} rx="206" ry="138" /></clipPath>
      <ellipse cx={cx} cy={cy} rx="206" ry="138" fill={`url(#${p}-grass)`} />
      <g clipPath={`url(#${clip})`}>
        {Array.from({ length: 14 }).map((_, i) => <rect key={i} x={cx - 210 + i * 30} y="0" width="15" height={H} fill="#fff" fillOpacity="0.06" />)}
        <rect width={W} height={H} filter={`url(#${p}-grain)`} opacity="0.7" />
      </g>
      <ellipse cx={cx} cy={cy} rx="198" ry="132" fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="1.5" />
      <ellipse cx={cx} cy={cy} rx="110" ry="74" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.2" strokeDasharray="4 5" />
      <rect x={cx - 7} y={cy - 26} width="14" height="52" fill={`url(#${p}-pitch)`} />
      {/* broadcast shot lines */}
      <g filter={`url(#${p}-bloom)`} opacity="0.9">
        {shots.map(([dx, dy], i) => <line key={i} x1={cx} y1={cy} x2={cx + dx} y2={cy + dy} stroke={i % 3 === 0 ? C.pink : C.cyan} strokeWidth="4" />)}
      </g>
      {shots.map(([dx, dy], i) => (
        <g key={i}>
          <line x1={cx} y1={cy} x2={cx + dx} y2={cy + dy} stroke={i % 3 === 0 ? '#ffd1f5' : '#d6fbff'} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx={cx + dx} cy={cy + dy} r="3.6" fill="#fff" />
        </g>
      ))}
      {/* lower-third graphic */}
      <g transform="translate(262 276)">
        <rect width="208" height="34" fill={C.blueDeep} />
        <rect width="6" height="34" fill={C.cyan} />
        <text x="16" y="14" fontFamily="JetBrains Mono Variable, monospace" fontSize="9.5" fontWeight="700" fill="#c9d4ff">WAGON WHEEL</text>
        <text x="16" y="27" fontFamily="JetBrains Mono Variable, monospace" fontSize="10.5" fontWeight="700" fill="#fff">ORIGIN → DESTINATION</text>
      </g>
    </Frame>
  );
}

/* 4 ─ The LaLiT: twelve floodlit grounds (aerial) feeding one dashboard */
function MiniGround({ p, x, y, i }: { p: string; x: number; y: number; i: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse rx="21" ry="15" fill="#10173d" stroke="#2a356e" strokeWidth="1" />
      <ellipse rx="15.5" ry="10.5" fill={`url(#${p}-grass)`} />
      <ellipse rx="15.5" ry="10.5" fill={`url(#${p}-stripes)`} />
      <rect x="-1.4" y="-4" width="2.8" height="8" fill="#d9c28f" />
      {[[-19, -12], [19, -12], [-19, 12], [19, 12]].map(([fx, fy], k) => (
        <g key={k}>
          <circle cx={fx} cy={fy} r="6" fill={`url(#${p}-glow)`} opacity="0.7" />
          <circle cx={fx} cy={fy} r="1.3" fill="#fff" />
        </g>
      ))}
      <text y="26" textAnchor="middle" fontFamily="JetBrains Mono Variable, monospace" fontSize="6.5" fill="#8fa4ff">{String(i + 1).padStart(2, '0')}</text>
    </g>
  );
}

export function TwelveGroundsScene() {
  const p = useId().replace(/:/g, '');
  const grounds = Array.from({ length: 12 }, (_, i) => ({ x: 40 + (i % 4) * 58, y: 72 + Math.floor(i / 4) * 80 }));
  const hub = { x: 380, y: 170 };
  return (
    <Frame label="12 GROUNDS">
      <Defs p={p} />
      <rect width={W} height={H} fill="#050818" />
      <rect width={W} height={H} fill={`url(#${p}-haze)`} opacity="0.6" />
      {/* city-at-night texture */}
      {useMemo(() => {
        const r = rng(41);
        return Array.from({ length: 220 }, (_, i) => <circle key={i} cx={r() * W} cy={r() * H} r={0.5 + r() * 0.7} fill="#9fb4ff" fillOpacity={0.12 + r() * 0.25} />);
      }, [])}
      <g filter={`url(#${p}-bloom)`} opacity="0.8">
        {grounds.map((g, i) => (
          <path key={i} d={`M${g.x + 20} ${g.y} C ${g.x + 90} ${g.y}, ${hub.x - 100} ${hub.y}, ${hub.x - 68} ${hub.y}`} stroke={i % 2 ? C.cyan : C.purple} strokeWidth="3" fill="none" />
        ))}
      </g>
      {grounds.map((g, i) => (
        <path key={`t${i}`} d={`M${g.x + 20} ${g.y} C ${g.x + 90} ${g.y}, ${hub.x - 100} ${hub.y}, ${hub.x - 68} ${hub.y}`} stroke="#dbe5ff" strokeOpacity="0.8" strokeWidth="1" fill="none" />
      ))}
      {grounds.map((g, i) => <MiniGround key={i} p={p} x={g.x} y={g.y} i={i} />)}
      {/* tablet dashboard */}
      <g transform={`translate(${hub.x - 70} ${hub.y - 100})`} filter={`url(#${p}-shadow)`}>
        <rect width="156" height="200" rx="12" fill="#111526" stroke="#3a4260" strokeWidth="1.5" />
        <rect x="8" y="10" width="140" height="180" rx="4" fill={`url(#${p}-screen)`} />
        <rect x="8" y="10" width="140" height="26" rx="4" fill={C.blueDeep} />
        <text x="78" y="28" textAnchor="middle" fontFamily="JetBrains Mono Variable, monospace" fontSize="10.5" fontWeight="700" letterSpacing="2" fill="#fff">WEEKLY MIS</text>
        {[0.55, 0.8, 0.65, 0.9, 0.72].map((v, i) => (
          <rect key={i} x={22 + i * 24} y={136 - v * 84} width="15" height={v * 84} rx="2" fill={i % 2 ? C.purple : C.blue} />
        ))}
        <polyline points="29,96 53,70 77,84 101,58 125,72" fill="none" stroke={C.cyan} strokeWidth="1.8" />
        <line x1="16" x2="140" y1="137" y2="137" stroke="#3a4a8a" />
        <text x="78" y="158" textAnchor="middle" fontFamily="JetBrains Mono Variable, monospace" fontSize="9.5" fontWeight="700" fill="#e6ecff">12 PROPERTIES</text>
        <text x="78" y="174" textAnchor="middle" fontFamily="JetBrains Mono Variable, monospace" fontSize="8.5" fontWeight="700" fill={C.blueLight}>GSI · FEEDBACK · AUDITS</text>
      </g>
    </Frame>
  );
}

/* 5 ─ Choosing the format: the big screen's DRS decision */
export function DecisionScene() {
  const p = useId().replace(/:/g, '');
  return (
    <Frame label="THE REVIEW">
      <Defs p={p} />
      <Sky p={p} />
      <g filter={`url(#${p}-soft)`}>
        <Floodlight p={p} x={46} y={30} h={150} beam={false} />
        <Stands p={p} top="M0 160 Q240 118 480 160" bottom="L480 268 L0 268" seed={51} />
      </g>
      <rect x="0" y="266" width={W} height="54" fill={`url(#${p}-grass)`} />
      <rect x="0" y="266" width={W} height="54" fill={`url(#${p}-stripes)`} />
      {/* big screen */}
      <g filter={`url(#${p}-shadow)`}>
        <rect x="92" y="40" width="308" height="198" rx="4" fill={`url(#${p}-steel)`} />
        <rect x="100" y="48" width="292" height="182" fill={`url(#${p}-screen)`} />
        <rect x="100" y="48" width="292" height="28" fill={C.blueDeep} />
        <text x="246" y="67" textAnchor="middle" fontFamily="JetBrains Mono Variable, monospace" fontSize="12" fontWeight="700" letterSpacing="3" fill="#fff">DRS · DECISION REVIEW</text>
        <rect x="118" y="92" width="118" height="48" fill="#1b2150" />
        <text x="177" y="113" textAnchor="middle" fontFamily="JetBrains Mono Variable, monospace" fontSize="10.5" fontWeight="700" fill="#7d84ad">L&amp;D-RELATED</text>
        <text x="177" y="128" textAnchor="middle" fontFamily="JetBrains Mono Variable, monospace" fontSize="10.5" fontWeight="700" fill="#7d84ad">REPORTING</text>
        <line x1="122" y1="96" x2="232" y2="136" stroke={C.red} strokeWidth="3" />
        <rect x="256" y="92" width="122" height="48" fill={C.blue} />
        <text x="317" y="113" textAnchor="middle" fontFamily="JetBrains Mono Variable, monospace" fontSize="10.5" fontWeight="700" fill="#fff">HANDS-ON</text>
        <text x="317" y="128" textAnchor="middle" fontFamily="JetBrains Mono Variable, monospace" fontSize="10.5" fontWeight="700" fill="#fff">DATA ANALYSIS</text>
        <rect x="146" y="158" width="200" height="54" fill={C.blueDeep} />
        <rect x="146" y="158" width="200" height="54" fill="none" stroke={C.cyan} strokeWidth="2" />
        <text x="246" y="194" textAnchor="middle" fontFamily="JetBrains Mono Variable, monospace" fontSize="24" fontWeight="700" letterSpacing="6" fill="#fff">DATA ✓</text>
        <rect x="100" y="48" width="292" height="182" fill={`url(#${p}-led)`} />
      </g>
      <rect x="148" y="238" width="9" height="30" fill={`url(#${p}-steel)`} />
      <rect x="334" y="238" width="9" height="30" fill={`url(#${p}-steel)`} />
    </Frame>
  );
}

/* 6 ─ Nets practice: laptop, stumps, graduation cap, CGPA board */
export function NetsScene() {
  const p = useId().replace(/:/g, '');
  return (
    <Frame label="NETS PRACTICE">
      <Defs p={p} />
      <Sky p={p} stars={false} />
      <Floodlight p={p} x={440} y={24} h={120} flip />
      {/* net tunnel */}
      <polygon points="70,46 410,46 470,300 10,300" fill="#0a1033" fillOpacity="0.55" />
      <polygon points="70,46 410,46 470,300 10,300" fill={`url(#${p}-mesh)`} />
      <polygon points="70,46 410,46 470,300 10,300" fill="none" stroke="#c9d4ff" strokeOpacity="0.4" strokeWidth="1.5" />
      <line x1="70" y1="46" x2="10" y2="300" stroke={`url(#${p}-steel)`} strokeWidth="3" />
      <line x1="410" y1="46" x2="470" y2="300" stroke={`url(#${p}-steel)`} strokeWidth="3" />
      {/* artificial turf strip */}
      <polygon points="186,300 294,300 272,196 208,196" fill="#1f6b3a" />
      <polygon points="186,300 294,300 272,196 208,196" fill={`url(#${p}-stripes)`} />
      <Stumps p={p} x={226} y={160} s={0.85} />
      <g transform="translate(236 154)" filter={`url(#${p}-shadow)`}>
        <polygon points="-32,-8 0,-21 32,-8 0,5" fill="#101426" />
        <polygon points="-32,-8 0,-21 32,-8 0,5" fill="none" stroke="#3a4260" />
        <rect x="-15" y="-4" width="30" height="11" fill="#1a1f33" />
        <line x1="24" y1="-10" x2="28" y2="13" stroke={C.cyan} strokeWidth="2" />
        <circle cx="28" cy="14" r="2" fill={C.cyan} />
      </g>
      {/* laptop */}
      <g transform="translate(34 196)" filter={`url(#${p}-shadow)`}>
        <rect width="134" height="84" rx="5" fill={`url(#${p}-alu)`} />
        <rect x="6" y="6" width="122" height="72" rx="2" fill="#070b1d" />
        <text x="14" y="24" fontFamily="JetBrains Mono Variable, monospace" fontSize="9" fill={C.cyan}>import pandas as pd</text>
        <text x="14" y="38" fontFamily="JetBrains Mono Variable, monospace" fontSize="9" fill={C.pink}>df.describe()</text>
        <text x="14" y="52" fontFamily="JetBrains Mono Variable, monospace" fontSize="9" fill={C.blueLight}>SELECT … FROM …</text>
        <text x="14" y="66" fontFamily="JetBrains Mono Variable, monospace" fontSize="9" fill="#fff">=XLOOKUP(…)</text>
        <polygon points="-8,84 142,84 152,96 -18,96" fill={`url(#${p}-alu)`} />
      </g>
      <Ball p={p} x={196} y={284} r={7} />
      {/* CGPA LED board */}
      <g transform="translate(328 170)" filter={`url(#${p}-shadow)`}>
        <rect width="124" height="88" rx="3" fill={`url(#${p}-steel)`} />
        <rect x="5" y="5" width="114" height="78" fill={`url(#${p}-screen)`} />
        <text x="62" y="26" textAnchor="middle" fontFamily="JetBrains Mono Variable, monospace" fontSize="10.5" fontWeight="700" fill={C.blueLight}>MBA · CGPA</text>
        <text x="62" y="68" textAnchor="middle" fontFamily="JetBrains Mono Variable, monospace" fontSize="32" fontWeight="700" fill={C.cyan}>8.27</text>
        <rect x="5" y="5" width="114" height="78" fill={`url(#${p}-led)`} />
      </g>
    </Frame>
  );
}

/* 7 ─ Finale: the hero under the lights (uses the comic portrait) */
export function FinaleScene({ hero }: { hero: string }) {
  const p = useId().replace(/:/g, '');
  return (
    <Frame label="NEXT MATCH">
      <Defs p={p} />
      <Sky p={p} />
      <Floodlight p={p} x={52} y={34} h={140} />
      <Floodlight p={p} x={428} y={34} h={140} flip />
      <Stands p={p} top="M0 190 Q240 150 480 190" bottom="L480 262 Q240 236 0 262" seed={71} />
      <AdBoards y={256} />
      <Field p={p} cy={342} rx={320} ry={74} />
      {/* spotlight halo */}
      <circle cx="240" cy="158" r="140" fill={`url(#${p}-glow)`} opacity="0.35" filter={`url(#${p}-bloom)`} />
      <circle cx="240" cy="158" r="110" fill={C.blueDeep} stroke={C.blueLight} strokeWidth="3" />
      <circle cx="240" cy="158" r="110" fill="none" stroke={C.cyan} strokeOpacity="0.5" strokeWidth="10" filter={`url(#${p}-bloom)`} />
      <clipPath id={`${p}-clip`}><circle cx="240" cy="158" r="104" /></clipPath>
      <image href={hero} x="136" y="54" width="208" height="208" clipPath={`url(#${p}-clip)`} preserveAspectRatio="xMidYMid slice" />
      <circle cx="240" cy="158" r="104" fill="none" stroke={C.ink} strokeWidth="4" />
      <Stumps p={p} x={58} y={262} s={0.7} />
      <Stumps p={p} x={406} y={262} s={0.7} />
    </Frame>
  );
}
