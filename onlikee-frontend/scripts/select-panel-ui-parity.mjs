import { createRequire } from 'node:module'
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'

const args = process.argv.slice(2)
const value = (name) => args[args.indexOf(name) + 1]
if (!args.includes('--react-root')) throw new Error('Pass --react-root <local Primer React repository at 8c0b708>.')
const frontend = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const reference = path.resolve(value('--react-root'))
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: reference, encoding: 'utf8' }).trim()
if (!commit.startsWith('8c0b708')) throw new Error(`Expected reference commit 8c0b708, got ${commit}.`)
const referenceRequire = createRequire(path.join(reference, 'package.json'))
const frontendRequire = createRequire(path.join(frontend, 'package.json'))
const { chromium } = referenceRequire('playwright')
const { PNG } = referenceRequire('pngjs')
const { default: primer } = await import(
  pathToFileURL(path.join(reference, 'packages/postcss-preset-primer/src/index.js')).href
)
const compiler = frontendRequire('@vue/compiler-sfc')
compiler.registerTS(() => frontendRequire('typescript'))
const output = args.includes('--output')
  ? path.resolve(value('--output'))
  : await mkdtemp(path.join(tmpdir(), 'select-panel-ui-'))
await mkdir(output, { recursive: true })
const root = await mkdtemp(path.join(tmpdir(), 'select-panel-ui-server-'))
const fixture = (name) => '/@fs/' + path.join(frontend, 'scripts/select-panel-ui', name).replaceAll('\\', '/')
await writeFile(
  path.join(root, 'index.html'),
  `<!doctype html><html data-color-mode="light" data-light-theme="light" data-dark-theme="dark"><head><meta charset="utf-8"><style>body {margin:64px;font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--fgColor-default);background:var(--bgColor-default)} *,*::before,*::after {box-sizing:border-box}</style></head><body><div id="app"></div><script type="module">if(new URLSearchParams(location.search).get('framework')==='react')import('${fixture('react.tsx')}');else import('${fixture('vue.ts')}');</script></body></html>`,
)
const server = await createServer({
  configFile: false,
  root,
  cacheDir: path.join(root, 'cache'),
  plugins: [vue({ compiler })],
  define: { __DEV__: 'true' },
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: {
      '@reference': path.join(reference, 'packages/react/src'),
      '@implementation': path.join(frontend, 'src/components/primer-vue'),
      '@parity-theme': path.join(frontend, 'src/css/themes'),
      react: path.join(reference, 'node_modules/react'),
      'react-dom': path.join(reference, 'node_modules/react-dom'),
      vue: path.join(frontend, 'node_modules/vue'),
    },
  },
  optimizeDeps: { include: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom/client', 'vue'] },
  css: { postcss: { plugins: [primer()] } },
  server: { host: '127.0.0.1', port: 4187, fs: { allow: [root, frontend, reference] } },
})
await server.listen()
const url = server.resolvedUrls.local[0]
const browser = await chromium.launch({
  headless: true,
  channel: args.includes('--channel') ? value('--channel') : 'chrome',
})
const context = await browser.newContext({ reducedMotion: 'reduce' })
const cases = []
for (const scenario of [
  'single',
  'multi',
  'modal',
  'notice',
  'message',
  'loading',
  'skeleton',
  'group',
  'all',
  'advanced',
  'input-loading',
  'cancel',
  'secondary-loading',
]) {
  if (!args.includes('--scenario') || value('--scenario') === scenario)
    for (const theme of ['light', 'dark'])
      for (const width of [1024, 390]) {
        const state = args.includes('--state') ? value('--state') : undefined
        if (state !== 'tooltip' || width === 1024) cases.push({ scenario, theme, width, state })
      }
}
if (!args.includes('--scenario')) {
  for (const extra of [
    { height: 'medium', width: 'large' },
    { height: 'initial' },
    { height: 'medium', virtual: '' },
    { merged: '' },
    { cssanchor: '' },
  ])
    cases.push({ scenario: 'single', theme: 'light', width: 1024, extra })
  for (const state of ['hover', 'keyboard']) cases.push({ scenario: 'single', theme: 'light', width: 1024, state })
  for (const theme of ['light', 'dark']) cases.push({ scenario: 'modal', theme, width: 1024, state: 'tooltip' })
}
const report = {
  commit,
  browser: browser.version(),
  date: new Date().toISOString(),
  method:
    'All standard computed properties (excluding custom variables), DOM element hierarchy, rect tolerance 0.02px, exact RGBA pixels; animations frozen on the verification page.',
  normalization: [
    'Generated anchor identifiers from React/Vue useId.',
    'Retained coordinates of closed, display:none tooltips; open tooltip coordinates are compared.',
  ],
  cases: [],
}
function compare(a, b, location, differences) {
  if (!b || a.tag !== b.tag || a.children.length !== b.children.length) {
    differences.push({
      location,
      kind: 'tree',
      reference: a.tag + '/' + a.children.length,
      actual: b && b.tag + '/' + b.children.length,
    })
    return
  }
  for (const key of new Set([...Object.keys(a.css), ...Object.keys(b.css)])) {
    // Closed popovers retain coordinates from transient mount-time focus. They
    // have no rendered box; compare their actual positioning when opened.
    if (
      a.component === 'Tooltip' &&
      a.css.display === 'none' &&
      b.css.display === 'none' &&
      /^(inset-|top$|left$|right$|bottom$)/.test(key)
    )
      continue
    // Vue useId and React useId intentionally produce different identifiers.
    if (
      ['anchor-name', 'position-anchor'].includes(key) &&
      a.css[key]?.startsWith('--') &&
      b.css[key]?.startsWith('--')
    )
      continue
    if (a.css[key] !== b.css[key]) differences.push({ location, kind: key, reference: a.css[key], actual: b.css[key] })
  }
  for (const key of ['x', 'y', 'width', 'height'])
    if (Math.abs(a.rect[key] - b.rect[key]) > 0.02)
      differences.push({ location, kind: key, reference: a.rect[key], actual: b.rect[key] })
  a.children.forEach((child, i) =>
    compare(child, b.children[i], location + '/' + (child.component || child.tag) + i, differences),
  )
}
try {
  for (const [index, config] of cases.entries()) {
    const id = `${index + 1}-${config.scenario}-${config.theme}-${config.width}${config.state ? '-' + config.state : ''}`
    const records = {},
      screenshots = {}
    for (const framework of ['react', 'vue']) {
      const page = await context.newPage()
      page.setDefaultTimeout(60_000)
      await page.setViewportSize({ width: config.width, height: 768 })
      const errors = []
      page.on('pageerror', (error) => errors.push(error.message))
      await page.goto(
        url + '?' + new URLSearchParams({ framework, scenario: config.scenario, theme: config.theme, ...config.extra }),
        { waitUntil: 'domcontentloaded', timeout: 60_000 },
      )
      await page.waitForSelector('[data-component="SelectPanel"]')
      await page.waitForTimeout(250)
      if (errors.length && errors.every((error) => error.startsWith('Failed to fetch dynamically imported module:'))) {
        // Initial dependency optimization can replace modules and reload Vite.
        // Revisit once after optimization; actual runtime errors still fail.
        errors.length = 0
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 })
        await page.waitForSelector('[data-component="SelectPanel"]')
      }
      if (config.state === 'hover') await page.locator('[role="option"]').nth(1).hover()
      if (config.state === 'tooltip') {
        await page.locator('[data-component="SelectPanel.CloseButton"]').hover()
        await page.waitForTimeout(100)
      }
      if (config.state === 'keyboard') await page.locator('input').press('ArrowDown')
      // Compare the same resting frame without compositor-dependent text AA
      // caused by a still-composited paused spinner. Source animations are kept
      // in the components; only the verification page freezes them.
      await page.addStyleTag({
        content: ':root:root:root:root *, :root:root:root:root *::before, :root:root:root:root *::after {animation: none !important; transition: none !important}',
      })
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      records[framework] = await page.evaluate(() => {
        const capture = (e) => ({
          tag: e.tagName,
          component: e.getAttribute('data-component'),
          rect: Object.fromEntries(['x', 'y', 'width', 'height'].map((k) => [k, e.getBoundingClientRect()[k]])),
          css: Object.fromEntries(
            Array.from(getComputedStyle(e))
              .filter((k) => !k.startsWith('--'))
              .map((k) => [k, getComputedStyle(e).getPropertyValue(k)]),
          ),
          children: Array.from(e.children).map(capture),
        })
        return {
          anchor: capture(document.querySelector('#app button')),
          panel: capture(document.querySelector('[role="dialog"]')),
        }
      })
      screenshots[framework] = await page.screenshot({
        path: path.join(output, id + '-' + framework + '.png'),
        caret: 'hide',
      })
      if (errors.length) throw new Error(`${id}/${framework}: ${errors.join('; ')}`)
      await page.close()
    }
    report.standardPropertyCount = Object.keys(records.react.anchor.css).length
    const differences = []
    compare(records.react.anchor, records.vue.anchor, 'anchor', differences)
    compare(records.react.panel, records.vue.panel, 'overlay', differences)
    const a = PNG.sync.read(screenshots.react),
      b = PNG.sync.read(screenshots.vue)
    let pixels = 0
    for (let i = 0; i < a.data.length; i += 4) if ([0, 1, 2, 3].some((c) => a.data[i + c] !== b.data[i + c])) pixels++
    report.cases.push({ ...config, id, differences, pixels })
    if (differences.length || pixels)
      console.log(`${id}: ${differences.length} node/style differences, ${pixels} different pixels`)
    else console.log(`${id}: identical`)
    await writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  }
} finally {
  await browser.close()
  await server.close()
}
const failures = report.cases.filter((c) => c.differences.length || c.pixels)
console.log(
  `${report.cases.length - failures.length}/${report.cases.length} identical; report and screenshots: ${output}`,
)
process.exitCode = failures.length ? 1 : 0
