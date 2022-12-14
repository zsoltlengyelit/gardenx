import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // specify some special constants that are used by dependencies, mostly InstUI
    'global.PREVENT_CODEMIRROR_RENDER': undefined,
    'process.env.OMIT_INSTUI_DEPRECATION_WARNINGS': undefined,
    'process.env': {},
  },
  build: {
    rollupOptions: {

    }
  }
});
