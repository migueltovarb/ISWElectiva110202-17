import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      statements: 99,
      branches: 99,
      functions: 99,
      lines: 99,
    },
    checkCoverage: true,
  },
  resolve: {
    alias: {
      src: '/src',
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
})