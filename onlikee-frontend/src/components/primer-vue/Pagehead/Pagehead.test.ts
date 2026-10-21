// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, h } from 'vue'
import Pagehead, { Pagehead as NamedPagehead, type PageheadProps } from './index'
import { Heading } from '../Heading'
import { Button } from '../Button'
import { Breadcrumbs, BreadcrumbsItem } from '../Breadcrumbs'

describe('Pagehead', () => {
  it('accepts no props and renders the default div', () => {
    const props: PageheadProps = {}
    const wrapper = mount(Pagehead, { props })
    expect(Pagehead).toBe(NamedPagehead)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('data-component')).toBe('Pagehead')
    expect(wrapper.classes().some((name) => name.includes('Pagehead'))).toBe(true)
    expect(wrapper.text()).toBe('')
    wrapper.unmount()
  })

  it('forwards native attributes, events, classes and numeric styles to a changing root', async () => {
    const onClick = vi.fn()
    const wrapper = mount(Pagehead, {
      props: { as: 'header', className: 'custom' },
      attrs: {
        class: 'extra',
        id: 'page-title',
        'aria-label': 'Repository',
        'data-testid': 'pagehead',
        style: { paddingTop: 8, lineHeight: 1.5, '--gap': 4 },
        onClick,
      },
      slots: { default: 'Repository' },
    })
    expect(wrapper.element.tagName).toBe('HEADER')
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['custom', 'extra']))
    expect(wrapper.attributes('id')).toBe('page-title')
    expect(wrapper.attributes('aria-label')).toBe('Repository')
    expect(wrapper.attributes('data-testid')).toBe('pagehead')
    expect(wrapper.element.style.paddingTop).toBe('8px')
    expect(wrapper.element.style.lineHeight).toBe('1.5')
    expect(wrapper.element.style.getPropertyValue('--gap')).toBe('4')
    await wrapper.trigger('click')
    expect(onClick).toHaveBeenCalledOnce()
    await wrapper.setProps({
      as: 'section',
      'data-component': 'Custom.Pagehead',
      style: 'margin: 0',
    })
    expect(wrapper.element.tagName).toBe('SECTION')
    expect(wrapper.attributes('data-component')).toBe('Custom.Pagehead')
    expect(wrapper.element.style.margin).toBe('0px')
    expect(wrapper.element.style.paddingTop).toBe('')
    wrapper.unmount()
  })

  it('passes slots and raw style values to a custom root component', () => {
    const Root = defineComponent({
      inheritAttrs: false,
      props: { style: { type: Object, default: undefined } },
      setup(props, { attrs, slots }) {
        return () =>
          h('header', { ...attrs, 'data-padding': props.style?.paddingTop }, slots.default?.())
      },
    })
    const wrapper = mount(Pagehead, {
      props: { as: Root },
      attrs: { style: { paddingTop: 12 }, id: 'custom-root' },
      slots: { default: 'Custom heading' },
    })
    expect(wrapper.element.tagName).toBe('HEADER')
    expect(wrapper.attributes('id')).toBe('custom-root')
    expect(wrapper.attributes('data-component')).toBe('Pagehead')
    expect(wrapper.attributes('data-padding')).toBe('12')
    expect(wrapper.text()).toBe('Custom heading')
    wrapper.unmount()
  })

  it('retains the structure and events of Heading, Breadcrumbs and Button composition', async () => {
    const onClick = vi.fn()
    const wrapper = mount(Pagehead, {
      slots: {
        default: () => [
          h(
            Breadcrumbs,
            {},
            {
              default: () => [
                h(BreadcrumbsItem<'a'>, { href: '/projects' }, { default: () => 'Projects' }),
                h(BreadcrumbsItem<'a'>, { selected: true }, { default: () => 'onlikee' }),
              ],
            },
          ),
          h(Heading, { as: 'h2', variant: 'small' }, { default: () => 'Repository' }),
          h(Button, { onClick }, { default: () => 'New issue' }),
        ],
      },
    })
    expect(wrapper.get('h2').text()).toBe('Repository')
    expect(wrapper.get('a[href="/projects"]').text()).toBe('Projects')
    expect(wrapper.get('[aria-current="page"]').text()).toBe('onlikee')
    await wrapper.get('button').trigger('click')
    expect(onClick).toHaveBeenCalledOnce()
    wrapper.unmount()
  })

  it('renders native semantics, slot content and normalized styles during SSR', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(
            Pagehead,
            {
              as: 'header',
              'aria-labelledby': 'repository-title',
              style: { paddingTop: 8, lineHeight: 1.5 },
            },
            {
              default: () =>
                h(
                  Heading,
                  { id: 'repository-title', variant: 'small' },
                  {
                    default: () => 'Repository',
                  },
                ),
            },
          ),
      }),
    )
    expect(html).toContain('<header')
    expect(html).toContain('data-component="Pagehead"')
    expect(html).toContain('aria-labelledby="repository-title"')
    expect(html).toContain('padding-top:8px;line-height:1.5;')
    expect(html).toContain('id="repository-title"')
    expect(html).toContain('Repository')
  })
})
