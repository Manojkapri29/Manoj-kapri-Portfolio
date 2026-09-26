import { existsSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // Resume button is hidden when the PDF is missing from /public.
    __HAS_RESUME__: JSON.stringify(existsSync('public/Manoj_Kapri_Resume.pdf')),
  },
  build: {
    target: 'es2020',
    // three.js and recharts are split out automatically via React.lazy() imports.
    chunkSizeWarningLimit: 1100,
  },
});
