// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Independent lifecycle fixtures. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, shallowRef } from 'vue'
import { Portal } from '../Portal'
import { useAnchoredPosition } from './useAnchoredPosition'

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
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.useRealTimers()
})
describe('useAnchoredPosition', () => {
  it.each([false, true])(
    'measures connected portal content on first open and reopen (initiallyOpen=%s)',
    async (initiallyOpen) => {
      vi.stubGlobal(
        'ResizeObserver',
        class {
          observe() {}
          disconnect() {}
        },
      )
      const measurements: boolean[] = []
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
        this: HTMLElement,
      ) {
        if (this.hasAttribute('data-floating')) measurements.push(this.isConnected)
        return new DOMRect(0, 0, 320, 32)
      })
      const open = shallowRef(initiallyOpen)
      const anchor = shallowRef<HTMLElement | null>(null)
      const floating = shallowRef<HTMLElement | null>(null)
      const wrapper = mount(
        defineComponent({
          setup() {
            useAnchoredPosition(() => ({
              anchorElementRef: anchor,
              floatingElementRef: floating,
              enabled: open.value,
            }))
            return () => [
              h('button', { ref: anchor }, 'Anchor'),
              open.value
                ? h(Portal, null, {
                    default: () => h('div', { ref: floating, 'data-floating': '' }, 'Floating'),
                  })
                : null,
            ]
          },
        }),
        { attachTo: document.body },
      )
      wrappers.push(wrapper)
      if (!initiallyOpen) open.value = true
      await settle()
      expect(measurements.length).toBeGreaterThan(0)
      expect(measurements).not.toContain(false)
      open.value = false
      await settle()
      measurements.length = 0
      open.value = true
      await settle()
      expect(measurements.length).toBeGreaterThan(0)
      expect(measurements).not.toContain(false)
    },
  )

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
})
