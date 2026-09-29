import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // The Firebase SDK (auth + Firestore) alone is ~620 kB minified / ~180 kB gzipped.
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        // Long-lived vendor chunks stay cached across app updates.
        codeSplitting: {
          groups: [
            { name: 'firebase', test: /node_modules[\\/]@?firebase/, priority: 2 },
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/, priority: 1 },
          ],
        },
      },
    },
  },
});
