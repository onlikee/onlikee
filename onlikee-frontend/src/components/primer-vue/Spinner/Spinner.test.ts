// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from '@vue/server-renderer'
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

describe('Spinner React parity', () => {
  it.each([
    [undefined, '32px'],
    ['small', '16px'],
    ['medium', '32px'],
    ['large', '64px'],
  ] as const)('uses size %s', (size, expected) => {
    const wrapper = mount(Spinner, { props: { size } })
    expect(wrapper.get('svg').attributes()).toMatchObject({ width: expected, height: expected })
    wrapper.unmount()
  })

  it('lets forwarded SVG attributes override defaults without changing the wrapper', () => {
    const wrapper = mount(Spinner, {
      attrs: {
        width: '48',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'red',
        'aria-hidden': false,
        'aria-labelledby': 'external',
        'data-component': 'custom-svg',
        class: 'native-class',
        style: { marginTop: 4, strokeWidth: 2, '--custom': 3 },
      },
    })
    expect(wrapper.attributes('data-component')).toBe('Spinner')
    expect(wrapper.get('svg').attributes()).toMatchObject({
      width: '48',
      height: '24',
      viewBox: '0 0 24 24',
      fill: 'red',
      'aria-hidden': 'false',
      'aria-labelledby': 'external',
      'data-component': 'custom-svg',
    })
    expect(wrapper.get('svg').classes()).toContain('native-class')
    expect(wrapper.get('svg').attributes('style')).toContain('margin-top: 4px')
    expect(wrapper.get('svg').attributes('style')).toContain('stroke-width: 2')
    expect(wrapper.get('svg').attributes('style')).toContain('--custom: 3')
    expect(wrapper.find('circle').attributes('vector-effect')).toBe('non-scaling-stroke')
    wrapper.unmount()
  })

  it('updates labels and ignores children as React does', async () => {
    const wrapper = mount(Spinner, { slots: { default: 'Ignored child' } })
    const id = wrapper.get('svg').attributes('aria-labelledby')
    expect(wrapper.text()).toBe('Loading')
    await wrapper.setProps({ srText: 'Fetching' })
    expect(wrapper.get('svg').attributes('aria-labelledby')).toBe(id)
    expect(wrapper.text()).toBe('Fetching')
    await wrapper.setProps({ 'aria-label': '' })
    expect(wrapper.find('svg').attributes('aria-label')).toBe('')
    expect(wrapper.find('svg').attributes('aria-labelledby')).toBeUndefined()
    expect(wrapper.text()).toBe('')
    await wrapper.setProps({ 'aria-label': undefined })
    expect(wrapper.get('svg').attributes('aria-labelledby')).toBe(id)
    await wrapper.setProps({ srText: null })
    expect(wrapper.text()).toBe('')
    expect(wrapper.findAll('span')).toHaveLength(1)
    wrapper.unmount()
  })

  it.each([true, 'short', 'long', 500] as const)('honors delay %s', async (delay) => {
    vi.useFakeTimers()
    const ms = delay === 'short' ? 300 : typeof delay === 'number' ? delay : 1000
    const wrapper = mount(Spinner, { props: { delay } })
    await vi.advanceTimersByTimeAsync(ms - 1)
    expect(wrapper.find('svg').exists()).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect(wrapper.find('svg').exists()).toBe(true)
    wrapper.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('cancels replaced delays and keeps React visibility semantics when delay becomes false', async () => {
    vi.useFakeTimers()
    const wrapper = mount(Spinner, { props: { delay: 'short' } })
    await vi.advanceTimersByTimeAsync(200)
    await wrapper.setProps({ delay: 'long' })
    await vi.advanceTimersByTimeAsync(300)
    expect(wrapper.find('svg').exists()).toBe(false)
    await wrapper.setProps({ delay: false })
    await vi.advanceTimersByTimeAsync(1000)
    expect(wrapper.find('svg').exists()).toBe(false)
    await wrapper.setProps({ delay: 10 })
    await vi.advanceTimersByTimeAsync(10)
    expect(wrapper.find('svg').exists()).toBe(true)
    await wrapper.setProps({ delay: 'long' })
    expect(wrapper.find('svg').exists()).toBe(true)
    wrapper.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it.each([false, 0] as const)('shows immediately for delay %s', (delay) => {
    const wrapper = mount(Spinner, { props: { delay } })
    expect(wrapper.find('svg').exists()).toBe(true)
    wrapper.unmount()
  })

  it.each(['modern', 'legacy'] as const)(
    'synchronizes animations and cleans up %s media subscriptions',
    async (api) => {
      let now = 1250
      vi.spyOn(performance, 'now').mockImplementation(() => now)
      let listener: (() => void) | undefined
      const subscribe = vi.fn((...args: unknown[]) => {
        listener = args.at(-1) as () => void
      })
      const unsubscribe = vi.fn()
      const query = {
        matches: true,
        ...(api === 'modern'
          ? { addEventListener: subscribe, removeEventListener: unsubscribe }
          : { addListener: subscribe, removeListener: unsubscribe }),
      }
      vi.stubGlobal(
        'matchMedia',
        vi.fn(() => query),
      )
      const first = mount(Spinner, { attrs: { style: { animationDelay: '42ms' } } })
      await nextTick()
      expect(first.get('svg').attributes('style')).toContain('animation-delay: -250ms')
      now = 1750
      const second = mount(Spinner)
      await nextTick()
      expect(second.get('svg').attributes('style')).toContain('animation-delay: -750ms')
      query.matches = false
      listener?.()
      await nextTick()
      expect(second.get('svg').attributes('style') ?? '').not.toContain('animation-delay')
      second.unmount()
      expect(unsubscribe).toHaveBeenCalled()
      first.unmount()
    },
  )

  it('preserves custom animation delay for reduced motion and samples time when a delayed spinner appears', async () => {
    vi.useFakeTimers()
    let now = 10
    vi.spyOn(performance, 'now').mockImplementation(() => now)
    let listener: (() => void) | undefined
    const query = {
      matches: false,
      addEventListener: vi.fn((_event: string, callback: () => void) => {
        listener = callback
      }),
      removeEventListener: vi.fn(),
    }
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => query),
    )
    const wrapper = mount(Spinner, {
      props: { delay: 'short' },
      attrs: { style: { animationDelay: '42ms' } },
    })
    now = 1480
    await vi.advanceTimersByTimeAsync(300)
    expect(wrapper.get('svg').attributes('style')).toContain('animation-delay: 42ms')
    query.matches = true
    listener?.()
    await nextTick()
    expect(wrapper.get('svg').attributes('style')).toContain('animation-delay: -480ms')
    query.matches = false
    listener?.()
    await nextTick()
    expect(wrapper.get('svg').attributes('style')).toContain('animation-delay: 42ms')
    wrapper.unmount()
    expect(query.removeEventListener).toHaveBeenCalledWith('change', listener)
  })

  it('hydrates unique screen reader labels without mismatches', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    )
    const render = () => h('div', [h(Spinner), h(Spinner), h(Spinner, { delay: 'short' })])
    const container = document.createElement('div')
    container.innerHTML = await renderToString(createSSRApp({ render }))
    const labels = [...container.querySelectorAll('svg')].map((svg) =>
      svg.getAttribute('aria-labelledby'),
    )
    expect(new Set(labels).size).toBe(2)
    const warn = vi.spyOn(console, 'warn')
    const error = vi.spyOn(console, 'error')
    const app = createSSRApp({ render })
    app.mount(container)
    await nextTick()
    expect(
      [...container.querySelectorAll('svg')].map((svg) => svg.getAttribute('aria-labelledby')),
    ).toEqual(labels)
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
    app.unmount()
  })
})
