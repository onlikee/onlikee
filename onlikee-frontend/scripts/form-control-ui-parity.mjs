import { createRequire } from 'node:module'
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'

// FormControl strict UI parity harness — mirrors scripts/select-panel-ui-parity.mjs.
// Renders each scenario with the React source implementation and the Vue port in the
// same Chrome build, then compares the DOM element tree, every standard computed
// property (custom properties excluded), element rects (0.02px tolerance) and the
// full-page screenshot pixel-for-pixel (zero tolerance).
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
  pathToFileURL(path.join(reference, 'packages/postcss-preset-primer/src/index.js')).href,
)
const compiler = frontendRequire('@vue/compiler-sfc')
compiler.registerTS(() => frontendRequire('typescript'))
const output = args.includes('--output')
  ? path.resolve(value('--output'))
  : await mkdtemp(path.join(tmpdir(), 'form-control-ui-'))
await mkdir(output, { recursive: true })
const root = await mkdtemp(path.join(tmpdir(), 'form-control-ui-server-'))
const fixture = (name) => '/@fs/' + path.join(frontend, 'scripts/form-control-ui', name).replaceAll('\\', '/')
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
  server: { host: '127.0.0.1', port: 4188, fs: { allow: [root, frontend, reference] } },
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
  'error',
  'success',
  'required',
  'plain',
  'disabled',
  'checkbox',
  'hidden-label',
  'textarea',
  'tokens',
]) {
  if (!args.includes('--scenario') || value('--scenario') === scenario)
    for (const theme of ['light', 'dark']) cases.push({ scenario, theme })
}
const report = {
  commit,
  browser: browser.version(),
  date: new Date().toISOString(),
  method:
    'All standard computed properties (excluding custom variables), DOM element hierarchy, rect tolerance 0.02px, exact RGBA pixels; viewport 1024x768; animations frozen on the verification page.',
  normalization: ['Vue useId and React useId intentionally produce different identifiers (attributes are not compared).'],
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
    const id = `${index + 1}-${config.scenario}-${config.theme}`
    const records = {},
      screenshots = {}
    for (const framework of ['react', 'vue']) {
      const page = await context.newPage()
      page.setDefaultTimeout(60_000)
      await page.setViewportSize({ width: 1024, height: 768 })
      const errors = []
      page.on('pageerror', (error) => errors.push(error.message))
      await page.goto(url + '?' + new URLSearchParams({ framework, ...config }), {
        waitUntil: 'domcontentloaded',
        timeout: 60_000,
      })
      await page.waitForSelector('[data-component="FormControl"]')
      await page.waitForTimeout(250)
      if (errors.length && errors.every((error) => error.startsWith('Failed to fetch dynamically imported module:'))) {
        // Initial dependency optimization can replace modules and reload Vite.
        // Revisit once after optimization; actual runtime errors still fail.
        errors.length = 0
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 })
        await page.waitForSelector('[data-component="FormControl"]')
      }
      // Compare the same resting frame; only the verification page freezes animations.
      await page.addStyleTag({
        content:
          ':root:root:root:root *, :root:root:root:root *::before, :root:root:root:root *::after {animation: none !important; transition: none !important}',
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
        return capture(document.querySelector('[data-component="FormControl"]'))
      })
      screenshots[framework] = await page.screenshot({
        path: path.join(output, id + '-' + framework + '.png'),
        caret: 'hide',
      })
      if (errors.length) throw new Error(`${id}/${framework}: ${errors.join('; ')}`)
      await page.close()
    }
    report.standardPropertyCount = Object.keys(records.react.css).length
    const differences = []
    compare(records.react, records.vue, 'form-control', differences)
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
