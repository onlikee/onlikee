import { createRequire } from 'node:module'
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { execFileSync } from 'node:child_process'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'

const args = process.argv.slice(2)
const value = name => args[args.indexOf(name) + 1]
if (!args.includes('--react-root')) throw new Error('Pass --react-root <local Primer React repository>.')
const frontend = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const reference = path.resolve(value('--react-root'))
const referenceRequire = createRequire(path.join(reference, 'package.json'))
const frontendRequire = createRequire(path.join(frontend, 'package.json'))
const { chromium } = referenceRequire('playwright')
const { default: primer } = await import(pathToFileURL(path.join(reference, 'packages/postcss-preset-primer/src/index.js')).href)
const compiler = frontendRequire('@vue/compiler-sfc')
compiler.registerTS(() => frontendRequire('typescript'))
const output = args.includes('--output') ? path.resolve(value('--output')) : await mkdtemp(path.join(tmpdir(), 'action-menu-parity-'))
await mkdir(output, { recursive: true })
const root = await mkdtemp(path.join(tmpdir(), 'action-menu-server-'))
const fixture = name => '/@fs/' + path.join(frontend, 'scripts/action-menu-ui', name).replaceAll('\\', '/')
const html = `<!doctype html><html data-color-mode="light" data-light-theme="light" data-dark-theme="dark"><head><meta charset="utf-8"><style>body{margin:64px;font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--fgColor-default);background:var(--bgColor-default)}*,*::before,*::after{box-sizing:border-box}</style></head><body><div id="app"></div><script type="module">import('${fixture('ENTRY')}');</script></body></html>`
await writeFile(path.join(root, 'index.html'), html.replace(fixture('ENTRY'), fixture('react.tsx')))
await writeFile(path.join(root, 'vue.html'), html.replace(fixture('ENTRY'), fixture('vue.ts')))
const server = await createServer({
  configFile: false, root, cacheDir: path.join(root, 'cache'), plugins: [vue({ compiler })],
  define: { __DEV__: 'true' }, esbuild: { jsx: 'automatic' },
  resolve: { alias: { '@': path.join(frontend, 'src'), '@reference': path.join(reference, 'packages/react/src'), '@implementation': path.join(frontend, 'src/components/primer-vue'), '@parity-theme': path.join(frontend, 'src/css/themes'), react: path.join(reference, 'node_modules/react'), 'react-dom': path.join(reference, 'node_modules/react-dom'), vue: path.join(frontend, 'node_modules/vue') } },
  optimizeDeps: { include: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom/client', 'vue'] },
  css: { postcss: { plugins: [primer()] } }, server: { hmr: false, watch: null, host: '127.0.0.1', port: 4190, fs: { allow: [root, frontend, reference] } }
})
await server.listen()
const browser = await chromium.launch({ headless: true, channel: 'chrome' })
const url = server.resolvedUrls.local[0]
const report = { commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: reference, encoding: 'utf8' }).trim(), cases: [], differences: [], output }
async function snapshot(page) {
  await page.evaluate(() => document.getAnimations().forEach(animation => {
    if (animation.effect.getComputedTiming().endTime === Infinity) { animation.pause(); animation.currentTime = 0 }
    else animation.finish()
  }))
  return page.evaluate(() => {
    const text = element => element?.textContent?.replace(/\s+/g, ' ').trim() || ''
    const label = element => element?.getAttribute('aria-labelledby')?.split(' ').map(id => text(document.getElementById(id))).join(' ') || element?.getAttribute('aria-label') || ''
    const element = node => {
      const rect = node.getBoundingClientRect(), style = getComputedStyle(node)
      return { tag: node.tagName, role: node.getAttribute('role'), text: text(node), label: label(node), disabled: node.getAttribute('aria-disabled'), checked: node.getAttribute('aria-checked'), expanded: node.getAttribute('aria-expanded'), described: node.getAttribute('aria-describedby')?.split(' ').map(id => text(document.getElementById(id))).filter(Boolean).join(' ') || '', rect: ['x', 'y', 'width', 'height'].map(key => Math.round(rect[key] * 100) / 100), style: ['color', 'backgroundColor', 'fontSize', 'fontWeight', 'lineHeight', 'borderRadius', 'boxShadow', 'padding', 'overflow'].map(key => style[key]) }
    }
    return { focus: document.activeElement?.id && !/^(v-|_r_|:r)/.test(document.activeElement.id) ? document.activeElement.id : text(document.activeElement).slice(0, 80), result: text(document.getElementById('result')), anchor: element(document.getElementById('trigger') || document.getElementById('detached')), surfaces: [...document.querySelectorAll('[data-component="ActionMenu.Overlay"]')].map(element), menus: [...document.querySelectorAll('[role="menu"]')].map(node => ({ label: label(node), items: [...node.querySelectorAll('[role^="menuitem"]')].map(element) })) }
  })
}
function compare(expected, actual, prefix) {
  if (typeof expected === 'number' && typeof actual === 'number') return Math.abs(expected - actual) <= 0.02 ? [] : [`${prefix}: ${expected} != ${actual}`]
  if (Array.isArray(expected) || expected && typeof expected === 'object') {
    if (!actual || typeof actual !== 'object') return [`${prefix}: missing`]
    return [...new Set([...Object.keys(expected), ...Object.keys(actual)])].flatMap(key => compare(expected[key], actual[key], `${prefix}.${key}`))
  }
  return expected === actual ? [] : [`${prefix}: ${JSON.stringify(expected)} != ${JSON.stringify(actual)}`]
}
try {
  const scenarios = args.includes('--scenario') ? [value('--scenario')] : ['basic', 'controlled', 'fullscreen', 'nested', 'loading', 'inactive', 'single', 'multiple', 'dividers', 'context', 'custom', 'tooltip', 'sizes', 'scroll', 'label', 'surface', 'external', 'css-anchor', 'css-edge', 'release']
  for (const scenario of scenarios) for (const theme of args.includes('--theme') ? [value('--theme')] : ['light', 'dark']) for (const width of args.includes('--width') ? [Number(value('--width'))] : [390, 768, 1024, 1400]) {
    const traces = []
    for (const framework of ['react', 'vue']) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
      const errors = []
      page.on('pageerror', error => errors.push(String(error)))
      await page.goto(`${url}${framework === 'vue' ? 'vue.html' : ''}?scenario=${scenario}&theme=${theme}`)
      await page.locator(scenario === 'external' ? 'button#detached' : 'button#trigger').waitFor()
      const trigger = page.locator(scenario === 'external' ? 'button#detached' : 'button#trigger')
      if (scenario === 'context') await trigger.click({ button: 'right' })
      else await trigger.click()
      await page.getByRole('menu').first().waitFor()
      await page.waitForTimeout(60)
      const trace = { errors, steps: [await snapshot(page)] }
      const step = async operation => { await operation(); await page.waitForTimeout(60); trace.steps.push(await snapshot(page)) }
      if (scenario === 'nested') {
        await step(() => page.locator('#submenu').press('ArrowRight'))
        await step(() => page.locator('#deep').press('ArrowRight'))
        await step(() => page.keyboard.press('Escape'))
        await step(() => page.keyboard.press('ArrowLeft'))
        await step(() => page.locator('#submenu').click())
        await step(() => page.locator('#markdown').click())
      } else if (scenario === 'external') {
        await step(() => page.locator('#replace').click())
        await step(() => page.keyboard.press('Escape'))
      } else if (scenario === 'release') {
        await step(() => page.evaluate(() => document.getElementById('release').click()))
        await step(() => page.keyboard.press('Escape'))
      } else {
        await step(() => trigger.press('ArrowUp'))
        await step(() => page.keyboard.press('Home'))
        await step(() => page.keyboard.press('z'))
        await step(() => page.keyboard.press('Enter'))
        await step(() => page.keyboard.press('Tab'))
        await step(() => page.keyboard.press('Escape'))
      }
      traces.push(trace)
      if (args.includes('--screenshots')) await page.screenshot({ path: path.join(output, `${scenario}-${theme}-${width}-${framework}.png`) })
      await page.close()
    }
    const name = `${scenario}/${theme}/${width}`
    const differences = compare(traces[0], traces[1], name)
    report.cases.push({ name, differences: differences.length, react: traces[0], vue: traces[1] })
    report.differences.push(...differences)
    process.stdout.write(`${name}: ${differences.length}\n`)
  }
} finally {
  await writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close(); await server.close()
}
console.log(JSON.stringify({ cases: report.cases.length, differences: report.differences.length, report: path.join(output, 'report.json'), firstDifferences: report.differences.slice(0, 20) }, null, 2))
if (report.differences.length) process.exitCode = 1
