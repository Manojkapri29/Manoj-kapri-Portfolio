import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SheetMark } from './icons';

const steps = [
  'Importing raw data…',
  'Removing duplicates…',
  'Building pivot tables…',
  'Raising the skyline…',
  'Refreshing dashboard…',
];

/** Full-screen loader shown while the 3D city boots. */
export default function CityLoader({ done }: { done: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (done) return;
    const id = window.setInterval(() => setI((n) => Math.min(n + 1, steps.length - 1)), 420);
    return () => window.clearInterval(id);
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[90] grid place-items-center bg-bg"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeOut' } }}
          role="status"
          aria-live="polite"
        >
          <div className="flex w-72 flex-col items-center gap-5">
            <SheetMark className="size-12" />
            <p className="font-mono text-sm font-semibold text-ink">Manoj_Kapri.xlsx</p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
              <motion.div
                className="h-full rounded-full bg-accent"
                initial={{ width: '8%' }}
                animate={{ width: `${((i + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="font-mono text-[12.5px] text-muted"
              >
                {steps[i]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
