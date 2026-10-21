// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, nextTick, type App } from 'vue'
import { renderToString } from '@vue/server-renderer'
import PageComposition from './PageComposition.fixture.vue'

let wrapper: VueWrapper | undefined
let hydrated: App | undefined

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  )
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
    setTimeout(() => callback(performance.now()), 0),
  )
  vi.stubGlobal('cancelAnimationFrame', clearTimeout)
})

afterEach(() => {
  wrapper?.unmount()
  hydrated?.unmount()
  wrapper = undefined
  hydrated = undefined
  document.body.innerHTML = ''
})

describe('page component composition', () => {
  it('hydrates the layout, header, navigation and footer without losing region placement', async () => {
    const html = await renderToString(createSSRApp(PageComposition))
    const host = document.createElement('div')
    host.innerHTML = html
    document.body.append(host)
    const heading = host.querySelector('h1')
    const warn = vi.spyOn(console, 'warn')
    const error = vi.spyOn(console, 'error')
    hydrated = createSSRApp(PageComposition)
    hydrated.mount(host)
    await nextTick()
    await flushPromises()

    expect(host.querySelector('h1')).toBe(heading)
    expect(host.querySelector('header h1')?.textContent).toBe('Repository')
    expect(host.querySelector('[data-component="PageHeader"]')?.getAttribute('data-has-nav')).toBe(
      '',
    )
    expect(host.querySelector('[data-component="PH_Breadcrumbs"] nav')).not.toBeNull()
    expect(host.querySelector('#composition-pane [aria-current="page"]')).not.toBeNull()
    expect(host.querySelector('footer [data-component="Pagination"]')).not.toBeNull()
    expect(warn.mock.calls.flat().join(' ')).not.toMatch(/hydration|mismatch/i)
    expect(error.mock.calls.flat().join(' ')).not.toMatch(/hydration|mismatch/i)
  })

  it('updates a controlled footer pagination while preserving the header and pane', async () => {
    wrapper = mount(PageComposition, { attachTo: document.body })
    const heading = wrapper.get('h1').element
    const pane = wrapper.get('#composition-pane').element
    await wrapper.get('[data-component="Pagination.NextPage"]').trigger('click')
    expect(wrapper.get('[data-current-page]').text()).toBe('Page 2')
    expect(wrapper.get('[data-component="Pagination"] [aria-current="page"]').text()).toBe('2')
    expect(wrapper.get('h1').element).toBe(heading)
    expect(wrapper.get('#composition-pane').element).toBe(pane)
    expect(wrapper.get('#composition-menu').attributes('aria-haspopup')).toBe('true')
  })
})
