import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:9002',
        changeOrigin: true,
      },
    },
  },

  preview: {
    host: true,
    port: 5173,
    allowedHosts: ['smarty.insightpulse.fun'],
  },

  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});