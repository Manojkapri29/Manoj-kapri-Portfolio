// Brand icons (lucide v1 no longer ships them). Same paths the old site used.
type P = { className?: string };

export const LinkedinIcon = ({ className = 'size-4' }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
    <path d="M10 9v12M10 13a4 4 0 0 1 8 0v8" />
  </svg>
);

export const GithubIcon = ({ className = 'size-4' }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
    <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
  </svg>
);

/** Small green "cell grid" mark used as the app logo. */
export const SheetMark = ({ className = 'size-6' }: P) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <rect width="32" height="32" rx="6" fill="#107C41" />
    <path d="M6 11.5h20M6 17h20M6 22.5h20M12.5 6v20M19.5 6v20" stroke="#fff" strokeOpacity=".35" strokeWidth="1.2" fill="none" />
    <rect x="12.5" y="11.5" width="7" height="5.5" fill="#fff" />
    <rect x="6" y="6" width="20" height="20" rx="1.5" fill="none" stroke="#fff" strokeWidth="1.6" />
  </svg>
);
