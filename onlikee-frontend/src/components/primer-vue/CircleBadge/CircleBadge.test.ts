// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, type Component } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { CheckIcon } from '@onlikee/octicons-vue'
import { CircleBadge, CircleBadgeIcon, type CircleBadgeInstance } from './index'

const wrappers: VueWrapper[] = []
function render(props = {}, content?: () => unknown) {
  const wrapper = mount(CircleBadge as Component, {
    props,
    slots: content ? { default: content } : {},
  })
  wrappers.push(wrapper)
  return wrapper
}
afterEach(() => wrappers.splice(0).forEach((wrapper) => wrapper.unmount()))

describe('CircleBadge source contracts', () => {
  it('supports an empty badge with default size and compound Icon', () => {
    const wrapper = render()
    expect(CircleBadge.Icon).toBe(CircleBadgeIcon)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('data-component')).toBe('CircleBadge')
    expect((wrapper.element as HTMLElement).style.width).toBe('96px')
    expect((wrapper.element as HTMLElement).style.height).toBe('96px')
    expect(wrapper.attributes('variant')).toBeUndefined()
    expect(wrapper.attributes('data-inline')).toBeUndefined()
  })
  it.each([
    ['small', 56],
    ['medium', 96],
    ['large', 128],
  ] as const)('supports %s and forwards the explicit variant attr', (variant, size) => {
    const wrapper = render({ variant })
    expect((wrapper.element as HTMLElement).style.width).toBe(`${size}px`)
    expect(wrapper.attributes('variant')).toBe(variant)
  })
  it.each([0, 20, 64])('lets numeric size %s override variant and consumer style', (size) => {
    const wrapper = render({
      variant: 'large',
      size,
      style: { width: '200px', color: 'red', padding: '10px' },
    })
    const style = (wrapper.element as HTMLElement).style
    expect(style.width).toBe(`${size}px`)
    expect(style.height).toBe(`${size}px`)
    expect(style.color).toBe('')
    expect(style.padding).toBe('')
    expect(wrapper.attributes('size')).toBe(String(size))
  })
  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'falls back to the variant for non-finite size %s',
    (size) => {
      expect((render({ size, variant: 'small' }).element as HTMLElement).style.width).toBe('56px')
    },
  )
  it('supports inline, preserves child classes and forwards native events', async () => {
    const click = vi.fn()
    const wrapper = render(
      {
        inline: true,
        className: 'source',
        class: 'vue',
        onClick: click,
        'data-component': 'ignored',
        'data-inline': 'ignored',
      },
      () => h('img', { class: 'child', alt: 'Example', src: '/image.png' }),
    )
    expect(wrapper.attributes('data-inline')).toBe('')
    expect(wrapper.attributes('data-component')).toBe('CircleBadge')
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['source', 'vue']))
    expect(wrapper.get('img').classes()).toEqual(['child'])
    await wrapper.trigger('click')
    expect(click).toHaveBeenCalledOnce()
  })
  it('supports native polymorphism and exposes the DOM ref with a class excluded from global link styles', () => {
    const wrapper = render({ as: 'a', href: '/badge', title: 'Badge' })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/badge')
    expect(wrapper.attributes('as')).toBeUndefined()
    expect(wrapper.attributes('title')).toBe('Badge')
    expect(wrapper.attributes('class')).toContain('prc-CircleBadge-CircleBadge')
    expect((wrapper.vm as unknown as CircleBadgeInstance).element).toBe(wrapper.element)
  })
  it('supports custom components and forwards their props', () => {
    const Link = defineComponent({
      props: { destination: { type: String, required: true } },
      setup:
        (props, { attrs, slots }) =>
        () =>
          h('a', { ...attrs, href: props.destination }, slots.default?.()),
    })
    const wrapper = render({ as: Link, destination: '/custom' }, () => 'Custom')
    expect(wrapper.get('a').attributes('href')).toBe('/custom')
    expect((wrapper.vm as unknown as CircleBadgeInstance).element).toBe(wrapper.element)
  })
  it('forwards icon props to the selected icon and preserves source component marker', () => {
    const wrapper = render({}, () =>
      h(CircleBadge.Icon, {
        icon: CheckIcon,
        size: 32,
        'aria-label': 'Check',
        className: 'source',
        class: 'vue',
        'data-component': 'ignored',
      }),
    )
    const svg = wrapper.get('svg')
    expect(svg.attributes()).toMatchObject({
      'data-component': 'CircleBadge.Icon',
      width: '32',
      height: '32',
      'aria-label': 'Check',
      role: 'img',
    })
    expect(svg.classes()).toEqual(expect.arrayContaining(['source', 'vue']))
  })
  it('renders sizing and child content consistently in SSR', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(CircleBadge as Component, { inline: true, variant: 'small' }, () => h('span', 'SSR')),
      }),
    )
    expect(html).toContain('width:56px;height:56px')
    expect(html).toContain('data-inline')
    expect(html).toContain('SSR')
  })
  it('hydrates a polymorphic badge with the same dimensions and native event handling', async () => {
    const click = vi.fn()
    const render = () =>
      h(CircleBadge as Component, { as: 'button', size: 64, onClick: click }, () => 'Badge')
    const host = document.createElement('div')
    host.innerHTML = await renderToString(createSSRApp({ render }))
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const app = createSSRApp({ render })
    app.mount(host)
    const badge = host.querySelector('button')!
    expect(badge.style.width).toBe('64px')
    badge.click()
    expect(click).toHaveBeenCalledOnce()
    expect(warn).not.toHaveBeenCalled()
    app.unmount()
  })
})
