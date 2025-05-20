import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Agora você pode usar @/components por exemplo
    },
  },
  server: {
    port: 3000,        // Porta padrão ao rodar o projeto localmente
    open: true,        // Abre automaticamente o navegador ao iniciar o dev server
  },
  build: {
    outDir: 'dist',    // Pasta de saída para build
    sourcemap: false,  // Pode ativar true para debug em produção
  },
  define: {
    'process.env': {}, // Suporte básico para process.env (ambiente)
  },
});
