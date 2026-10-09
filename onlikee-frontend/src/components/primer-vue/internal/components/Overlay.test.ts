// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Independent overlay test fixtures. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, nextTick, shallowRef } from 'vue'
import { renderToString } from '@vue/server-renderer'
import Overlay from './Overlay.vue'
import { FeatureFlags } from '../../FeatureFlags'
import { useAnchoredPosition } from '../../composables/useAnchoredPosition'

const wrappers: VueWrapper[] = []
async function settle() {
  await nextTick()
  await flushPromises()
  await nextTick()
}
afterEach(() => {
  wrappers.forEach((wrapper) => wrapper.unmount())
  wrappers.length = 0
  document.body.innerHTML = ''
  vi.restoreAllMocks()
  vi.useRealTimers()
})
describe('shared Vue overlay behavior', () => {
  it('retains initial content height until reopened and mounts a positioned portal host', async () => {
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(207)
    const wrapper = mount(Overlay, {
      props: { open: true, height: 'initial' },
      slots: { default: '<button>Option</button>' },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    await settle()
    const overlay = document.querySelector<HTMLElement>('.primer-overlay')!
    expect(overlay.style.height).toBe('207px')
    expect(overlay.parentElement?.dataset.component).toBe('Portal')
    expect(overlay.parentElement?.style.position).toBe('relative')
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(320)
    await wrapper.setProps({ width: 'large' })
    await settle()
    expect(overlay.style.height).toBe('207px')
    await wrapper.setProps({ open: false })
    await wrapper.setProps({ open: true })
    await settle()
    expect(document.querySelector<HTMLElement>('.primer-overlay')?.style.height).toBe('320px')
  })
  it('retains autocomplete input focus, ignores anchor clicks and returns focus on close', async () => {
    const anchor = document.createElement('input')
    document.body.append(anchor)
    anchor.focus()
    const wrapper = mount(Overlay, {
      props: {
        anchor,
        open: true,
        preventFocusOnOpen: true,
        returnFocusRef: anchor,
        ignoreClickRefs: [shallowRef(anchor)],
      },
      attrs: { 'data-component': 'Autocomplete.Overlay' },
      slots: { default: '<button>Option</button>' },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    await settle()
    expect(document.activeElement).toBe(anchor)
    expect(document.querySelector('[data-component="Autocomplete.Overlay"]')).not.toBeNull()
    anchor.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    expect(wrapper.emitted('close')).toBeUndefined()
    document.querySelector<HTMLButtonElement>('button')!.focus()
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    expect(wrapper.emitted('close')?.[0]?.[1]).toBe('click-outside')
    await wrapper.setProps({ open: false })
    await settle()
    expect(document.activeElement).toBe(anchor)
  })
  it('only closes the most recently opened overlay on Escape and cleans document listeners', async () => {
    const close = vi.fn()
    const first = mount(Overlay, { props: { open: true, onClose: close }, attachTo: document.body })
    const second = mount(Overlay, { props: { open: true }, attachTo: document.body })
    wrappers.push(first, second)
    await settle()
    // 与真实浏览器一致：keydown 的 target 是元素而非 document（事件冒泡到 document）
    const escape = () =>
      document.body.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
      )
    escape()
    expect(first.emitted('close')).toBeUndefined()
    expect(second.emitted('close')?.[0]?.[1]).toBe('escape')
    second.unmount()
    wrappers.splice(wrappers.indexOf(second), 1)
    escape()
    expect(close).toHaveBeenCalledOnce()
    first.unmount()
    wrappers.splice(wrappers.indexOf(first), 1)
    escape()
    expect(close).toHaveBeenCalledOnce()
  })
  it('position observers survive recalculation without restarting and clean up on disable', async () => {
    const callbacks: ResizeObserverCallback[] = []
    const observe = vi.fn()
    const disconnect = vi.fn()
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          callbacks.push(callback)
        }
        observe = observe
        disconnect = disconnect
      },
    )
    const enabled = shallowRef(true)
    const anchor = shallowRef<HTMLElement | null>(null)
    const floating = shallowRef<HTMLElement | null>(null)
    const changed = vi.fn()
    const wrapper = mount(
      defineComponent({
        setup() {
          useAnchoredPosition(() => ({
            anchorElementRef: anchor,
            floatingElementRef: floating,
            enabled: enabled.value,
            onPositionChange: changed,
          }))
          return () =>
            h('div', [
              h('button', { ref: anchor }, 'Anchor'),
              h('div', { ref: floating }, 'Floating'),
            ])
        },
      }),
      { attachTo: document.body },
    )
    wrappers.push(wrapper)
    await settle()
    expect(callbacks).toHaveLength(3)
    expect(observe).toHaveBeenCalledTimes(3)
    callbacks[0]!([], {} as ResizeObserver)
    await new Promise((resolve) => requestAnimationFrame(resolve))
    await settle()
    expect(callbacks).toHaveLength(3)
    expect(changed).toHaveBeenCalled()
    enabled.value = false
    await settle()
    expect(disconnect).toHaveBeenCalledTimes(3)
  })
  it('SSR omits browser-only overlay content even when open', async () => {
    const html = await renderToString(
      createSSRApp(() => h(Overlay, { open: true }, { default: () => h('div', 'Popup') })),
    )
    expect(html).not.toContain('Popup')
    expect(html).not.toContain('data-component="Overlay"')
  })
  it('keeps CSS anchor names unique after an older overlay closes and restores anchor styles', async () => {
    for (const property of ['anchorName', 'positionTryFallbacks', 'positionVisibility']) {
      Object.defineProperty(document.documentElement.style, property, {
        value: '',
        configurable: true,
        writable: true,
      })
    }
    const anchors = [
      document.createElement('button'),
      document.createElement('button'),
      document.createElement('button'),
    ]
    document.body.append(...anchors)
    anchors[0]!.style.setProperty('anchor-name', '--existing-anchor')
    const firstOpen = shallowRef(true)
    const thirdOpen = shallowRef(false)
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            FeatureFlags,
            { flags: { primer_react_css_anchor_positioning: true } },
            {
              default: () => [
                h(Overlay, { open: firstOpen.value, anchor: anchors[0] }),
                h(Overlay, { open: true, anchor: anchors[1] }),
                h(Overlay, { open: thirdOpen.value, anchor: anchors[2] }),
              ],
            },
          ),
      }),
      { attachTo: document.body },
    )
    wrappers.push(wrapper)
    await settle()
    expect(
      document
        .querySelector<HTMLElement>('.primer-overlay')!
        .style.getPropertyValue('position-try-fallbacks'),
    ).toBe(
      'flip-block, flip-inline, flip-block flip-inline, --inline-end-center, --inline-start-center, --fit-block-bottom, --fit-block-top',
    )
    const secondName = anchors[1]!.style.getPropertyValue('anchor-name')
    expect(secondName).toMatch(/^--primer-overlay-/)
    firstOpen.value = false
    await settle()
    expect(anchors[0]!.style.getPropertyValue('anchor-name')).toBe('--existing-anchor')
    thirdOpen.value = true
    await settle()
    expect(anchors[2]!.style.getPropertyValue('anchor-name')).not.toBe(secondName)
    wrapper.unmount()
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    expect(anchors[1]!.style.getPropertyValue('anchor-name')).toBe('')
    expect(anchors[2]!.style.getPropertyValue('anchor-name')).toBe('')
  })
})
