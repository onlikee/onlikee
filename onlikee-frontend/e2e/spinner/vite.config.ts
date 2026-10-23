import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
const source = path.resolve(process.env.SPINNER_SOURCE_ROOT ?? '.')
export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': path.join(source, 'src') }, dedupe: ['vue'] },
  css: { modules: { localsConvention: 'camelCase' } },
  server: { host: '127.0.0.1', fs: { allow: [process.cwd(), source] } },
})
