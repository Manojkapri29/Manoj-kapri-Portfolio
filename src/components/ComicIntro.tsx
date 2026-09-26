import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { intro } from '../data/content';
import { scrollToSection } from '../hooks/useSite';
import OceanHero from './OceanHero';
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
        i === 0 ? (
          <div key={ch.cell} data-page={i}>
            <OceanHero />
          </div>
        ) : (
          <div key={ch.cell} data-page={i} className="flex min-h-[100svh] items-center">
            <StoryPage ch={ch} i={i} />
          </div>
        )
      ))}
    </section>
  );
}
