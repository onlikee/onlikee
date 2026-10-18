// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Custom root fixtures verify attribute and ref forwarding. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { createMemoryHistory, createRouter, RouterLink } from 'vue-router'
import Header, {
  Header as NamedHeader,
  HeaderItem,
  HeaderLink,
  type HeaderInstance,
  type HeaderItemInstance,
  type HeaderLinkInstance,
} from './index'

const wrappers: VueWrapper[] = []
afterEach(() => wrappers.splice(0).forEach((wrapper) => wrapper.unmount()))

describe('Header', () => {
  it('exports the complete family and renders slots without additional wrappers', () => {
    expect(Header).toBe(NamedHeader)
    expect(Header.Item).toBe(HeaderItem)
    expect(Header.Link).toBe(HeaderLink)
    const wrapper = mount(Header, {
      slots: {
        default: () => [
          h(Header.Item, { full: true }, () => h(Header.Link, { href: '#' }, () => 'GitHub')),
          h('span', 'Menu'),
        ],
      },
    })
    wrappers.push(wrapper)
    expect(wrapper.element.tagName).toBe('HEADER')
    expect(wrapper.attributes('data-component')).toBe('Header')
    expect(wrapper.element.children).toHaveLength(2)
    expect(wrapper.get('div').attributes('data-component')).toBe('Header.Item')
    expect(wrapper.get('a').attributes('data-component')).toBe('Header.Link')
    expect(wrapper.get('a').text()).toBe('GitHub')
    expect(wrapper.get('span').text()).toBe('Menu')
  })

  it('preserves absent, true and false full values and explicit data-full overrides', async () => {
    const wrapper = mount(Header.Item)
    wrappers.push(wrapper)
    expect(wrapper.attributes('data-full')).toBeUndefined()
    expect(wrapper.attributes('full')).toBeUndefined()
    await wrapper.setProps({ full: true })
    expect(wrapper.attributes('data-full')).toBe('true')
    await wrapper.setProps({ full: false })
    expect(wrapper.attributes('data-full')).toBe('false')
    await wrapper.setProps({ full: undefined })
    expect(wrapper.attributes('data-full')).toBeUndefined()
    await wrapper.setProps({ full: true })
    await wrapper.setProps({ 'data-full': 'custom' } as never)
    expect(wrapper.attributes('data-full')).toBe('custom')
  })

  it.each([Header, Header.Item, Header.Link])(
    'forwards native attributes and events, merges classes and fixes the component marker',
    async (component) => {
      const click = vi.fn()
      const wrapper = mount(component, {
        props: { className: 'source' },
        attrs: {
          class: 'vue',
          style: { padding: '4px' },
          id: 'example',
          'aria-label': 'Example',
          'data-component': 'Override',
          onClick: click,
        },
      })
      wrappers.push(wrapper)
      expect(wrapper.classes()).toEqual(['source', 'vue', expect.stringContaining('prc-Header-')])
      expect(wrapper.attributes()).toMatchObject({ id: 'example', 'aria-label': 'Example' })
      expect(wrapper.attributes('data-component')).not.toBe('Override')
      expect(wrapper.attributes('className')).toBeUndefined()
      expect((wrapper.element as HTMLElement).style.padding).toBe('4px')
      await wrapper.trigger('click')
      expect(click).toHaveBeenCalledOnce()
    },
  )

  it('supports native custom roots and updates their refs', async () => {
    const wrapper = mount(Header, { props: { as: 'nav' } })
    wrappers.push(wrapper)
    const instance = wrapper.vm as unknown as HeaderInstance<'nav'>
    expect(wrapper.element.tagName).toBe('NAV')
    expect(instance.element).toBe(wrapper.element)
    await wrapper.setProps({ as: 'section' })
    expect(wrapper.element.tagName).toBe('SECTION')
    expect(instance.element).toBe(wrapper.element)
    expect(wrapper.attributes('as')).toBeUndefined()
  })

  it('passes custom component props and slots through and retains the public component ref', () => {
    const Root = defineComponent({
      props: { label: { type: String, required: true } },
      setup:
        (props, { slots }) =>
        () =>
          h('nav', { 'aria-label': props.label }, slots.default?.()),
    })
    const wrapper = mount(Header, {
      props: { as: Root },
      attrs: { label: 'Navigation' },
      slots: { default: () => 'Content' },
    })
    wrappers.push(wrapper)
    expect(wrapper.attributes('aria-label')).toBe('Navigation')
    expect(wrapper.text()).toBe('Content')
    const instance = wrapper.vm as unknown as HeaderInstance<typeof Root>
    expect(instance.element?.$el).toBe(wrapper.element)
  })

  it('forwards to without rewriting href and composes with RouterLink', async () => {
    const native = mount(Header.Link, { attrs: { to: '/target' } })
    wrappers.push(native)
    expect(native.element.tagName).toBe('A')
    expect(native.attributes('to')).toBe('/target')
    expect(native.attributes('href')).toBeUndefined()

    const Page = defineComponent({ render: () => null })
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:pathMatch(.*)*', component: Page }],
    })
    await router.push('/')
    const wrapper = mount(Header.Link, {
      props: { as: RouterLink },
      attrs: { to: { path: '/target', query: { q: 'header' } } },
      slots: { default: () => 'Target' },
      global: { plugins: [router] },
    })
    wrappers.push(wrapper)
    expect(wrapper.attributes('href')).toBe('/target?q=header')
    expect(wrapper.text()).toBe('Target')
    await wrapper.trigger('click', { button: 0 })
    await vi.waitFor(() => expect(router.currentRoute.value.fullPath).toBe('/target?q=header'))
  })

  it.each([Header, Header.Item, Header.Link])(
    'exposes and clears the root ref on unmount',
    (component) => {
      const wrapper = mount(component)
      const instance = wrapper.vm as unknown as
        HeaderInstance | HeaderItemInstance | HeaderLinkInstance
      expect(instance.element).toBe(wrapper.element)
      wrapper.unmount()
      expect(instance.element).toBeNull()
    },
  )
})
