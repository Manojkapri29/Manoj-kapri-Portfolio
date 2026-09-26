import { useId } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
 *  Comic panel artwork — "The Data Innings" (a day-night cricket match).
 *  Pure SVG so it stays crisp and light. All art is decorative (aria-hidden);
 *  the story text lives in the caption boxes next to it.
 * ──────────────────────────────────────────────────────────────────────────── */

export const C = {
  ink: '#0b0c14',
  paper: '#f2ede1',
  yellow: '#ffcc32',
  red: '#e0201f',
  blue: '#3b5bff',
  purple: '#8b5cf6',
  cyan: '#27e0ff',
  pink: '#ff4fd8',
  night: '#0a0f2c',
  grass: '#0f5a3c',
  grass2: '#127a4f',
  pitch: '#c9a96e',
  amber: '#ffb800',
};

const W = 480;
const H = 320;

/** Shared defs: night sky, halftone dots, floodlight beams. */
function Defs({ p }: { p: string }) {
  return (
    <defs>
      <linearGradient id={`${p}-sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#060a1a" />
        <stop offset="0.6" stopColor="#141b56" />
        <stop offset="1" stopColor="#3a1f6e" />
      </linearGradient>
      <linearGradient id={`${p}-beam`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#dff6ff" stopOpacity="0.85" />
        <stop offset="1" stopColor={C.cyan} stopOpacity="0" />
      </linearGradient>
      <radialGradient id={`${p}-glow`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="0.4" stopColor={C.cyan} stopOpacity="0.45" />
        <stop offset="1" stopColor={C.cyan} stopOpacity="0" />
      </radialGradient>
      <pattern id={`${p}-dots`} width="7" height="7" patternUnits="userSpaceOnUse">
        <circle cx="3.5" cy="3.5" r="1.3" fill="#ffffff" fillOpacity="0.16" />
      </pattern>
      <pattern id={`${p}-dotsInk`} width="6" height="6" patternUnits="userSpaceOnUse">
        <circle cx="3" cy="3" r="1.4" fill={C.ink} fillOpacity="0.35" />
      </pattern>
      <pattern id={`${p}-crowd`} width="9" height="8" patternUnits="userSpaceOnUse">
        <circle cx="4.5" cy="3" r="2.3" fill="#2a3170" />
        <circle cx="4.5" cy="3" r="1" fill={C.cyan} fillOpacity="0.35" />
      </pattern>
    </defs>
  );
}

function Sky({ p, stars = true }: { p: string; stars?: boolean }) {
  return (
    <>
      <rect width={W} height={H} fill={`url(#${p}-sky)`} />
      <rect width={W} height={H} fill={`url(#${p}-dots)`} />
      {stars &&
        [[40, 30], [120, 18], [210, 40], [300, 22], [390, 35], [450, 60], [80, 70], [350, 75]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.8 : 1.1} fill="#fff" fillOpacity="0.8" />
        ))}
    </>
  );
}

function Floodlight({ p, x, flip = false }: { p: string; x: number; flip?: boolean }) {
  const dir = flip ? -1 : 1;
  return (
    <g>
      <polygon points={`${x},52 ${x + dir * 190},${H} ${x + dir * 40},${H}`} fill={`url(#${p}-beam)`} opacity="0.55" />
      <rect x={x - 3} y={60} width={6} height={200} fill={C.ink} />
      <rect x={x - 22} y={34} width={44} height={26} rx="3" fill={C.ink} stroke="#fff" strokeWidth="2" />
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={x - 18 + c * 9.5} y={37 + r * 7.5} width={7} height={5} rx="1" fill="#eaf9ff" />),
      )}
      <circle cx={x} cy={47} r={40} fill={`url(#${p}-glow)`} />
    </g>
  );
}

function Stumps({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={C.ink} strokeWidth="2">
      {[0, 9, 18].map((dx) => <rect key={dx} x={dx} y={0} width={5} height={46} rx="1.5" fill={C.paper} />)}
      <rect x={-1} y={-3} width={12} height={4} rx="2" fill={C.amber} />
      <rect x={10} y={-3} width={12} height={4} rx="2" fill={C.amber} />
    </g>
  );
}

function Frame({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {children}
      {label && (
        <g>
          <rect x="10" y="10" width={label.length * 7.6 + 18} height="22" fill={C.yellow} stroke={C.ink} strokeWidth="2.5" />
          <text x="19" y="26" fontFamily="Bangers, sans-serif" fontSize="15" letterSpacing="1" fill={C.ink}>{label}</text>
        </g>
      )}
    </svg>
  );
}

