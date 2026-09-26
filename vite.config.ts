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
    rollupOptions: {
      output: {
        // Keep the heavy 3D and chart libraries out of the initial bundle.
        manualChunks(id) {
          if (id.includes('node_modules/three') || id.includes('@react-three')) return 'three';
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) return 'charts';
        },
      },
    },
  },
});
