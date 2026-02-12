import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
    proxy: {
      '/api': {
        target: 'http://localhost:3004', // Port untuk vercel dev
        changeOrigin: true,
        timeout: 30000,
        proxyTimeout: 30000,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('❌ Proxy error:', err.message);
            console.log('⚠️ Pastikan backend berjalan dengan: npm run dev:api atau npm run dev:full');
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🔄 Proxying:', req.method, req.url, '→', options.target);
          });
        },
      },
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
          'socket': ['socket.io-client']
        },
      },
    },
  },
  esbuild: {
    drop: ['console', 'debugger'],
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