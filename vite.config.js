import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Для GitHub Pages: замените 'wot-tournament-frontend' на имя вашего репозитория
  // Если репозиторий называется 'wot-tournament-frontend', оставьте как есть
  base: process.env.NODE_ENV === 'production' 
  ? (process.env.VITE_BASE_PATH || 'wot-tournament')  // ← замените на имя вашего репозитория
  : '/',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  // Copy data.json to public folder
  publicDir: 'public',
  // Ensure data.json is accessible
  assetsInclude: ['**/*.json']
});
