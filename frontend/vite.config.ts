import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// El build se escribe en ../public, que es la carpeta que sirve Apache.
// - `npm run build`        → URLs bajo /Mundo-Libreria/public/ (XAMPP local)
// - `npm run build:server` → URLs desde la raíz del dominio (/)
// En desarrollo (`npm run dev`) la app vive en / y Vite reenvía la API y las
// imágenes al servidor PHP (`npm run api`, puerto 8000).
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Mundo-Libreria/public/' : '/',
  plugins: [react(), tailwindcss()],
  publicDir: false,
  build: {
    outDir: '../public',
    // No vaciar ../public: ahí están la API, las imágenes subidas y los assets.
    emptyOutDir: false,
    assetsDir: 'static',
  },
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8000',
      '/uploads': 'http://127.0.0.1:8000',
      '/assets': 'http://127.0.0.1:8000',
    },
  },
}));
