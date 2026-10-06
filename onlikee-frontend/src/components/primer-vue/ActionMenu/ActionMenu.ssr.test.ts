import { expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { ActionMenu } from './index'
import { ActionList } from '../ActionList'

it('renders the anchor without browser globals or portal content, even when initially open', async () => {
  const html = await renderToString(createSSRApp(() => h(ActionMenu, { open: true }, { default: () => [
    h(ActionMenu.Button, null, { default: () => 'Open menu' }),
    h(ActionMenu.Overlay, null, { default: () => h(ActionList, null, { default: () => h(ActionList.Item, null, { default: () => 'Copy' }) }) })
  ] })))
  expect(html).toContain('Open menu')
  expect(html).toContain('aria-haspopup="true"')
  expect(html).toContain('aria-expanded="true"')
  expect(html).not.toContain('ActionMenu.Overlay')
})
