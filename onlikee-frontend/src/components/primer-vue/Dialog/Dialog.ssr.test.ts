import { createSSRApp, h, shallowRef } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { expect, it } from 'vitest'
import { Dialog, type DialogFocusTarget } from './index'
import { Button } from '../Button'

it('defers portaled content and component focus refs without browser globals during SSR', async () => {
  const target = shallowRef<DialogFocusTarget | null>(null)
  const html = await renderToString(
    createSSRApp({
      render: () =>
        h(
          Dialog,
          { onClose: () => {}, initialFocusRef: target, returnFocusRef: target },
          {
            default: () => h(Button, { ref: target }, () => 'Target'),
          },
        ),
    }),
  )
  expect(html).not.toContain('role="dialog"')
  expect(html).not.toContain('<button')
  expect(target.value).toBeNull()
})
