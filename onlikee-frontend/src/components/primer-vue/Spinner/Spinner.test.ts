// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Spinner } from './index'

afterEach(() => vi.useRealTimers())

describe('Spinner source contract', () => {
  it('keeps SVG styles, classes, data attributes and accessible labeling', () => {
    const wrapper = mount(Spinner, {
      props: { size: 'small', className: 'custom-spinner', srText: 'Fetching rows' },
      attrs: { style: { color: 'red' }, 'data-testid': 'rows-spinner' },
    })
    const svg = wrapper.get('svg')
    expect(svg.classes()).toContain('custom-spinner')
    expect(svg.attributes('style')).toContain('color: red')
    expect(svg.attributes('width')).toBe('16px')
    expect(svg.attributes('data-testid')).toBe('rows-spinner')
    const label = wrapper.get(`#${svg.attributes('aria-labelledby')}`)
    expect(label.text()).toBe('Fetching rows')
    wrapper.unmount()
  })

  it('supports deprecated aria-label and explicit omission of screen reader text', () => {
    const wrapper = mount(Spinner, { attrs: { 'aria-label': 'Loading repositories' } })
    expect(wrapper.get('svg').attributes('aria-label')).toBe('Loading repositories')
    expect(wrapper.get('svg').attributes('aria-labelledby')).toBeUndefined()
    expect(wrapper.text()).toBe('')
    wrapper.unmount()
    const silent = mount(Spinner, { props: { srText: null } })
    expect(silent.get('svg').attributes('aria-labelledby')).toBeUndefined()
    silent.unmount()
  })

  it('delays display and cancels pending work on unmount', async () => {
    vi.useFakeTimers()
    const wrapper = mount(Spinner, { props: { delay: 'short' } })
    expect(wrapper.find('svg').exists()).toBe(false)
    await vi.advanceTimersByTimeAsync(299)
    expect(wrapper.find('svg').exists()).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect(wrapper.find('svg').exists()).toBe(true)
    wrapper.unmount()
    const pending = mount(Spinner, { props: { delay: 'long' } })
    pending.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