/* 1 ─ Prologue: floodlit stadium, ball flying off the bat */
export function StadiumScene() {
  const p = useId().replace(/:/g, '');
  return (
    <Frame label="THE PROLOGUE">
      <Defs p={p} />
      <Sky p={p} />
      <Floodlight p={p} x={70} />
      <Floodlight p={p} x={410} flip />
      {/* stands */}
      <path d={`M0 200 Q240 120 ${W} 200 L${W} ${H} L0 ${H} Z`} fill="#161b4a" stroke={C.ink} strokeWidth="3" />
      <path d={`M0 200 Q240 120 ${W} 200 L${W} ${H} L0 ${H} Z`} fill={`url(#${p}-crowd)`} />
      {/* outfield + pitch */}
      <ellipse cx="240" cy="300" rx="260" ry="80" fill={C.grass} stroke={C.ink} strokeWidth="3" />
      <ellipse cx="240" cy="300" rx="200" ry="58" fill={C.grass2} opacity="0.6" />
      <polygon points="222,236 258,236 272,320 208,320" fill={C.pitch} stroke={C.ink} strokeWidth="2.5" />
      <Stumps x={229} y={214} s={0.55} />
      {/* ball arc */}
      <path d="M235 250 Q300 120 430 70" fill="none" stroke="#fff" strokeWidth="2.5" strokeDasharray="6 7" opacity="0.8" />
      {[0, 1, 2].map((i) => (
        <line key={i} x1={392 - i * 6} y1={96 + i * 9} x2={362 - i * 8} y2={112 + i * 11} stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity={0.8 - i * 0.2} />
      ))}
      <circle cx="430" cy="70" r="11" fill={C.red} stroke={C.ink} strokeWidth="3" />
      <path d="M422 64 Q430 70 438 76" stroke="#fff" strokeWidth="1.5" fill="none" strokeDasharray="2 2" />
    </Frame>
  );
}

/* 2 ─ M3M: old-school stadium scoreboard */
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
      <Floodlight p={p} x={440} flip />
      <rect x="0" y="262" width={W} height="58" fill={C.grass} stroke={C.ink} strokeWidth="3" />
      {/* board */}
      <rect x="48" y="58" width="330" height="200" rx="6" fill="#0d1026" stroke={C.ink} strokeWidth="5" />
      <rect x="48" y="58" width="330" height="200" rx="6" fill="none" stroke="#fff" strokeWidth="2" />
      <rect x="62" y="70" width="302" height="30" fill={C.red} stroke={C.ink} strokeWidth="2.5" />
      <text x="213" y="92" textAnchor="middle" fontFamily="Bangers, sans-serif" fontSize="22" letterSpacing="2" fill="#fff">SCOREBOARD</text>
      {rows.map(([k, v], i) => (
        <g key={k}>
          <text x="74" y={128 + i * 26} fontFamily="JetBrains Mono Variable, monospace" fontSize="12.5" fontWeight="700" fill={C.cyan}>{k}</text>
          <text x="358" y={128 + i * 26} textAnchor="end" fontFamily="JetBrains Mono Variable, monospace" fontSize="13.5" fontWeight="700" fill={C.amber}>{v}</text>
          <line x1="74" x2="358" y1={134 + i * 26} y2={134 + i * 26} stroke="#fff" strokeOpacity="0.08" />
        </g>
      ))}
      {/* legs */}
      <rect x="110" y="258" width="10" height="20" fill={C.ink} />
      <rect x="306" y="258" width="10" height="20" fill={C.ink} />
      {/* bat leaning */}
      <g transform="translate(398 150) rotate(12)">
        <rect x="-5" y="-40" width="10" height="46" rx="4" fill="#3a2a1a" stroke={C.ink} strokeWidth="2.5" />
        <rect x="-15" y="4" width="30" height="104" rx="8" fill="#e9c98f" stroke={C.ink} strokeWidth="3" />
        <line x1="0" y1="12" x2="0" y2="100" stroke={C.ink} strokeOpacity="0.35" strokeWidth="2" />
      </g>
    </Frame>
  );
}

