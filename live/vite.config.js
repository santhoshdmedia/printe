import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    // Pre-compress assets at build time so Vercel/nginx can serve .gz
    // directly instead of compressing on every request.
    viteCompression({ algorithm: 'gzip', ext: '.gz' }),
    viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
  ],

  build: {
    // Raise warning limit to reduce noise
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        // Split vendor code into separate chunks so each library is
        // cached independently and the initial bundle stops growing
        // every time an unrelated feature adds a dependency.
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [ 'motion'],
          'antd-vendor': ['antd', '@ant-design/icons'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'pdf-vendor': ['jspdf', 'html2canvas'],
          'date-vendor': ['dayjs'],
          'swiper-vendor': ['swiper'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux', 'redux-saga'],
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