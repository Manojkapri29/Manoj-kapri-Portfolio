import { story } from '../data/content';
import { Reveal } from './Reveal';

/** Manoj's personal introduction in one compact, premium section. */
export default function Story() {
  return (
    <section id="story" aria-labelledby="story-heading" className="mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-32">
      <Reveal>
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-accent-ink">My story</p>
        <h2 id="story-heading" className="mt-4 text-4xl font-light tracking-[-0.03em] text-ink outline-none sm:text-5xl">
          {story.title}
        </h2>
      </Reveal>

      {/* Career — hairline grid */}
      <ol className="mt-12 grid overflow-hidden rounded-3xl border border-line md:grid-cols-3">
        {story.career.map((c, i) => (
          <li key={c.n} className={`border-line p-7 ${i ? 'border-t md:border-l md:border-t-0' : ''}`}>
            <Reveal delay={i * 0.08}>
              <p className="text-sm font-medium tabular-nums text-muted">{c.n}</p>
              <p className="mt-6 text-lg font-semibold text-ink">{c.org}</p>
              <p className="text-sm text-accent-ink">{c.role}</p>
              <p className="mt-4 text-[15px] leading-relaxed text-ink/75">{c.text}</p>
            </Reveal>
          </li>
        ))}
      </ol>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Reveal className="rounded-3xl border border-line p-7">
          <p className="text-sm font-medium text-muted">Why data</p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink/75">{story.why}</p>
        </Reveal>
        <Reveal delay={0.08} className="rounded-3xl border border-line p-7">
          <p className="text-sm font-medium text-muted">Learning the science</p>
          <p className="mt-4 text-[15px] leading-relaxed text-ink/75">{story.learning}</p>
        </Reveal>
      </div>

      <Reveal>
        <blockquote className="mx-auto mt-20 max-w-4xl text-center text-2xl font-light leading-snug tracking-[-0.02em] text-ink sm:text-3xl md:text-4xl">
          <span className="text-accent-ink">“</span>
          {story.bring}
          <span className="text-accent-ink">”</span>
        </blockquote>
      </Reveal>
    </section>
  );
}
