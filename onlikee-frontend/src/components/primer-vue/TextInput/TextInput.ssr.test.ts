import { describe, expect, it } from 'vitest'
import { createSSRApp, h, type Component } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { TextInput } from './index'
import { Textarea } from '../Textarea'
import { Select } from '../Select'

describe('native input SSR without browser globals', () => {
  it('renders loading and counter markup without registering browser custom elements', async () => {
    expect(typeof document).toBe('undefined')
    const app = () => createSSRApp({ render: () => h(TextInput as Component, { id: 'search', defaultValue: 'a', leadingVisual: '$', loading: true, characterLimit: 3 }) })
    const first = await renderToString(app())
    expect(first).toBe(await renderToString(app()))
    expect(first).toContain('aria-busy="true"')
    expect(first).toContain('2 characters remaining')
    expect(first).toContain('TextInput.LeadingVisual')
  })
  it('renders textarea defaults and native selected options', async () => {
    const output = await renderToString(createSSRApp({ render: () => h('form', {}, [h(Textarea as Component, { defaultValue: 'description', autoSize: true }), h(Select as Component, { defaultValue: 'b' }, () => [h(Select.Option, { value: 'a' }, () => 'A'), h(Select.Option, { value: 'b' }, () => 'B')])]) }))
    expect(output).toContain('rows="7"')
    expect(output).toContain('data-auto-size="true"')
    expect(output).toContain('description</textarea>')
    expect(output).toMatch(/<option[^>]*value="b"[^>]*selected/)
  })
})
