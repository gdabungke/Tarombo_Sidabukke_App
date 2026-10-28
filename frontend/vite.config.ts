import { defineConfig } from 'vite';

export default defineConfig({
  // Tambahkan baris base ini agar aset terbaca sempurna di GitHub Pages
  base: '/Tarombo_Sidabukke_App/',
  
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});