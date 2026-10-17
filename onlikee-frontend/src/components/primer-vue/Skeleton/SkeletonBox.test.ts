// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { SkeletonBox } from './index'
import { SkeletonText } from '../SkeletonText'

describe('SkeletonBox', () => {
  afterEach(() => vi.useRealTimers())
  it('forwards native attributes, merges style overrides and exposes its element', () => {
    const wrapper = mount(SkeletonBox, {
      props: { height: 40, width: '60%', className: 'loading' },
      attrs: { id: 'pending', style: { height: '80px' }, 'aria-hidden': 'true' },
    })
    expect(wrapper.attributes('data-component')).toBe('SkeletonBox')
    expect(wrapper.attributes('id')).toBe('pending')
    expect(wrapper.element.style.height).toBe('80px')
    expect(wrapper.element.style.width).toBe('60%')
    expect(wrapper.classes()).toContain('loading')
    expect(wrapper.vm.element).toBe(wrapper.element)
    wrapper.unmount()
  })
  it.each([
    ['short', 300],
    ['long', 1000],
    [600, 600],
  ] as const)('delays %s for %i milliseconds', async (delay, duration) => {
    vi.useFakeTimers()
    const wrapper = mount(SkeletonBox, { props: { delay } })
    expect(wrapper.find('div').exists()).toBe(false)
    await vi.advanceTimersByTimeAsync(duration - 1)
    expect(wrapper.find('div').exists()).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    await nextTick()
    expect(wrapper.find('div').exists()).toBe(true)
    wrapper.unmount()
  })
  it('cancels the previous delay on update and pending timers on unmount', async () => {
    vi.useFakeTimers()
    const wrapper = mount(SkeletonBox, { props: { delay: 'short' } })
    await vi.advanceTimersByTimeAsync(100)
    await wrapper.setProps({ delay: 'long' })
    await vi.advanceTimersByTimeAsync(200)
    expect(wrapper.find('div').exists()).toBe(false)
    wrapper.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('SkeletonText', () => {
  it('defaults to one full-width medium body line and forwards attrs', () => {
    const wrapper = mount(SkeletonText, { attrs: { id: 'loading-text' } })
    expect(wrapper.attributes('data-component')).toBe('SkeletonText')
    expect(wrapper.attributes('data-text-skeleton-size')).toBe('bodyMedium')
    expect(wrapper.attributes('id')).toBe('loading-text')
    expect((wrapper.element as HTMLElement).style.width).toBe('100%')
    wrapper.unmount()
  })
  it('renders styled lines in a maximum-width container', () => {
    const wrapper = mount(SkeletonText, {
      props: { lines: 3, size: 'titleLarge', maxWidth: 250, className: 'line' },
      attrs: { 'aria-hidden': 'true' },
    })
    expect(wrapper.attributes('data-component')).toBe('multilineContainer')
    expect((wrapper.element as HTMLElement).style.maxWidth).toBe('250px')
    const lines = wrapper.findAll('[data-component="SkeletonText"]')
    expect(lines).toHaveLength(3)
    for (const line of lines) {
      expect(line.attributes('data-in-multiline')).toBe('true')
      expect(line.attributes('data-text-skeleton-size')).toBe('titleLarge')
      expect(line.attributes('aria-hidden')).toBe('true')
      expect(line.classes()).toContain('line')
    }
    wrapper.unmount()
  })
})
