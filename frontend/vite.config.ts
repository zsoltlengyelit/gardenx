import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa';

const pwaManifest: Partial<VitePWAOptions> = {
  registerType: 'autoUpdate',
  minify: true,
  workbox: {
    clientsClaim: true,
    skipWaiting: true
  },
  devOptions: {
    enabled: true
  },
  manifest: {
    name: 'HapPi Plant',
    short_name: 'HapPi Plant',
    description: 'My Awesome App description',
    theme_color: '#ffffff',
    icons: [
      {
        src: 'plant.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: 'plant.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  }
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA(pwaManifest)],
  define: {
    // specify some special constants that are used by dependencies, mostly InstUI
    'global.PREVENT_CODEMIRROR_RENDER': undefined,
    'process.env.OMIT_INSTUI_DEPRECATION_WARNINGS': undefined,
    'process.env': {},
  },
  build: {
    minify: true,
    rollupOptions: {}
  }
});
