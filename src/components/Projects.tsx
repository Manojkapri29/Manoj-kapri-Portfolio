import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight, ExternalLink, X } from 'lucide-react';
import { isPlaceholder, projects, ranges, type Project } from '../data/content';
import { useMediaQuery } from '../hooks/useSite';
import { GithubIcon } from './icons';
import { Reveal } from './Reveal';
import { SectionLabel } from './Shell';

const ForecastChart = lazy(() => import('./ForecastChart'));

/** Renders a value, or a visible placeholder chip if it's still {{...}}. */
export function Val({ v }: { v: string }) {
  return isPlaceholder(v) ? <span className="placeholder-chip">{v}</span> : <>{v}</>;
}

function TiltCard({ project, index, onOpen }: { project: Project; index: number; onOpen: () => void }) {
  const reduced = useReducedMotion();
  const fine = useMediaQuery('(hover: hover) and (pointer: fine)');
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [5, -5]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [0, 1], [-6, 6]), { stiffness: 200, damping: 20 });
  const tilt = fine && !reduced;

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      onPointerMove={(e) => {
        if (!tilt) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => { mx.set(0.5); my.set(0.5); }}
      style={tilt ? { rotateX: rx, rotateY: ry, transformPerspective: 900 } : undefined}
      aria-haspopup="dialog"
      className="group relative flex h-full w-full flex-col rounded-md border border-line bg-surface p-6 text-left transition-colors hover:border-accent"
    >
      <span className="absolute right-3 top-2 font-mono text-[10px] text-muted" aria-hidden="true">D{index + 2}</span>
      <div className="flex flex-wrap gap-1.5">
        {project.tags.map((t) => (
          <span key={t} className="rounded bg-accent-soft px-2 py-0.5 font-mono text-[11px] text-accent-ink">{t}</span>
        ))}
      </div>
      <h3 className="mt-4 text-lg font-bold text-ink">{project.name}</h3>
      <p className="mt-2 flex-1 text-[14.5px] text-ink/85">{project.description}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 font-mono text-[12px] text-accent-ink">
        Open dashboard view <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
      </span>
    </motion.button>
  );
}

function ProjectModal({ project, seed, onClose }: { project: Project; seed: number; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const f = dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus();
    };
  }, [onClose]);

  const links = [
    { href: project.github, label: 'GitHub', icon: <GithubIcon /> },
    { href: project.demo, label: 'Live Demo', icon: <ExternalLink className="size-4" aria-hidden="true" /> },
  ].filter((l) => !isPlaceholder(l.href));

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        initial={{ y: 40, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
        className="max-h-[92svh] w-full max-w-3xl overflow-y-auto rounded-t-lg border border-line-strong bg-bg shadow-2xl sm:rounded-lg"
      >
        {/* Title bar like a workbook window */}
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-surface px-5 py-3">
          <span className="font-mono text-[12px] text-muted">Dashboard.xlsx</span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="ml-auto grid size-8 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-ink"
            aria-label="Close project details"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-6 p-5 sm:p-7">
          <div>
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((t) => (
                <span key={t} className="rounded bg-accent-soft px-2 py-0.5 font-mono text-[11px] text-accent-ink">{t}</span>
              ))}
            </div>
            <h3 id="project-modal-title" className="mt-3 text-2xl font-bold text-ink">{project.name}</h3>
            <p className="mt-2 text-ink/85">{project.description}</p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-3">
            {project.metrics.map((m, i) => (
              <li key={m.label} className="relative rounded-md border border-line bg-surface p-4">
                <span className="absolute right-2 top-1.5 font-mono text-[10px] text-muted" aria-hidden="true">{String.fromCharCode(65 + i)}1</span>
                <p className="text-[12px] text-muted">{m.label}</p>
                <p className="mt-1 font-mono text-lg font-bold text-accent-ink"><Val v={m.value} /></p>
              </li>
            ))}
          </ul>

          <div className="rounded-md border border-line bg-surface p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">Actual vs Forecast</p>
              <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[10.5px] uppercase tracking-wider text-muted">Sample data</span>
            </div>
            <Suspense fallback={<div className="h-56 animate-pulse rounded bg-surface-2" />}>
              <ForecastChart seed={seed} />
            </Suspense>
          </div>

          <div>
            <p className="mb-2 font-mono text-[11px] tracking-wider text-muted">TOOLS USED</p>
            <ul className="flex flex-wrap gap-2">
              {project.tools.map((t) => (
                <li key={t} className="rounded border border-line bg-surface-2 px-3 py-1 text-sm text-ink">{t}</li>
              ))}
            </ul>
          </div>

          {links.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 rounded-md border border-line-strong px-4 py-2 text-sm font-semibold text-ink hover:border-accent hover:text-accent-ink"
                >
                  {l.icon} {l.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Projects() {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);

  return (
    <section id="projects" aria-labelledby="projects-heading" className="mx-auto max-w-6xl px-4 py-14 md:py-20">
      <SectionLabel id="projects" title="PROJECTS" range={ranges.projects} />
      <ul className="grid gap-5 md:grid-cols-2">
        {projects.map((p, i) => (
          <li key={p.name}>
            <Reveal delay={i * 0.08} className="h-full">
              <TiltCard project={p} index={i} onOpen={() => setOpen(i)} />
            </Reveal>
          </li>
        ))}
      </ul>
      <AnimatePresence>
        {open !== null && <ProjectModal project={projects[open]} seed={open * 3} onClose={close} />}
      </AnimatePresence>
    </section>
  );
}