/* 3 ─ AECOM: a wagon wheel that doubles as a map of travel routes */
export function WagonWheelScene() {
  const p = useId().replace(/:/g, '');
  const cx = 240;
  const cy = 170;
  const shots = [[-150, -70], [-120, 40], [-60, -110], [20, -125], [90, -95], [160, -40], [150, 60], [70, 105], [-30, 115], [-170, 0], [110, 20], [-90, 80]];
  return (
    <Frame label="NEW GROUND">
      <Defs p={p} />
      <rect width={W} height={H} fill="#07122a" />
      {/* street-map grid */}
      {Array.from({ length: 13 }).map((_, i) => (
        <line key={`v${i}`} x1={i * 40} x2={i * 40 + 20} y1="0" y2={H} stroke="#1b2a66" strokeWidth="1.5" />
      ))}
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={`h${i}`} x1="0" x2={W} y1={i * 40} y2={i * 40 - 10} stroke="#1b2a66" strokeWidth="1.5" />
      ))}
      <rect width={W} height={H} fill={`url(#${p}-dots)`} />
      {/* field */}
      <ellipse cx={cx} cy={cy} rx="200" ry="135" fill={C.grass} fillOpacity="0.55" stroke="#fff" strokeWidth="2.5" strokeDasharray="8 6" />
      <rect x={cx - 8} y={cy - 24} width="16" height="48" fill={C.pitch} stroke={C.ink} strokeWidth="2" />
      {/* shots / routes */}
      {shots.map(([dx, dy], i) => (
        <g key={i}>
          <line x1={cx} y1={cy} x2={cx + dx} y2={cy + dy} stroke={i % 3 === 0 ? C.pink : C.cyan} strokeWidth="3" strokeLinecap="round" />
          <circle cx={cx + dx} cy={cy + dy} r="5" fill={i % 3 === 0 ? C.pink : C.cyan} stroke={C.ink} strokeWidth="2" />
        </g>
      ))}
      <circle cx={cx} cy={cy} r="9" fill={C.yellow} stroke={C.ink} strokeWidth="3" />
      {/* legend chip */}
      <g transform="translate(300 272)">
        <rect width="168" height="36" fill={C.paper} stroke={C.ink} strokeWidth="2.5" />
        <text x="10" y="15" fontFamily="JetBrains Mono Variable, monospace" fontSize="10" fontWeight="700" fill={C.ink}>WAGON WHEEL =</text>
        <text x="10" y="29" fontFamily="JetBrains Mono Variable, monospace" fontSize="10" fontWeight="700" fill={C.blue}>ORIGIN → DESTINATION</text>
      </g>
    </Frame>
  );
}

/* 4 ─ The LaLiT: twelve grounds feeding one scorecard */
export function TwelveGroundsScene() {
  const p = useId().replace(/:/g, '');
  const grounds = Array.from({ length: 12 }, (_, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    return { x: 38 + col * 58, y: 70 + row * 78 };
  });
  const hub = { x: 372, y: 170 };
  return (
    <Frame label="12 GROUNDS">
      <Defs p={p} />
      <Sky p={p} stars={false} />
      {grounds.map((g, i) => (
        <path key={`l${i}`} d={`M${g.x + 18} ${g.y} C ${g.x + 90} ${g.y}, ${hub.x - 90} ${hub.y}, ${hub.x - 62} ${hub.y}`} stroke={i % 2 ? C.cyan : C.purple} strokeWidth="2" fill="none" strokeOpacity="0.7" />
      ))}
      {grounds.map((g, i) => (
        <g key={i} transform={`translate(${g.x} ${g.y})`}>
          <ellipse rx="19" ry="13" fill="#161b4a" stroke={C.ink} strokeWidth="2.5" />
          <ellipse rx="13" ry="8" fill={C.grass2} stroke={C.ink} strokeWidth="1.5" />
          <rect x="-2" y="-4" width="4" height="8" fill={C.pitch} />
          <circle cx="-16" cy="-14" r="2.5" fill="#eaf9ff" />
          <circle cx="16" cy="-14" r="2.5" fill="#eaf9ff" />
        </g>
      ))}
      {/* the one scorecard / dashboard */}
      <g transform={`translate(${hub.x - 64} ${hub.y - 92})`}>
        <rect width="150" height="184" rx="6" fill={C.paper} stroke={C.ink} strokeWidth="4" />
        <rect width="150" height="30" rx="6" fill={C.blue} stroke={C.ink} strokeWidth="3" />
        <text x="75" y="21" textAnchor="middle" fontFamily="Bangers, sans-serif" fontSize="16" letterSpacing="1.5" fill="#fff">WEEKLY MIS</text>
        {[0.55, 0.8, 0.65, 0.9, 0.72].map((v, i) => (
          <rect key={i} x={16 + i * 25} y={130 - v * 80} width="17" height={v * 80} fill={i % 2 ? C.purple : C.blue} stroke={C.ink} strokeWidth="2" />
        ))}
        <line x1="12" x2="138" y1="131" y2="131" stroke={C.ink} strokeWidth="2.5" />
        <text x="75" y="156" textAnchor="middle" fontFamily="JetBrains Mono Variable, monospace" fontSize="11" fontWeight="700" fill={C.ink}>12 PROPERTIES</text>
        <text x="75" y="172" textAnchor="middle" fontFamily="JetBrains Mono Variable, monospace" fontSize="10" fontWeight="700" fill={C.red}>GSI · FEEDBACK · AUDITS</text>
      </g>
    </Frame>
  );
}

