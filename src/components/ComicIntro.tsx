import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowRight, FileDown, Mail, MapPin, Phone } from 'lucide-react';
import { intro, profile } from '../data/content';
import { scrollToSection } from '../hooks/useSite';
import { GithubIcon, LinkedinIcon } from './icons';
import {
  C,
  DecisionScene,
  FinaleScene,
  NetsScene,
  ScoreboardScene,
  StadiumScene,
  TwelveGroundsScene,
  WagonWheelScene,
} from './comic/Scenes';

const HERO = '/comic/manoj-hero.webp';

type Chapter = (typeof intro)[number];

function Scene({ name }: { name: Chapter['scene'] }) {
  switch (name) {
    case 'stadium': return <StadiumScene />;
    case 'scoreboard': return <ScoreboardScene />;
    case 'wagonwheel': return <WagonWheelScene />;
    case 'grounds': return <TwelveGroundsScene />;
    case 'decision': return <DecisionScene />;
    case 'nets': return <NetsScene />;
    case 'finale': return <FinaleScene hero={HERO} />;
    default: return null;
  }
}

/** Comic "POW" burst with the sound effect. */
function Sfx({ text, className = '' }: { text: string; className?: string }) {
  const reduced = useReducedMotion();
  if (!text) return null;
  const pts = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    const r = i % 2 ? 44 : 60;
    return `${60 + Math.cos(a) * r * 1.35},${60 + Math.sin(a) * r}`;
  }).join(' ');
  return (
    <motion.div
      className={`pointer-events-none absolute z-20 w-44 sm:w-52 ${className}`}
      initial={reduced ? false : { scale: 0, rotate: -25, opacity: 0 }}
      whileInView={{ scale: 1, rotate: -8, opacity: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.35 }}
      aria-hidden="true"
    >
      <svg viewBox="-22 0 164 120" className="w-full drop-shadow-[5px_5px_0_#0b0c14]">
        <polygon points={pts} fill={C.blue} stroke={C.ink} strokeWidth="4" strokeLinejoin="round" />
        <text x="60" y="70" textAnchor="middle" fontFamily="Bangers, sans-serif" fontSize={text.length > 9 ? 19 : 26} letterSpacing="1.5" fill="#ffffff" stroke={C.ink} strokeWidth="1.2">
          {text}
        </text>
      </svg>
    </motion.div>
  );
}

const panel =
  'relative overflow-hidden border-[4px] border-[#0b0c14] shadow-[7px_7px_0_#0b0c14] outline outline-2 outline-white/70';

