import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowRight, FileDown } from 'lucide-react';
import { hero, profile } from '../data/content';
import { scrollToSection, useMediaQuery } from '../hooks/useSite';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────────────────────
 *  Cinematic hero (cinematic-landing technique): a pre-rendered frame sequence
 *  of the cricket-bat film is drawn on a sticky <canvas>; scroll progress picks
 *  the frame. Text "beats" fade in/out at progress windows.
 *  Frames: /public/film/{desktop,mobile}/0001.webp… rendered by tools/film.
 * ──────────────────────────────────────────────────────────────────────────── */

type Meta = { count: number; width: number; height: number };
const META: Record<'desktop' | 'mobile', Meta> = {
  desktop: { count: 180, width: 1600, height: 900 },
  mobile: { count: 150, width: 720, height: 1280 },
};

const btnPrimary =
  'inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-medium text-[#07080c] transition-transform hover:-translate-y-0.5';
const btnGhost =
  'inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-[15px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10';

function Beat({ i, show, children, className = '' }: { i: number; show: number; children: React.ReactNode; className?: string }) {
  const on = show === i;
  return (
    <div
      className={`absolute inset-x-0 transition-all duration-700 ease-out ${on ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'} ${className}`}
      aria-hidden={on ? undefined : true}
    >
      {children}
    </div>
  );
}

