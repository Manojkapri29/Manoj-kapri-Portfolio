import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {/* Vercel Web Analytics — the /_vercel/insights endpoint only exists on Vercel */}
    {!/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && <Analytics />}
  </StrictMode>,
);
