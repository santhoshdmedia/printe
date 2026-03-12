import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    // Raise warning limit to reduce noise
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        // Split vendor code into separate chunks for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion'], // add your UI libs here
        },

        // Cache-busting filenames
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },

    // Minify with terser for smaller bundle
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,    // removes console.log in production
        drop_debugger: true,
      },
    },

    // Generate CSS code splitting
    cssCodeSplit: true,

    // Inline small assets to reduce requests
    assetsInlineLimit: 4096, // inline files < 4KB as base64
  },

  // Pre-bundle dependencies for faster dev
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },

  server: {
    // Enable gzip in dev
    cors: true,
  },
})