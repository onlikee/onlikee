import { createRequire } from 'node:module'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'
import { preprocessCSS, resolveConfig } from 'vite'
import postcss from 'postcss'

const { JSDOM } = createRequire(import.meta.url)('jsdom') as {
  JSDOM: new (html: string) => { window: { document: Document; close: () => void } }
}

it('applies compiled disabled rules to loading buttons and their visuals for every variant', async () => {
  const filename = fileURLToPath(new URL('./ButtonBase.module.css', import.meta.url))
  const config = await resolveConfig({ configFile: false }, 'build')
  const result = await preprocessCSS(await readFile(filename, 'utf8'), filename, config)
  const css = postcss.parse(result.code)
  const dom = new JSDOM(
    '<button aria-disabled="true" data-loading="true"><span></span><kbd data-kbd-chord></kbd></button>',
  )
  try {
    const button = dom.window.document.querySelector('button')!
    const visual = button.querySelector('span')!
    const kbd = button.querySelector('kbd')!
    button.className = result.modules!.ButtonBase!
    visual.className = result.modules!.Visual!
    function disabledRules(node: Element) {
      const declarations: Record<string, string> = {}
      css.walkRules((rule) => {
        for (const selector of rule.selectors) {
          if (selector.includes('data-loading-disabled-styles') && node.matches(selector)) {
            rule.walkDecls((declaration) => {
              declarations[declaration.prop] = declaration.value
            })
          }
        }
      })
      return declarations
    }
    for (const variant of ['default', 'primary', 'danger', 'invisible', 'link']) {
      button.dataset.variant = variant
      expect(disabledRules(button)).toEqual({})
      button.dataset.loadingDisabledStyles = 'true'
      expect(disabledRules(button).cursor).toBe('not-allowed')
      expect(disabledRules(button).color).toContain('disabled')
      expect(disabledRules(button)['background-color']).toBe(
        variant === 'link' ? 'transparent' : `var(--button-${variant}-bgColor-disabled)`,
      )
      expect(disabledRules(visual).color).toBe('inherit')
      if (variant !== 'link') expect(disabledRules(kbd).background).toContain('disabled')
      button.removeAttribute('data-loading-disabled-styles')
      expect(disabledRules(button)).toEqual({})
      // Existing aria-disabled styling remains active outside loading.
      button.dataset.loading = 'false'
      expect(disabledRules(button).color).toContain('disabled')
      button.dataset.loading = 'true'
    }
  } finally {
    dom.window.close()
  }
})
