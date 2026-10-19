// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, nextTick } from 'vue'
import { renderToString } from '@vue/server-renderer'
import Label, { Label as NamedLabel, type LabelColorOptions, type LabelInstance } from './index'
import { Link } from '../Link'
import { ActionList } from '../ActionList'
import { Tooltip } from '../Tooltip'

const wrappers: VueWrapper[] = []
function track<T extends VueWrapper>(wrapper: T): T {
  wrappers.push(wrapper)
  return wrapper
}
afterEach(() => {
  wrappers.forEach((wrapper) => wrapper.unmount())
  wrappers.length = 0
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

const variants: LabelColorOptions[] = [
  'default',
  'primary',
  'secondary',
  'accent',
  'success',
  'attention',
  'severe',
  'danger',
  'done',
  'sponsors',
]

describe('Label', () => {
  it('exports the same component and renders a small default span without extra wrappers', () => {
    expect(Label).toBe(NamedLabel)
    const wrapper = track(mount(Label, { slots: { default: 'Public' } }))
    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.attributes()).toMatchObject({
      'data-component': 'Label',
      'data-size': 'small',
      'data-variant': 'default',
    })
    expect(wrapper.element.textContent).toBe('Public')
    expect(wrapper.element.children).toHaveLength(0)
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('tabindex')).toBeUndefined()
  })

  it.each(variants)('supports both sizes for the %s variant', async (variant) => {
    const wrapper = track(mount(Label, { props: { variant, size: 'small' } }))
    expect(wrapper.attributes('data-variant')).toBe(variant)
    expect(wrapper.attributes('data-size')).toBe('small')
    await wrapper.setProps({ size: 'large' })
    expect(wrapper.attributes('data-size')).toBe('large')
  })

  it('allows rest data attributes to override size and variant but fixes data-component last', async () => {
    const wrapper = track(
      mount(Label, {
        props: { size: 'large', variant: 'success', className: 'source-class' },
        attrs: {
          class: { 'vue-class': true },
          'data-size': 'small',
          'data-variant': 'danger',
          'data-component': 'Custom',
        },
      }),
    )
    expect(wrapper.attributes('data-size')).toBe('small')
    expect(wrapper.attributes('data-variant')).toBe('danger')
    expect(wrapper.attributes('data-component')).toBe('Label')
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['source-class', 'vue-class', expect.stringContaining('Label')]),
    )
    expect(wrapper.attributes('className')).toBeUndefined()
    const updated = {
      className: 'updated',
      'data-size': undefined,
      'data-variant': null,
    }
    await wrapper.setProps(updated)
    expect(wrapper.attributes('data-size')).toBeUndefined()
    expect(wrapper.attributes('data-variant')).toBeUndefined()
    expect(wrapper.classes()).toContain('updated')
    expect(wrapper.classes()).not.toContain('source-class')
  })

  it('forwards native attributes and events, updates the exposed ref and clears it on unmount', async () => {
    const onClick = vi.fn((event: MouseEvent) => event.preventDefault())
    const wrapper = track(
      mount(Label, {
        props: { as: 'a' },
        attrs: { href: '#issues', id: 'issues', 'aria-label': 'Open issues', onClick },
        attachTo: document.body,
        slots: { default: 'Issues' },
      }),
    )
    const instance = wrapper.vm as unknown as LabelInstance
    expect(instance.element).toBeInstanceOf(HTMLAnchorElement)
    expect(instance.element).toBe(wrapper.element)
    expect(wrapper.attributes('aria-label')).toBe('Open issues')
    expect(wrapper.attributes('href')).toBe('#issues')
    ;(instance.element as HTMLAnchorElement).focus()
    expect(document.activeElement).toBe(wrapper.element)
    await wrapper.trigger('click')
    expect(onClick).toHaveBeenCalledOnce()
    expect(onClick.mock.calls[0]![0].target).toBe(wrapper.element)
    const previous = instance.element
    const updated = { as: 'button' as const, href: undefined, type: 'button', disabled: true }
    await wrapper.setProps(updated)
    expect(instance.element).toBeInstanceOf(HTMLButtonElement)
    expect(instance.element).toBe(wrapper.element)
    expect(instance.element).not.toBe(previous)
    expect(wrapper.attributes('disabled')).toBe('')
    wrapper.unmount()
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    expect(instance.element).toBeNull()
  })

  it('normalizes native numeric lengths and preserves unitless and custom properties', async () => {
    const wrapper = track(
      mount(Label, {
        attrs: { style: { marginLeft: 8, height: 24, lineHeight: 1.5, opacity: 0.8, '--gap': 4 } },
      }),
    )
    const element = wrapper.element as HTMLElement
    expect(element.style.marginLeft).toBe('8px')
    expect(element.style.height).toBe('24px')
    expect(element.style.lineHeight).toBe('1.5')
    expect(element.style.opacity).toBe('0.8')
    expect(element.style.getPropertyValue('--gap')).toBe('4')
    await wrapper.setProps({ style: [{ marginLeft: 0 }, { height: '2rem' }] })
    expect(element.style.marginLeft).toBe('0px')
    expect(element.style.height).toBe('2rem')
    expect(element.style.lineHeight).toBe('')
    expect(element.style.getPropertyValue('--gap')).toBe('')
  })

  it('preserves custom component props, slots, style values and the component ref', async () => {
    const receivedStyle = vi.fn()
    const Custom = defineComponent({
      props: { to: { type: String, required: true } },
      setup(props, { attrs, slots, expose }) {
        expose({ marker: 'custom-label' })
        return () => {
          receivedStyle(attrs.style)
          return h('a', { ...attrs, href: props.to }, slots.default?.())
        }
      },
    })
    const wrapper = track(
      mount(Label, {
        props: { as: Custom },
        attrs: { to: '/labels', style: { marginLeft: 8 } },
        slots: { default: () => [h('strong', 'Custom'), h('span', ' label')] },
      }),
    )
    expect(wrapper.get('a').attributes('href')).toBe('/labels')
    expect(wrapper.get('strong').text()).toBe('Custom')
    expect(receivedStyle).toHaveBeenCalledWith({ marginLeft: 8 })
    expect((wrapper.vm as unknown as LabelInstance).element).toMatchObject({
      marker: 'custom-label',
    })
    await wrapper.setProps({ as: Custom, ...{ to: '/updated' } })
    expect(wrapper.get('a').attributes('href')).toBe('/updated')
  })

  it('composes with Link as the root without adding a wrapper or losing native behavior', async () => {
    const onClick = vi.fn((event: MouseEvent) => event.preventDefault())
    const wrapper = track(
      mount(Label, {
        props: { as: Link, variant: 'accent' },
        attrs: { href: '#labels', onClick, style: { marginLeft: 8 } },
        slots: { default: 'Labels' },
        attachTo: document.body,
      }),
    )
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('data-component')).toBe('Label')
    expect(wrapper.attributes('data-variant')).toBe('accent')
    expect(wrapper.element.children).toHaveLength(0)
    const link = (wrapper.vm as unknown as LabelInstance).element as HTMLElement
    expect(link).toBe(wrapper.element)
    expect(link.style.marginLeft).toBe('8px')
    link.focus()
    expect(document.activeElement).toBe(wrapper.element)
    await wrapper.trigger('click')
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders in ActionList trailing visuals and includes the label in the accessible name', () => {
    const wrapper = track(
      mount(ActionList, {
        slots: {
          default: () =>
            h(
              ActionList.Item,
              {},
              {
                default: () => [
                  'Repository',
                  h(
                    ActionList.TrailingVisual,
                    {},
                    {
                      default: () => h(Label, { variant: 'success' }, () => 'Choose this one'),
                    },
                  ),
                ],
              },
            ),
        },
      }),
    )
    const visual = wrapper.get('[data-component="ActionList.TrailingVisual"]')
    const label = visual.get('[data-component="Label"]')
    expect(label.text()).toBe('Choose this one')
    expect(label.attributes('aria-hidden')).toBeUndefined()
    expect(wrapper.get('button').attributes('aria-labelledby')?.split(' ')).toContain(
      visual.attributes('id'),
    )
    expect(wrapper.findAll('button')).toHaveLength(1)
  })

  it.each([
    { name: 'anchor', as: 'a' as const },
    { name: 'Link', as: Link },
  ])('forwards Tooltip ARIA and refs through Label as=$name', async ({ as }) => {
    const forwardedRef = { current: null as HTMLElement | null }
    const wrapper = track(
      mount(Tooltip, {
        props: { text: 'Repository visibility', forwardedRef },
        slots: {
          default: () =>
            h(Label, { as, href: '#visibility', 'aria-describedby': 'help' }, () => 'Public'),
        },
        attachTo: document.body,
      }),
    )
    await nextTick()
    const label = wrapper.get('[data-component="Label"]')
    const tooltip = wrapper.get('[data-component="Tooltip"]')
    expect(forwardedRef.current).toBe(label.element)
    expect(label.attributes('aria-describedby')).toBe(`help ${tooltip.attributes('id')}`)
    const matches = label.element.matches.bind(label.element)
    vi.spyOn(label.element, 'matches').mockImplementation(
      (selector) => selector === ':focus-visible' || matches(selector),
    )
    await label.trigger('focus')
    expect(tooltip.element.classList.contains(':popover-open')).toBe(true)
    await label.trigger('blur')
    expect(tooltip.element.classList.contains(':popover-open')).toBe(false)
    wrapper.unmount()
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    expect(forwardedRef.current).toBeNull()
  })

  it.each([
    { name: 'anchor', as: 'a' as const },
    { name: 'Link', as: Link },
  ])('hydrates $name markup and styles without mismatches', async ({ as }) => {
    const options = {
      render: () =>
        h(
          Label,
          {
            as,
            href: '#labels',
            variant: 'accent',
            'data-component': 'Ignored',
            style: { marginLeft: 8, lineHeight: 1.5, '--gap': 4 },
          },
          () => [h('strong', 'Public')],
        ),
    }
    const html = await renderToString(createSSRApp(options))
    expect(html).toContain('data-component="Label"')
    expect(html).toContain('margin-left:8px;line-height:1.5;--gap:4;')
    const host = document.createElement('div')
    document.body.append(host)
    host.innerHTML = html
    const original = host.firstElementChild
    const warn = vi.spyOn(console, 'warn')
    const error = vi.spyOn(console, 'error')
    const app = createSSRApp(options)
    app.mount(host)
    try {
      expect(host.firstElementChild).toBe(original)
      expect(warn).not.toHaveBeenCalled()
      expect(error).not.toHaveBeenCalled()
    } finally {
      app.unmount()
    }
  })
})
