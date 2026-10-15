import { expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { Tooltip } from './index'
import { IconButton } from '../Button'

it('renders label relationships and suppresses nested tooltips without browser globals', async () => {
  const html = await renderToString(
    createSSRApp({
      render: () =>
        h(
          Tooltip,
          { id: 'close-tip', text: 'Close', type: 'label' },
          {
            default: () => h(IconButton, { icon: 'svg', 'aria-labelledby': 'close-tip' }),
          },
        ),
    }),
  )
  expect(html).toContain('aria-labelledby="close-tip"')
  expect(html).toContain('id="close-tip"')
  expect(html.match(/data-component="Tooltip"/g)).toHaveLength(1)
  expect(html).not.toContain('role="tooltip"')
})
