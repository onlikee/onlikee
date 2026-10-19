// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { InfoIcon } from '@onlikee/octicons-vue'
import InlineMessage, { InlineMessage as NamedInlineMessage } from './index'
import type { InlineMessageProps } from './index'

const wrappers: VueWrapper[] = []
function track<T extends VueWrapper>(wrapper: T): T {
  wrappers.push(wrapper)
  return wrapper
}
afterEach(() => {
  wrappers.forEach((wrapper) => wrapper.unmount())
  wrappers.length = 0
})

describe('InlineMessage', () => {
  it('exports the component and renders content directly after the default InfoIcon', () => {
    expect(InlineMessage).toBe(NamedInlineMessage)
    const wrapper = track(mount(InlineMessage, { slots: { default: () => h('span', 'Message') } }))
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('data-component')).toBe('InlineMessage')
    expect(wrapper.attributes('data-size')).toBe('medium')
    expect(wrapper.attributes('data-variant')).toBeUndefined()
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('aria-live')).toBeUndefined()
    expect(wrapper.element.children).toHaveLength(2)
    expect(wrapper.get('svg.octicon-info').attributes('height')).toBe('16')
    expect(wrapper.get('svg').attributes('aria-hidden')).toBe('true')
    expect(wrapper.element.lastElementChild?.textContent).toBe('Message')
  })

  it.each(['small', 'medium'] as const)(
    'uses InfoIcon at 16px without a variant at size %s',
    (size) => {
      const wrapper = track(mount(InlineMessage, { props: { size } }))
      expect(wrapper.attributes('data-size')).toBe(size)
      expect(wrapper.get('svg.octicon-info').attributes('height')).toBe('16')
    },
  )

  const variants = ['critical', 'success', 'unavailable', 'warning'] as const
  it.each(
    variants.flatMap((variant) => [
      { variant, size: 'small' as const },
      { variant, size: 'medium' as const },
    ]),
  )('selects the correct artwork for $variant / $size', (props) => {
    const wrapper = track(mount(InlineMessage, { props: props as InlineMessageProps }))
    const icon = props.variant === 'success' ? 'check-circle' : 'alert'
    const suffix = props.size === 'small' ? '-fill' : ''
    const svg = wrapper.get(`svg.octicon-${icon}${suffix}`)
    expect(wrapper.attributes('data-variant')).toBe(props.variant)
    expect(svg.attributes('width')).toBe(props.size === 'small' ? '12' : '16')
    expect(svg.attributes('height')).toBe(props.size === 'small' ? '12' : '16')
    expect(svg.classes().some((name) => name.includes('InlineMessageIcon'))).toBe(true)
  })

  it('forwards native attributes and events while preserving component markers and merging classes', async () => {
    const onClick = vi.fn()
    const wrapper = track(
      mount(InlineMessage, {
        props: { className: 'source-class', size: 'small', variant: 'warning' },
        attrs: {
          class: { 'vue-class': true },
          id: 'message',
          title: 'Warning',
          style: { marginLeft: '4px' },
          role: 'status',
          'aria-live': 'polite',
          'data-testid': 'message',
          'data-size': 'large',
          'data-variant': 'other',
          'data-component': 'other',
          onClick,
        },
        slots: { default: 'Warning message' },
      }),
    )
    expect(wrapper.attributes()).toMatchObject({
      id: 'message',
      title: 'Warning',
      role: 'status',
      'aria-live': 'polite',
      'data-testid': 'message',
      'data-size': 'small',
      'data-variant': 'warning',
      'data-component': 'InlineMessage',
    })
    expect(wrapper.classes()).toEqual([
      'source-class',
      'vue-class',
      expect.stringContaining('InlineMessage'),
    ])
    expect((wrapper.element as HTMLDivElement).style.marginLeft).toBe('4px')
    expect(wrapper.attributes('className')).toBeUndefined()
    expect(wrapper.get('svg').attributes('id')).toBeUndefined()
    await wrapper.trigger('click')
    expect(onClick).toHaveBeenCalledOnce()
    expect(onClick.mock.calls[0]![0].target).toBe(wrapper.element)
  })

  it.each([
    InfoIcon,
    defineComponent({ setup: () => () => h('span', { 'data-testid': 'custom' }, 'Custom') }),
    () => h('span', { 'data-testid': 'functional' }, 'Functional'),
  ])('adds the icon class to component visuals without forcing their size', (leadingVisual) => {
    const wrapper = track(
      mount(InlineMessage, { props: { variant: 'critical', size: 'small', leadingVisual } }),
    )
    expect(wrapper.find('.octicon-alert-fill').exists()).toBe(false)
    const visual = wrapper.element.firstElementChild!
    expect(visual.getAttribute('class')).toEqual(expect.stringContaining('InlineMessageIcon'))
    if (visual.tagName === 'svg') expect(visual.getAttribute('height')).toBe('16')
  })

  it('preserves a prebuilt visual node, including its size and classes', () => {
    const wrapper = track(
      mount(InlineMessage, {
        props: {
          variant: 'success',
          leadingVisual: h(InfoIcon, { size: 24, class: 'custom-icon', 'data-testid': 'custom' }),
        },
      }),
    )
    const svg = wrapper.get('svg.octicon-info')
    expect(svg.attributes('height')).toBe('24')
    expect(svg.classes()).toContain('custom-icon')
    expect(svg.classes().some((name) => name.includes('InlineMessageIcon'))).toBe(false)
    expect(wrapper.find('.octicon-check-circle').exists()).toBe(false)
  })

  it.each([null, false, 'Custom visual', 0, [h('span', 'One'), h('span', 'Two')]])(
    'renders node visual %j without falling back to a variant icon',
    (leadingVisual) => {
      const wrapper = track(mount(InlineMessage, { props: { variant: 'warning', leadingVisual } }))
      expect(wrapper.find('svg').exists()).toBe(false)
      if (leadingVisual === 0) expect(wrapper.text()).toBe('0')
      if (typeof leadingVisual === 'string') expect(wrapper.text()).toBe(leadingVisual)
      if (Array.isArray(leadingVisual)) expect(wrapper.text()).toBe('OneTwo')
    },
  )

  it('updates icons, size and variant when props change and restores defaults for undefined', async () => {
    const wrapper = track(
      mount(InlineMessage, { props: { variant: 'success' } as InlineMessageProps }),
    )
    await wrapper.setProps({ size: 'small', variant: 'critical' })
    expect(wrapper.get('svg.octicon-alert-fill').attributes('height')).toBe('12')
    await wrapper.setProps({ leadingVisual: null })
    expect(wrapper.find('svg').exists()).toBe(false)
    await wrapper.setProps({ leadingVisual: undefined, variant: undefined, size: undefined })
    expect(wrapper.get('svg.octicon-info').attributes('height')).toBe('16')
    expect(wrapper.attributes('data-size')).toBe('medium')
    expect(wrapper.attributes('data-variant')).toBeUndefined()
  })

  it('renders the same root and content on the server', async () => {
    const html = await renderToString(
      h(InlineMessage, { variant: 'success', size: 'small', id: 'server-message' }, () => 'Saved'),
    )
    const container = document.createElement('div')
    container.innerHTML = html
    expect(container.querySelector('#server-message')?.textContent).toBe('Saved')
    expect(container.querySelector('svg.octicon-check-circle-fill')?.getAttribute('height')).toBe(
      '12',
    )
  })
})
