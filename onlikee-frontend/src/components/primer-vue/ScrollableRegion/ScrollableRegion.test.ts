// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { ScrollableRegion } from './index'

describe('ScrollableRegion', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('adds and removes the accessible region only while it overflows, and disconnects', async () => {
    let callback: ResizeObserverCallback = () => {}
    const observe = vi.fn()
    const disconnect = vi.fn()
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(handler: ResizeObserverCallback) {
          callback = handler
        }
        observe = observe
        disconnect = disconnect
      },
    )
    const wrapper = mount(ScrollableRegion, {
      props: { 'aria-label': 'Repository list', className: 'custom' },
      attrs: { id: 'scroll-region' },
      slots: { default: 'Repositories' },
    })
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('aria-label')).toBeUndefined()
    expect(wrapper.classes()).toContain('custom')
    expect(wrapper.attributes('id')).toBe('scroll-region')
    expect(wrapper.attributes('data-component')).toBe('ScrollableRegion')
    expect(observe).toHaveBeenCalledWith(wrapper.element)
    Object.defineProperties(wrapper.element, {
      scrollWidth: { configurable: true, value: 500 },
      clientWidth: { configurable: true, value: 100 },
    })
    callback([], {} as ResizeObserver)
    await nextTick()
    expect(wrapper.attributes('role')).toBe('region')
    expect(wrapper.attributes('tabindex')).toBe('0')
    expect(wrapper.attributes('aria-label')).toBe('Repository list')
    Object.defineProperty(wrapper.element, 'scrollWidth', { configurable: true, value: 100 })
    callback([], {} as ResizeObserver)
    await nextTick()
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('tabindex')).toBeUndefined()
    expect(wrapper.attributes('aria-label')).toBeUndefined()
    wrapper.unmount()
    expect(disconnect).toHaveBeenCalledOnce()
  })

  it('handles vertical overflow and labelledby', async () => {
    let notify = () => {}
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          notify = callback
        }
        observe() {}
        disconnect() {}
      },
    )
    const wrapper = mount(ScrollableRegion, { props: { 'aria-labelledby': 'title' } })
    Object.defineProperties(wrapper.element, {
      scrollHeight: { value: 100 },
      clientHeight: { value: 25 },
    })
    notify()
    await nextTick()
    expect(wrapper.attributes('aria-labelledby')).toBe('title')
    expect(wrapper.attributes('role')).toBe('region')
    wrapper.unmount()
  })
})
