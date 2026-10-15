import { createRequire } from 'node:module'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { preprocessCSS, resolveConfig } from 'vite'
import postcss from 'postcss'

const { JSDOM } = createRequire(import.meta.url)('jsdom') as {
  JSDOM: new (html: string) => { window: { document: Document; close: () => void } }
}

describe('Tooltip compiled popover fallback', () => {
  it('matches the polyfill class for visibility and animation after CSS Modules compilation', async () => {
    const filename = fileURLToPath(new URL('./Tooltip.module.css', import.meta.url))
    const config = await resolveConfig(
      { configFile: false, css: { modules: { localsConvention: 'camelCase' } } },
      'build',
    )
    const result = await preprocessCSS(await readFile(filename, 'utf8'), filename, config)
    const dom = new JSDOM('<span popover="auto"></span>')
    try {
      const element = dom.window.document.querySelector('span')!
      element.classList.add(result.modules!['primer-tooltip']!, ':popover-open')
      const matches: Record<string, string> = {}
      postcss.parse(result.code).walkRules((rule) => {
        for (const selector of rule.selectors) {
          if (!selector.includes('\\') || selector.includes('::before')) continue
          if (element.matches(selector))
            rule.walkDecls((declaration) => {
              matches[declaration.prop] = declaration.value
            })
        }
      })
      expect(matches.display).toBe('block')
      expect(matches['animation-duration']).toBe('0.1s')
      expect(matches['animation-name']).toBeTruthy()
      element.classList.remove(':popover-open')
      postcss.parse(result.code).walkRules((rule) => {
        for (const selector of rule.selectors) {
          if (selector.includes('\\') && !selector.includes('::before'))
            expect(element.matches(selector)).toBe(false)
        }
      })
    } finally {
      dom.window.close()
    }
  })
})
