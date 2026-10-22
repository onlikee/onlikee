import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import { ScrollableRegion } from './index'

describe('ScrollableRegion SSR', () => {
  it('renders without browser globals or automatic region attributes', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(ScrollableRegion, { 'aria-label': 'Repositories', style: { maxHeight: 120 } }, () =>
            h('span', 'Contents'),
          ),
      }),
    )
    expect(html).toContain('data-component="ScrollableRegion"')
    expect(html).toContain('max-height:120px')
    expect(html).toContain('<span>Contents</span>')
    expect(html).not.toContain('role=')
    expect(html).not.toContain('tabindex=')
    expect(html).not.toContain('aria-label=')
  })
  it('preserves caller role and tabIndex while consuming the accessible name', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(ScrollableRegion, { 'aria-labelledby': 'title', role: 'log', tabIndex: -1 }),
      }),
    )
    expect(html).toContain('role="log"')
    expect(html).toContain('tabindex="-1"')
    expect(html).not.toContain('aria-labelledby=')
  })
})
