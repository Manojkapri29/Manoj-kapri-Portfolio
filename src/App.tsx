import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import CityLoader from './components/CityLoader';
import { CellCursor, CommandPalette } from './components/Extras';
import Hero from './components/Hero';
import Projects from './components/Projects';
import { Contact, Education, Experience, Footer, KpiStrip, Skills } from './components/Sections';
import { SheetTabs, TopBar } from './components/Shell';
import { ToastProvider } from './components/Toast';
import { canUse3D, useActiveSection, useTheme } from './hooks/useSite';

const DataCity = lazy(() => import('./components/DataCity'));

type View = 'city' | 'simple';

function readView(): View {
  try {
    return localStorage.getItem('view') === 'simple' ? 'simple' : 'city';
  } catch {
    return 'city';
  }
}

export default function App() {
  const { theme, toggle } = useTheme();
  const active = useActiveSection();
  const [palette, setPalette] = useState(false);
  const closePalette = useCallback(() => setPalette(false), []);

  // 3D city on capable desktops unless the visitor picked "Simple view".
  const [cityAllowed] = useState(canUse3D);
  const [view, setView] = useState<View>(readView);
  const city = cityAllowed && view === 'city';
  const [cityReady, setCityReady] = useState(false);
  const onCityReady = useCallback(() => setCityReady(true), []);

  const toggleView = useCallback(() => {
    setView((v) => {
      const next: View = v === 'city' ? 'simple' : 'city';
      try { localStorage.setItem('view', next); } catch { /* ignore */ }
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('city', city);
  }, [city]);

  // Never trap visitors behind the loader if WebGL is slow to start.
  useEffect(() => {
    if (!city || cityReady) return;
    const t = window.setTimeout(() => setCityReady(true), 8000);
    return () => window.clearTimeout(t);
  }, [city, cityReady]);

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
      {city ? (
        <>
          <Suspense fallback={null}>
            <DataCity onReady={onCityReady} />
          </Suspense>
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-y-0 left-0 -z-[5] hidden w-[62%] bg-gradient-to-r from-bg/85 via-bg/55 to-transparent md:block"
          />
          <CityLoader done={cityReady} />
        </>
      ) : (
        <CellCursor />
      )}
      <TopBar
        active={active}
        theme={theme}
        onToggleTheme={toggle}
        onOpenPalette={() => setPalette(true)}
        view={cityAllowed ? view : undefined}
        onToggleView={toggleView}
      />
      <main id="main">
        <Hero showChart={!city} />
        <KpiStrip />
        <Skills />
        <Experience />
        <Projects />
        <Education />
        <Contact />
      </main>
      <Footer />
      <SheetTabs active={active} />
      <CommandPalette
        open={palette}
        onClose={closePalette}
        onToggleTheme={toggle}
        onToggleView={cityAllowed ? toggleView : undefined}
      />
    </ToastProvider>
  );
}
