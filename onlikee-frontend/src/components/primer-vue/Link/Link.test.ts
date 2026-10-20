// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Independent polymorphic Link test fixtures. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, markRaw, nextTick } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { Link } from './index'
import type { LinkInstance } from './types'
import { Tooltip } from '../Tooltip'
import { FeatureFlags } from '../FeatureFlags'

const wrappers: VueWrapper[] = []
function render(props: Record<string, unknown> = {}, content?: () => unknown): VueWrapper {
  const wrapper = mount(Link, {
    props,
    slots: content ? { default: content } : {},
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  return wrapper
}

afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
})

describe('Link', () => {
  it('renders an empty anchor without required props or an extra wrapper', () => {
    const wrapper = render()
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.classes()).toEqual([expect.stringContaining('Link')])
    expect(wrapper.element.className).toContain('prc-')
    expect(wrapper.attributes('data-component')).toBe('Link')
    for (const name of ['href', 'target', 'rel', 'data-muted', 'data-inline']) {
      expect(wrapper.attributes(name)).toBeUndefined()
    }
    expect(wrapper.text()).toBe('')
  })

  it('forwards attributes, classes, styles and events to the anchor', async () => {
    const click = vi.fn()
    const wrapper = render({
      href: '/destination',
      id: 'destination',
      target: '_blank',
      rel: 'nofollow',
      'aria-label': 'Destination',
      tabindex: 2,
      className: 'source-class',
      class: 'vue-class',
      style: { color: 'red' },
      onClick: click,
    })
    expect(wrapper.attributes()).toMatchObject({
      href: '/destination',
      id: 'destination',
      target: '_blank',
      rel: 'nofollow',
      'aria-label': 'Destination',
      tabindex: '2',
    })
    expect(wrapper.classes()).toEqual([
      'source-class',
      'vue-class',
      expect.stringContaining('Link'),
    ])
    expect((wrapper.element as HTMLElement).style.color).toBe('red')
    await wrapper.trigger('click')
    expect(click).toHaveBeenCalledOnce()
    expect(click.mock.calls[0]![0].target).toBe(wrapper.element)
  })

  it('accepts rich default slot content', () => {
    const wrapper = render({}, () => [h('svg', { 'aria-hidden': 'true' }), h('strong', 'Link')])
    expect(wrapper.get('strong').text()).toBe('Link')
    expect(wrapper.get('svg').attributes('aria-hidden')).toBe('true')
  })

  it('preserves unspecified and explicit boolean data attributes through updates', async () => {
    const wrapper = render({ muted: false, inline: true })
    expect(wrapper.attributes('data-muted')).toBe('false')
    expect(wrapper.attributes('data-inline')).toBe('true')
    expect(wrapper.attributes('muted')).toBeUndefined()
    expect(wrapper.attributes('inline')).toBeUndefined()
    await wrapper.setProps({ muted: true, inline: false })
    expect(wrapper.attributes('data-muted')).toBe('true')
    expect(wrapper.attributes('data-inline')).toBe('false')
    await wrapper.setProps({ muted: undefined, inline: undefined })
    expect(wrapper.attributes('data-muted')).toBeUndefined()
    expect(wrapper.attributes('data-inline')).toBeUndefined()
  })

  it('consumes deprecated hoverColor without forwarding or applying it', () => {
    const wrapper = render({ hoverColor: 'red' })
    expect(wrapper.attributes('hoverColor')).toBeUndefined()
    expect(wrapper.attributes('hover-color')).toBeUndefined()
    expect(wrapper.attributes('style')).toBeUndefined()
  })

  it('allows rest attributes to override the component data attributes', () => {
    const wrapper = render({
      muted: true,
      inline: true,
      'data-component': 'CustomLink',
      'data-muted': 'false',
      'data-inline': 'false',
    })
    expect(wrapper.attributes('data-component')).toBe('CustomLink')
    expect(wrapper.attributes('data-muted')).toBe('false')
    expect(wrapper.attributes('data-inline')).toBe('false')
  })

  it('renders a native button without adding a default type', async () => {
    const click = vi.fn()
    const wrapper = render({ as: 'button', onClick: click }, () => 'Action')
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBeUndefined()
    await wrapper.setProps({ type: 'button', disabled: true })
    expect(wrapper.attributes('type')).toBe('button')
    expect((wrapper.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('exposes the actual root element and updates and clears it', async () => {
    const wrapper = render({ href: '#' })
    const instance = wrapper.vm as unknown as LinkInstance
    expect(instance.element).toBe(wrapper.element)
    ;(instance.element as HTMLElement).focus()
    expect(document.activeElement).toBe(wrapper.element)
    await wrapper.setProps({ as: 'button' })
    expect(instance.element).toBe(wrapper.element)
    expect(instance.element).toBeInstanceOf(HTMLButtonElement)
    wrapper.unmount()
    expect(instance.element).toBeNull()
    wrappers.splice(wrappers.indexOf(wrapper), 1)
  })

  it('supports a custom component and resolves its DOM root', async () => {
    const CustomLink = defineComponent({
      props: { to: { type: String, required: true } },
      setup:
        (props, { slots }) =>
        () =>
          h('a', { href: props.to }, slots.default?.()),
    })
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = render(
      { as: CustomLink, to: '/custom', 'aria-label': 'Custom' },
      () => 'Custom',
    )
    await nextTick()
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/custom')
    expect(wrapper.attributes('aria-label')).toBe('Custom')
    expect((wrapper.vm as unknown as LinkInstance).element).toBe(wrapper.element)
    expect(error).not.toHaveBeenCalled()
  })

  it('passes numeric styles unchanged to a custom component before it transforms them', async () => {
    const receivedStyle = vi.fn()
    const CustomLink = markRaw(
      defineComponent({
        inheritAttrs: false,
        setup:
          (_props, { attrs, slots }) =>
          () => {
            const style = attrs.style as { marginLeft: number }
            receivedStyle(style)
            return h(
              'a',
              { ...attrs, style: { marginLeft: `${style.marginLeft * 2}px` } },
              slots.default?.(),
            )
          },
      }),
    )
    const wrapper = render({ as: CustomLink, href: '#custom', style: { marginLeft: 8 } })
    expect(receivedStyle).toHaveBeenLastCalledWith({ marginLeft: 8 })
    expect((wrapper.element as HTMLElement).style.marginLeft).toBe('16px')
    await wrapper.setProps({ style: { marginLeft: 12 } })
    expect(receivedStyle).toHaveBeenLastCalledWith({ marginLeft: 12 })
    expect((wrapper.element as HTMLElement).style.marginLeft).toBe('24px')
  })

  it.each([false, true])(
    'forwards a single trigger to Tooltip as its root with merged refs=%s',
    async (mergedRefs) => {
      const error = vi.spyOn(console, 'error')
      const warn = vi.spyOn(console, 'warn')
      const onClick = vi.fn((event: Event) => event.preventDefault())
      const wrapper = mount(FeatureFlags, {
        props: { flags: { primer_react_merged_forwarded_refs: mergedRefs } },
        slots: {
          default: () =>
            h(
              Link,
              { as: Tooltip, text: 'Link help' },
              {
                default: () =>
                  h('a', { href: '#target', 'aria-describedby': 'existing', onClick }, 'Target'),
              },
            ),
        },
        attachTo: document.body,
      })
      wrappers.push(wrapper)
      await nextTick()
      const anchor = wrapper.get('a')
      const tooltip = wrapper.get('[role="tooltip"]')
      const instance = wrapper.findComponent(Link).vm as unknown as LinkInstance
      expect(anchor.attributes('aria-describedby')).toBe(`existing ${tooltip.attributes('id')}`)
      expect(instance.element).toBe(anchor.element)
      instance.element?.focus()
      expect(document.activeElement).toBe(anchor.element)
      await anchor.trigger('click')
      expect(onClick).toHaveBeenCalledOnce()
      expect(warn).not.toHaveBeenCalled()
      expect(error).not.toHaveBeenCalled()
      wrapper.unmount()
      wrappers.splice(wrappers.indexOf(wrapper), 1)
      expect(instance.element).toBeNull()
    },
  )

  it('hydrates native styles and slot content without changing the anchor', async () => {
    const options = {
      render: () =>
        h(Link, { href: '#target', inline: true, style: { marginLeft: 8, lineHeight: 1.5 } }, () =>
          h('strong', 'Target'),
        ),
    }
    const host = document.createElement('div')
    document.body.append(host)
    host.innerHTML = await renderToString(createSSRApp(options))
    expect(host.innerHTML).toContain('margin-left:8px;line-height:1.5;')
    const anchor = host.firstElementChild
    const error = vi.spyOn(console, 'error')
    const warn = vi.spyOn(console, 'warn')
    const app = createSSRApp(options)
    try {
      app.mount(host)
      expect(host.firstElementChild).toBe(anchor)
      expect(host.querySelector('a > strong')?.textContent).toBe('Target')
      expect(error).not.toHaveBeenCalled()
      expect(warn).not.toHaveBeenCalled()
    } finally {
      app.unmount()
    }
  })

  it('reports inaccessible roots in development', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = render({ as: 'i' })
    expect(error).toHaveBeenCalledWith(
      'Error: Found `Link` component that renders an inaccessible element',
      wrapper.element,
      'Please ensure `Link` always renders as <a> or <button>',
    )
  })

  it('does not report inaccessible roots in production', () => {
    vi.stubEnv('DEV', false)
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render({ as: 'i' })
    expect(error).not.toHaveBeenCalled()
  })
})
