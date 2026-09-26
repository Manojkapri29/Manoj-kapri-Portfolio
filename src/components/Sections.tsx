import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useInView, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { Award, Copy, GraduationCap, Mail, Phone } from 'lucide-react';
import {
  certifications,
  contact,
  education,
  experience,
  formulaCells,
  kpis,
  profile,
  ranges,
  site,
  skills,
} from '../data/content';
import { GithubIcon, LinkedinIcon } from './icons';
import { Reveal } from './Reveal';
import { SectionLabel } from './Shell';
import { copyText, useToast } from './Toast';

const wrap = 'mx-auto max-w-6xl px-4';

/* ── KPI strip ───────────────────────────────────────────────────────────── */

function Counter({ value, decimals, suffix }: { value: number; decimals: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? value : 0);

  useEffect(() => {
    if (!inView || reduced) return;
    const c = animate(0, value, { duration: 1.4, ease: [0.2, 0.8, 0.2, 1], onUpdate: setShown });
    return () => c.stop();
  }, [inView, reduced, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export function KpiStrip() {
  return (
    <section aria-label="Key figures" className={`${wrap} -mt-4 pb-8`}>
      <ul className="grid grid-cols-2 overflow-hidden rounded-md border border-line bg-surface md:grid-cols-4">
        {kpis.map((k, i) => (
          <li
            key={k.label}
            className={[
              'relative px-5 py-5',
              i % 2 === 1 ? 'border-l border-line' : '',
              i >= 2 ? 'border-t border-line md:border-t-0' : '',
              i === 2 ? 'md:border-l' : '',
            ].join(' ')}
          >
            <span className="absolute right-2 top-1.5 font-mono text-[10px] text-muted" aria-hidden="true">{k.cell}</span>
            <p className="font-mono text-3xl font-bold text-accent-ink md:text-4xl">
              <Counter value={k.value} decimals={k.decimals} suffix={k.suffix} />
            </p>
            <p className="mt-1 text-sm text-muted">{k.label}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ── Skills: pivot table + mini formula sheet ────────────────────────────── */

function FormulaSheet() {
  const [sel, setSel] = useState(0);
  const cols = ['A', 'B', 'C'];
  const cell = formulaCells[sel];
  const gridRef = useRef<HTMLDivElement>(null);

  // Arrow-key navigation between cells, like a real sheet.
  const onKey = (e: React.KeyboardEvent) => {
    const map: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 3, ArrowUp: -3 };
    if (!(e.key in map)) return;
    e.preventDefault();
    const next = Math.min(formulaCells.length - 1, Math.max(0, sel + map[e.key]));
    setSel(next);
    gridRef.current?.querySelectorAll<HTMLButtonElement>('[role="gridcell"]')[next]?.focus();
  };

  return (
    <div className="mt-10 overflow-hidden rounded-md border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <p className="font-mono text-xs font-semibold tracking-wider text-ink">FORMULAS.xlsx</p>
        <p className="text-xs text-muted">Click a cell to see a formula I use</p>
      </div>
      <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div ref={gridRef} role="grid" aria-label="Formula examples" onKeyDown={onKey} className="border-b border-line md:border-b-0 md:border-r">
          <div role="row" className="grid grid-cols-[36px_repeat(3,minmax(0,1fr))] border-b border-line bg-surface-2 font-mono text-[11px] text-muted">
            <span role="columnheader" aria-hidden="true" />
            {cols.map((c) => (
              <span role="columnheader" key={c} className="border-l border-line py-1 text-center">{c}</span>
            ))}
          </div>
          {[0, 1].map((r) => (
            <div role="row" key={r} className="grid grid-cols-[36px_repeat(3,minmax(0,1fr))] border-b border-line last:border-b-0">
              <span role="rowheader" className="grid place-items-center bg-surface-2 font-mono text-[11px] text-muted">{r + 1}</span>
              {formulaCells.slice(r * 3, r * 3 + 3).map((fc, ci) => {
                const idx = r * 3 + ci;
                const isSel = idx === sel;
                return (
                  <button
                    key={fc.cell}
                    type="button"
                    role="gridcell"
                    aria-selected={isSel}
                    tabIndex={isSel ? 0 : -1}
                    onClick={() => setSel(idx)}
                    className={[
                      'relative h-16 border-l border-line px-2 text-left font-mono text-[12px] transition-colors',
                      isSel ? 'bg-accent-soft text-accent-ink outline-2 -outline-offset-2 outline-accent' : 'text-ink hover:bg-surface-2',
                    ].join(' ')}
                  >
                    {fc.label}
                    {isSel && <span className="absolute -bottom-[3px] -right-[3px] size-1.5 bg-accent" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 border-b border-line px-3 py-1.5 font-mono text-[12px]">
            <span className="font-semibold text-ink">{cell.cell}</span>
            <span className="italic text-accent-ink">fx</span>
            <span className="ml-auto text-muted">{cell.lang}</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.pre
              key={cell.cell}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="overflow-x-auto whitespace-pre-wrap break-words p-4 font-mono text-[12.5px] leading-relaxed text-ink"
              aria-live="polite"
            >
              <code>{cell.code}</code>
            </motion.pre>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export function Skills() {
  const [cat, setCat] = useState(0);
  const tabsId = useId();
  const listRef = useRef<HTMLDivElement>(null);

  const onKey = (e: React.KeyboardEvent) => {
    const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (cat + d + skills.length) % skills.length;
    setCat(next);
    listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  };

  return (
    <section id="skills" aria-labelledby="skills-heading" className={`${wrap} py-14 md:py-20`}>
      <SectionLabel id="skills" title="SKILLS" range={ranges.skills} />
      <Reveal>
        <div className="overflow-hidden rounded-md border border-line bg-surface md:grid md:grid-cols-[240px_minmax(0,1fr)]">
          <div
            ref={listRef}
            role="tablist"
            aria-label="Skill categories"
            aria-orientation="vertical"
            onKeyDown={onKey}
            className="no-scrollbar flex overflow-x-auto border-b border-line md:block md:border-b-0 md:border-r"
          >
            <p className="hidden border-b border-line bg-surface-2 px-4 py-2 font-mono text-[11px] tracking-wider text-muted md:block" aria-hidden="true">
              ROW LABELS ▾
            </p>
            {skills.map((s, i) => (
              <button
                key={s.category}
                type="button"
                role="tab"
                id={`${tabsId}-tab-${i}`}
                aria-selected={i === cat}
                aria-controls={`${tabsId}-panel`}
                tabIndex={i === cat ? 0 : -1}
                onClick={() => setCat(i)}
                className={[
                  'relative shrink-0 whitespace-nowrap px-4 py-3 text-left text-sm font-medium transition-colors md:block md:w-full md:border-b md:border-line',
                  i === cat ? 'bg-accent-soft text-accent-ink' : 'text-ink hover:bg-surface-2',
                ].join(' ')}
              >
                {i === cat && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-accent md:inset-y-0 md:left-0 md:right-auto md:h-auto md:w-0.5" aria-hidden="true" />}
                {s.category}
                <span className="ml-2 font-mono text-[11px] text-muted">{s.items.length}</span>
              </button>
            ))}
          </div>
          <div id={`${tabsId}-panel`} role="tabpanel" aria-labelledby={`${tabsId}-tab-${cat}`} className="min-h-[180px] p-5">
            <p className="mb-4 font-mono text-[11px] tracking-wider text-muted" aria-hidden="true">
              VALUES · {skills[cat].category.toUpperCase()}
            </p>
            <AnimatePresence mode="wait">
              <motion.ul
                key={cat}
                className="flex flex-wrap gap-2"
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
              >
                {skills[cat].items.map((item) => (
                  <motion.li
                    key={item}
                    variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                    className="rounded border border-line bg-surface-2 px-3 py-1.5 text-sm text-ink"
                  >
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.05}>
        <FormulaSheet />
      </Reveal>
    </section>
  );
}

/* ── Experience timeline ─────────────────────────────────────────────────── */

export function Experience() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <section id="experience" aria-labelledby="experience-heading" className={`${wrap} py-14 md:py-20`}>
      <SectionLabel id="experience" title="EXPERIENCE" range={ranges.experience} />
      <ol ref={ref} className="relative space-y-8 pl-8 md:pl-12">
        <span className="absolute bottom-2 left-[11px] top-2 w-px bg-line md:left-[19px]" aria-hidden="true" />
        <motion.span
          style={{ scaleY }}
          className="absolute bottom-2 left-[10px] top-2 w-[3px] origin-top rounded-full bg-accent-ink shadow-[0_0_8px_var(--accent-ink)] md:left-[18px]"
          aria-hidden="true"
        />
        {experience.map((job, i) => (
          <li key={job.org} className="relative">
            <span
              className="absolute -left-8 top-6 grid size-6 place-items-center rounded-sm border border-accent bg-bg font-mono text-[10px] font-bold text-accent-ink md:-left-12 md:size-10 md:text-[11px]"
              aria-hidden="true"
            >
              C{2 + i * 4}
            </span>
            <Reveal x={24} y={0}>
              <article className="group relative rounded-sm border-2 border-accent/70 bg-surface p-5 shadow-[0_0_0_4px_var(--accent-soft)] transition-colors hover:border-accent md:p-6">
                <span className="absolute -bottom-[5px] -right-[5px] size-2 border border-bg bg-accent" aria-hidden="true" />
                <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                  <div>
                    <h3 className="text-lg font-bold text-ink">{job.role}</h3>
                    <p className="text-[15px] font-semibold text-accent-ink">{job.org}</p>
                  </div>
                  <div className="text-right font-mono text-[12.5px] text-muted">
                    <p>{job.period}</p>
                    {job.note && <p className="text-teal">{job.note}</p>}
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-[14.5px] text-ink/90">
                  {job.points.map((p) => (
                    <li key={p} className="flex gap-2.5">
                      <span className="mt-[9px] size-1.5 shrink-0 bg-accent" aria-hidden="true" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ── Education ───────────────────────────────────────────────────────────── */

export function Education() {
  return (
    <section id="education" aria-labelledby="education-heading" className={`${wrap} py-14 md:py-20`}>
      <SectionLabel id="education" title="EDUCATION & CERTIFICATIONS" range={ranges.education} />
      <div className="grid gap-4 md:grid-cols-3">
        {education.map((e, i) => (
          <Reveal key={e.degree} delay={i * 0.06}>
            <article className="h-full rounded-md border border-line bg-surface p-5 transition-colors hover:border-accent/60">
              <GraduationCap className="size-6 text-accent-ink" aria-hidden="true" />
              <h3 className="mt-3 font-bold text-ink">{e.degree}</h3>
              <p className="text-sm text-muted">{e.school}</p>
              <p className="mt-3 font-mono text-[12.5px] text-ink">
                {e.period}
                {e.score && <span className="ml-2 rounded bg-accent-soft px-1.5 py-0.5 font-semibold text-accent-ink">{e.score}</span>}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.1}>
        <ul className="mt-6 flex flex-wrap gap-2.5" aria-label="Certifications">
          {certifications.map((c) => (
            <li key={c} className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink">
              <Award className="size-4 text-teal" aria-hidden="true" />
              {c}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

/* ── Contact ─────────────────────────────────────────────────────────────── */

export function Contact() {
  const toast = useToast();
  const btn =
    'inline-flex items-center gap-2 rounded-md border border-line-strong bg-surface px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent-ink';

  return (
    <section id="contact" aria-labelledby="contact-heading" className={`${wrap} py-16 md:py-28`}>
      <Reveal>
        <div className="rounded-md border border-line bg-surface p-6 text-center md:p-12">
          <h2 id="contact-heading" className="caret font-mono text-xl font-bold leading-snug text-ink outline-none sm:text-2xl md:text-4xl">
            <span className="text-accent-ink">=CONNECT</span>
            {contact.heading.replace('=CONNECT', '')}
          </h2>
          <p className="mt-4 text-muted">{contact.line}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
              onClick={async () => {
                if (await copyText(profile.email)) toast('Copied to clipboard');
              }}
              aria-label={`Copy email address ${profile.email}`}
            >
              <Copy className="size-4" aria-hidden="true" /> Email Me
            </button>
            <a className={btn} href={`mailto:${profile.email}`}>
              <Mail className="size-4" aria-hidden="true" /> Open Mail
            </a>
            <a className={btn} href={profile.linkedin} target="_blank" rel="noopener">
              <LinkedinIcon /> LinkedIn
            </a>
            <a className={btn} href={profile.github} target="_blank" rel="noopener">
              <GithubIcon /> GitHub
            </a>
            <a className={btn} href={profile.phoneHref}>
              <Phone className="size-4" aria-hidden="true" /> {profile.phone}
            </a>
          </div>
          <p className="mt-5 font-mono text-[12.5px] text-muted">{profile.email}</p>
        </div>
      </Reveal>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line px-4 pb-24 pt-8 text-center font-mono text-[12px] text-muted md:pb-16">
      {site.footer}
    </footer>
  );
}
