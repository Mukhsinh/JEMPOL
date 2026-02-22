import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { viteApiPlugin } from './vite-api-plugin';

export default defineConfig({
  plugins: [
    react(),
    viteApiPlugin(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
  base: '/',
  server: {
    hmr: {
      overlay: false,
    },
    port: 3002,
    host: true,
    headers: {
      'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: http://localhost:* https://localhost:* ws://localhost:* wss://localhost:*; img-src 'self' data: blob: http: https: http://localhost:* https://localhost:* https://quickchart.io https://api.qrserver.com; connect-src 'self' http://localhost:* https://localhost:* ws://localhost:* wss://localhost:* https://*.supabase.co wss://*.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com;"
    },
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui-libs': ['lucide-react'],
          'game': ['phaser'],
          'http': ['axios'],
          'supabase': ['@supabase/supabase-js'],
          'pdf': ['jspdf', 'jspdf-autotable', 'html2canvas'],
          'excel': ['xlsx']
        },
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'axios',
      'lucide-react'
    ],
  },
});
