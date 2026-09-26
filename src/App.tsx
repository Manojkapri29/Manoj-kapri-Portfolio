import { useCallback, useEffect, useState } from 'react';
import { CellCursor, CommandPalette } from './components/Extras';
import Hero from './components/Hero';
import Projects from './components/Projects';
import { Contact, Education, Experience, Footer, KpiStrip, Skills } from './components/Sections';
import { SheetTabs, TopBar } from './components/Shell';
import { ToastProvider } from './components/Toast';
import { useActiveSection, useTheme } from './hooks/useSite';

export default function App() {
  const { theme, toggle } = useTheme();
  const active = useActiveSection();
  const [palette, setPalette] = useState(false);
  const closePalette = useCallback(() => setPalette(false), []);

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
      <CellCursor />
      <TopBar active={active} theme={theme} onToggleTheme={toggle} onOpenPalette={() => setPalette(true)} />
      <main id="main">
        <Hero />
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
