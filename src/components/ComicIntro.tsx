import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowRight, FileDown, Mail, MapPin, Phone } from 'lucide-react';
import { intro, profile } from '../data/content';
import { scrollToSection } from '../hooks/useSite';
import { GithubIcon, LinkedinIcon } from './icons';
import {
  DecisionScene,
  FinaleScene,
  NetsScene,
  ScoreboardScene,
  StadiumScene,
  TwelveGroundsScene,
  WagonWheelScene,
} from './comic/Scenes';

const PORTRAIT = '/comic/manoj-portrait.webp';

type Chapter = (typeof intro)[number];

function Scene({ name }: { name: Chapter['scene'] }) {
  switch (name) {
    case 'stadium': return <StadiumScene />;
    case 'scoreboard': return <ScoreboardScene />;
    case 'wagonwheel': return <WagonWheelScene />;
    case 'grounds': return <TwelveGroundsScene />;
    case 'decision': return <DecisionScene />;
    case 'nets': return <NetsScene />;
    case 'finale': return <FinaleScene hero={PORTRAIT} />;
    default: return null;
  }
}

function Rise({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

const kicker = 'text-[12px] font-semibold uppercase tracking-[0.28em] text-accent-ink';

const btnPrimary =
  'inline-flex items-center gap-2 rounded-xl bg-[#17173d] px-5 py-3 text-[15px] font-medium text-white shadow-lg shadow-indigo-900/20 transition-transform hover:-translate-y-0.5 dark:bg-white dark:text-[#17173d]';
const btnGhost =
  'inline-flex items-center gap-2 rounded-xl border border-white/70 bg-white/55 px-5 py-3 text-[15px] font-medium text-ink backdrop-blur-md transition-colors hover:bg-white/80 dark:border-white/20 dark:bg-white/10 dark:hover:bg-white/20';
const chip =
  'inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/50 px-3.5 py-1.5 text-[13px] text-ink backdrop-blur-md transition-colors hover:bg-white/80 dark:border-white/15 dark:bg-white/10';

function Cover({ ch }: { ch: Chapter }) {
  return (
    <div className="mx-auto grid w-full max-w-6xl items-end gap-10 px-5 pb-20 pt-16 sm:px-8 md:grid-cols-[1.15fr_0.85fr] md:gap-14">
      <Rise>
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3.5 py-1.5 text-[13px] font-medium text-ink backdrop-blur-md dark:border-white/15 dark:bg-white/10">
          <span className="relative flex size-2" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          {profile.status}
        </p>
        <h1 id="about-heading" className="text-[3.25rem] font-semibold leading-[1.02] tracking-[-0.03em] text-ink outline-none sm:text-7xl md:text-[5.25rem]">
          {intro[0].bubble}
        </h1>
        <p className="mt-4 text-lg font-medium text-muted">{profile.titleParts.join('  ·  ')}</p>
        <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink/85">{ch.body}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#projects" onClick={(e) => { e.preventDefault(); scrollToSection('projects'); }} className={btnPrimary}>
            View Projects <ArrowRight className="size-4" aria-hidden="true" />
          </a>
          {__HAS_RESUME__ && (
            <a href={profile.resume} download className={btnGhost}>
              <FileDown className="size-4" aria-hidden="true" /> Download Resume
            </a>
          )}
          <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }} className={btnGhost}>
            Contact Me
          </a>
        </div>
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Contact links">
          <li><a className={chip} href={`mailto:${profile.email}`}><Mail className="size-3.5" aria-hidden="true" /> {profile.email}</a></li>
          <li><a className={chip} href={profile.phoneHref}><Phone className="size-3.5" aria-hidden="true" /> {profile.phone}</a></li>
          <li><a className={chip} href={profile.linkedin} target="_blank" rel="noopener"><LinkedinIcon className="size-3.5" /> LinkedIn</a></li>
          <li><a className={chip} href={profile.github} target="_blank" rel="noopener"><GithubIcon className="size-3.5" /> GitHub</a></li>
          <li><span className={`${chip} cursor-default hover:bg-white/50`}><MapPin className="size-3.5" aria-hidden="true" /> {profile.location}</span></li>
        </ul>
        <div className="mt-10 flex flex-wrap items-center gap-5 text-[13px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <ArrowDown className="size-3.5 animate-bounce motion-reduce:animate-none" aria-hidden="true" /> Scroll to read my story
          </span>
          <a href="#skills" onClick={(e) => { e.preventDefault(); scrollToSection('skills'); }} className="underline decoration-current/30 underline-offset-4 hover:text-ink">
            Skip intro →
          </a>
        </div>
      </Rise>

      {/* Portrait card */}
      <Rise delay={0.15} className="mx-auto w-full max-w-[380px] md:max-w-none">
        <figure className="relative overflow-hidden rounded-[28px] border border-white/70 bg-gradient-to-b from-white/60 to-white/20 shadow-2xl shadow-indigo-900/20 backdrop-blur-md dark:border-white/15 dark:from-white/10 dark:to-white/5">
          <div className="absolute inset-x-10 top-10 aspect-square rounded-full bg-[radial-gradient(circle,#8b87f0_0%,transparent_70%)] opacity-60 blur-2xl" aria-hidden="true" />
          <img
            src={PORTRAIT}
            alt="Portrait of Manoj Kapri"
            width={720}
            height={720}
            fetchPriority="high"
            className="relative mx-auto w-[92%] pt-6"
          />
          <figcaption className="relative flex items-center justify-between gap-3 border-t border-white/60 bg-white/60 px-5 py-4 backdrop-blur-md dark:border-white/10 dark:bg-white/10">
            <div>
              <p className="font-semibold text-ink">{profile.name}</p>
              <p className="text-[13px] text-muted">{ch.title} · {ch.kicker}</p>
            </div>
            <span className="rounded-full bg-[#17173d] px-3 py-1 text-[12px] font-medium text-white dark:bg-white dark:text-[#17173d]">Issue #1</span>
          </figcaption>
        </figure>
      </Rise>
    </div>
  );
}

