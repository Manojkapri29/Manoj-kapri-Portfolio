import { profile } from './data/content';

export default function App() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-5xl font-extrabold">{profile.name}</h1>
      <p className="font-mono text-accent-ink">{profile.title}</p>
    </main>
  );
}
