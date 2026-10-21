import { describe, expect, it } from 'vitest'
import { createSSRApp, h, type Component } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { PageLayout, PageLayoutContent, PageLayoutPane, PageLayoutSidebar } from './index'

describe('PageLayout without DOM globals', () => {
  it('renders resizable Pane and Sidebar with accessible default and custom width bounds', async () => {
    expect(typeof window).toBe('undefined')
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(PageLayout, null, () => [
            h(PageLayoutContent, null, () => 'Main'),
            h(PageLayoutPane as Component, { resizable: true }, () => 'Pane'),
            h(
              PageLayoutSidebar as Component,
              { resizable: true, width: { min: '200px', default: '320px', max: '600px' } },
              () => 'Sidebar',
            ),
          ]),
      }),
    )
    expect(html).toContain('aria-valuenow="296"')
    expect(html).toContain('aria-valuenow="320"')
    expect(html).toContain('aria-valuemin="200"')
    expect(html.match(/aria-valuemax="600"/g)).toHaveLength(2)
    expect(html).toContain('aria-valuetext="Pane width 320 pixels"')
    expect(html).not.toContain('NaN')
  })
})
