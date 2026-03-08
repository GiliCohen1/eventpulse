import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(() => {
  const isDemoMode = process.env.VITE_DEMO_MODE !== 'false';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 5173,
      proxy: isDemoMode
        ? undefined
        : {
            '/api': {
              target: 'http://localhost:3000',
              changeOrigin: true,
            },
          },
    },
  };
});
