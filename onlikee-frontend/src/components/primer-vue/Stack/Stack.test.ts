// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Fixtures exercise polymorphic component composition. */
import { afterEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, shallowRef, type CSSProperties, type PropType } from 'vue'
import { Stack, StackItem, type StackInstance } from './index'
import { Link } from '../Link'
import { Button } from '../Button'
import { StateLabel } from '../StateLabel'

const wrappers: VueWrapper[] = []
afterEach(() => wrappers.splice(0).forEach((wrapper) => wrapper.unmount()))

describe('Stack', () => {
  it('exports the compound Item with the same identity as StackItem', () => {
    expect(Stack.Item).toBe(StackItem)
  })

  it('renders source defaults, forwards attributes, and normalizes native styles', () => {
    const wrapper = mount(Stack, {
      props: { className: 'custom' },
      attrs: {
        class: 'native',
        id: 'stack',
        style: { width: 200 },
        'data-component': 'ignored',
        'data-direction': 'horizontal',
      },
      slots: { default: 'Content' },
    })
    wrappers.push(wrapper)
    expect(wrapper.attributes()).toMatchObject({
      id: 'stack',
      'data-component': 'Stack',
      'data-direction': 'vertical',
      'data-align': 'stretch',
      'data-wrap': 'nowrap',
      'data-justify': 'start',
      'data-padding': 'none',
    })
    expect(wrapper.attributes('data-gap')).toBeUndefined()
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['custom', 'native']))
    expect(wrapper.attributes('className')).toBeUndefined()
    expect(wrapper.attributes('style')).toContain('width: 200px')
    expect(wrapper.text()).toBe('Content')
    expect((wrapper.vm as unknown as StackInstance).element).toBe(wrapper.element)
  })

  it('updates responsive attributes and removes obsolete values', async () => {
    const wrapper = mount(Stack, {
      props: { direction: { narrow: 'vertical', regular: 'horizontal' }, gap: 'tight' },
    })
    wrappers.push(wrapper)
    expect(wrapper.attributes('data-direction-regular')).toBe('horizontal')
    expect(wrapper.attributes('data-direction')).toBeUndefined()
    await wrapper.setProps({ direction: 'horizontal', gap: { regular: 'spacious' } })
    expect(wrapper.attributes('data-direction-regular')).toBeUndefined()
    expect(wrapper.attributes('data-direction')).toBe('horizontal')
    expect(wrapper.attributes('data-gap')).toBeUndefined()
    expect(wrapper.attributes('data-gap-regular')).toBe('spacious')
  })

  it('does not emit grow/shrink defaults on items and preserves explicit false', async () => {
    const wrapper = mount(Stack.Item)
    wrappers.push(wrapper)
    expect(wrapper.attributes('data-grow')).toBeUndefined()
    expect(wrapper.attributes('data-shrink')).toBeUndefined()
    await wrapper.setProps({ grow: { narrow: false, regular: true }, shrink: false })
    expect(wrapper.attributes('data-grow-narrow')).toBe('false')
    expect(wrapper.attributes('data-grow-regular')).toBe('true')
    expect(wrapper.attributes('data-shrink')).toBe('false')
    await wrapper.setProps({ grow: undefined, shrink: undefined })
    expect(wrapper.attributes('data-grow-regular')).toBeUndefined()
    expect(wrapper.attributes('data-shrink')).toBeUndefined()
  })

  it('supports lists and composes a status label with a button inside an item', () => {
    const wrapper = mount(Stack, {
      props: { as: 'ul' },
      slots: {
        default: () =>
          h(Stack.Item, { as: 'li', grow: true }, () => [
            h(StateLabel, { status: 'pullMerged' }, () => 'Merged'),
            h(Button, null, () => 'View'),
          ]),
      },
    })
    wrappers.push(wrapper)
    expect(wrapper.element.tagName).toBe('UL')
    expect(wrapper.get('li').attributes('data-grow')).toBe('true')
    expect(wrapper.get('[data-component="StateLabel"]').text()).toBe('Merged')
    expect(wrapper.get('button').text()).toBe('View')
  })

  it('forwards component props and refs through Link and refreshes refs on replacement', async () => {
    const as = shallowRef<typeof Link | 'button'>(Link)
    const stack = shallowRef<{ element: HTMLElement | null } | null>(null)
    const wrapper = mount(
      defineComponent({
        setup: () => () => h(Stack, { as: as.value, href: '#target', ref: stack }, () => 'Go'),
      }),
    )
    wrappers.push(wrapper)
    expect(wrapper.get('a').attributes('href')).toBe('#target')
    expect(stack.value?.element).toBe(wrapper.get('a').element)
    as.value = 'button'
    await nextTick()
    expect(stack.value?.element).toBe(wrapper.get('button').element)
    wrapper.unmount()
    wrappers.pop()
    expect(stack.value).toBeNull()
  })

  it('preserves custom component style values', () => {
    let received: unknown
    const Custom = defineComponent({
      props: { style: { type: Object as PropType<CSSProperties>, default: undefined } },
      setup: (props) => () => {
        received = props.style
        return h('div')
      },
    })
    const style = { width: 12 }
    const wrapper = mount(Stack, { props: { as: Custom }, attrs: { style } })
    wrappers.push(wrapper)
    expect(received).toEqual(style)
  })
})
