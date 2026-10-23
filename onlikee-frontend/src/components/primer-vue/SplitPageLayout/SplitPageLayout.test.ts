// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, Fragment, h, nextTick, type Component } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { SplitPageLayout, Header, Content, Pane, Sidebar, Footer } from './index'
import { PageLayout } from '../PageLayout'
import { Stack } from '../Stack'
import { StateLabel } from '../StateLabel'
import { NavList } from '../NavList'
import { asSlot } from '../composables/useSlots'

vi.mock('../PageLayout/PageLayout.module.css', () => ({
  default: new Proxy(
    {
      paneMaxWidthDiffDefault: '511',
      sidebarMaxWidthDiffDefault: '256',
      paneMaxWidthDiffWide: '959',
      paneMaxWidthDiffBreakpoint: '1280',
    },
    { get: (values, name) => (name in values ? values[name as keyof typeof values] : name) },
  ),
}))
const wrappers: VueWrapper[] = []
beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn()
      disconnect = vi.fn()
    },
  )
  localStorage.clear()
})
afterEach(() => wrappers.splice(0).forEach((wrapper) => wrapper.unmount()))

describe('SplitPageLayout', () => {
  it('hydrates the composed layout without replacing DOM or changing status labels', async () => {
    const render = () =>
      h(SplitPageLayout, null, () => [
        h(SplitPageLayout.Header, null, () => 'Header'),
        h(SplitPageLayout.Pane, null, () => 'Navigation'),
        h(SplitPageLayout.Content, null, () =>
          h(Stack, null, () =>
            h(Stack.Item, null, () => h(StateLabel, { status: 'pullMerged' }, () => 'Merged')),
          ),
        ),
        h(SplitPageLayout.Footer, null, () => 'Footer'),
      ])
    const container = document.createElement('div')
    container.innerHTML = await renderToString(createSSRApp({ render }))
    const original = container.querySelector('main')
    const warn = vi.spyOn(console, 'warn')
    const error = vi.spyOn(console, 'error')
    const app = createSSRApp({ render })
    app.mount(container)
    await nextTick()
    expect(container.querySelector('main')).toBe(original)
    expect(container.querySelector('svg')?.getAttribute('aria-label')).toBe('Pull request')
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
    app.unmount()
  })
  it('exports each region and shares its PageLayout slot marker', () => {
    for (const [name, component] of Object.entries({ Header, Content, Pane, Sidebar, Footer })) {
      expect(SplitPageLayout[name as keyof typeof SplitPageLayout]).toBe(component)
      expect(component.__SLOT__).toBe(PageLayout[name as 'Header'].__SLOT__)
    }
  })

  it('applies split defaults and places the header, sidebar and footer around the body', () => {
    const wrapper = mount(SplitPageLayout, {
      props: { className: 'custom' },
      slots: {
        default: () => [
          h(SplitPageLayout.Footer, null, () => 'Footer'),
          h(SplitPageLayout.Content, null, () => 'Content'),
          h(SplitPageLayout.Pane, { id: 'pane' }, () => 'Pane'),
          h(SplitPageLayout.Header, null, () => 'Header'),
          h(SplitPageLayout.Sidebar, { id: 'sidebar' }, () => 'Sidebar'),
        ],
      },
    })
    wrappers.push(wrapper)
    expect(wrapper.classes()).toContain('custom')
    expect(wrapper.attributes('data-component')).toBe('SplitPageLayout')
    expect(wrapper.attributes('style')).toContain('--spacing: var(--spacing-none)')
    expect(wrapper.element.firstElementChild?.querySelector('#sidebar')).not.toBeNull()
    expect(wrapper.get('[data-width="full"]').element.children[0]?.tagName).toBe('HEADER')
    expect(wrapper.get('[data-width="full"]').element.lastElementChild?.tagName).toBe('FOOTER')
    expect(
      wrapper
        .get('[data-component="SplitPageLayout.Content"] [data-width]')
        .attributes('data-width'),
    ).toBe('large')
    expect(
      wrapper.get('[data-component="SplitPageLayout.Content"] > div').attributes('style'),
    ).toContain('--spacing: var(--spacing-normal)')
    expect(wrapper.get('#pane').element.parentElement?.getAttribute('data-position')).toBe('start')
    expect(wrapper.get('#pane').element.parentElement?.getAttribute('data-sticky')).toBe('true')
    expect(
      wrapper
        .get(
          '[data-component="SplitPageLayout.Header"] [data-component="PageLayout.HorizontalDivider"]',
        )
        .attributes('data-variant'),
    ).toBe('line')
  })

  it.each([false, true])(
    'recognizes mixed region families with PageLayout root = %s',
    (pageRoot) => {
      const root = pageRoot ? PageLayout : SplitPageLayout
      const header = pageRoot ? SplitPageLayout.Header : PageLayout.Header
      const wrapper = mount(root, {
        slots: {
          default: () => [
            h(header, null, () => 'Header'),
            h(SplitPageLayout.Content, null, () => 'Content'),
          ],
        },
      })
      wrappers.push(wrapper)
      expect(wrapper.get('header').element.parentElement?.firstElementChild).toBe(
        wrapper.get('header').element,
      )
      expect(wrapper.get('main').text()).toBe('Content')
    },
  )

  it('recognizes marked wrappers but preserves an explicit Fragment boundary', () => {
    const WrappedHeader = asSlot(
      { render: () => h(SplitPageLayout.Header, null, () => 'Wrapped') },
      SplitPageLayout.Header,
    )
    const wrapper = mount(SplitPageLayout, {
      slots: {
        default: () => [
          h(WrappedHeader),
          h(Fragment, null, [h(SplitPageLayout.Footer, null, () => 'Nested footer')]),
        ],
      },
    })
    wrappers.push(wrapper)
    const header = wrapper.get('header').element
    expect(header.parentElement?.firstElementChild).toBe(header)
    expect(wrapper.get('footer').element.parentElement).not.toBe(header.parentElement)
  })

  it('allows explicit defaults and attribute overrides and composes navigation and status stacks', () => {
    const wrapper = mount(SplitPageLayout, {
      slots: {
        default: () => [
          h(
            SplitPageLayout.Header,
            { padding: undefined, divider: 'none', 'data-component': 'custom-header' },
            () => 'Header',
          ),
          h(
            SplitPageLayout.Pane,
            { sticky: false, position: 'end', padding: 'none', 'aria-label': 'Navigation' },
            () =>
              h(NavList, { 'aria-label': 'Settings' }, () =>
                h(NavList.Item as Component, { href: '#profile' }, () => 'Profile'),
              ),
          ),
          h(SplitPageLayout.Content, { as: 'section', width: 'medium' }, () =>
            h(Stack, { direction: 'horizontal' }, () =>
              h(StateLabel, { status: 'issueOpened' }, () => 'Open'),
            ),
          ),
        ],
      },
    })
    wrappers.push(wrapper)
    expect(wrapper.get('[data-component="custom-header"] > div').attributes('style')).toContain(
      '--spacing: var(--spacing-normal)',
    )
    const pane = wrapper.get('[data-component="SplitPageLayout.Pane"]')
    expect(pane.element.parentElement?.getAttribute('data-position')).toBe('end')
    expect(pane.element.parentElement?.hasAttribute('data-sticky')).toBe(false)
    expect(wrapper.get('a').attributes('href')).toBe('#profile')
    expect(wrapper.get('section [data-width]').attributes('data-width')).toBe('medium')
    expect(wrapper.get('[data-component="StateLabel"]').text()).toBe('Open')
  })

  it('passes controlled pane resize events and width updates through the wrapper', async () => {
    const onResizeEnd = vi.fn()
    const wrapper = mount(SplitPageLayout, {
      slots: {
        default: () => [
          h(
            SplitPageLayout.Pane,
            { resizable: true, currentWidth: 320, onResizeEnd, 'aria-label': 'Navigation' },
            () => 'Navigation',
          ),
          h(SplitPageLayout.Content, null, () => 'Content'),
        ],
      },
    })
    wrappers.push(wrapper)
    const handle = wrapper.get('[role="slider"]')
    await handle.trigger('keydown', { key: 'ArrowRight' })
    await handle.trigger('keyup', { key: 'ArrowRight' })
    expect(onResizeEnd).toHaveBeenCalledWith(323)
  })
})
