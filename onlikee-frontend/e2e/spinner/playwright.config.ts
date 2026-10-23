import { defineConfig } from '@playwright/test'
import { fileURLToPath } from 'node:url'
const frontendRoot = fileURLToPath(new URL('../..', import.meta.url))
export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.ts',
  outputDir: '../../.tmp/spinner-results',
  snapshotPathTemplate: '{testDir}/../../.tmp/spinner-base/{projectName}/{testFilePath}/{arg}{ext}',
  updateSnapshots: 'none',
  workers: 1,
  retries: 0,
  timeout: 60000,
  reporter: [['list'], ['html', { outputFolder: '../../.tmp/spinner-report', open: 'never' }]],
  use: {
    browserName: 'chromium',
    launchOptions: { chromiumSandbox: true },
    locale: 'en-US',
    timezoneId: 'UTC',
    deviceScaleFactor: 1,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1100, height: 900 } } },
    { name: 'narrow', use: { viewport: { width: 390, height: 844 } } },
  ],
  webServer: [
    {
      cwd: frontendRoot,
      command: 'npx vite --config e2e/spinner/vite.config.ts --port 5174 --strictPort',
      url: 'http://127.0.0.1:5174/e2e/spinner/',
      reuseExistingServer: false,
    },
    {
      cwd: frontendRoot,
      command: 'npx vite --config e2e/spinner/vite.config.ts --port 5175 --strictPort',
      env: { SPINNER_SOURCE_ROOT: process.env.SPINNER_BASE_ROOT ?? '../../base/onlikee-frontend' },
      url: 'http://127.0.0.1:5175/e2e/spinner/',
      reuseExistingServer: false,
    },
  ],
})
