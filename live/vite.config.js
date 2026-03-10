import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React
          'react-core': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],

          // HTTP / State
          'axios': ['axios'],
          'redux': ['redux', '@reduxjs/toolkit', 'react-redux'],

          // UI libraries (add whatever you use)
          'antd': ['antd'],
          'mui': ['@mui/material', '@mui/icons-material'],
          'icons': ['react-icons'],
        }
      }
    },
    // Compress assets
    assetsInlineLimit: 4096,      // inline files < 4kb
    cssCodeSplit: true,
    sourcemap: false,             // disable sourcemaps in prod (saves size)
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,       // remove all console.logs in prod
        drop_debugger: true,
      }
    }
  }
})