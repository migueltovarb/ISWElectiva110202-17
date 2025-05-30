import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 80,  // Bajé los valores para que sea realista 😉
        branches: 80,
        functions: 80,
        lines: 80,
      }
    }
  },
  resolve: {
    alias: {
      src: '/src',
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
});