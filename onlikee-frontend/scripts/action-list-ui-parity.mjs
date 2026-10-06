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
if (!args.includes('--react-root')) throw new Error('Pass --react-root <local Primer React repository at 09e4c4c>.')
const frontend = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const reference = path.resolve(value('--react-root'))
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: reference, encoding: 'utf8' }).trim()
if (!commit.startsWith('09e4c4c')) throw new Error(`Expected reference commit 09e4c4c, got ${commit}.`)
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
  : await mkdtemp(path.join(tmpdir(), 'action-list-ui-'))
await mkdir(output, { recursive: true })
const root = await mkdtemp(path.join(tmpdir(), 'action-list-ui-server-'))
const fixture = (name) => '/@fs/' + path.join(frontend, 'scripts/action-list-ui', name).replaceAll('\\', '/')
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
      '@': path.join(frontend, 'src'),
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
  server: { host: '127.0.0.1', port: 4189, fs: { allow: [root, frontend, reference] } },
})
await server.listen()
const url = server.resolvedUrls.local[0]
const browser = await chromium.launch({
  headless: true,
  channel: args.includes('--channel') ? value('--channel') : 'chrome',
})
const context = await browser.newContext({ reducedMotion: args.includes('--motion') ? 'no-preference' : 'reduce' })
const cases = []
for (const scenario of ['basic', 'full', 'horizontal', 'dividers', 'block', 'truncate', 'single', 'radio', 'multiple', 'listbox', 'states', 'loading', 'inactive', 'trailing', 'heading', 'group', 'group-action', 'menu', 'heading-hidden', 'trailing-loading', 'gap', 'dynamic']) {
  if (!args.includes('--scenario') || value('--scenario') === scenario)
    for (const theme of ['light', 'dark'])
      for (const width of [1024, 390]) cases.push({ scenario, theme, width, state: args.includes('--state') ? value('--state') : undefined })
}
if (!args.includes('--scenario')) {
  for (const theme of ['light', 'dark'])
    for (const [scenario, state] of [['basic', 'hover'], ['basic', 'keyboard'], ['menu', 'keyboard'], ['truncate', 'tooltip'], ['group-action', 'tooltip'], ['states', 'hover'], ['states', 'pressed'], ['states', 'keyboard'], ['dividers', 'keyboard']])
      cases.push({ scenario, state, theme, width: 1024 })
}
if (!args.includes('--scenario')) {
  for (const theme of ['light', 'dark']) {
    for (const state of ['select-click', 'select-space', 'select-enter', 'select-prevented', 'active', 'loading', 'disabled', 'inactive', 'restored', 'description-short', 'link-click', 'link-focus'])
      cases.push({ scenario: 'dynamic', theme, width: 1024, state })
    for (const state of ['select-space', 'inactive', 'restored'])
      cases.push({ scenario: 'dynamic', theme, width: 390, state })
    for (const scenario of ['multiple', 'states'])
      cases.push({ scenario, theme, width: 1024, state: 'keyboard', forcedColors: 'active' })
    for (const scenario of ['basic', 'group-action'])
      cases.push({ scenario, theme, width: 390, direction: 'rtl' })
  }
}
const report = {
  commit,
  browser: browser.version(),
  date: new Date().toISOString(),
  method:
    'Click/keyboard event sequences and link refs for live updates; DOM attributes including ARIA and SVG, direct text and focus, element hierarchy, standard computed styles of elements and ::before/::after, rect tolerance 0.02px, exact RGBA pixels; animations frozen for capture. With --motion, also compare live animation keyframes/timing and settled checkbox clip-path/visibility before freezing.',
  normalization: [
    'Generated IDs are normalized by their target element path; authored IDs stay exact.',
    'CSS module class names, Vue data-v scope markers and raw style serialization are framework-specific. Computed styles and pseudo-elements are compared instead.',
    'Retained coordinates of closed, display:none tooltips; open tooltip coordinates are compared.',
    'Spinner clock phase is independent across pages: delays must be between -duration and 0; keyframes, duration and easing remain exact.',
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
  for (const field of ['attrs', 'before', 'after']) {
    for (const key of new Set([...Object.keys(a[field]), ...Object.keys(b[field])]))
      if (a[field][key] !== b[field][key]) differences.push({ location, kind: field + '.' + key, reference: a[field][key], actual: b[field][key] })
  }
  if (a.text !== b.text) differences.push({ location, kind: 'text', reference: a.text, actual: b.text })
  if (a.focused !== b.focused) differences.push({ location, kind: 'focused', reference: a.focused, actual: b.focused })
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
      screenshots = {},
      probes = {},
      motion = {}
    let expectedProbe
    for (const framework of ['react', 'vue']) {
      const page = await context.newPage()
      page.setDefaultTimeout(60_000)
      await page.setViewportSize({ width: config.width, height: 768 })
      if (config.forcedColors) await page.emulateMedia({ forcedColors: config.forcedColors })
      const errors = []
      page.on('pageerror', (error) => errors.push(error.message))
      await page.goto(
        url + '?' + new URLSearchParams({ framework, scenario: config.scenario, theme: config.theme, ...config.extra }),
        { waitUntil: 'domcontentloaded', timeout: 60_000 },
      )
      await page.waitForSelector('[data-component="ActionList"]')
      if (args.includes('--motion')) await page.addStyleTag({ path: path.join(frontend, 'src/css/themes/base-motion.css') })
      await page.waitForTimeout(250)
      if (errors.length && errors.every((error) => error.startsWith('Failed to fetch dynamically imported module:'))) {
        // Initial dependency optimization can replace modules and reload Vite.
        // Revisit once after optimization; actual runtime errors still fail.
        errors.length = 0
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 })
        await page.waitForSelector('[data-component="ActionList"]')
      }
      if (config.direction) await page.evaluate(direction => { document.documentElement.dir = direction }, config.direction)
      if (config.state === 'pressed') {
        await page.locator('[data-component="ActionList.Item"] button').first().hover()
        await page.mouse.down()
      }
      if (config.state === 'hover') await page.locator('[data-component="ActionList.Item"] button').first().hover()
      if (config.state === 'keyboard') {
        if (config.scenario === 'menu') {
          await page.locator('[role="menuitemradio"]').first().focus()
          await page.keyboard.press('ArrowDown')
        } else await page.keyboard.press('Tab')
      }
      if (config.state === 'tooltip') {
        await page.locator(config.scenario === 'group-action' ? '[data-component="ActionList.GroupHeading.TrailingAction"]' : '[data-component="ActionList.Item"] button').first().hover()
        await page.waitForSelector('[data-component="Tooltip"]:visible')
      }
      if (config.scenario === 'dynamic') {
        const update = async patch => {
          await page.evaluate(value => window.updateActionList(value), patch)
          await page.waitForTimeout(100)
        }
        expectedProbe = { events: [], linkElement: config.state === 'inactive' ? null : 'A' }
        if (config.state === 'select-prevented') await update({ prevent: true })
        if (['select-click', 'select-prevented'].includes(config.state)) {
          await page.locator('#first').click()
          expectedProbe.events = ['select:click:false', ...(config.state === 'select-prevented' ? [] : ['after:click:false'])]
        }
        if (['select-space', 'select-enter'].includes(config.state)) {
          await page.locator('#first').focus()
          await page.keyboard.press(config.state === 'select-space' ? 'Space' : 'Enter')
          expectedProbe.events = ['select:keypress:false', 'after:keypress:false']
        }
        if (config.state === 'active') await update({ active: true, selected: true })
        if (['loading', 'disabled', 'inactive'].includes(config.state)) {
          await update({ [config.state]: true, selected: true, ...(config.state === 'inactive' ? { loading: true } : {}) })
          await page.locator('#first').dispatchEvent('click')
        }
        if (config.state === 'restored') {
          await update({ inactive: true, loading: true })
          await update({ inactive: false, loading: false, active: true, selected: true })
          await page.evaluate(() => window.focusActionListLink())
        }
        if (config.state === 'description-short') await update({ description: 'Short' })
        if (config.state === 'link-click') {
          await page.locator('#link').click()
          expectedProbe.events = ['after:click:false', 'link:click:false']
        }
        if (config.state === 'link-focus') await page.evaluate(() => window.focusActionListLink())
        await page.waitForTimeout(100)
        probes[framework] = await page.evaluate(() => window.actionListProbe())
      }
      if (args.includes('--motion')) {
        await page.waitForTimeout(300)
        motion[framework] = await page.evaluate(() => {
          const app = document.querySelector('#app')
          const paths = new Map()
          function index(element, location) {
            paths.set(element, location)
            Array.from(element.children).forEach((child, i) => index(child, location + '/' + i))
          }
          index(app, 'app')
          return {
            animations: app.getAnimations({ subtree: true }).map(animation => {
              const effect = animation.effect
              const timing = effect.getTiming()
              const synchronized = effect.target.closest('[data-component="Spinner"]')
              if (synchronized && (timing.delay > 0 || timing.delay < -timing.duration)) throw new Error('Spinner synchronization delay outside one rotation')
              return {
                target: paths.get(effect.target),
                pseudoElement: effect.pseudoElement,
                timing: { ...timing, delay: synchronized ? 'synchronized-clock' : timing.delay },
                keyframes: effect.getKeyframes(),
              }
            }).sort((a, b) => a.target.localeCompare(b.target)),
            checkboxes: Array.from(app.querySelectorAll('[data-component="ActionList.Selection"] > div')).map(checkbox => ({
              clipPath: getComputedStyle(checkbox, '::before').clipPath,
              visibility: getComputedStyle(checkbox, '::before').visibility,
            })),
          }
        })
      }
      // Compare the same resting frame without compositor-dependent text AA
      // caused by a still-composited paused spinner. Source animations are kept
      // in the components; only the verification page freezes them.
      await page.addStyleTag({
        content: ':root:root:root:root *, :root:root:root:root *::before, :root:root:root:root *::after {animation: none !important; transition: none !important}',
      })
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      records[framework] = await page.evaluate(() => {
        const app = document.querySelector('#app')
        const generated = /^(?:v-\d+|_r_[\w-]+_|_R_[\w-]+_|:r[\w-]+:)/
        const idPaths = new Map()
        function index(e, location) {
          if (e.id && generated.test(e.id)) idPaths.set(e.id, '@' + location)
          Array.from(e.children).forEach((child, i) => index(child, location + '/' + i))
        }
        index(app, 'app')
        const normalize = (value) => {
          for (const [id, location] of [...idPaths].sort((a, b) => b[0].length - a[0].length)) value = value.replaceAll(id, location)
          return value
        }
        const css = (e, pseudo) => {
          const style = getComputedStyle(e, pseudo)
          return Object.fromEntries(Array.from(style).filter(k => !k.startsWith('--')).map(k => [k, normalize(style.getPropertyValue(k))]))
        }
        const capture = (e) => ({
          tag: e.tagName,
          component: e.getAttribute('data-component'),
          attrs: Object.fromEntries(Array.from(e.attributes).filter(a => !['class', 'style'].includes(a.name) && !a.name.startsWith('data-v-')).map(a => [a.name, normalize(a.value)])),
          text: Array.from(e.childNodes).filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.textContent).join('').trim(),
          focused: e === document.activeElement,
          rect: Object.fromEntries(['x', 'y', 'width', 'height'].map(k => [k, e.getBoundingClientRect()[k]])),
          css: css(e), before: css(e, '::before'), after: css(e, '::after'),
          children: Array.from(e.children).map(capture),
        })
        return capture(app)
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
    compare(records.react, records.vue, 'app', differences)
    if (args.includes('--motion') && JSON.stringify(motion.react) !== JSON.stringify(motion.vue))
      differences.push({ location: 'app', kind: 'motion', reference: motion.react, actual: motion.vue })
    if (expectedProbe) {
      for (const framework of ['react', 'vue'])
        if (JSON.stringify(probes[framework]) !== JSON.stringify(expectedProbe))
          differences.push({ location: framework, kind: 'events/ref', reference: expectedProbe, actual: probes[framework] })
    }
    const a = PNG.sync.read(screenshots.react),
      b = PNG.sync.read(screenshots.vue)
    let pixels = 0
    for (let i = 0; i < a.data.length; i += 4) if ([0, 1, 2, 3].some((c) => a.data[i + c] !== b.data[i + c])) pixels++
    report.cases.push({ ...config, id, differences, pixels, ...(expectedProbe ? { probes } : {}), ...(args.includes('--motion') ? { motion } : {}) })
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
