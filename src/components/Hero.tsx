import { ArrowRight, FileDown, Mail, MapPin, Phone } from 'lucide-react';
import { profile } from '../data/content';
import { scrollToSection } from '../hooks/useSite';
import { heroBars } from './heroBars';
import { GithubIcon, LinkedinIcon } from './icons';


/** Lightweight 2D chart used on mobile, low-power devices and reduced motion. */
export function HeroFallback() {
  const w = 520;
  const h = 300;
  const gap = 12;
  const bw = (w - gap * (heroBars.length + 1)) / heroBars.length;
  const pts = heroBars.map((v, i) => [gap + i * (bw + gap) + bw / 2, h - 20 - v * (h - 60)] as const);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="fb-bar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f9d58" />
          <stop offset="1" stopColor="#107C41" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      {Array.from({ length: 9 }).map((_, r) => (
        <line key={`h${r}`} x1="0" x2={w} y1={20 + r * 32} y2={20 + r * 32} stroke="var(--line)" />
      ))}
      {heroBars.map((v, i) => {
        const bh = v * (h - 60);
        return (
          <rect
            key={i}
            className="fallback-bar"
            style={{ animationDelay: `${i * 80}ms` }}
            x={gap + i * (bw + gap)}
            y={h - 20 - bh}
            width={bw}
            height={bh}
            rx="2"
            fill="url(#fb-bar)"
          />
        );
      })}
      <polyline
        className="fallback-line"
        pathLength={1}
        points={pts.map((p) => p.join(',')).join(' ')}
        fill="none"
        stroke="var(--teal)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="var(--teal)" className="fallback-bar" style={{ animationDelay: `${900 + i * 90}ms` }} />
      ))}
    </svg>
  );
}

const chip =
  'inline-flex items-center gap-2 rounded-md border border-line bg-surface/70 px-3 py-2 font-mono text-[12.5px] text-ink transition-colors hover:border-accent hover:text-accent-ink';

export default function Hero({ showChart = true }: { showChart?: boolean }) {
  return (
    <section id="about" aria-labelledby="about-heading" className="relative isolate overflow-hidden">
      {/* Chart layer (simple view / mobile) — the 3D city replaces it on desktop */}
      {showChart && (
      <div
        className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-full opacity-35 md:w-[64%] md:opacity-100"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, #000 38%), linear-gradient(to top, transparent 0%, #000 22%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 38%), linear-gradient(to top, transparent 0%, #000 22%)',
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in',
        }}
      >
        <div className="absolute inset-0 flex items-end px-4 pb-10 md:pb-16">
          <HeroFallback />
        </div>
      </div>
      )}

      <div className="mx-auto flex min-h-[calc(100svh-140px)] max-w-6xl flex-col justify-center px-4 py-16 md:py-24">
        <p className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-accent-soft px-3 py-1 font-mono text-[12px] text-accent-ink">
          <span className="relative flex size-2" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-ink opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex size-2 rounded-full bg-accent-ink" />
          </span>
          {profile.status}
        </p>

        <h1 id="about-heading" className="text-5xl font-extrabold tracking-tight text-ink outline-none sm:text-6xl md:text-7xl">
          {profile.name}
        </h1>

        <p className="mt-4 flex flex-wrap items-center gap-x-3 text-lg text-muted sm:text-xl">
          {profile.titleParts.map((t, i) => (
            <span key={t} className="flex items-center gap-3">
              {i > 0 && <span className="text-line-strong" aria-hidden="true">/</span>}
              <span className={i === 0 ? 'font-semibold text-ink' : ''}>{t}</span>
            </span>
          ))}
        </p>

        <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-ink/85">{profile.about}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#projects"
            onClick={(e) => { e.preventDefault(); scrollToSection('projects'); }}
            className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
          >
            View Projects <ArrowRight className="size-4" aria-hidden="true" />
          </a>
          {__HAS_RESUME__ && (
            <a
              href={profile.resume}
              download
              className="inline-flex items-center gap-2 rounded-md border border-line-strong bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent-ink"
            >
              <FileDown className="size-4" aria-hidden="true" /> Download Resume
            </a>
          )}
          <a
            href="#contact"
            onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}
            className="inline-flex items-center gap-2 rounded-md border border-line-strong px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent-ink"
          >
            Contact Me
          </a>
        </div>

        <ul className="mt-8 flex flex-wrap gap-2.5" aria-label="Contact links">
          <li>
            <a className={chip} href={`mailto:${profile.email}`}>
              <Mail className="size-4" aria-hidden="true" /> {profile.email}
            </a>
          </li>
          <li>
            <a className={chip} href={profile.phoneHref}>
              <Phone className="size-4" aria-hidden="true" /> {profile.phone}
            </a>
          </li>
          <li>
            <a className={chip} href={profile.linkedin} target="_blank" rel="noopener">
              <LinkedinIcon /> LinkedIn
            </a>
          </li>
          <li>
            <a className={chip} href={profile.github} target="_blank" rel="noopener">
              <GithubIcon /> GitHub
            </a>
          </li>
          <li>
            <span className={`${chip} cursor-default hover:border-line hover:text-ink`}>
              <MapPin className="size-4" aria-hidden="true" /> {profile.location}
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}