/* 5 ─ Choosing the format: the third-umpire decision screen */
export function DecisionScene() {
  const p = useId().replace(/:/g, '');
  return (
    <Frame label="THE REVIEW">
      <Defs p={p} />
      <Sky p={p} />
      <Floodlight p={p} x={50} />
      <rect x="0" y="266" width={W} height="54" fill={C.grass} stroke={C.ink} strokeWidth="3" />
      {/* giant screen */}
      <rect x="96" y="44" width="300" height="190" rx="8" fill="#0d1026" stroke={C.ink} strokeWidth="6" />
      <rect x="96" y="44" width="300" height="190" rx="8" fill="none" stroke="#fff" strokeWidth="2" />
      <rect x="96" y="44" width="300" height="190" rx="8" fill={`url(#${p}-dots)`} />
      <text x="246" y="80" textAnchor="middle" fontFamily="Bangers, sans-serif" fontSize="22" letterSpacing="2" fill={C.cyan}>THIRD UMPIRE · DECISION</text>
      {/* two options */}
      <g>
        <rect x="118" y="100" width="118" height="48" fill="#262b52" stroke={C.ink} strokeWidth="3" />
        <text x="177" y="122" textAnchor="middle" fontFamily="JetBrains Mono Variable, monospace" fontSize="11" fontWeight="700" fill="#8b90b5">L&amp;D-RELATED</text>
        <text x="177" y="138" textAnchor="middle" fontFamily="JetBrains Mono Variable, monospace" fontSize="11" fontWeight="700" fill="#8b90b5">REPORTING</text>
        <line x1="122" y1="104" x2="232" y2="144" stroke={C.red} strokeWidth="4" />
      </g>
      <g>
        <rect x="256" y="100" width="122" height="48" fill={C.blue} stroke={C.ink} strokeWidth="3" />
        <text x="317" y="122" textAnchor="middle" fontFamily="JetBrains Mono Variable, monospace" fontSize="11" fontWeight="700" fill="#fff">HANDS-ON</text>
        <text x="317" y="138" textAnchor="middle" fontFamily="JetBrains Mono Variable, monospace" fontSize="11" fontWeight="700" fill="#fff">DATA ANALYSIS</text>
      </g>
      <rect x="146" y="166" width="200" height="50" fill={C.yellow} stroke={C.ink} strokeWidth="4" />
      <text x="246" y="200" textAnchor="middle" fontFamily="Bangers, sans-serif" fontSize="30" letterSpacing="2" fill={C.ink}>DATA!</text>
      {/* screen legs */}
      <rect x="150" y="234" width="10" height="34" fill={C.ink} />
      <rect x="332" y="234" width="10" height="34" fill={C.ink} />
    </Frame>
  );
}

