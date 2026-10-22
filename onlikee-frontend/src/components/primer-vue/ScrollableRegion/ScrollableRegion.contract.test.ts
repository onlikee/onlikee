// @vitest-environment jsdom
import { mount, type VueWrapper } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { createSSRApp, h, nextTick } from 'vue'
import {
  ScrollableRegion,
  type ScrollableRegionProps,
  type ScrollableRegionInstance,
} from './index'

const wrappers: VueWrapper[] = []
let notify: ResizeObserverCallback
let observe: ReturnType<typeof vi.fn>
let disconnect: ReturnType<typeof vi.fn>
beforeEach(() => {
  observe = vi.fn()
  disconnect = vi.fn()
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeObserverCallback) {
        notify = callback
      }
      observe = observe
      disconnect = disconnect
    },
  )
})
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
})
function render(attrs: Record<string, unknown> = {}) {
  const wrapper = mount(ScrollableRegion, {
    props: { 'aria-label': 'Repositories' },
    attrs,
    slots: { default: () => h('span', 'Contents') },
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  return wrapper
}
function dimensions(target: Element, width = 100, height = 100) {
  Object.defineProperties(target, {
    scrollWidth: { configurable: true, value: width },
    clientWidth: { configurable: true, value: 100 },
    scrollHeight: { configurable: true, value: height },
    clientHeight: { configurable: true, value: 100 },
  })
}
function resize(...targets: Element[]) {
  notify(
    targets.map((target) => ({ target }) as ResizeObserverEntry),
    {} as ResizeObserver,
  )
  return nextTick()
}

describe('ScrollableRegion source contract', () => {
  it('starts without automatic region attributes until the first observer delivery', async () => {
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(500)
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(100)
    const wrapper = render()
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('aria-label')).toBeUndefined()
    expect(observe).toHaveBeenCalledExactlyOnceWith(wrapper.element)
    await resize(wrapper.element)
    expect(wrapper.attributes()).toMatchObject({
      role: 'region',
      tabindex: '0',
      'aria-label': 'Repositories',
    })
  })

  it.each([
    [101, 100],
    [100, 101],
    [101, 101],
  ])('recognizes overflow at %s by %s', async (width, height) => {
    const wrapper = render()
    dimensions(wrapper.element, width, height)
    await resize(wrapper.element)
    expect(wrapper.attributes('role')).toBe('region')
    expect(wrapper.attributes('tabindex')).toBe('0')
    dimensions(wrapper.element)
    await resize(wrapper.element)
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('tabindex')).toBeUndefined()
    expect(wrapper.attributes('aria-label')).toBeUndefined()
  })

  it('evaluates the observer entries and clears overflow for an empty delivery', async () => {
    const wrapper = render()
    const other = document.createElement('div')
    dimensions(wrapper.element)
    dimensions(other, 200)
    await resize(wrapper.element, other)
    expect(wrapper.attributes('role')).toBe('region')
    await resize()
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it.each(['tabindex', 'tabIndex'])(
    'overrides and then restores caller role and %s',
    async (tabIndex) => {
      const wrapper = render({ role: 'log', [tabIndex]: -1 })
      expect(wrapper.attributes('role')).toBe('log')
      expect(wrapper.attributes('tabindex')).toBe('-1')
      dimensions(wrapper.element, 200)
      await resize(wrapper.element)
      expect(wrapper.attributes('role')).toBe('region')
      expect(wrapper.attributes('tabindex')).toBe('0')
      await wrapper.setProps({ role: 'list', [tabIndex]: 2 })
      expect(wrapper.attributes('role')).toBe('region')
      expect(wrapper.attributes('tabindex')).toBe('0')
      dimensions(wrapper.element)
      await resize(wrapper.element)
      expect(wrapper.attributes('role')).toBe('list')
      expect(wrapper.attributes('tabindex')).toBe('2')
    },
  )

  it('updates the accessible name without replacing the element or observer', async () => {
    const wrapper = render()
    const original = wrapper.element
    dimensions(original, 200)
    await resize(original)
    await wrapper.setProps({ 'aria-label': undefined, 'aria-labelledby': 'repositories-title' })
    expect(wrapper.attributes('aria-label')).toBeUndefined()
    expect(wrapper.attributes('aria-labelledby')).toBe('repositories-title')
    expect(wrapper.element).toBe(original)
    expect(observe).toHaveBeenCalledOnce()
  })

  it('merges classes, normalizes native styles and forwards events on the div', async () => {
    expectTypeOf<ScrollableRegionProps>().not.toHaveProperty('unexpected')
    const click = vi.fn()
    const wrapper = render({
      id: 'scroll',
      class: 'vue-class',
      style: { maxHeight: 120, opacity: 0.5 },
      onClick: click,
      'data-component': 'Other',
    })
    await wrapper.setProps({ className: 'source-class' })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toEqual([
      expect.stringContaining('ScrollableRegion'),
      'source-class',
      'vue-class',
    ])
    expect((wrapper.element as HTMLElement).style.maxHeight).toBe('120px')
    expect((wrapper.element as HTMLElement).style.opacity).toBe('0.5')
    expect(wrapper.attributes('data-component')).toBe('ScrollableRegion')
    expect(wrapper.get('span').text()).toBe('Contents')
    await wrapper.trigger('click')
    expect(click).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ target: wrapper.element }),
    )
  })

  it('keeps content changes independent from overflow until another resize notification', async () => {
    const wrapper = render()
    dimensions(wrapper.element, 200)
    await wrapper.setProps({ title: 'Changed content' })
    expect(wrapper.attributes('role')).toBeUndefined()
    await resize(wrapper.element)
    expect(wrapper.attributes('role')).toBe('region')
  })

  it('exposes the root element and disconnects the observer on unmount', () => {
    const wrapper = render()
    const instance = wrapper.vm as unknown as ScrollableRegionInstance
    expect(instance.element).toBe(wrapper.element)
    wrapper.unmount()
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    expect(instance.element).toBeNull()
    expect(disconnect).toHaveBeenCalledOnce()
  })

  it('hydrates without region attributes and adds them after the observer notification', async () => {
    const appFactory = () =>
      createSSRApp({
        render: () =>
          h(ScrollableRegion, { 'aria-label': 'Repositories' }, () => h('span', 'Contents')),
      })
    const host = document.createElement('div')
    host.innerHTML = await renderToString(appFactory())
    document.body.append(host)
    const original = host.firstElementChild!
    expect(original.hasAttribute('role')).toBe(false)
    const warn = vi.spyOn(console, 'warn')
    const error = vi.spyOn(console, 'error')
    const app = appFactory()
    app.mount(host)
    expect(host.firstElementChild).toBe(original)
    expect(original.hasAttribute('role')).toBe(false)
    dimensions(original, 200)
    await resize(original)
    expect(original.getAttribute('role')).toBe('region')
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
    app.unmount()
  })
})