function Panel({ children, className = '', tilt = 0, delay = 0 }: { children: React.ReactNode; className?: string; tilt?: number; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={`${panel} ${className}`}
      initial={reduced ? false : { opacity: 0, y: 46, rotate: tilt * 3 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Yellow narration box, comic style. */
function Caption({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border-[3px] border-[#0b0c14] bg-[#1f37b0] px-4 py-3 font-comic text-[16.5px] font-bold leading-snug text-white shadow-[4px_4px_0_#0b0c14] sm:text-[17px] ${className}`}>
      {children}
    </div>
  );
}

function PageTag({ ch, i }: { ch: Chapter; i: number }) {
  return (
    <p className="mb-3 flex flex-wrap items-center gap-2 font-mono text-[11.5px] uppercase tracking-wider text-[#c9cff5]">
      <span className="border-2 border-[#0b0c14] bg-white px-1.5 py-0.5 font-bold text-[#0b0c14] shadow-[2px_2px_0_#0b0c14]">{ch.cell}</span>
      <span>{ch.kicker}</span>
      <span className="text-[#8b90b5]">· page {i + 1}/{intro.length}</span>
    </p>
  );
}

const chip =
  'inline-flex items-center gap-2 border-2 border-[#0b0c14] bg-white px-3 py-1.5 font-mono text-[12px] font-semibold text-[#0b0c14] shadow-[3px_3px_0_#0b0c14] transition-transform hover:-translate-y-0.5';

function Cover({ ch }: { ch: Chapter }) {
  return (
    <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 pb-16 pt-10 sm:px-8 md:grid-cols-[1fr_1.05fr] md:gap-12">
      {/* Cover panel */}
      <Panel className="aspect-[4/5] bg-[#141b56]" tilt={-1.5}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,#3b5bff_0%,#1a1f6b_45%,#0a0f2c_80%)]" />
        <div className="comic-rays absolute inset-0 opacity-60" />
        <div className="halftone absolute inset-0" />
        <div className="absolute left-3 right-3 top-3 flex items-start justify-between">
          <span className="border-[3px] border-[#0b0c14] bg-[#e0201f] px-2 py-0.5 font-bangers text-lg tracking-wider text-white shadow-[3px_3px_0_#0b0c14]">ISSUE #1</span>
          <span className="border-[3px] border-[#0b0c14] bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-[#0b0c14] shadow-[3px_3px_0_#0b0c14]">DAY-NIGHT MATCH</span>
        </div>
        <h2 className="relative z-10 mt-14 px-4 text-center font-bangers text-[3rem] leading-[0.9] tracking-wide text-[#7cc4ff] [text-shadow:4px_4px_0_#0b0c14] sm:text-7xl">
          {ch.title}
        </h2>
        <img
          src={HERO}
          alt="Comic-style portrait of Manoj Kapri"
          width={720}
          height={720}
          fetchPriority="high"
          className="absolute bottom-[4.2rem] left-1/2 w-[68%] -translate-x-1/2 drop-shadow-[6px_6px_0_#0b0c14] sm:w-[82%]"
        />
        <div className="absolute inset-x-3 bottom-3 border-[3px] border-[#0b0c14] bg-white px-3 py-1.5 text-center shadow-[3px_3px_0_#0b0c14]">
          <p className="font-bangers text-2xl leading-none tracking-wider text-[#0b0c14]">MANOJ KAPRI</p>
          <p className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-[#1f37b0]">{profile.titleParts.join(' · ')}</p>
        </div>
      </Panel>

      {/* Intro text */}
      <div className="relative">
        <p className="mb-5 inline-flex items-center gap-2 border-2 border-[#0b0c14] bg-[#27e0ff] px-3 py-1 font-mono text-[12px] font-bold text-[#0b0c14] shadow-[3px_3px_0_#0b0c14]">
          <span className="size-2 animate-pulse rounded-full bg-[#0b0c14] motion-reduce:animate-none" aria-hidden="true" />
          {profile.status}
        </p>
        {/* Speech bubble */}
        <div className="speech relative mb-6 inline-block border-[4px] border-[#0b0c14] bg-white px-6 py-4 shadow-[6px_6px_0_#0b0c14]">
          <h1 id="about-heading" className="font-bangers text-5xl leading-none tracking-wide text-[#0b0c14] outline-none sm:text-6xl">
            {intro[0].bubble}
          </h1>
        </div>
        <Caption>{ch.body}</Caption>

        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href="#projects"
            onClick={(e) => { e.preventDefault(); scrollToSection('projects'); }}
            className="inline-flex items-center gap-2 border-[3px] border-[#0b0c14] bg-[#3b5bff] px-5 py-2.5 font-bangers text-xl tracking-wider text-white shadow-[4px_4px_0_#0b0c14] transition-transform hover:-translate-y-0.5"
          >
            View Projects <ArrowRight className="size-4" aria-hidden="true" />
          </a>
          {__HAS_RESUME__ && (
            <a href={profile.resume} download className="inline-flex items-center gap-2 border-[3px] border-[#0b0c14] bg-white px-5 py-2.5 font-bangers text-xl tracking-wider text-[#0b0c14] shadow-[4px_4px_0_#0b0c14] transition-transform hover:-translate-y-0.5">
              <FileDown className="size-4" aria-hidden="true" /> Download Resume
            </a>
          )}
          <a
            href="#contact"
            onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}
            className="inline-flex items-center gap-2 border-[3px] border-[#0b0c14] bg-[#27e0ff] px-5 py-2.5 font-bangers text-xl tracking-wider text-[#0b0c14] shadow-[4px_4px_0_#0b0c14] transition-transform hover:-translate-y-0.5"
          >
            Contact Me
          </a>
        </div>
        <ul className="mt-6 flex flex-wrap gap-2.5" aria-label="Contact links">
          <li><a className={chip} href={`mailto:${profile.email}`}><Mail className="size-3.5" aria-hidden="true" /> {profile.email}</a></li>
          <li><a className={chip} href={profile.phoneHref}><Phone className="size-3.5" aria-hidden="true" /> {profile.phone}</a></li>
          <li><a className={chip} href={profile.linkedin} target="_blank" rel="noopener"><LinkedinIcon className="size-3.5" /> LinkedIn</a></li>
          <li><a className={chip} href={profile.github} target="_blank" rel="noopener"><GithubIcon className="size-3.5" /> GitHub</a></li>
          <li><span className={`${chip} cursor-default hover:translate-y-0`}><MapPin className="size-3.5" aria-hidden="true" /> {profile.location}</span></li>
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-5 font-mono text-[12px] text-[#c9cff5]">
          <span className="inline-flex items-center gap-1.5">
            <ArrowDown className="size-3.5 animate-bounce motion-reduce:animate-none" aria-hidden="true" /> Scroll to read my story
          </span>
          <a
            href="#skills"
            onClick={(e) => { e.preventDefault(); scrollToSection('skills'); }}
            className="underline decoration-white/40 underline-offset-4 hover:text-white"
          >
            Skip intro →
          </a>
        </div>
      </div>
    </div>
  );
}

function StoryPage({ ch, i }: { ch: Chapter; i: number }) {
  const flip = i % 2 === 0; // alternate art left / right
  const tilt = flip ? 1 : -1;
  const last = i === intro.length - 1;
  return (
    <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-5 py-16 sm:px-8 md:grid-cols-12 md:gap-10">
      <div className={`relative md:col-span-7 ${flip ? 'md:order-2' : ''}`}>
        <Panel className="aspect-[3/2] bg-[#0a0f2c]" tilt={tilt}>
          <Scene name={ch.scene} />
        </Panel>
        <Sfx text={ch.sfx} className={flip ? '-left-6 -top-10 sm:-left-10' : '-right-6 -top-10 sm:-right-10'} />
      </div>
      <div className={`md:col-span-5 ${flip ? 'md:order-1' : ''}`}>
        <PageTag ch={ch} i={i} />
        <motion.h2
          className="font-bangers text-5xl leading-[0.95] tracking-wide text-white [text-shadow:4px_4px_0_#0b0c14] sm:text-6xl"
          initial={{ opacity: 0, x: flip ? -30 : 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6 }}
        >
          {ch.title}
        </motion.h2>
        <Caption className="mt-5">{ch.body}</Caption>
        {last && (
          <a
            href="#skills"
            onClick={(e) => { e.preventDefault(); scrollToSection('skills'); }}
            className="mt-7 inline-flex items-center gap-2 border-[3px] border-[#0b0c14] bg-[#3b5bff] px-5 py-2.5 font-bangers text-xl tracking-wider text-white shadow-[4px_4px_0_#0b0c14] transition-transform hover:-translate-y-0.5"
          >
            Explore my work <ArrowDown className="size-4" aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}

export default function ComicIntro({ onReady }: { onReady?: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const [chapter, setChapter] = useState(0);

  // All SVG — nothing heavy to wait for.
  useEffect(() => { onReady?.(); }, [onReady]);

  // Which page is in the middle of the screen (drives the formula bar).
  useEffect(() => {
    const pages = ref.current?.querySelectorAll<HTMLElement>('[data-page]');
    if (!pages) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setChapter(Number((e.target as HTMLElement).dataset.page));
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    pages.forEach((p) => io.observe(p));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('introchapter', { detail: chapter }));
  }, [chapter]);

  return (
    <section id="about" ref={ref} aria-labelledby="about-heading" className="comic-bg relative">
      {intro.map((ch, i) => (
        <div key={ch.cell} data-page={i} className="flex min-h-[100svh] items-center">
          {i === 0 ? <Cover ch={ch} /> : <StoryPage ch={ch} i={i} />}
        </div>
      ))}
      <div className="pointer-events-none absolute inset-x-0 -bottom-32 h-32 bg-gradient-to-b from-[#0a0f2c] to-transparent" aria-hidden="true" />
    </section>
  );
}
