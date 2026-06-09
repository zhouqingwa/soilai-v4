import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  process.env.GEMINI_API_KEY ||= env.GEMINI_API_KEY;
  process.env.NODE_USE_ENV_PROXY ||= env.NODE_USE_ENV_PROXY;
  process.env.HTTP_PROXY ||= env.HTTP_PROXY;
  process.env.HTTPS_PROXY ||= env.HTTPS_PROXY || env.HTTP_PROXY;
  const hmrPort = Number(process.env.VITE_HMR_PORT || env.VITE_HMR_PORT || 0);

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;

            if (id.includes('/node_modules/@firebase/') || id.includes('/node_modules/firebase/')) return 'firebase';
            if (id.includes('/node_modules/framer-motion/') || id.includes('/node_modules/motion/')) return 'motion';
            if (id.includes('/node_modules/lucide-react/')) return 'icons';
            if (id.includes('/node_modules/@paypal/')) return 'paypal';
            if (
              id.includes('/node_modules/react-markdown/') ||
              id.includes('/node_modules/remark-') ||
              id.includes('/node_modules/micromark') ||
              id.includes('/node_modules/unified/') ||
              id.includes('/node_modules/mdast') ||
              id.includes('/node_modules/hast') ||
              id.includes('/node_modules/vfile/')
            ) {
              return 'markdown';
            }
            if (id.includes('/node_modules/html-to-image/') || id.includes('/node_modules/react-qr-code/')) return 'share-vendor';
            if (
              id.includes('/node_modules/react/') ||
              id.includes('/node_modules/react-dom/') ||
              id.includes('/node_modules/react-router-dom/') ||
              id.includes('/node_modules/react-helmet-async/')
            ) {
              return 'react-vendor';
            }

            return undefined;
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR === 'true'
        ? false
        : hmrPort
          ? { port: hmrPort }
          : true,
    },
    test: {
      include: ['server/__tests__/**/*.test.ts'],
      environment: 'node',
    },
  };
});
