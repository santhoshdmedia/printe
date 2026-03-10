import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // ── Antd & its internal deps ──────────────────────────
          if (id.includes('node_modules/antd'))          return 'antd';
          if (id.includes('node_modules/@ant-design'))   return 'antd-icons';
          if (id.includes('node_modules/rc-'))           return 'antd-rc';

          // ── React core ────────────────────────────────────────
          if (id.includes('node_modules/react-dom'))     return 'react-dom';
          if (id.includes('node_modules/react-router'))  return 'react-router';
          if (id.includes('node_modules/react/'))        return 'react-core';

          // ── MUI (heavy - split out) ───────────────────────────
          if (id.includes('node_modules/@mui/material')) return 'mui';
          if (id.includes('node_modules/@mui/icons'))    return 'mui-icons';
          if (id.includes('node_modules/@emotion'))      return 'emotion';

          // ── Redux ─────────────────────────────────────────────
          if (id.includes('node_modules/redux') ||
              id.includes('node_modules/@reduxjs') ||
              id.includes('node_modules/react-redux') ||
              id.includes('node_modules/redux-saga'))    return 'redux';

          // ── Utils ─────────────────────────────────────────────
          if (id.includes('node_modules/axios'))         return 'axios';
          if (id.includes('node_modules/lodash'))        return 'lodash';
          if (id.includes('node_modules/moment'))        return 'moment';
          if (id.includes('node_modules/swiper'))        return 'swiper';
          if (id.includes('node_modules/react-icons'))   return 'icons';
          if (id.includes('node_modules/lucide-react'))  return 'icons';
          if (id.includes('node_modules/motion') ||
              id.includes('node_modules/framer-motion')) return 'motion';

          // ── PDF / Canvas (only needed on specific pages) ──────
          if (id.includes('node_modules/jspdf') ||
              id.includes('node_modules/html2canvas'))   return 'pdf-tools';

          // ── Misc small libs ───────────────────────────────────
          if (id.includes('node_modules/sweetalert2'))   return 'swal';
          if (id.includes('node_modules/aos'))           return 'aos';

          // ── Everything else in node_modules ───────────────────
          if (id.includes('node_modules'))               return 'vendor';
        }
      }
    },
    assetsInlineLimit: 4096,   // inline assets < 4 KB as base64
    cssCodeSplit: true,         // per-chunk CSS
    sourcemap: false,           // no sourcemaps in prod
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,     // remove console.log in prod
        drop_debugger: true,
        pure_funcs: ['console.info', 'console.debug', 'console.warn'],
      }
    }
  }
})