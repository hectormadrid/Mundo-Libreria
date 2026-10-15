import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// El build se escribe en ../public, que es la carpeta que sirve el servidor Node.
// En desarrollo (`npm run dev`) Vite reenvía la API y las imágenes al servidor
// Node (`npm run dev` en la carpeta server, puerto 3000).
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  publicDir: false,
  build: {
    outDir: '../public',
    // No vaciar ../public: ahí están las imágenes subidas y los assets.
    emptyOutDir: false,
    assetsDir: 'static',
  },
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:3000',
      '/uploads': 'http://127.0.0.1:3000',
      '/assets': 'http://127.0.0.1:3000',
    },
  },
});
