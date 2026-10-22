// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { SkeletonBox } from './index'

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
  it('normalizes numeric styles and preserves caller data-component values', async () => {
    const onClick = vi.fn()
    const wrapper = mount(SkeletonBox, {
      props: { height: 16, width: 40 },
      attrs: {
        'data-component': 'CustomSkeleton',
        class: 'custom',
        style: { height: 32, width: 80, opacity: 0.5 },
        onClick,
      },
    })
    expect(wrapper.attributes('data-component')).toBe('CustomSkeleton')
    expect(wrapper.classes()).toContain('custom')
    expect(wrapper.element.style.height).toBe('32px')
    expect(wrapper.element.style.width).toBe('80px')
    expect(wrapper.element.style.opacity).toBe('0.5')
    await wrapper.trigger('click')
    expect(onClick).toHaveBeenCalledOnce()
    wrapper.unmount()
  })
  it('matches delay updates after becoming visible and when a pending delay is removed', async () => {
    vi.useFakeTimers()
    const wrapper = mount(SkeletonBox, { props: { delay: 0 } })
    expect(wrapper.find('div').exists()).toBe(true)
    await wrapper.setProps({ delay: 'short' })
    expect(wrapper.find('div').exists()).toBe(true)
    wrapper.unmount()

    const pending = mount(SkeletonBox, { props: { delay: 'short' } })
    expect(pending.vm.element).toBe(null)
    await pending.setProps({ delay: undefined })
    await vi.advanceTimersByTimeAsync(1000)
    expect(pending.find('div').exists()).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
    pending.unmount()
  })
})