export default function CinematicHero() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const mobile = useMediaQuery('(max-width: 767px)');
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [beat, setBeat] = useState(0);
  const [loaded, setLoaded] = useState(0);

  useEffect(() => {
    const kind = mobile ? 'mobile' : 'desktop';
    const meta = META[kind];
    const frames: (HTMLImageElement | undefined)[] = new Array(meta.count);
    const cv = canvas.current!;
    const ctx = cv.getContext('2d')!;
    const state = { frame: 0 };
    let alive = true;
    let done = 0;

    const src = (i: number) => `/film/${kind}/${String(i + 1).padStart(4, '0')}.webp`;
    const nearest = (i: number) => {
      for (let d = 0; d < meta.count; d++) {
        if (frames[i - d]) return frames[i - d];
        if (frames[i + d]) return frames[i + d];
      }
    };
    const render = () => {
      const img = nearest(Math.round(state.frame));
      if (!img) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = cv.clientWidth * dpr;
      const h = cv.clientHeight * dpr;
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      // object-fit: cover
      const s = Math.max(w / meta.width, h / meta.height);
      const dw = meta.width * s;
      const dh = meta.height * s;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    };
    const load = (i: number) =>
      new Promise<void>((res) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => { if (alive) { frames[i] = img; done++; setLoaded(done / meta.count); if (i === Math.round(state.frame) || done === 1) render(); } res(); };
        img.onerror = () => { done++; res(); };
        img.src = src(i);
      });

    // First frame, then every 4th (fast coarse scrub), then fill the gaps.
    const order: number[] = [0];
    for (let i = 4; i < meta.count; i += 4) order.push(i);
    for (let i = 1; i < meta.count; i++) if (i % 4) order.push(i);
    (async () => {
      await load(0);
      if (reduced) return;
      for (let k = 1; k < order.length && alive; k += 6) await Promise.all(order.slice(k, k + 6).map(load));
    })();

    const beats = [0.2, 0.52, 0.82]; // boundaries between the 4 beats
    const st = reduced
      ? null
      : gsap.to(state, {
          frame: meta.count - 1,
          ease: 'none',
          onUpdate: render,
          scrollTrigger: {
            trigger: section.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.4,
            onUpdate: (self) => {
              const p = self.progress;
              setBeat(p < beats[0] ? 0 : p < beats[1] ? 1 : p < beats[2] ? 2 : 3);
            },
          },
        });
    const onResize = () => render();
    window.addEventListener('resize', onResize);
    return () => {
      alive = false;
      st?.scrollTrigger?.kill();
      st?.kill();
      window.removeEventListener('resize', onResize);
    };
  }, [mobile, reduced]);

  return (
    <section id="about" ref={section} aria-labelledby="about-heading" className={`relative ${reduced ? 'h-[100svh]' : 'h-[420vh]'}`}>
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-[#05060a]">
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        {/* legibility: left scrim on desktop, top/bottom scrims on phones, fade into the page */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,6,10,0.85)_0%,rgba(5,6,10,0.35)_42%,transparent_62%)] max-md:bg-[linear-gradient(180deg,rgba(5,6,10,0.35)_0%,transparent_30%,rgba(5,6,10,0.55)_58%,rgba(5,6,10,0.95)_100%)]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#05060a] to-transparent" aria-hidden="true" />

        {/* loader line */}
        <div className="absolute inset-x-0 top-0 h-px bg-white/10" aria-hidden="true">
          <div className="h-full bg-[#7c9dff] transition-[width] duration-300" style={{ width: `${Math.round(loaded * 100)}%`, opacity: loaded >= 1 ? 0 : 1 }} />
        </div>

        <div className="relative mx-auto h-full w-full max-w-6xl px-5 text-white sm:px-8">
          <Beat i={0} show={beat} className="bottom-[15vh] px-5 sm:px-8 md:bottom-auto md:top-[30vh]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#9fb2ff]">{hero.eyebrow}</p>
            <h1 id="about-heading" className="mt-5 max-w-2xl text-[2.6rem] font-light leading-[0.98] tracking-[-0.04em] outline-none sm:text-7xl md:text-[6rem]">
              Hi, I'm <span className="font-semibold text-[#9fb2ff]">Manoj Kapri.</span>
            </h1>
            <p className="mt-5 text-lg text-white/70">{profile.titleParts.join('  ·  ')}</p>
          </Beat>

          <Beat i={1} show={beat} className="bottom-[15vh] px-5 sm:px-8 md:bottom-auto md:top-[28vh]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#9fb2ff]">{hero.beat2.eyebrow}</p>
            <h2 className="mt-5 max-w-xl text-4xl font-light leading-[1.05] tracking-[-0.03em] sm:text-6xl">{hero.beat2.title}</h2>
            <p className="mt-6 max-w-md text-[16px] leading-relaxed text-white/75">{hero.beat2.body}</p>
          </Beat>

          <Beat i={2} show={beat} className="bottom-[15vh] px-5 sm:px-8 md:bottom-auto md:top-[28vh]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#9fb2ff]">{hero.beat3.eyebrow}</p>
            <h2 className="mt-5 max-w-xl text-4xl font-light leading-[1.05] tracking-[-0.03em] sm:text-6xl">{hero.beat3.title}</h2>
            <ul className="mt-7 flex max-w-md flex-wrap gap-2">
              {hero.beat3.tags.map((t) => (
                <li key={t} className="rounded-full border border-white/20 px-3.5 py-1.5 text-[13px] text-white/85">{t}</li>
              ))}
            </ul>
          </Beat>

          <Beat i={3} show={beat} className="bottom-[15vh] px-5 sm:px-8 md:bottom-auto md:top-[26vh]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#9fb2ff]">{hero.beat4.eyebrow}</p>
            <h2 className="mt-5 max-w-xl text-4xl font-light leading-[1.05] tracking-[-0.03em] sm:text-6xl">{hero.beat4.title}</h2>
            <p className="mt-5 max-w-md text-[16px] text-white/75">{profile.status}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#projects" onClick={(e) => { e.preventDefault(); scrollToSection('projects'); }} className={btnPrimary}>
                View Projects <ArrowRight className="size-4" aria-hidden="true" />
              </a>
              {__HAS_RESUME__ && (
                <a href={profile.resume} download className={btnGhost}>
                  <FileDown className="size-4" aria-hidden="true" /> Resume
                </a>
              )}
              <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }} className={btnGhost}>
                Contact
              </a>
            </div>
          </Beat>

          <div className={`absolute bottom-[8.5vh] left-5 flex items-center gap-5 text-[12px] text-white/60 transition-opacity duration-500 sm:left-8 md:bottom-14 ${beat === 0 ? 'opacity-100' : 'opacity-0'}`}>
            <span className="inline-flex items-center gap-2">
              <ArrowDown className="size-3.5 animate-bounce motion-reduce:animate-none" aria-hidden="true" /> Scroll
            </span>
            <a href="#story" onClick={(e) => { e.preventDefault(); scrollToSection('story'); }} className="underline decoration-white/30 underline-offset-4 hover:text-white">
              Skip intro →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
