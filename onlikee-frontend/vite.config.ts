import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(), 
    tailwindcss(), 
  ],
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    allowedHosts: ['www.onlikee.com', 'onlikee.com'],
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    sourcemap: false,
    reportCompressedSize: false,
    minify: 'esbuild',
    target: 'es2018'
  },
})
