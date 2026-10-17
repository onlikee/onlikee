import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import { Spinner } from './index'

describe('Spinner server rendering', () => {
  it('renders visible and delayed variants without browser globals', async () => {
    const visible = await renderToString(createSSRApp({ render: () => h(Spinner) }))
    expect(visible).toContain('data-component="Spinner"')
    expect(visible).toContain('Loading')
    const delayed = await renderToString(
      createSSRApp({ render: () => h(Spinner, { delay: 'short' }) }),
    )
    expect(delayed).not.toContain('<svg')
  })
})
