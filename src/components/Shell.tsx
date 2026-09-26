import { useEffect, useState } from 'react';
import { Briefcase, FolderKanban, GraduationCap, Mail, Moon, Search, Sun, User, Wrench } from 'lucide-react';
import { profile, sections, site, type SectionId } from '../data/content';
import { scrollToSection, useReducedMotion } from '../hooks/useSite';
import { SheetMark } from './icons';

const tabIcons: Record<SectionId, typeof User> = {
  about: User,
  skills: Wrench,
  experience: Briefcase,
  projects: FolderKanban,
  education: GraduationCap,
  contact: Mail,
};

const heroFormula = `="${profile.name}"`;

/** Types the name into the fx bar once on load. */
function useTypedFormula() {
  const reduced = useReducedMotion();
  const [n, setN] = useState(reduced ? heroFormula.length : 0);
  useEffect(() => {
    if (reduced) return setN(heroFormula.length);
    let i = 0;
    const start = window.setTimeout(function tick() {
      i += 1;
      setN(i);
      if (i < heroFormula.length) window.setTimeout(tick, 70);
    }, 450);
    return () => window.clearTimeout(start);
  }, [reduced]);
  return { text: heroFormula.slice(0, n), done: n >= heroFormula.length };
}

type TopBarProps = {
  active: SectionId;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenPalette: () => void;
};

export function TopBar({ active, theme, onToggleTheme, onOpenPalette }: TopBarProps) {
  const current = sections.find((s) => s.id === active) ?? sections[0];
  const typed = useTypedFormula();
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md supports-[backdrop-filter]:bg-bg/70">
      {/* Row 1: file name + tools */}
      <div className="mx-auto flex h-11 max-w-6xl items-center gap-3 px-4">
        <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }} className="flex items-center gap-2 rounded">
          <SheetMark className="size-5" />
          <span className="font-mono text-[13px] font-semibold text-ink">{site.fileName}</span>
        </a>
        <span className="hidden font-mono text-[11px] text-muted sm:inline">— Saved</span>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenPalette}
            className="flex h-8 items-center gap-2 rounded-md border border-line px-2.5 font-mono text-[12px] text-muted transition-colors hover:border-line-strong hover:text-ink"
            aria-label="Open quick navigation"
            aria-keyshortcuts="Control+K Meta+K"
          >
            <Search className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Go to…</span>
            <kbd className="hidden rounded border border-line px-1 text-[10px] sm:inline">{isMac ? '⌘' : 'Ctrl'} K</kbd>
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            className="grid size-8 place-items-center rounded-md border border-line text-muted transition-colors hover:border-line-strong hover:text-ink"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Row 2: Name Box + fx formula bar */}
      <div className="border-t border-line bg-surface/60" aria-hidden="true">
        <div className="mx-auto flex h-9 max-w-6xl items-stretch px-4 font-mono text-[12.5px]">
          <div className="flex w-14 shrink-0 items-center justify-center border-r border-line font-semibold text-ink">
            {current.cell}
          </div>
          <div className="flex w-10 shrink-0 items-center justify-center border-r border-line italic text-accent-ink">fx</div>
          <div className="flex min-w-0 items-center truncate px-3 text-ink">
            {active === 'about' ? (
              <span className={typed.done ? '' : 'caret'}>{typed.text}</span>
            ) : (
              <span>
                <span className="text-accent-ink">{current.formula.replace('()', '')}</span>
                <span className="text-muted">()</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

/** Excel-style sheet tabs, fixed to the bottom. Compact icon nav on mobile. */
export function SheetTabs({ active }: { active: SectionId }) {
  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 backdrop-blur-md"
    >
      <div className="no-scrollbar mx-auto flex max-w-6xl items-stretch overflow-x-auto px-2 sm:px-4">
        <span className="hidden items-center pr-3 font-mono text-[11px] text-muted md:flex" aria-hidden="true">
          ◂ ▸
        </span>
        <ul className="flex w-full md:w-auto">
          {sections.map((s) => {
            const Icon = tabIcons[s.id];
            const isActive = s.id === active;
            return (
              <li key={s.id} className="flex-1 md:flex-none">
                <a
                  href={`#${s.id}`}
                  onClick={(e) => { e.preventDefault(); scrollToSection(s.id); }}
                  aria-current={isActive ? 'true' : undefined}
                  className={[
                    'relative flex h-14 flex-col items-center justify-center gap-0.5 px-1 text-[10.5px] font-medium transition-colors md:h-10 md:flex-row md:gap-2 md:border-r md:border-line md:px-4 md:text-[13px]',
                    isActive ? 'bg-bg text-accent-ink' : 'text-muted hover:text-ink',
                  ].join(' ')}
                >
                  <Icon className="size-4 md:hidden" aria-hidden="true" />
                  <span>{s.label}</span>
                  {isActive && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-accent md:inset-x-0" aria-hidden="true" />}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

/** Section heading styled as a cell range label, e.g. "SKILLS B2:B5". */
export function SectionLabel({ id, title, range }: { id: string; title: string; range: string }) {
  return (
    <div className="mb-8 flex items-baseline gap-3">
      <span className="font-mono text-sm italic text-accent-ink" aria-hidden="true">ƒ</span>
      <h2 id={`${id}-heading`} className="font-mono text-sm font-bold tracking-[0.14em] text-ink outline-none">
        {title}
      </h2>
      <span className="font-mono text-xs text-muted" aria-label={`cell range ${range}`}>{range}</span>
      <span className="h-px flex-1 bg-line" aria-hidden="true" />
    </div>
  );
}
