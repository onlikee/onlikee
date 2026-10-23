import { describe, expect, it } from 'vitest'
import { createSSRApp, h, type Component } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { TextInput } from './index'
import { Textarea } from '../Textarea'
import { Select } from '../Select'
import { SubNav } from '../SubNav'
import { Text } from '../Text'

describe('native input SSR without browser globals', () => {
  it('renders navigation with polymorphic text and inputs without DOM globals', async () => {
    expect(typeof document).toBe('undefined')
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(SubNav, { label: 'Projects', actions: 0 }, () => [
            h(SubNav.Links, null, () =>
              h(SubNav.Link, { href: '#all', selected: true }, () =>
                h(Text, { as: 'strong', style: { padding: 12 } }, () => 'All'),
              ),
            ),
            h(Textarea, { autoSize: true, minHeight: 60 }),
          ]),
      }),
    )
    expect(html).toContain('aria-current="true"')
    expect(html).toContain('padding:12px')
    expect(html).toContain('data-auto-size="true"')
    expect(html).toContain('min-height:60px')
    expect(html.replace(/<!--[\s\S]*?-->/g, '')).toContain('0</nav>')
  })
  it('renders loading and counter markup without registering browser custom elements', async () => {
    expect(typeof document).toBe('undefined')
    const app = () =>
      createSSRApp({
        render: () =>
          h(TextInput as Component, {
            id: 'search',
            defaultValue: 'a',
            leadingVisual: '$',
            loading: true,
            characterLimit: 3,
          }),
      })
    const first = await renderToString(app())
    expect(first).toBe(await renderToString(app()))
    expect(first).toContain('aria-busy="true"')
    expect(first).toContain('2 characters remaining')
    expect(first).toContain('TextInput.LeadingVisual')
  })
  it('renders textarea defaults and native selected options', async () => {
    const output = await renderToString(
      createSSRApp({
        render: () =>
          h('form', {}, [
            h(Textarea as Component, { defaultValue: 'description', autoSize: true }),
            h(Select as Component, { defaultValue: 'b' }, () => [
              h(Select.Option, { value: 'a' }, () => 'A'),
              h(Select.Option, { value: 'b' }, () => 'B'),
            ]),
          ]),
      }),
    )
    expect(output).toContain('rows="7"')
    expect(output).toContain('data-auto-size="true"')
    expect(output).toContain('description</textarea>')
    expect(output).toMatch(/<option[^>]*value="b"[^>]*selected/)
  })
})
