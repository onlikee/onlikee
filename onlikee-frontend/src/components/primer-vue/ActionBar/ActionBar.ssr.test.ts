import { expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { ActionBar } from './index'

it('renders all ActionBar children without browser globals or portal content', async () => {
  const Icon = () => h('svg')
  const html = await renderToString(
    createSSRApp(() =>
      h(
        ActionBar,
        { 'aria-label': 'SSR' },
        {
          default: () => [
            h(ActionBar.IconButton, {
              icon: Icon,
              'aria-label': 'Bold',
              unsafeDisableTooltip: true,
            }),
            h(ActionBar.Group, null, {
              default: () => [h(ActionBar.Button, null, { default: () => 'Code' })],
            }),
            h(ActionBar.Divider),
            h(ActionBar.Menu, {
              icon: Icon,
              'aria-label': 'Menu',
              unsafeDisableTooltip: true,
              items: [{ label: 'Copy' }],
            }),
          ],
        },
      ),
    ),
  )
  expect(html).toContain('role="toolbar"')
  expect(html).toContain('aria-label="SSR"')
  expect(html).toContain('Code')
  expect(html).not.toContain('ActionBar.MenuOverlay')
})
