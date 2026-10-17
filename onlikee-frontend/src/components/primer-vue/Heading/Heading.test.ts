// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { Heading } from './index'
import { Label } from '../Label'

describe('Heading', () => {
  it('renders h2 by default and exposes the heading DOM element', () => {
    const wrapper = mount(Heading, { slots: { default: 'Repositories' } })
    expect(wrapper.element.tagName).toBe('H2')
    expect(wrapper.attributes('data-component')).toBe('Heading')
    expect(wrapper.text()).toBe('Repositories')
    expect(wrapper.vm.element).toBe(wrapper.element)
    wrapper.unmount()
  })
  it('supports heading levels, variants and native attribute forwarding', () => {
    const wrapper = mount(Heading, {
      props: { as: 'h3', variant: 'small', className: 'custom' },
      attrs: { id: 'heading', class: 'extra', tabindex: -1 },
    })
    expect(wrapper.element.tagName).toBe('H3')
    expect(wrapper.attributes('data-variant')).toBe('small')
    expect(wrapper.attributes('tabindex')).toBe('-1')
    expect(wrapper.attributes('id')).toBe('heading')
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['custom', 'extra']))
    wrapper.unmount()
  })
})

describe('Label', () => {
  it('defaults to a small neutral span', () => {
    const wrapper = mount(Label, { slots: { default: 'Public' } })
    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.attributes('data-size')).toBe('small')
    expect(wrapper.attributes('data-variant')).toBe('default')
    expect(wrapper.attributes('data-component')).toBe('Label')
    wrapper.unmount()
  })
  it('renders custom elements and preserves native attrs and classes', () => {
    const wrapper = mount(Label, {
      props: { as: 'a', variant: 'accent', size: 'large', className: 'custom' },
      attrs: { href: '/issues', class: 'extra', 'aria-label': 'Issues' },
    })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/issues')
    expect(wrapper.attributes('aria-label')).toBe('Issues')
    expect(wrapper.attributes('data-size')).toBe('large')
    expect(wrapper.attributes('data-variant')).toBe('accent')
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['custom', 'extra']))
    expect(wrapper.vm.element).toBe(wrapper.element)
    wrapper.unmount()
  })
})
