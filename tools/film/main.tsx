import { createRoot } from 'react-dom/client';
import { advance } from '@react-three/fiber';
import '@fontsource-variable/dm-sans';
import Film from './Film';

/* Render harness: /tools/film/index.html?w=1920&h=1080
   window.__render(t) → renders frame at t (0..1) and returns a JPEG data URL. */
const q = new URLSearchParams(location.search);
const width = Number(q.get('w') || 1920);
const height = Number(q.get('h') || 1080);
window.__t = 0;

declare global {
  interface Window { __render: (t: number) => Promise<string>; __ready: boolean }
}

window.__render = async (t: number) => {
  window.__t = t;
  // two passes so reflector + effects settle on the new pose
  advance(performance.now());
  advance(performance.now() + 16);
  const c = document.querySelector('canvas') as HTMLCanvasElement;
  return c.toDataURL('image/jpeg', 0.95);
};

// DOM bridge for automation running in an isolated world:
// dispatch `film-render` {id, t} → result lands in <body data-frame data-done>.
document.addEventListener('film-render', (e) => {
  const { id, t } = (e as CustomEvent<{ id: number; t: number }>).detail;
  window.__render(t).then((url) => {
    document.body.dataset.frame = url;
    document.body.dataset.done = String(id);
  });
});

document.fonts.ready.then(() => {
  createRoot(document.getElementById('root')!).render(<Film width={width} height={height} />);
  setTimeout(() => { window.__ready = true; document.body.dataset.ready = '1'; }, 1500);
});
