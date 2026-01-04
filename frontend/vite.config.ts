import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3004',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000, // Kurangi warning limit
    minify: 'esbuild', // Gunakan esbuild untuk minifikasi yang lebih cepat
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
    // Optimasi untuk build yang lebih cepat
    sourcemap: false, // Disable sourcemap di production untuk ukuran lebih kecil
    reportCompressedSize: false, // Skip compressed size reporting untuk build lebih cepat
  },
  // Optimasi untuk development
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
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
