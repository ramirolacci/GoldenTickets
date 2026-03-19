import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/tickets/',
  plugins: [
    react(),
    {
      name: 'strict-base-redirect',
      enforce: 'pre',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/tickets' || req.originalUrl === '/tickets') {
            res.statusCode = 301;
            res.setHeader('Location', '/tickets/');
            res.end();
            return;
          }
          next();
        });
      }
    }
  ],
});
