import { createSSRApp, h, type Component } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import { Details, Summary, useDetails } from './index'
import { Button } from '../Button'

describe('Details SSR', () => {
  it.each([true, false, undefined])(
    'renders defaultOpen=%s without browser globals',
    async (defaultOpen) => {
      const html = await renderToString(
        createSSRApp({
          setup() {
            const { getDetailsProps } = useDetails({ defaultOpen, closeOnOutsideClick: true })
            return () =>
              h(Details, getDetailsProps(), {
                default: () => [
                  h(Summary as Component, { as: Button }, () => 'See details'),
                  h('p', 'Content'),
                ],
              })
          },
        }),
      )
      expect(html).toContain('<details')
      expect(html).toContain('data-component="Details"')
      expect(html).toContain('<summary')
      expect(html).toContain('data-component="Details.Summary"')
      expect(html).not.toContain('<button')
      expect(/<details\b[^>]*\sopen(?:[\s=>])/.test(html)).toBe(defaultOpen === true)
      expect(html).toContain('Content')
    },
  )
})
