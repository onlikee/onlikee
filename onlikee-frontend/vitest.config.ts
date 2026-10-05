import { defineConfig, mergeConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import viteConfig from './vite.config'

export default mergeConfig(viteConfig, defineConfig({
  resolve: { alias: { '@primer/live-region-element': fileURLToPath(new URL('./node_modules/@primer/live-region-element/dist/esm/index.js', import.meta.url)) } },
  // jsdom must register the browser custom element, rather than the Node SSR shim.
  ssr: { noExternal: ['@primer/live-region-element'], resolve: { conditions: ['browser'] } },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    globals: false,
    // jsdom 环境垫片（adoptedStyleSheets），node 环境下自动跳过
    setupFiles: ['./vitest.setup.ts'],
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true
  }
}))
