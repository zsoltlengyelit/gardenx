import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteCompression({
    algorithm: 'gzip',
    deleteOriginFile: true
  })],
  define: {
    // specify some special constants that are used by dependencies, mostly InstUI
    'global.PREVENT_CODEMIRROR_RENDER': undefined,
    'process.env.OMIT_INSTUI_DEPRECATION_WARNINGS': undefined,
    'process.env': {},
  },
  build: {
    commonjsOptions: {
      exclude: [
        'moment-timezone/data/packed/latest.json?commonjs-proxy'
      ]
    },
    minify: true,
    rollupOptions: {
      external: [
        'moment-timezone/data/packed/latest.json?commonjs-proxy'
      ]
    },
  }
});
