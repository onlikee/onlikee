// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, nextTick, onMounted, shallowRef } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { PortalContext, registerPortalRoot } from './index'
import { Overlay } from '../Overlay'
import { Dialog } from '../Dialog'
import { AnchoredOverlay } from '../AnchoredOverlay'

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
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
})
afterEach(() => {
  document.body.innerHTML = ''
})

describe.each(['Overlay', 'Dialog', 'AnchoredOverlay'] as const)('Portal with %s', (name) => {
  function fixture(parentMounted = () => {}) {
    const element = shallowRef<{ element: HTMLElement | null } | null>(null)
    const content = () => h('button', { 'data-portal-content': '' }, 'Portaled content')
    const render = () => {
      if (name === 'Dialog') return h(Dialog, { ref: element, onClose: vi.fn() }, content)
      if (name === 'AnchoredOverlay') {
        return h(
          AnchoredOverlay,
          {
            ref: element,
            open: true,
            renderAnchor: null,
            anchorRef: shallowRef<HTMLElement | null>(null),
          },
          content,
        )
      }
      return h(
        Overlay,
        {
          ref: element,
          returnFocusRef: shallowRef<HTMLElement | null>(null),
          onEscape: vi.fn(),
          onClickOutside: vi.fn(),
        },
        content,
      )
    }
    const App = defineComponent({
      setup() {
        onMounted(parentMounted)
        return () =>
          h(
            PortalContext.Provider,
            {
              value: { portalContainerName: 'combination' },
            },
            { default: render },
          )
      },
    })
    return { App, element }
  }

  it('exposes the connected surface before the parent mounted hook', () => {
    const root = document.createElement('div')
    document.body.append(root)
    registerPortalRoot(root, 'combination')
    const parentMounted = vi.fn(() => {
      expect(element.value?.element?.isConnected).toBe(true)
      expect(root.contains(element.value?.element ?? null)).toBe(true)
    })
    const { App, element } = fixture(parentMounted)
    const wrapper = mount(App)
    expect(parentMounted).toHaveBeenCalledOnce()
    wrapper.unmount()
    expect(root.children).toHaveLength(0)
  })

  it('hydrates its named portal without warnings and removes the host on unmount', async () => {
    const root = document.createElement('div')
    document.body.append(root)
    registerPortalRoot(root, 'combination')
    const { App, element } = fixture()
    const container = document.createElement('div')
    container.innerHTML = await renderToString(createSSRApp(App))
    expect(container.innerHTML).not.toContain('Portaled content')
    expect(root.children).toHaveLength(0)
    document.body.append(container)
    const warn = vi.spyOn(console, 'warn')
    const error = vi.spyOn(console, 'error')
    const app = createSSRApp(App)
    app.mount(container)
    await nextTick()
    await flushPromises()
    expect(root.querySelector('[data-portal-content]')?.textContent).toBe('Portaled content')
    expect(element.value?.element?.isConnected).toBe(true)
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
    app.unmount()
    expect(root.children).toHaveLength(0)
  })
})
