import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useMotionValueEvent, useTransform } from 'framer-motion';
import { ArrowDown, ArrowRight, FileDown, Mail, MapPin, Phone } from 'lucide-react';
import { intro, profile } from '../data/content';
import { canUseWebGL, scrollToSection, useMediaQuery } from '../hooks/useSite';
import { GithubIcon, LinkedinIcon } from './icons';

const OceanScene = lazy(() => import('./ocean/OceanScene'));

const PORTRAIT = '/comic/manoj-portrait.webp';

const btnPrimary =
  'inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[15px] font-medium text-[#17173d] shadow-lg shadow-black/20 transition-transform hover:-translate-y-0.5';
const btnGhost =
  'inline-flex items-center gap-2 rounded-xl border border-white/35 bg-white/10 px-5 py-3 text-[15px] font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20';
const chip =
  'inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3.5 py-1.5 text-[13px] text-white backdrop-blur-md transition-colors hover:bg-white/20';

/**
 * First page: scroll-driven 3D ocean. Above the water the title greets you;
 * scrolling dives the camera (and the fish) under the surface where the
 * introduction appears.
 */
export default function OceanHero() {
  const ref = useRef<HTMLDivElement>(null);
  // 0 → 1 as the tall hero scrolls past (read directly so big jumps stay exact).
  const scrollYProgress = useMotionValue(0);
  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const len = el.offsetHeight - window.innerHeight;
      scrollYProgress.set(len > 0 ? Math.min(1, Math.max(0, -r.top / len)) : 0);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [scrollYProgress]);
  const [webgl] = useState(canUseWebGL);
  const [mount3D, setMount3D] = useState(false);
  useEffect(() => {
    if (!webgl) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const go = () => setMount3D(true);
    if (w.requestIdleCallback) w.requestIdleCallback(go, { timeout: 1500 });
    else window.setTimeout(go, 400);
  }, [webgl]);
  const mobile = useMediaQuery('(max-width: 767px)');
  const ch = intro[0];

  const aOpacity = useTransform(scrollYProgress, [0, 0.1, 0.2], [1, 1, 0]);
  const aY = useTransform(scrollYProgress, [0, 0.2], [0, -70]);
  const hint = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  const bOpacity = useTransform(scrollYProgress, [0.5, 0.64], [0, 1]);
  const bY = useTransform(scrollYProgress, [0.5, 0.64], [40, 0]);
  const [bOn, setBOn] = useState(false);
  useMotionValueEvent(scrollYProgress, 'change', (v) => setBOn(v > 0.5));

  // Keyboard users tabbing into the (still hidden) intro: dive down to it.
  const revealIntro = () => {
    const el = ref.current;
    if (!el || scrollYProgress.get() >= 0.64) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (el.offsetHeight - window.innerHeight) * 0.7 });
  };

  return (
    <div ref={ref} className="relative h-[320vh] w-full">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* Fallback / loading backdrop: sunset sky over deep water */}
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,#9d99ee_0%,#e6d4ee_46%,#6d74d4_52%,#2a3a8c_78%,#1b2766_100%)]"
          aria-hidden="true"
        />
        {mount3D && (
          <Suspense fallback={null}>
            <OceanScene progress={scrollYProgress} mobile={mobile} />
          </Suspense>
        )}

        {/* Above the water */}
        <motion.div
          style={{ opacity: aOpacity, y: aY }}
          className="pointer-events-none absolute inset-x-0 top-[13vh] px-5 text-center text-[#17173d]"
        >
          <p className="text-[12px] font-semibold uppercase tracking-[0.3em] text-[#3b35c4]">Portfolio · {ch.kicker}</p>
          <h1 id="about-heading" className="mx-auto mt-4 max-w-4xl text-[3.1rem] font-semibold leading-[1.02] tracking-[-0.03em] outline-none sm:text-7xl md:text-[5.5rem]">
            {ch.bubble}
          </h1>
          <p className="mt-4 text-lg font-medium text-[#3a3b66]">{profile.titleParts.join('  ·  ')}</p>
        </motion.div>

        <motion.div style={{ opacity: hint }} className="pointer-events-none absolute inset-x-0 bottom-24 text-center text-[13px] font-medium text-white md:bottom-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-black/20 px-4 py-2 backdrop-blur-md">
            <ArrowDown className="size-3.5 animate-bounce motion-reduce:animate-none" aria-hidden="true" /> Scroll down &amp; dive in
          </span>
        </motion.div>

        {/* Under the water */}
        <motion.div
          style={{ opacity: bOpacity, y: bY }}
          onFocusCapture={revealIntro}
          className={`absolute inset-0 flex items-center ${bOn ? '' : 'pointer-events-none'}`}
        >
          <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-24 sm:px-8 sm:pb-16 sm:pt-0">
            <div className="max-w-xl text-white [text-shadow:0_2px_18px_rgba(10,14,50,0.55)]">
              <div className="mb-6 flex items-center gap-3">
                <img src={PORTRAIT} alt="" width={44} height={44} className="size-11 rounded-full border border-white/40 bg-white/20 object-cover" />
                <p className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3.5 py-1.5 text-[13px] font-medium backdrop-blur-md">
                  <span className="relative flex size-2" aria-hidden="true">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:hidden" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                  </span>
                  {profile.status}
                </p>
              </div>
              <p className="text-4xl font-semibold leading-[1.08] tracking-[-0.025em] sm:text-5xl">Diving into data.</p>
              <p className="mt-5 text-[17px] leading-relaxed text-white/90">{ch.body}</p>

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
              <ul className="mt-6 hidden flex-wrap gap-2 [text-shadow:none] sm:flex" aria-label="Contact links">
                <li><a className={chip} href={`mailto:${profile.email}`}><Mail className="size-3.5" aria-hidden="true" /> {profile.email}</a></li>
                <li><a className={chip} href={profile.phoneHref}><Phone className="size-3.5" aria-hidden="true" /> {profile.phone}</a></li>
                <li><a className={chip} href={profile.linkedin} target="_blank" rel="noopener"><LinkedinIcon className="size-3.5" /> LinkedIn</a></li>
                <li><a className={chip} href={profile.github} target="_blank" rel="noopener"><GithubIcon className="size-3.5" /> GitHub</a></li>
                <li><span className={`${chip} cursor-default hover:bg-white/10`}><MapPin className="size-3.5" aria-hidden="true" /> {profile.location}</span></li>
              </ul>
              <a
                href="#skills"
                onClick={(e) => { e.preventDefault(); scrollToSection('skills'); }}
                className="mt-8 inline-block text-[13px] text-white/85 underline decoration-white/40 underline-offset-4 hover:text-white"
              >
                Skip intro →
              </a>
            </div>
          </div>
        </motion.div>
      </div>
      {/* hand-off from the deep into the lavender page */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-40 h-40 bg-gradient-to-b from-[#25378a] to-transparent" aria-hidden="true" />
    </div>
  );
}
