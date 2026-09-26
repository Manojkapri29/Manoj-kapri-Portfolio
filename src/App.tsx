import { useCallback, useEffect, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CinematicHero from './components/CinematicHero';
import DreamBackground from './components/DreamBackground';
import { CommandPalette } from './components/Extras';
import Projects from './components/Projects';
import Story from './components/Story';
import { Contact, Education, Experience, Footer, KpiStrip, Skills } from './components/Sections';
import { SheetTabs, TopBar } from './components/Shell';
import { ToastProvider } from './components/Toast';
import { useActiveSection, useTheme } from './hooks/useSite';

export default function App() {
  const { theme, toggle } = useTheme();
  const active = useActiveSection();
  const [palette, setPalette] = useState(false);
  const closePalette = useCallback(() => setPalette(false), []);

  // Smooth scroll (Lenis) driving GSAP ScrollTrigger, as in the cinematic-landing skill.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ lerp: 0.09 });
    (window as Window & { __lenis?: Lenis }).__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); delete (window as Window & { __lenis?: Lenis }).__lenis; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <ToastProvider>
      <a href="#main" className="skip-link">Skip to content</a>
      {theme === 'light' && <DreamBackground />}
      <TopBar active={active} theme={theme} onToggleTheme={toggle} onOpenPalette={() => setPalette(true)} />
      <main id="main">
        <CinematicHero />
        <Story />
        <KpiStrip />
        <Skills />
        <Experience />
        <Projects />
        <Education />
        <Contact />
      </main>
      <Footer />
      <SheetTabs active={active} />
      <CommandPalette open={palette} onClose={closePalette} onToggleTheme={toggle} />
    </ToastProvider>
  );
}
