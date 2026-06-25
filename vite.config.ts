import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api/v1': {
          target: 'http://localhost:5299',
          changeOrigin: true,
          secure: false
        }
      }
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      // Target modern browsers — smaller output, no legacy polyfills
      target: 'es2020',
      // Split CSS per chunk so pages only load the CSS they need
      cssCodeSplit: true,
      // Raise warning threshold (hls.js is large by design)
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // Fine-grained chunk splitting for better caching
          manualChunks(id) {
            // Plyr — only loaded on /watch
            if (id.includes('node_modules/plyr')) return 'vendor-plyr';
            // hls.js — only loaded on /watch via dynamic import
            if (id.includes('node_modules/hls.js')) return 'vendor-hls';
            // React core — changes rarely, long-lived cache
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')
            ) return 'vendor-react';
            // Everything else in node_modules → shared vendor chunk
            if (id.includes('node_modules')) return 'vendor';
          }
        }
      }
    }
  };
});