/* 6 ─ Nets practice: laptop, stumps, graduation cap */
export function NetsScene() {
  const p = useId().replace(/:/g, '');
  return (
    <Frame label="NETS PRACTICE">
      <Defs p={p} />
      <Sky p={p} stars={false} />
      {/* net cage in perspective */}
      <polygon points="60,40 420,40 470,300 10,300" fill="#0d1440" stroke={C.ink} strokeWidth="3" />
      {Array.from({ length: 16 }).map((_, i) => {
        const t = i / 15;
        return <line key={`n${i}`} x1={60 + t * 360} y1="40" x2={10 + t * 460} y2="300" stroke="#fff" strokeOpacity="0.14" strokeWidth="1.2" />;
      })}
      {Array.from({ length: 9 }).map((_, i) => {
        const y = 40 + i * 32.5;
        const t = (y - 40) / 260;
        return <line key={`m${i}`} x1={60 - t * 50} x2={420 + t * 50} y1={y} y2={y} stroke="#fff" strokeOpacity="0.14" strokeWidth="1.2" />;
      })}
      <polygon points="180,300 300,300 280,220 200,220" fill={C.pitch} stroke={C.ink} strokeWidth="2.5" />
      <Stumps x={228} y={176} s={0.9} />
      {/* graduation cap on the stumps */}
      <g transform="translate(240 170)">
        <polygon points="-34,-8 0,-22 34,-8 0,6" fill={C.ink} stroke="#fff" strokeWidth="1.5" />
        <rect x="-16" y="-4" width="32" height="12" fill={C.ink} />
        <line x1="26" y1="-10" x2="30" y2="14" stroke={C.yellow} strokeWidth="2.5" />
      </g>
      {/* laptop */}
      <g transform="translate(40 190)">
        <rect width="132" height="84" rx="5" fill="#1a2266" stroke={C.ink} strokeWidth="3.5" />
        <rect x="8" y="8" width="116" height="68" fill="#0b0f2a" />
        <text x="14" y="26" fontFamily="JetBrains Mono Variable, monospace" fontSize="9" fill={C.cyan}>import pandas as pd</text>
        <text x="14" y="40" fontFamily="JetBrains Mono Variable, monospace" fontSize="9" fill={C.pink}>df.describe()</text>
        <text x="14" y="54" fontFamily="JetBrains Mono Variable, monospace" fontSize="9" fill={C.amber}>SELECT … FROM …</text>
        <text x="14" y="68" fontFamily="JetBrains Mono Variable, monospace" fontSize="9" fill="#fff">=XLOOKUP(…)</text>
        <polygon points="-10,84 142,84 150,96 -18,96" fill="#2a3170" stroke={C.ink} strokeWidth="3" />
      </g>
      {/* CGPA scoreboard */}
      <g transform="translate(330 170)">
        <rect width="120" height="84" rx="4" fill="#0d1026" stroke={C.ink} strokeWidth="4" />
        <rect width="120" height="84" rx="4" fill="none" stroke="#fff" strokeWidth="1.5" />
        <text x="60" y="26" textAnchor="middle" fontFamily="JetBrains Mono Variable, monospace" fontSize="11" fontWeight="700" fill={C.cyan}>MBA · CGPA</text>
        <text x="60" y="68" textAnchor="middle" fontFamily="Bangers, sans-serif" fontSize="40" letterSpacing="2" fill={C.amber}>8.27</text>
      </g>
    </Frame>
  );
}

/* 7 ─ Finale: the hero walks out under the lights (uses the comic portrait) */
export function FinaleScene({ hero }: { hero: string }) {
  const p = useId().replace(/:/g, '');
  return (
    <Frame label="NEXT MATCH">
      <Defs p={p} />
      <Sky p={p} />
      <Floodlight p={p} x={60} />
      <Floodlight p={p} x={420} flip />
      <path d={`M0 230 Q240 170 ${W} 230 L${W} ${H} L0 ${H} Z`} fill="#161b4a" stroke={C.ink} strokeWidth="3" />
      <path d={`M0 230 Q240 170 ${W} 230 L${W} ${H} L0 ${H} Z`} fill={`url(#${p}-crowd)`} />
      <circle cx="240" cy="160" r="112" fill={C.yellow} stroke={C.ink} strokeWidth="5" />
      {/* burst rays */}
      {Array.from({ length: 18 }).map((_, i) => {
        const a = (i / 18) * Math.PI * 2;
        return <line key={i} x1={240 + Math.cos(a) * 118} y1={160 + Math.sin(a) * 118} x2={240 + Math.cos(a) * 150} y2={160 + Math.sin(a) * 150} stroke={C.yellow} strokeWidth="5" strokeLinecap="round" />;
      })}
      <clipPath id={`${p}-clip`}><circle cx="240" cy="160" r="104" /></clipPath>
      <image href={hero} x="136" y="56" width="208" height="208" clipPath={`url(#${p}-clip)`} preserveAspectRatio="xMidYMid slice" />
      <circle cx="240" cy="160" r="104" fill="none" stroke={C.ink} strokeWidth="5" />
      <Stumps x={60} y={250} s={0.8} />
      <Stumps x={400} y={250} s={0.8} />
    </Frame>
  );
}
