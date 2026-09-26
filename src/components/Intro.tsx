import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowRight, FileDown, Mail, MapPin, Phone } from 'lucide-react';
import { intro, profile } from '../data/content';
import { canUse3D, scrollToSection } from '../hooks/useSite';
import { GithubIcon, LinkedinIcon } from './icons';
import { introScroll } from './introScroll';

const OrbScene = lazy(() => import('./OrbScene'));

type Align = 'top' | 'bottom' | 'left' | 'right' | 'center';

// Where each chapter's text sits (desktop). On phones everything stacks at the bottom.
const layout: Record<Align, string> = {
  top: 'justify-start pt-[12vh] md:items-center md:text-center',
  bottom: 'justify-end pb-[22vh] md:pb-[14vh] md:items-center md:text-center',
  left: 'justify-end pb-[22vh] md:pb-[14vh] md:justify-center md:pb-0 md:items-start md:text-left',
  right: 'justify-end pb-[22vh] md:pb-[14vh] md:justify-center md:pb-0 md:items-end md:text-left',
  center: 'justify-end pb-[22vh] md:pb-[14vh] md:justify-center md:pb-0 md:items-center md:text-center',
};

const chip =
  'inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-[12px] text-ink backdrop-blur-sm transition-colors hover:border-accent-ink hover:text-accent-ink';

/** Lightweight orb for phones / reduced motion: a blurred, morphing CSS blob. */
function CssOrb({ chapter }: { chapter: number }) {
  const o = intro[chapter].orb;
  return (
    <div
      className="absolute left-1/2 top-1/2 size-[62vmin] transition-[transform,background] duration-[1200ms] ease-out"
      style={{ transform: `translate(calc(-50% + ${o.x * 22}vw), calc(-50% + ${-o.y * 30}vh)) scale(${o.scale})` }}
    >
      <div
        className="css-orb size-full"
        style={{ background: `radial-gradient(circle at 38% 35%, #ffffff 0%, ${o.color} 32%, ${o.color}55 58%, transparent 72%)` }}
      />
    </div>
  );
}

