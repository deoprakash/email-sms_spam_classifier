import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'email-sms-spam-classifier-1-kmko.onrender.com',
      '*.onrender.com',
    ],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
      '/predict': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
