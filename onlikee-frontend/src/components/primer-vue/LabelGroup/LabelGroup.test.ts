// @vitest-environment jsdom
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick, ref } from 'vue'
import { LabelGroup } from './index'
import { Label } from '../Label'

const wrappers: VueWrapper[] = []
async function settle() {
  await nextTick()
  await flushPromises()
  await nextTick()
}
function labels() {
  return ['One', 'Two', 'Three', 'Four', 'Five'].map((label) =>
    h(Label, { key: label }, { default: () => label }),
  )
}
function fixture(props: Record<string, unknown> = {}, children = labels) {
  const wrapper = mount(LabelGroup, {
    props,
    slots: { default: children },
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  return wrapper
}
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(100)
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(30)
  vi.spyOn(HTMLElement.prototype, 'offsetParent', 'get').mockReturnValue(document.body)
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockImplementation(function (
    this: HTMLElement,
  ) {
    return [this.getBoundingClientRect()] as unknown as DOMRectList
  })
})
afterEach(() => {
  wrappers.forEach((wrapper) => wrapper.unmount())
  wrappers.length = 0
  document.body.innerHTML = ''
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('LabelGroup', () => {
  it.each(['ul', 'ol'])('renders %s items and wraps every label', (as) => {
    const wrapper = fixture({ as, className: 'custom', id: 'labels' })
    expect(wrapper.element.tagName.toLowerCase()).toBe(as)
    expect(wrapper.attributes('data-component')).toBe('LabelGroup')
    expect(wrapper.attributes('data-list')).toBe('true')
    expect(wrapper.findAll(':scope > li')).toHaveLength(5)
    expect(wrapper.attributes('data-overflow')).toBe('inline')
    expect(wrapper.classes()).toContain('custom')
    expect(wrapper.attributes('id')).toBe('labels')
  })
  it('renders custom roots without list wrappers, including fragment slot children', () => {
    const wrapper = fixture({ as: 'div' })
    expect(wrapper.findAll('li')).toHaveLength(0)
    expect(wrapper.findAll('[data-component="Label"]')).toHaveLength(5)
    expect(wrapper.attributes('data-list')).toBeUndefined()
  })
  it('truncates to a fixed count, updates when props or children change, and treats zero as untruncated', async () => {
    const count = ref(5)
    const wrapper = fixture({ visibleChildCount: 3, overflowStyle: 'inline' }, () =>
      labels().slice(0, count.value),
    )
    expect(wrapper.get('button').text()).toBe('Show +2 more+2')
    expect(
      wrapper
        .get('[data-index="3"]')
        .classes()
        .some((name) => name.includes('hidden')),
    ).toBe(true)
    await wrapper.setProps({ visibleChildCount: 1 })
    expect(wrapper.get('button').text()).toContain('+4')
    count.value = 3
    await nextTick()
    expect(wrapper.findAll('[data-index]')).toHaveLength(3)
    expect(wrapper.get('button').text()).toContain('+2')
    await wrapper.setProps({ visibleChildCount: 0 })
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.find('[data-component="LabelGroup.Toggle"]').exists()).toBe(false)
  })
  it('expands inline and restores focus to its own toggle without affecting another instance', async () => {
    const first = fixture({ visibleChildCount: 1, overflowStyle: 'inline' })
    const second = fixture({ visibleChildCount: 1, overflowStyle: 'inline' })
    await second.get('button').trigger('click')
    await settle()
    expect(second.attributes('data-overflow')).toBe('inline')
    expect(second.get('button').text()).toBe('Show less')
    expect(document.activeElement).toBe(second.get('button').element)
    expect(first.get('button').text()).toContain('+4')
    await second.get('button').trigger('click')
    await settle()
    expect(second.get('button').text()).toContain('+4')
    expect(document.activeElement).toBe(second.get('button').element)
  })
  it('focuses the first newly revealed focusable child', async () => {
    const wrapper = fixture({ visibleChildCount: 1, overflowStyle: 'inline' }, () => [
      h(Label, null, { default: () => 'Plain' }),
      h('a', { href: '#issue', id: 'hidden-link' }, 'Issue'),
      h(Label, null, { default: () => 'Last' }),
    ])
    await wrapper.get('button').trigger('click')
    await settle()
    expect(document.activeElement?.id).toBe('hidden-link')
  })
  it('opens all labels in a named modal overlay by keyboard and restores focus on Escape', async () => {
    const wrapper = fixture({ visibleChildCount: 3 })
    const expand = wrapper.get('button')
    await expand.trigger('keydown', { key: 'Enter' })
    await settle()
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')
    expect(dialog?.getAttribute('aria-label')).toBe('All 5 labels')
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    expect(dialog?.querySelectorAll('[data-component="Label"]')).toHaveLength(5)
    expect(document.activeElement).toBe(
      dialog?.querySelector('button[data-component="IconButton"]'),
    )
    document.activeElement?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    )
    await settle()
    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).toBe(expand.element)
  })
  it('closes the overlay from the explicit Close button', async () => {
    const wrapper = fixture({ visibleChildCount: 1 })
    await wrapper.get('button').trigger('click')
    await settle()
    document
      .querySelector<HTMLButtonElement>('[role="dialog"] button[data-component="IconButton"]')
      ?.click()
    await settle()
    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).toBe(wrapper.get('button').element)
  })
  it('observes each auto-truncated child, reserves toggle width, and disconnects on unmount', async () => {
    const observers: {
      callback: IntersectionObserverCallback
      observe: ReturnType<typeof vi.fn>
      disconnect: ReturnType<typeof vi.fn>
      options?: IntersectionObserverInit
    }[] = []
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
          observers.push({ callback, options, observe: this.observe, disconnect: this.disconnect })
        }
        observe = vi.fn()
        disconnect = vi.fn()
      },
    )
    const wrapper = fixture({ visibleChildCount: 'auto', overflowStyle: 'inline' })
    expect(observers[0]?.observe).toHaveBeenCalledTimes(5)
    const entries = wrapper.findAll('[data-index]').map(
      (item, index) =>
        ({
          target: item.element,
          isIntersecting: index < 2,
        }) as IntersectionObserverEntry,
    )
    observers[0]?.callback(entries, {} as IntersectionObserver)
    await settle()
    expect(wrapper.get('button').text()).toContain('+3')
    expect(observers.at(-1)?.options?.root).toBe(wrapper.element)
    expect(observers.at(-1)?.options?.threshold).toBe(1)
    await wrapper.get('button').trigger('click')
    await settle()
    expect(wrapper.attributes('data-overflow')).toBe('inline')
    expect(observers[0]?.disconnect).toHaveBeenCalled()
    await wrapper.get('button').trigger('click')
    await settle()
    expect(wrapper.get('button').text()).toContain('+3')
    const latest = observers.at(-1)
    wrapper.unmount()
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    expect(latest?.disconnect).toHaveBeenCalled()
  })
})
