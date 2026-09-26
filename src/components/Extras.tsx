import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Copy, CornerDownLeft, FileDown, Moon, Search } from 'lucide-react';
import { profile, sections } from '../data/content';
import { scrollToSection } from '../hooks/useSite';
import { GithubIcon, LinkedinIcon } from './icons';
import { copyText, useToast } from './Toast';

type Cmd = { id: string; label: string; hint: string; icon: React.ReactNode; run: () => void };

/** Ctrl/Cmd+K quick navigation. */
export function CommandPalette({ open, onClose, onToggleTheme, onToggleView }: { open: boolean; onClose: () => void; onToggleTheme: () => void; onToggleView?: () => void }) {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo<Cmd[]>(() => {
    const go: Cmd[] = sections.map((s) => ({
      id: s.id,
      label: `Go to ${s.label}`,
      hint: s.cell,
      icon: <span className="font-mono text-[11px] text-accent-ink">{s.cell}</span>,
      run: () => scrollToSection(s.id),
    }));
    const actions: Cmd[] = [
      { id: 'copy', label: 'Copy email address', hint: profile.email, icon: <Copy className="size-4" />, run: async () => { if (await copyText(profile.email)) toast('Copied to clipboard'); } },
      { id: 'li', label: 'Open LinkedIn', hint: 'linkedin.com', icon: <LinkedinIcon />, run: () => window.open(profile.linkedin, '_blank', 'noopener') },
      { id: 'gh', label: 'Open GitHub', hint: 'github.com', icon: <GithubIcon />, run: () => window.open(profile.github, '_blank', 'noopener') },
      { id: 'theme', label: 'Toggle light / dark mode', hint: 'Theme', icon: <Moon className="size-4" />, run: onToggleTheme },
    ];
    if (onToggleView) {
      actions.push({ id: 'view', label: 'Toggle 3D city / simple view', hint: 'View', icon: <Building2 className="size-4" />, run: onToggleView });
    }
    if (__HAS_RESUME__) {
      actions.splice(1, 0, { id: 'cv', label: 'Download resume', hint: 'PDF', icon: <FileDown className="size-4" />, run: () => window.open(profile.resume, '_blank') });
    }
    return [...go, ...actions];
  }, [onToggleTheme, onToggleView, toast]);

  const filtered = commands.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()) || c.hint.toLowerCase().includes(q.toLowerCase()));

  useEffect(() => {
    if (!open) return;
    setQ('');
    setIdx(0);
    const prev = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => prev?.focus?.();
  }, [open]);

  useEffect(() => setIdx(0), [q]);

  const runAt = (i: number) => {
    const c = filtered[i];
    if (!c) return;
    onClose();
    // Let the palette close (and focus restore) before scrolling / opening.
    window.setTimeout(c.run, 30);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(filtered.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); runAt(idx); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    else if (e.key === 'Tab') { e.preventDefault(); } // keep focus in the palette
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-start justify-center bg-black/50 px-4 pt-[14vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Quick navigation"
            initial={{ y: -12, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-lg overflow-hidden rounded-lg border border-line-strong bg-surface shadow-2xl"
            onKeyDown={onKey}
          >
            <div className="flex items-center gap-2 border-b border-line px-4">
              <Search className="size-4 text-muted" aria-hidden="true" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Go to a section or run a command…"
                aria-label="Search sections and commands"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={filtered[idx] ? `cmd-${filtered[idx].id}` : undefined}
                className="h-12 w-full bg-transparent text-[15px] text-ink placeholder:text-muted focus:outline-none"
              />
              <kbd className="rounded border border-line px-1.5 font-mono text-[10px] text-muted">Esc</kbd>
            </div>
            <ul id="palette-list" role="listbox" className="max-h-[50vh] overflow-y-auto p-1.5">
              {filtered.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">No matches</li>}
              {filtered.map((c, i) => (
                <li
                  key={c.id}
                  id={`cmd-${c.id}`}
                  role="option"
                  aria-selected={i === idx}
                  onMouseEnter={() => setIdx(i)}
                  onClick={() => runAt(i)}
                  className={[
                    'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm',
                    i === idx ? 'bg-accent-soft text-accent-ink' : 'text-ink',
                  ].join(' ')}
                >
                  <span className="grid w-6 place-items-center" aria-hidden="true">{c.icon}</span>
                  <span className="flex-1">{c.label}</span>
                  <span className="truncate font-mono text-[11px] text-muted">{c.hint}</span>
                  {i === idx && <CornerDownLeft className="size-3.5" aria-hidden="true" />}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
