import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // The pdf-lib / xlsx vendor chunks are large but lazy-loaded only when
      // their module is opened, so they don't affect initial page load.
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // Split large third-party dependencies into their own chunks so
          // they cache independently and the app's own code stays small.
          manualChunks: {
            'vendor-motion': ['motion'],
            'vendor-pdf': ['pdf-lib', 'exifr'],
            'vendor-xlsx': ['xlsx'],
            'vendor-datepicker': ['react-datepicker'],
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
