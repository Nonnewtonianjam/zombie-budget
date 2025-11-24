import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'charts': ['recharts'],
          'utils': ['date-fns', 'zustand'],
          'forms': ['react-hook-form', 'zod', '@hookform/resolvers'],
          'icons': ['lucide-react'],
        },
      },
    },
    // Target modern browsers for smaller bundle
    target: 'es2020',
    // Minify for production
    minify: 'esbuild',
    // Optimize CSS
    cssMinify: true,
    // Report compressed size
    reportCompressedSize: true,
    // Increase chunk size warning limit (charts library is large)
    chunkSizeWarningLimit: 600,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: [],
  },
  // Enable compression in preview mode
  preview: {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
})