function StoryPage({ ch, i }: { ch: Chapter; i: number }) {
  const flip = i % 2 === 0;
  const last = i === intro.length - 1;
  return (
    <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-5 py-20 sm:px-8 md:grid-cols-12 md:gap-14">
      <Rise className={`md:col-span-7 ${flip ? 'md:order-2' : ''}`}>
        <div className="overflow-hidden rounded-[24px] border border-white/70 bg-white/30 p-2 shadow-2xl shadow-indigo-900/25 backdrop-blur-md dark:border-white/15 dark:bg-white/5">
          <div className="aspect-[3/2] overflow-hidden rounded-[18px]">
            <Scene name={ch.scene} />
          </div>
        </div>
      </Rise>
      <Rise delay={0.1} className={`md:col-span-5 ${flip ? 'md:order-1' : ''}`}>
        <p className={kicker}>{ch.kicker}</p>
        <h2 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.025em] text-ink sm:text-5xl">{ch.title}</h2>
        <p className="mt-5 text-[17px] leading-relaxed text-ink/85">{ch.body}</p>
        <p className="mt-6 text-[12px] font-medium text-muted">
          {ch.cell} · Chapter {i + 1} of {intro.length}
        </p>
        {last && (
          <a href="#skills" onClick={(e) => { e.preventDefault(); scrollToSection('skills'); }} className={`${btnPrimary} mt-7`}>
            Explore my work <ArrowDown className="size-4" aria-hidden="true" />
          </a>
        )}
      </Rise>
    </div>
  );
}

export default function ComicIntro() {
  const ref = useRef<HTMLElement>(null);
  const [chapter, setChapter] = useState(0);

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
    <section id="about" ref={ref} aria-labelledby="about-heading" className="relative">
      {intro.map((ch, i) => (
        <div key={ch.cell} data-page={i} className="flex min-h-[100svh] items-center">
          {i === 0 ? <Cover ch={ch} /> : <StoryPage ch={ch} i={i} />}
        </div>
      ))}
    </section>
  );
}
