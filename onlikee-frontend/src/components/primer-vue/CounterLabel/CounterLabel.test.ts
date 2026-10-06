// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import CounterLabel from './CounterLabel.vue'

const wrappers: VueWrapper[] = []
afterEach(() => {
  wrappers.forEach(wrapper => wrapper.unmount()); wrappers.length = 0
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})
function track<T extends VueWrapper>(wrapper: T): T { wrappers.push(wrapper); return wrapper }

describe('CounterLabel', () => {
  it('renders the aria-hidden badge plus the screen-reader label', () => {
    const wrapper = track(mount(CounterLabel, { props: {}, slots: { default: '5' }, attrs: { id: 'counter' } }))
    const badge = wrapper.get('span.counter-label')
    expect(badge.attributes('aria-hidden')).toBe('true')
    expect(badge.attributes('data-variant')).toBe('secondary')
    expect(badge.attributes('data-component')).toBe('CounterLabel')
    expect(badge.attributes('id')).toBe('counter')
    expect(badge.text()).toBe('5')
    // VTU text() 会 trim 掉 \u00a0，断言原始 textContent
    expect(wrapper.get('span.visually-hidden').element.textContent).toBe('\u00a0(5)')
  })

  it('prefers variant over the deprecated scheme and allows data-component overrides', () => {
    const primary = track(mount(CounterLabel, { props: { variant: 'primary', scheme: 'secondary' }, slots: { default: '2' } }))
    expect(primary.get('span.counter-label').attributes('data-variant')).toBe('primary')
    const custom = track(mount(CounterLabel, { props: { dataComponent: 'ButtonCounter' }, slots: { default: '9' } }))
    expect(custom.get('span.counter-label').attributes('data-component')).toBe('ButtonCounter')
  })
})
