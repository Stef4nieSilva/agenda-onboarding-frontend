import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000, // aumenta limite para 1000 kB (1 MB)
    rollupOptions: {
      output: {
        manualChunks: {
          reactVendor: ['react', 'react-dom'],
          recharts: ['recharts'],
          reactRouter: ['react-router-dom'],
        },
      },
    },
  },
  base: './', // Necessário para Vercel
});
