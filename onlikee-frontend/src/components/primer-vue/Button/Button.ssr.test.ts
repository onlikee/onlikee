import { describe, expect, it, vi } from 'vitest'
import { createSSRApp, h, type Component } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { Button, ButtonBase, IconButton, LinkButton } from './index'

const render = (component: Component, props: Record<string, unknown> = {}) =>
  renderToString(createSSRApp({ render: () => h(component, props, { default: () => 'Save' }) }))

describe('Button server rendering', () => {
  it('renders the public elements and default button types without browser globals', async () => {
    expect(await render(Button)).toContain('type="button"')
    expect(await render(ButtonBase)).not.toContain('type="button"')
    const anchor = await render(LinkButton, { href: '#save' })
    expect(anchor).toContain('<a')
    expect(anchor).toContain('data-component="LinkButton"')
    expect(anchor).not.toContain('type="button"')
    const icon = await render(IconButton, {
      icon: 'svg',
      'aria-label': 'Close',
      unsafeDisableTooltip: true,
    })
    expect(icon).toContain('data-component="IconButton"')
    expect(icon).toContain('aria-label="Close"')
  })

  it('keeps loading ids, announcement and consumer descriptions in SSR', async () => {
    const html = await render(Button, {
      id: 'save',
      loading: true,
      loadingAnnouncement: 'Saving',
      'aria-describedby': 'help',
    })
    expect(html).toContain('data-loading-wrapper="true"')
    expect(html).toContain('aria-labelledby="save-label"')
    expect(html).toContain('aria-describedby="save-loading-announcement help"')
    expect(html).toMatch(/id="save-loading-announcement"[^>]*>(?:<!--.*?-->)*Saving/)
    expect(html).not.toContain(' disabled')
  })

  it('renders loading without a performance global', async () => {
    vi.stubGlobal('performance', undefined)
    try {
      expect(await render(Button, { loading: true })).toContain('data-component="Spinner"')
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('omits the wrapper only when loading is unspecified and renders zero counts', async () => {
    expect(await render(Button)).not.toContain('data-loading-wrapper')
    expect(await render(Button, { loading: false })).toContain('data-loading-wrapper')
    const html = await render(Button, { count: 0 })
    expect(html).toContain('data-component="ButtonCounter"')
    expect(html).toContain('data-has-count="true"')
    expect(html).toMatch(/\(.*0.*\)/)
  })

  it('renders numeric and string default slots as Vue text labels', async () => {
    const numeric = await renderToString(
      createSSRApp({ render: () => h(Button, null, { default: () => 0 }) }),
    )
    const text = await renderToString(
      createSSRApp({ render: () => h(Button, null, { default: () => '0' }) }),
    )
    expect(numeric).toContain('data-component="text"')
    expect(numeric).toMatch(/data-component="text"[^>]*>0<\/span>/)
    expect(text).toContain('data-component="text"')
  })
})
