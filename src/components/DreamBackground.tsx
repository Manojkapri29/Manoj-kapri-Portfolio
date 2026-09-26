import { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
 *  Full-page dreamy background: soft lavender haze, a frosted arch, misty
 *  periwinkle hills with a reflection, floating glass bubbles and film grain.
 *  Pure CSS/SVG (no WebGL). Layers drift slightly with scroll for depth.
 * ──────────────────────────────────────────────────────────────────────────── */

const grain =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

const bubbles = [
  { x: '14%', y: '22%', s: 120, d: 0 },
  { x: '71%', y: '14%', s: 64, d: -6 },
  { x: '83%', y: '58%', s: 150, d: -3 },
  { x: '38%', y: '66%', s: 54, d: -9 },
  { x: '58%', y: '36%', s: 36, d: -12 },
];

export default function DreamBackground() {
  const root = useRef<HTMLDivElement>(null);

  // Gentle parallax: expose scroll progress as a CSS variable.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      root.current?.style.setProperty('--p', String(window.scrollY / max));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', on, { passive: true });
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div ref={root} className="dream pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* base haze */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#e7e5ff_0%,#d6d3fb_38%,#c3bff4_70%,#b1acec_100%)]" />
      <div className="absolute -left-[10%] -top-[20%] h-[70vh] w-[70vw] rounded-full bg-white/70 blur-[90px]" />

      {/* frosted arch */}
      <div className="dream-layer absolute left-1/2 top-[8vh] h-[78vh] w-[34vw] min-w-[260px] -translate-x-1/2 rounded-t-[999px] border border-white/60 bg-gradient-to-b from-white/55 via-white/25 to-white/5 blur-[2px]" style={{ ['--k' as string]: '-60px' }} />

      {/* deep indigo form inside the arch */}
      <div className="dream-layer absolute left-[46%] top-[26vh] h-[34vh] w-[26vw] min-w-[200px] -translate-x-1/2 rounded-[45%] bg-[radial-gradient(circle_at_40%_40%,#7b7fe8_0%,#4d4fc4_45%,transparent_72%)] opacity-80 blur-[26px]" style={{ ['--k' as string]: '-110px' }} />
      <div className="dream-layer absolute left-[55%] top-[34vh] h-[22vh] w-[18vw] min-w-[140px] -translate-x-1/2 rounded-[40%] bg-[radial-gradient(circle,#5a5dd6_0%,transparent_70%)] opacity-70 blur-[30px]" style={{ ['--k' as string]: '-80px' }} />

      {/* misty hills */}
      <svg className="dream-layer absolute inset-x-0 -bottom-[4vh] h-[52vh] w-full" viewBox="0 0 1440 360" preserveAspectRatio="none" style={{ ['--k' as string]: '40px' }}>
        <defs>
          <linearGradient id="hill1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9c9bf0" stopOpacity="0.9" />
            <stop offset="1" stopColor="#5a5bd0" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="hill2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c4c2f7" stopOpacity="0.85" />
            <stop offset="1" stopColor="#8f8de6" stopOpacity="0.9" />
          </linearGradient>
          <filter id="mist" x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation="7" /></filter>
        </defs>
        <path filter="url(#mist)" fill="url(#hill2)" d="M0 170 C160 120 300 150 430 128 C560 106 650 160 780 140 C930 116 1030 96 1180 128 C1290 152 1370 140 1440 132 L1440 380 L0 380 Z" />
        <path filter="url(#mist)" fill="url(#hill1)" d="M0 238 C140 206 250 232 380 214 C520 194 600 246 760 226 C900 208 1010 180 1150 214 C1270 244 1360 220 1440 212 L1440 380 L0 380 Z" />
      </svg>

      {/* low mist / reflection over the foot of the hills */}
      <div className="absolute inset-x-0 bottom-0 h-[26vh] bg-gradient-to-b from-transparent via-[#d9d7fb]/60 to-[#eeedff]/90" />

      {/* glass bubbles */}
      {bubbles.map((b, i) => (
        <div
          key={i}
          className="dream-bubble absolute rounded-full"
          style={{ left: b.x, top: b.y, width: b.s, height: b.s, animationDelay: `${b.d}s`, ['--k' as string]: `${-40 - i * 25}px` }}
        />
      ))}

      {/* film grain */}
      <div className="absolute inset-0 opacity-[0.16] mix-blend-overlay" style={{ backgroundImage: grain }} />
      {/* dark-mode dusk tint */}
      <div className="dream-dusk absolute inset-0" />
    </div>
  );
}
