import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

const readJsonBody = async (req: any) => {
  const chunks: Buffer[] = [];
  let totalBytes = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.byteLength;
    if (totalBytes > 12 * 1024 * 1024) {
      throw new Error('Request body is too large.');
    }
    chunks.push(buffer);
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');
  return rawBody ? JSON.parse(rawBody) : {};
};

const sendJson = (res: any, status: number, data: unknown) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
};

const localApiPlugin = () => ({
  name: 'local-api',
  configureServer(server: any) {
    const routes: Record<string, (body: any, req: any) => Promise<unknown>> = {
      '/api/analyze-plant': async (body, req) => {
        const { handleAnalyzePlant } = await import('./server/api-handlers');
        return handleAnalyzePlant(body, { headers: req.headers, ip: req.socket?.remoteAddress });
      },
      '/api/generate-illustration': async (body, req) => {
        const { handleGenerateIllustration } = await import('./server/api-handlers');
        return handleGenerateIllustration(body, { headers: req.headers, ip: req.socket?.remoteAddress });
      },
      '/api/generate-care-guide': async (body, req) => {
        const { handleGenerateCareGuide } = await import('./server/api-handlers');
        return handleGenerateCareGuide(body, { headers: req.headers, ip: req.socket?.remoteAddress });
      },
      '/api/track-event': async (body, req) => {
        const { handleTrackEvent } = await import('./server/api-handlers');
        return handleTrackEvent(body, { headers: req.headers, ip: req.socket?.remoteAddress });
      },
      '/api/paypal/create-order': async (body, req) => {
        const { handleCreatePayPalOrder } = await import('./server/api-handlers');
        return handleCreatePayPalOrder(body, { headers: req.headers, ip: req.socket?.remoteAddress });
      },
      '/api/paypal/capture-order': async (body, req) => {
        const { handleCapturePayPalOrder } = await import('./server/api-handlers');
        return handleCapturePayPalOrder(body, { headers: req.headers, ip: req.socket?.remoteAddress });
      },
    };

    Object.entries(routes).forEach(([route, handler]) => {
      server.middlewares.use(route, async (req: any, res: any) => {
        if (req.method !== 'POST') {
          sendJson(res, 405, { error: 'Method not allowed.' });
          return;
        }

        try {
          const body = await readJsonBody(req);
          const result = await handler(body, req);
          sendJson(res, 200, result);
        } catch (error) {
          console.error(`${route} failed:`, error);
          const { toPublicError } = await import('./server/http');
          const publicError = toPublicError(error);
          sendJson(res, publicError.statusCode, publicError.body);
        }
      });
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  process.env.GEMINI_API_KEY ||= env.GEMINI_API_KEY;
  process.env.NODE_USE_ENV_PROXY ||= env.NODE_USE_ENV_PROXY;
  process.env.HTTP_PROXY ||= env.HTTP_PROXY;
  process.env.HTTPS_PROXY ||= env.HTTPS_PROXY || env.HTTP_PROXY;
  const hmrPort = Number(process.env.VITE_HMR_PORT || env.VITE_HMR_PORT || 0);

  return {
    plugins: [localApiPlugin(), react(), tailwindcss()],
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
  };
});
