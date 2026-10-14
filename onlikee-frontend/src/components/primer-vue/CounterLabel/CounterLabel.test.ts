// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { h } from 'vue'
import CounterLabel, {
  CounterLabel as NamedCounterLabel,
  type CounterLabelInstance,
  type CounterLabelProps,
} from './index'

const wrappers: VueWrapper[] = []
afterEach(() => {
  wrappers.forEach((wrapper) => wrapper.unmount())
  wrappers.length = 0
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})
function track<T extends VueWrapper>(wrapper: T): T {
  wrappers.push(wrapper)
  return wrapper
}

describe('CounterLabel', () => {
  it('exports the same component through named and default entries', () => {
    expect(CounterLabel).toBe(NamedCounterLabel)
  })

  it('renders the aria-hidden badge plus the screen-reader label', () => {
    const wrapper = track(
      mount(CounterLabel, { props: {}, slots: { default: '5' }, attrs: { id: 'counter' } }),
    )
    const badge = wrapper.get('span[class*="counter-label_"]')
    expect(badge.attributes('aria-hidden')).toBe('true')
    expect(badge.attributes('data-variant')).toBe('secondary')
    expect(badge.attributes('data-component')).toBe('CounterLabel')
    expect(badge.attributes('id')).toBe('counter')
    expect(badge.text()).toBe('5')
    // VTU text() 会 trim 掉 \u00a0，断言原始 textContent
    expect(wrapper.get('span[class*="visually-hidden_"]').element.textContent).toBe('\u00a0(5)')
  })

  it('prefers variant over the deprecated scheme and allows data-component overrides', () => {
    const primary = track(
      mount(CounterLabel, {
        props: { variant: 'primary', scheme: 'secondary' },
        slots: { default: '2' },
      }),
    )
    expect(primary.get('span[class*="counter-label_"]').attributes('data-variant')).toBe('primary')
    const custom = track(
      mount(CounterLabel, {
        attrs: { 'data-component': 'ButtonCounter' },
        slots: { default: '9' },
      }),
    )
    expect(custom.get('span[class*="counter-label_"]').attributes('data-component')).toBe(
      'ButtonCounter',
    )
  })

  it('accepts no props or content and preserves the empty badge and accessible parentheses', () => {
    const wrapper = track(mount(CounterLabel))
    const badge = wrapper.get('[data-component="CounterLabel"]')
    expect(badge.element.tagName).toBe('SPAN')
    expect(badge.element.childElementCount).toBe(0)
    expect(badge.element.textContent).toBe('')
    const parent = badge.element.parentElement!
    expect(parent.children).toHaveLength(2)
    expect(parent.children[1]!.tagName).toBe('SPAN')
    expect(parent.children[1]!.textContent).toBe('\u00a0()')
  })

  it.each([
    [{ variant: 'primary' }, 'primary'],
    [{ variant: 'secondary' }, 'secondary'],
    [{ scheme: 'primary' }, 'primary'],
    [{ scheme: 'secondary' }, 'secondary'],
    [{ variant: 'secondary', scheme: 'primary' }, 'secondary'],
  ] as const)('infers the variant from %j', (props, expected) => {
    const wrapper = track(mount(CounterLabel, { props: props as CounterLabelProps }))
    expect(wrapper.get('[data-component="CounterLabel"]').attributes('data-variant')).toBe(expected)
  })

  it('merges classes, forwards native attributes and dispatches native events on the visible span', async () => {
    const click = vi.fn()
    const wrapper = track(
      mount(CounterLabel, {
        props: { variant: 'primary', className: 'source-class' },
        attrs: {
          id: 'count',
          title: 'Open issues',
          tabindex: 0,
          class: { 'vue-class': true },
          style: { marginLeft: '4px' },
          'aria-label': 'Issue count',
          'data-component': 'CustomCounter',
          'data-variant': 'custom',
          'aria-hidden': false,
          onClick: click,
        },
        slots: { default: '0' },
      }),
    )
    const badge = wrapper.get('#count')
    expect(badge.attributes()).toMatchObject({
      title: 'Open issues',
      tabindex: '0',
      'aria-label': 'Issue count',
      'data-component': 'CustomCounter',
      'data-variant': 'custom',
      'aria-hidden': 'false',
    })
    expect(badge.classes()).toEqual([
      'source-class',
      'vue-class',
      expect.stringContaining('counter-label'),
    ])
    expect((badge.element as HTMLSpanElement).style.marginLeft).toBe('4px')
    expect(badge.attributes('className')).toBeUndefined()
    const hidden = badge.element.nextElementSibling!
    expect(hidden.getAttribute('id')).toBeNull()
    expect(hidden.getAttribute('title')).toBeNull()
    expect(hidden.getAttribute('aria-label')).toBeNull()
    expect(hidden.getAttribute('aria-hidden')).toBeNull()
    expect(hidden.classList.contains('vue-class')).toBe(false)
    expect(hidden.textContent).toBe('\u00a0(0)')
    await badge.trigger('click')
    expect(click).toHaveBeenCalledOnce()
    expect(click.mock.calls[0]![0]).toBeInstanceOf(MouseEvent)
    expect(click.mock.calls[0]![0].target).toBe(badge.element)
  })

  it.each([
    [undefined, 'CounterLabel'],
    [null, 'CounterLabel'],
    ['', ''],
    ['ButtonCounter', 'ButtonCounter'],
  ])('uses nullish defaulting for data-component=%s', (value, expected) => {
    const wrapper = track(mount(CounterLabel, { attrs: { 'data-component': value } }))
    expect(wrapper.get('span').attributes('data-component')).toBe(expected)
  })

  it('renders rich content in both spans', () => {
    const wrapper = track(
      mount(CounterLabel, { slots: { default: () => [h('strong', '12'), h('span', 'K')] } }),
    )
    const badge = wrapper.get('[data-component="CounterLabel"]')
    expect(badge.element.children).toHaveLength(2)
    expect(badge.element.textContent).toBe('12K')
    const hidden = badge.element.nextElementSibling!
    expect(hidden.children).toHaveLength(2)
    expect(hidden.textContent).toBe('\u00a0(12K)')
  })

  it('updates props and fallthrough attributes reactively', async () => {
    const wrapper = track(
      mount(CounterLabel, {
        props: { variant: 'primary', className: 'old' },
        attrs: { 'data-component': 'Old' },
      }),
    )
    await wrapper.setProps({
      variant: undefined,
      scheme: 'secondary',
      className: 'new',
      'data-component': 'New',
      title: 'Updated count',
    })
    const badge = wrapper.get('[data-component="New"]')
    expect(badge.attributes('data-variant')).toBe('secondary')
    expect(badge.attributes('title')).toBe('Updated count')
    expect(badge.classes()).toContain('new')
    expect(badge.classes()).not.toContain('old')
  })

  it('exposes and clears the visible span ref', () => {
    const wrapper = track(mount(CounterLabel, { attrs: { tabindex: 0 }, attachTo: document.body }))
    const instance = wrapper.vm as unknown as CounterLabelInstance
    expect(instance.element).toBe(wrapper.get('[data-component="CounterLabel"]').element)
    expect(instance.element).toBeInstanceOf(HTMLSpanElement)
    instance.element?.focus()
    expect(document.activeElement).toBe(instance.element)
    wrapper.unmount()
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    expect(instance.element).toBeNull()
  })
})
