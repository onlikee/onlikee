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

describe('Spinner Primer parity', () => {
  it.each([
    [undefined, '32px'],
    ['small', '16px'],
    ['medium', '32px'],
    ['large', '64px'],
  ] as const)('renders %s at %s', (size, expected) => {
    const wrapper = mount(Spinner, { props: { size } })
    expect(wrapper.get('svg').attributes('width')).toBe(expected)
    expect(wrapper.get('svg').attributes('height')).toBe(expected)
    expect(wrapper.get('svg').attributes('aria-hidden')).toBe('true')
    wrapper.unmount()
  })

  it('merges Vue classes on the SVG and lets forwarded attributes override SVG defaults', () => {
    const onClick = vi.fn()
    const wrapper = mount(Spinner, {
      props: { className: 'react-class' },
      attrs: {
        class: 'vue-class',
        'aria-hidden': 'false',
        'aria-labelledby': 'external-label',
        width: '20',
        'data-component': 'custom-svg',
        onClick,
      },
    })
    const svg = wrapper.get('svg')
    expect(svg.classes()).toEqual(expect.arrayContaining(['react-class', 'vue-class']))
    expect(svg.attributes('aria-hidden')).toBe('false')
    expect(svg.attributes('aria-labelledby')).toBe('external-label')
    expect(svg.attributes('width')).toBe('20')
    expect(svg.attributes('data-component')).toBe('custom-svg')
    expect(wrapper.attributes('data-component')).toBe('Spinner')
    svg.element.dispatchEvent(new MouseEvent('click'))
    expect(onClick).toHaveBeenCalledOnce()
    wrapper.unmount()
  })

  it.each([true, 'long', 'short', 500] as const)('honors delay=%s', async (delay) => {
    vi.useFakeTimers()
    const duration = typeof delay === 'number' ? delay : delay === 'short' ? 300 : 1000
    const wrapper = mount(Spinner, { props: { delay } })
    await vi.advanceTimersByTimeAsync(duration - 1)
    expect(wrapper.find('svg').exists()).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect(wrapper.find('svg').exists()).toBe(true)
    wrapper.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it.each([false, 0] as const)('renders delay=%s immediately without a timer', (delay) => {
    vi.useFakeTimers()
    const wrapper = mount(Spinner, { props: { delay } })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(vi.getTimerCount()).toBe(0)
    wrapper.unmount()
  })

  it('restarts pending delays on changes without hiding an already visible spinner', async () => {
    vi.useFakeTimers()
    const wrapper = mount(Spinner, { props: { delay: 'short' } })
    await vi.advanceTimersByTimeAsync(200)
    await wrapper.setProps({ delay: 500 })
    await vi.advanceTimersByTimeAsync(499)
    expect(wrapper.find('svg').exists()).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect(wrapper.find('svg').exists()).toBe(true)
    await wrapper.setProps({ delay: 'long' })
    expect(wrapper.find('svg').exists()).toBe(true)
    wrapper.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('matches the upstream mount-time visibility contract when a pending delay becomes false', async () => {
    vi.useFakeTimers()
    const wrapper = mount(Spinner, { props: { delay: 'short' } })
    await wrapper.setProps({ delay: false })
    await vi.advanceTimersByTimeAsync(1000)
    expect(wrapper.find('svg').exists()).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
    wrapper.unmount()
  })

  it('keeps caller animation styles for reduced motion and removes media listeners', async () => {
    const listeners = new Set<() => void>()
    const media = {
      matches: true,
      addEventListener: vi.fn((_type: string, listener: () => void) => listeners.add(listener)),
      removeEventListener: vi.fn((_type: string, listener: () => void) =>
        listeners.delete(listener),
      ),
    }
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => media),
    )
    vi.spyOn(performance, 'now').mockReturnValue(1250)
    const wrapper = mount(Spinner, {
      attrs: { style: { animationDelay: '99ms', marginTop: 8, color: 'red' } },
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.get('svg').element.style.animationDelay).toBe('-250ms')
    expect(wrapper.get('svg').element.style.marginTop).toBe('8px')
    media.matches = false
    listeners.forEach((listener) => listener())
    await wrapper.vm.$nextTick()
    expect(wrapper.get('svg').element.style.animationDelay).toBe('99ms')
    expect(wrapper.get('svg').element.style.color).toBe('red')
    wrapper.unmount()
    expect(listeners.size).toBe(0)
    expect(media.removeEventListener).toHaveBeenCalledOnce()
  })

  it('supports legacy MediaQueryList listeners and cleans them up', async () => {
    const media = { matches: true, addListener: vi.fn(), removeListener: vi.fn() }
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => media),
    )
    vi.spyOn(performance, 'now').mockReturnValue(1600)
    const wrapper = mount(Spinner)
    await wrapper.vm.$nextTick()
    expect(wrapper.get('svg').element.style.animationDelay).toBe('-600ms')
    expect(media.addListener).toHaveBeenCalledOnce()
    wrapper.unmount()
    expect(media.removeListener).toHaveBeenCalledWith(media.addListener.mock.calls[0]![0])
  })

  it('computes the animation phase when delayed content becomes visible', async () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )
    const now = vi.spyOn(performance, 'now').mockReturnValue(1250)
    const first = mount(Spinner)
    const delayed = mount(Spinner, { props: { delay: 'short' } })
    await first.vm.$nextTick()
    expect(first.get('svg').element.style.animationDelay).toBe('-250ms')
    now.mockReturnValue(1550)
    await vi.advanceTimersByTimeAsync(300)
    expect(delayed.get('svg').element.style.animationDelay).toBe('-550ms')
    first.unmount()
    delayed.unmount()
  })
})
