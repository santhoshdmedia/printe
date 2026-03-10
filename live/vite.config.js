import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Antd - split into smaller pieces
          if (id.includes('node_modules/antd')) return 'antd';
          if (id.includes('node_modules/@ant-design')) return 'antd-icons';
          if (id.includes('node_modules/rc-')) return 'antd-rc'; // antd dependencies

          // Core
          if (id.includes('node_modules/react-dom')) return 'react-dom';
          if (id.includes('node_modules/react-router')) return 'react-router';
          if (id.includes('node_modules/react')) return 'react-core';

          // Utils
          if (id.includes('node_modules/axios')) return 'axios';
          if (id.includes('node_modules/redux') ||
              id.includes('node_modules/@reduxjs')) return 'redux';
          if (id.includes('node_modules/react-icons')) return 'icons';

          // Everything else in node_modules → vendor chunk
          if (id.includes('node_modules')) return 'vendor';
        }
      }
    },
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      }
    }
  }
})