export default function Intro({ onReady }: { onReady?: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const [chapter, setChapter] = useState(0);
  const [use3D] = useState(canUse3D);
  const reduced = useReducedMotion();

  // With the CSS orb there is nothing to wait for.
  useEffect(() => { if (!use3D) onReady?.(); }, [use3D, onReady]);

  // Track scroll progress through the story (0 → 1) and the current chapter.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      introScroll.progress = p;
      const c = Math.round(p * (intro.length - 1));
      setChapter((prev) => (prev === c ? prev : c));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Tell the formula bar which chapter is showing.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('introchapter', { detail: chapter }));
  }, [chapter]);

  const color = intro[chapter].orb.color;

  return (
    <section id="about" ref={ref} aria-labelledby="about-heading" className="relative">
      {/* Sticky stage: background glow + orb */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="sticky top-0 h-[100svh] overflow-hidden bg-bg">
          <div
            className="absolute inset-0 transition-[background] duration-[1200ms]"
            style={{ background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${color}40 0%, ${color}14 45%, transparent 75%)` }}
          />
          {use3D ? (
            <Suspense fallback={<CssOrb chapter={chapter} />}>
              <OrbScene onReady={onReady} />
            </Suspense>
          ) : (
            <CssOrb chapter={chapter} />
          )}
        </div>
      </div>

      {intro.map((ch, i) => (
        <div key={ch.cell} className={`relative flex min-h-[100svh] flex-col px-5 sm:px-8 ${layout[ch.align]}`}>
          <motion.div
            className={`max-w-2xl ${ch.align === 'left' ? 'md:ml-[6vw]' : ''} ${ch.align === 'right' ? 'md:mr-[6vw]' : ''}`}
            initial={reduced ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.5 }}
            transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {i === 0 ? (
              <>
                <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent-soft px-3 py-1 font-mono text-[12px] text-accent-ink">
                  <span className="relative flex size-2" aria-hidden="true">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-ink opacity-60 motion-reduce:hidden" />
                    <span className="relative inline-flex size-2 rounded-full bg-accent-ink" />
                  </span>
                  {profile.status}
                </p>
                <h1 id="about-heading" className="font-display text-6xl leading-[1.02] tracking-tight text-ink outline-none sm:text-7xl md:text-[5.5rem]">
                  {ch.title}
                </h1>
                <p className="mt-3 font-mono text-sm tracking-wide text-accent-ink">
                  {profile.titleParts.join('  /  ')}
                </p>
              </>
            ) : (
              <>
                <p className="mb-4 font-mono text-[12px] tracking-wide text-muted">
                  <span className="mr-2 rounded border border-line-strong px-1.5 py-0.5 text-accent-ink">{ch.cell}</span>
                  {ch.kicker}
                </p>
                <h2 className="font-display text-5xl leading-[1.04] tracking-tight text-ink sm:text-6xl md:text-7xl">{ch.title}</h2>
              </>
            )}

            <p className="intro-body mt-5 text-[17px] leading-relaxed text-ink/90 md:text-lg">{ch.body}</p>

            {i === 0 && (
              <>
                <div className="mt-8 flex flex-wrap gap-3 md:justify-center">
                  <a
                    href="#projects"
                    onClick={(e) => { e.preventDefault(); scrollToSection('projects'); }}
                    className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
                  >
                    View Projects <ArrowRight className="size-4" aria-hidden="true" />
                  </a>
                  {__HAS_RESUME__ && (
                    <a href={profile.resume} download className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-ink backdrop-blur-sm transition-colors hover:border-accent-ink hover:text-accent-ink">
                      <FileDown className="size-4" aria-hidden="true" /> Download Resume
                    </a>
                  )}
                  <a
                    href="#contact"
                    onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-accent-ink hover:text-accent-ink"
                  >
                    Contact Me
                  </a>
                </div>
                <ul className="mt-6 flex flex-wrap gap-2 md:justify-center" aria-label="Contact links">
                  <li><a className={chip} href={`mailto:${profile.email}`}><Mail className="size-3.5" aria-hidden="true" /> {profile.email}</a></li>
                  <li><a className={chip} href={profile.phoneHref}><Phone className="size-3.5" aria-hidden="true" /> {profile.phone}</a></li>
                  <li><a className={chip} href={profile.linkedin} target="_blank" rel="noopener"><LinkedinIcon className="size-3.5" /> LinkedIn</a></li>
                  <li><a className={chip} href={profile.github} target="_blank" rel="noopener"><GithubIcon className="size-3.5" /> GitHub</a></li>
                  <li><span className={`${chip} cursor-default hover:border-white/15 hover:text-ink`}><MapPin className="size-3.5" aria-hidden="true" /> {profile.location}</span></li>
                </ul>
                <div className="mt-10 flex flex-wrap items-center gap-4 font-mono text-[12px] text-muted md:justify-center">
                  <span className="inline-flex items-center gap-1.5">
                    <ArrowDown className="size-3.5 animate-bounce motion-reduce:animate-none" aria-hidden="true" /> Scroll to read my story
                  </span>
                  <a
                    href="#skills"
                    onClick={(e) => { e.preventDefault(); scrollToSection('skills'); }}
                    className="underline decoration-line-strong underline-offset-4 hover:text-accent-ink"
                  >
                    Skip intro →
                  </a>
                </div>
              </>
            )}

            {i === intro.length - 1 && (
              <a
                href="#skills"
                onClick={(e) => { e.preventDefault(); scrollToSection('skills'); }}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Explore my work <ArrowDown className="size-4" aria-hidden="true" />
              </a>
            )}
          </motion.div>
        </div>
      ))}

      {/* Soft hand-off into the rest of the site */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-40 h-40 bg-gradient-to-b from-bg to-transparent" aria-hidden="true" />
    </section>
  );
}
