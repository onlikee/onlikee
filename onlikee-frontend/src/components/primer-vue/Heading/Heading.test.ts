// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { Heading } from './index'
import { Label } from '../Label'
import { Link } from '../Link'
import { VisuallyHidden } from '../VisuallyHidden'
import { Tooltip } from '../Tooltip'

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
  it('normalizes numeric lengths while preserving unitless properties and custom properties', async () => {
    const wrapper = mount(Heading, {
      attrs: { style: { fontSize: 20, marginTop: 8, lineHeight: 1.5, '--heading-gap': 4 } },
    })
    expect(wrapper.element.style.fontSize).toBe('20px')
    expect(wrapper.element.style.marginTop).toBe('8px')
    expect(wrapper.element.style.lineHeight).toBe('1.5')
    expect(wrapper.element.style.getPropertyValue('--heading-gap')).toBe('4')
    await wrapper.setProps({ style: [{ fontSize: '1rem' }, { marginTop: 0 }] })
    expect(wrapper.element.style.fontSize).toBe('1rem')
    expect(wrapper.element.style.marginTop).toBe('0px')
    expect(wrapper.element.style.lineHeight).toBe('')
    wrapper.unmount()
  })
  it('serializes numeric styles consistently during SSR', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(Heading, { style: { fontSize: 20, marginTop: 8, lineHeight: 1.5 } }),
      }),
    )
    expect(html).toContain('font-size:20px;margin-top:8px;line-height:1.5;')
  })
  it('composes inline components and preserves native events, focus and live element refs', async () => {
    const onClick = vi.fn((event: Event) => event.preventDefault())
    const wrapper = mount(Heading, {
      attachTo: document.body,
      attrs: { tabindex: -1, onClick, 'aria-describedby': 'help' },
      slots: {
        default: () => [
          h(Link, { href: '/repositories' }, { default: () => 'Repositories' }),
          h(Label, {}, { default: () => 'Public' }),
          h(VisuallyHidden, { id: 'help' }, { default: () => 'Project overview' }),
        ],
      },
    })
    expect(wrapper.get('h2 > a').attributes('href')).toBe('/repositories')
    expect(wrapper.get('h2 > [data-component="Label"]').text()).toBe('Public')
    expect(wrapper.get('#help').text()).toBe('Project overview')
    expect(wrapper.attributes('aria-describedby')).toBe('help')
    await wrapper.get('a').trigger('click')
    expect(onClick).toHaveBeenCalledOnce()
    wrapper.vm.element?.focus()
    expect(document.activeElement).toBe(wrapper.element)
    const previous = wrapper.element
    await wrapper.setProps({ as: 'h4', variant: 'medium' })
    expect(wrapper.element.tagName).toBe('H4')
    expect(wrapper.vm.element).toBe(wrapper.element)
    expect(wrapper.element).not.toBe(previous)
    wrapper.unmount()
    expect(wrapper.vm.element).toBeNull()
  })
  it('lets native data attributes override the component defaults', () => {
    const wrapper = mount(Heading, {
      props: { variant: 'large' },
      attrs: { 'data-component': 'Custom.Title', 'data-variant': 'small' },
    })
    expect(wrapper.attributes('data-component')).toBe('Custom.Title')
    expect(wrapper.attributes('data-variant')).toBe('small')
    wrapper.unmount()
  })
  it('forwards Tooltip attributes and its DOM ref while retaining interactive descendants', async () => {
    const forwardedRef = { current: null as HTMLElement | null }
    const wrapper = mount(Tooltip, {
      attachTo: document.body,
      props: { text: 'Repository help', forwardedRef },
      slots: {
        default: () =>
          h(
            Heading,
            { 'aria-describedby': 'existing-help' },
            {
              default: () => h(Link, { href: '#repositories' }, { default: () => 'Repositories' }),
            },
          ),
      },
    })
    await nextTick()
    const tooltip = wrapper.get('[data-component="Tooltip"]')
    expect(forwardedRef.current).toBe(wrapper.get('h2').element)
    expect(wrapper.get('h2').attributes('aria-describedby')).toBe(
      `existing-help ${tooltip.attributes('id')}`,
    )
    const link = wrapper.get('a').element
    const matches = link.matches.bind(link)
    const spy = vi
      .spyOn(link, 'matches')
      .mockImplementation((selector) => selector === ':focus-visible' || matches(selector))
    try {
      await wrapper.get('a').trigger('focusin')
      expect(tooltip.element.classList.contains(':popover-open')).toBe(true)
      await wrapper.get('a').trigger('focusout')
      expect(tooltip.element.classList.contains(':popover-open')).toBe(false)
    } finally {
      spy.mockRestore()
      wrapper.unmount()
    }
    expect(forwardedRef.current).toBeNull()
  })
  it.each([true, false])('warns about non-heading roots only in development (DEV=%s)', (dev) => {
    vi.stubEnv('DEV', dev)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      const wrapper = mount(Heading, { props: { as: 'i' as 'h2' } })
      if (dev)
        expect(warn).toHaveBeenCalledWith('This Heading component should be an instanceof of h1-h6')
      else expect(warn).not.toHaveBeenCalled()
      wrapper.unmount()
    } finally {
      warn.mockRestore()
      vi.unstubAllEnvs()
    }
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
