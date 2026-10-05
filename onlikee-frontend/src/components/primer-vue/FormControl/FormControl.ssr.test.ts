import { expect, test } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { FormControl } from './index'
import { TextInput } from '../TextInput'
test('SSR uses a stable generated id and wires label, caption and validation before mount', async () => {
  const app = () => createSSRApp({ render: () => h(FormControl, null, () => [
    h(FormControl.Label, null, () => 'Name'), h(TextInput),
    h(FormControl.Caption, null, () => 'Help'), h(FormControl.Validation, { variant: 'error' }, () => 'Invalid')
  ]) })
  const first = await renderToString(app())
  expect(await renderToString(app())).toBe(first)
  const id = first.match(/<input[^>]*\sid="([^"]+)"/)?.[1]
  expect(id).toBeDefined()
  expect(first).toContain(`for="${id}"`)
  expect(first).toContain(`aria-describedby="${id}-validationMessage ${id}-caption"`)
})
