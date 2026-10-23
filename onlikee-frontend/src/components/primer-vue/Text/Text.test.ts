// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Independent polymorphic fixtures. */
import { afterEach, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, nextTick, shallowRef } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { Text } from './index'
import { Button } from '../Button'

const wrappers: VueWrapper[] = []
afterEach(() => wrappers.splice(0).forEach((wrapper) => wrapper.unmount()))

it('preserves inherited typography and native attribute override order', async () => {
  const wrapper = mount(Text, {
    props: { size: 'small', weight: 'semibold', whiteSpace: 'pre' },
    attrs: {
      'data-size': 'large',
      'data-component': 'CustomText',
      style: { padding: 12, lineHeight: 1.5 },
      class: 'custom',
    },
  })
  wrappers.push(wrapper)
  expect(wrapper.element.tagName).toBe('SPAN')
  expect(wrapper.attributes('data-size')).toBe('large')
  expect(wrapper.attributes('data-component')).toBe('CustomText')
  expect((wrapper.element as HTMLElement).style.padding).toBe('12px')
  expect((wrapper.element as HTMLElement).style.lineHeight).toBe('1.5')
  await wrapper.setProps({ as: 'p', weight: undefined })
  expect(wrapper.element.tagName).toBe('P')
  expect(wrapper.attributes('data-weight')).toBeUndefined()
})

it('forwards native events and exposes the composed Button DOM ref', async () => {
  const click = vi.fn()
  const text = shallowRef<{ element: HTMLElement | null } | null>(null)
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          Text,
          { as: Button, ref: text, onClick: click, variant: 'primary' as const },
          () => 'Save',
        ),
    }),
  )
  wrappers.push(wrapper)
  expect(text.value?.element).toBe(wrapper.get('button').element)
  await wrapper.get('button').trigger('click')
  expect(click).toHaveBeenCalledTimes(1)
  wrapper.unmount()
  expect(text.value).toBeNull()
})

it('preserves custom component numeric styles before its own normalization', () => {
  const Custom = defineComponent({
    inheritAttrs: false,
    setup:
      (_, { attrs }) =>
      () =>
        h('div', { 'data-padding': (attrs.style as { padding: number }).padding }),
  })
  const wrapper = mount(Text, { props: { as: Custom }, attrs: { style: { padding: 12 } } })
  wrappers.push(wrapper)
  expect(wrapper.attributes('data-padding')).toBe('12')
})

it('hydrates polymorphic markup and updates styles without mismatches', async () => {
  const padding = shallowRef(12)
  const Root = defineComponent({
    setup: () => () =>
      h(Text, { as: 'label', for: 'field', style: { padding: padding.value } }, () => 'Name'),
  })
  const host = document.createElement('div')
  host.innerHTML = await renderToString(createSSRApp(Root))
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const app = createSSRApp(Root)
  app.mount(host)
  padding.value = 16
  await nextTick()
  expect(host.querySelector('label')?.style.padding).toBe('16px')
  expect(warn).not.toHaveBeenCalled()
  app.unmount()
  warn.mockRestore()
})
