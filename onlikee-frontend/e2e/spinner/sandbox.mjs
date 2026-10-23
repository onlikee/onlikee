import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
await mkdir('.tmp', { recursive: true })
let browser
try {
  browser = await chromium.launch({ chromiumSandbox: true, args: ['--enable-automation'] })
  const session = await browser.newBrowserCDPSession()
  const { arguments: args } = await session.send('Browser.getBrowserCommandLine')
  if (
    args.some((arg) =>
      /^--(no-sandbox|disable-setuid-sandbox|disable-namespace-sandbox|disable-seccomp-filter-sandbox)(=|$)/.test(
        arg,
      ),
    )
  ) {
    throw new Error('Browser was launched with a sandbox-disabling argument')
  }
  const page = await browser.newPage()
  await page.goto('data:text/html,<h1>Sandboxed Chromium startup verified</h1>')
  if ((await page.locator('h1').innerText()) !== 'Sandboxed Chromium startup verified')
    throw new Error('Renderer startup failed')
  await mkdir('.tmp', { recursive: true })
  await writeFile(
    '.tmp/spinner-sandbox.json',
    JSON.stringify(
      { version: browser.version(), chromiumSandbox: true, args, rendererStarted: true },
      null,
      2,
    ),
  )
  console.log('Sandbox-enabled Chromium and renderer started:', browser.version())
} catch (error) {
  await writeFile('.tmp/spinner-sandbox-failure.txt', String(error))
  throw error
} finally {
  await browser?.close()
}
