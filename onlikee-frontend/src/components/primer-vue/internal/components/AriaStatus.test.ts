// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import { LiveRegionElement } from '@primer/live-region-element'
import AriaStatus from './AriaStatus.vue'

let region: LiveRegionElement
const wrappers: VueWrapper[] = []
beforeEach(() => {
  region = new LiveRegionElement()
  region.delay = 0
  document.body.append(region)
})
afterEach(() => {
  for (const wrapper of wrappers.splice(0)) wrapper.unmount()
  region.clear()
  region.remove()
  vi.useRealTimers()
})
function status(props = {}, text = ref('Ready')) {
  const wrapper = mount(AriaStatus, { props, attachTo: document.body, slots: { default: () => text.value } })
  wrappers.push(wrapper)
  return { wrapper, text }
}

test('uses the real browser live region and preserves container attributes', async () => {
  const { wrapper } = status({ as: 'span', 'data-test': 'status' })
  await flushPromises()
  expect(wrapper.element.tagName).toBe('SPAN')
  expect(wrapper.attributes('data-test')).toBe('status')
  expect(region.getMessage('polite')).toBe('')
  expect(region.shadowRoot?.getElementById('polite')?.getAttribute('aria-live')).toBe('polite')
})

test('announces changed content and content populated after an empty mount', async () => {
  const { text } = status({}, ref(''))
  text.value = 'Export completed'
  await nextTick()
  await flushPromises()
  expect(region.getMessage('polite')).toBe('Export completed')
  text.value = 'Another export completed'
  await nextTick()
  await flushPromises()
  expect(region.getMessage('polite')).toBe('Another export completed')
})

test('announces initial content when requested and prefers aria-label', async () => {
  status({ announceOnShow: true, 'aria-label': 'Three results', politeness: 'assertive' })
  await flushPromises()
  expect(region.getMessage('polite')).toBe('Three results')
  expect(region.getMessage('assertive')).toBe('')
})

test('deduplicates trimmed content before performing visibility checks', async () => {
  const broadcast = vi.spyOn(region, 'announceFromElement')
  const { text } = status({ announceOnShow: true })
  await flushPromises()
  const visibility = vi.spyOn(window, 'getComputedStyle')
  text.value = '  Ready  '
  await nextTick()
  await flushPromises()
  expect(broadcast).toHaveBeenCalledTimes(1)
  expect(visibility).not.toHaveBeenCalled()
})

test('does not announce hidden content and never re-announces on unhide', async () => {
  const { wrapper, text } = status({ hidden: true, announceOnShow: true })
  await flushPromises()
  expect(region.getMessage()).toBe('')
  await wrapper.setProps({ hidden: false })
  await flushPromises()
  expect(region.getMessage()).toBe('')
  await wrapper.setProps({ style: { display: 'none' } })
  text.value = 'Hidden update'
  await nextTick()
  await flushPromises()
  expect(region.getMessage()).toBe('')
  text.value = ' '
  await nextTick()
  await flushPromises()
  expect(region.getMessage()).toBe('')
})

test('uses native visibility checks when available', async () => {
  const { wrapper, text } = status()
  const checkVisibility = vi.fn(() => false)
  Object.defineProperty(wrapper.element, 'checkVisibility', { value: checkVisibility })
  const computedStyle = vi.spyOn(window, 'getComputedStyle')
  text.value = 'Invisible'
  await nextTick()
  await flushPromises()
  expect(checkVisibility).toHaveBeenCalledWith({ visibilityProperty: true, checkVisibilityCSS: true })
  expect(computedStyle).not.toHaveBeenCalled()
  expect(region.getMessage()).toBe('')
})

test('cancels outdated delayed announcements and disconnects on unmount', async () => {
  vi.useFakeTimers()
  const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect')
  const { wrapper, text } = status({ announceOnShow: true, delayMs: 100 })
  await flushPromises()
  text.value = 'Latest'
  await nextTick()
  await flushPromises()
  await vi.advanceTimersByTimeAsync(100)
  expect(region.getMessage()).toBe('Latest')
  text.value = 'Unmounted'
  await nextTick()
  await flushPromises()
  wrapper.unmount()
  wrappers.splice(wrappers.indexOf(wrapper), 1)
  await vi.advanceTimersByTimeAsync(100)
  expect(region.getMessage()).toBe('Latest')
  expect(disconnect).toHaveBeenCalledTimes(1)
})
