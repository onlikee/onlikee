// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Custom component fixtures exercise composition and polymorphic roots. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, defineComponent, Fragment, h, nextTick, ref, type Component } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createMemoryHistory, createRouter, RouterLink } from 'vue-router'
import PageHeader, {
  PageHeader as NamedPageHeader,
  type PageHeaderInstance,
  type TitleAreaInstance,
  type ParentLinkInstance,
} from './index'
import { asSlot } from '../composables/useSlots'

const wrappers: VueWrapper[] = []
afterEach(() => wrappers.splice(0).forEach((wrapper) => wrapper.unmount()))

describe('PageHeader', () => {
  it('exports all 14 compound slots and preserves their component markers and classes', () => {
    expect(PageHeader).toBe(NamedPageHeader)
    const markers = {
      ContextArea: 'PageHeader.ContextArea',
      ParentLink: 'PageHeader.ParentLink',
      ContextBar: 'PageHeader.ContextBar',
      TitleArea: 'TitleArea',
      ContextAreaActions: 'PageHeader.ContextAreaActions',
      LeadingAction: 'PH_LeadingAction',
      Breadcrumbs: 'PH_Breadcrumbs',
      LeadingVisual: 'PH_LeadingVisual',
      Title: 'PH_Title',
      TrailingVisual: 'PH_TrailingVisual',
      TrailingAction: 'PH_TrailingAction',
      Actions: 'PH_Actions',
      Description: 'PageHeader.Description',
      Navigation: 'PH_Navigation',
    } as const
    for (const [name, marker] of Object.entries(markers)) {
      const wrapper = mount(PageHeader[name as keyof typeof markers], {
        props: { className: 'source' },
        attrs: { class: 'vue' },
        slots: { default: () => name },
      })
      wrappers.push(wrapper)
      expect(wrapper.attributes('data-component')).toBe(marker)
      expect(wrapper.classes()).toContain('source')
      expect(wrapper.classes()).toContain('vue')
      expect(wrapper.text()).toContain(name)
    }
  })

  it('renders the root semantics only when requested and forwards a native custom root', async () => {
    const wrapper = mount(PageHeader)
    wrappers.push(wrapper)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('aria-label')).toBeUndefined()
    expect(wrapper.attributes('data-title-size-variant')).toBeUndefined()
    await wrapper.setProps({ as: 'header', hasBorder: true })
    await wrapper.setProps({ role: 'banner', 'aria-label': 'Page' } as never)
    expect(wrapper.element.tagName).toBe('HEADER')
    expect(wrapper.attributes()).toMatchObject({
      role: 'banner',
      'aria-label': 'Page',
      'data-has-border': 'true',
    })
  })

  it('hoists title/navigation props through fragments and updates conditional content', async () => {
    const variant = ref<'large' | 'subtitle'>('large')
    const navigation = ref(true)
    const wrapper = mount(PageHeader, {
      slots: {
        default: () =>
          h(Fragment, null, [
            h(PageHeader.TitleArea, { variant: variant.value }, () =>
              h(PageHeader.Title, null, () => 'Title'),
            ),
            navigation.value
              ? h(PageHeader.Navigation, { hidden: { narrow: true, regular: false, wide: false } })
              : null,
          ]),
      },
    })
    wrappers.push(wrapper)
    expect(wrapper.attributes()).toMatchObject({
      'data-title-size-variant': 'large',
      'data-has-nav': '',
      'data-nav-hidden-narrow': 'true',
    })
    variant.value = 'subtitle'
    navigation.value = false
    await nextTick()
    expect(wrapper.attributes('data-title-size-variant')).toBe('subtitle')
    expect(wrapper.attributes('data-has-nav')).toBeUndefined()
    expect(wrapper.attributes('data-nav-hidden-narrow')).toBeUndefined()
  })

  it('does not hoist slots wrapped inside host elements or custom components', () => {
    const WrappedTitle = defineComponent({ render: () => h(PageHeader.TitleArea) })
    const wrapper = mount(PageHeader, {
      slots: {
        default: () => [
          h('div', [h(PageHeader.TitleArea)]),
          h(WrappedTitle),
          h('div', [h(PageHeader.Navigation)]),
        ],
      },
    })
    wrappers.push(wrapper)
    expect(wrapper.attributes('data-title-size-variant')).toBeUndefined()
    expect(wrapper.attributes('data-has-nav')).toBeUndefined()
  })

  it('uses medium as default title variant and serializes responsive variants without client measurement', () => {
    const wrapper = mount(PageHeader, { slots: { default: () => h(PageHeader.TitleArea) } })
    wrappers.push(wrapper)
    expect(wrapper.attributes('data-title-size-variant')).toBe('medium')
    const responsive = mount(PageHeader, {
      slots: {
        default: () =>
          h(PageHeader.TitleArea, {
            variant: { narrow: 'subtitle', regular: 'medium', wide: 'large' },
          }),
      },
    })
    wrappers.push(responsive)
    expect(responsive.attributes()).toMatchObject({
      'data-title-size-variant-narrow': 'subtitle',
      'data-title-size-variant-regular': 'medium',
      'data-title-size-variant-wide': 'large',
    })
    expect(
      responsive.get('[data-component="TitleArea"]').attributes('data-size-variant-wide'),
    ).toBe('large')
  })

  it('retains the responsive default visibility for context, parent link and leading/trailing actions', () => {
    for (const component of [
      PageHeader.ContextArea,
      PageHeader.ParentLink,
      PageHeader.ContextBar,
      PageHeader.ContextAreaActions,
    ]) {
      const wrapper = mount(component)
      wrappers.push(wrapper)
      expect(wrapper.attributes('data-hidden-regular')).toBe('true')
      expect(wrapper.attributes('data-hidden-wide')).toBeUndefined()
      expect(wrapper.attributes('data-hidden-narrow')).toBeUndefined()
    }
    for (const component of [PageHeader.LeadingAction, PageHeader.TrailingAction]) {
      const wrapper = mount(component)
      wrappers.push(wrapper)
      expect(wrapper.attributes('data-hidden-narrow')).toBe('true')
    }
  })

  it.each([
    [true, { 'data-hidden-all': 'true' }],
    [false, {}],
    [{}, { 'data-hidden-all': '[object Object]' }],
    [{ narrow: true, regular: true, wide: true }, { 'data-hidden-all': 'true' }],
    [
      { narrow: true, regular: false, wide: true },
      { 'data-hidden-narrow': 'true', 'data-hidden-wide': 'true' },
    ],
    [{ regular: true, wide: true }, { 'data-hidden-regular': 'true' }],
  ])('serializes hidden=%j without a native hidden attribute', (hidden, expected) => {
    const wrapper = mount(PageHeader.Description, { props: { hidden: hidden as boolean } })
    wrappers.push(wrapper)
    expect(wrapper.attributes()).toMatchObject(expected)
    expect(wrapper.attributes('hidden')).toBeUndefined()
    if (hidden === false) expect(wrapper.attributes('data-hidden-all')).toBeUndefined()
  })

  it('renders headings and parent link structure with the existing Heading and Link contracts', () => {
    const wrapper = mount(PageHeader, {
      slots: {
        default: () => [
          h(PageHeader.TitleArea, null, () => h(PageHeader.Title, { as: 'h1' }, () => 'Title')),
          h(PageHeader.ContextArea, null, () =>
            h(
              PageHeader.ParentLink,
              { href: '/parent', 'aria-label': 'Parent', hidden: false },
              () => 'Overview',
            ),
          ),
        ],
      },
    })
    wrappers.push(wrapper)
    expect(wrapper.get('h1').text()).toBe('Title')
    const link = wrapper.get('a')
    expect(link.attributes()).toMatchObject({
      href: '/parent',
      'aria-label': 'Parent',
      'data-muted': 'true',
    })
    expect(link.element.children[0]?.tagName.toLowerCase()).toBe('svg')
    expect(link.element.children[1]?.tagName).toBe('DIV')
    expect(link.text()).toBe('Overview')
    expect(wrapper.element.children[0]?.getAttribute('data-component')).toBe('TitleArea')
  })

  it('only applies navigation labels to nav landmarks and warns for missing labels', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const div = mount(PageHeader.Navigation, { props: { 'aria-label': 'Hidden label' } })
    const nav = mount(PageHeader.Navigation, { props: { as: 'nav', 'aria-labelledby': 'title' } })
    const unlabeled = mount(PageHeader.Navigation, { props: { as: 'nav' } })
    wrappers.push(div, nav, unlabeled)
    expect(div.attributes('aria-label')).toBeUndefined()
    expect(nav.attributes('aria-labelledby')).toBe('title')
    expect(warn).toHaveBeenCalledWith(
      'Warning:',
      expect.stringContaining('provide an accessible label'),
    )
  })

  it('warns for shallow interactive title content with context without reordering nodes', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mount(PageHeader, {
      slots: {
        default: () => [
          h(PageHeader.TitleArea, null, () => h('button', 'Interactive')),
          h(PageHeader.ContextArea, null, () => 'Context'),
        ],
      },
    })
    wrappers.push(wrapper)
    expect(warn).toHaveBeenCalledWith('Warning:', expect.stringContaining('focus order is logical'))
    expect(wrapper.element.children[0]?.getAttribute('data-component')).toBe('TitleArea')
  })

  it('recognizes marked context wrappers for the source focus-order warning', () => {
    const Context = asSlot(
      defineComponent({
        setup:
          (_, { slots }) =>
          () =>
            h(PageHeader.ContextArea, null, slots),
      }),
      PageHeader.ContextArea,
    )
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mount(PageHeader, {
      slots: {
        default: () => [
          h(PageHeader.TitleArea, null, () => h('button', 'Interactive')),
          h(Context, null, () => 'Context'),
        ],
      },
    })
    wrappers.push(wrapper)
    expect(warn).toHaveBeenCalledWith('Warning:', expect.stringContaining('focus order is logical'))
  })

  it('passes custom-root props and slots and exposes the corresponding public instance', () => {
    const Root = defineComponent({
      props: { label: { type: String, required: true } },
      setup:
        (props, { slots }) =>
        () =>
          h('header', { 'aria-label': props.label }, slots.default?.()),
    })
    const wrapper = mount(PageHeader, {
      props: { as: Root },
      attrs: { label: 'Page' },
      slots: { default: () => 'Custom root content' },
    })
    wrappers.push(wrapper)
    expect(wrapper.attributes('aria-label')).toBe('Page')
    expect(wrapper.text()).toBe('Custom root content')
    const instance = wrapper.vm as unknown as PageHeaderInstance<typeof Root>
    expect(instance.element?.$el).toBe(wrapper.element)
  })

  it('exposes and clears root, TitleArea and parent link element refs', () => {
    const root = mount(PageHeader)
    const title = mount(PageHeader.TitleArea)
    const link = mount(PageHeader.ParentLink)
    for (const [wrapper, instance] of [
      [root, root.vm as unknown as PageHeaderInstance],
      [title, title.vm as unknown as TitleAreaInstance],
      [link, link.vm as unknown as ParentLinkInstance],
    ] as const) {
      expect(instance.element).toBe(wrapper.element)
      wrapper.unmount()
      expect(instance.element).toBeNull()
    }
  })

  it('forwards custom router props, events and native link keyboard focus', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }],
    })
    await router.push('/')
    const click = vi.fn()
    const wrapper = mount(PageHeader.ParentLink, {
      props: { as: RouterLink },
      attrs: { to: '/parent', onClick: click },
      slots: { default: () => 'Parent' },
      global: { plugins: [router] },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    expect(wrapper.attributes('href')).toBe('/parent')
    ;(wrapper.element as HTMLAnchorElement).focus()
    expect(document.activeElement).toBe(wrapper.element)
    await wrapper.trigger('click', { button: 0 })
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/parent'))
    expect(click).toHaveBeenCalledOnce()
  })

  it('server renders compound state and hydrates without mismatches', async () => {
    const render = () =>
      h(PageHeader as Component, { as: 'header', hasBorder: true }, () => [
        h(Fragment, null, [
          h(PageHeader.TitleArea, { variant: { narrow: 'medium', regular: 'large' } }, () =>
            h(PageHeader.Title, null, () => 'Title'),
          ),
        ]),
        h(
          PageHeader.Navigation,
          { as: 'nav', 'aria-label': 'Local', hidden: { narrow: true } },
          () => h('a', { href: '/tab' }, 'Tab'),
        ),
      ])
    const html = await renderToString(createSSRApp({ render }))
    expect(html).toContain('data-title-size-variant-regular="large"')
    expect(html).toContain('data-nav-hidden-narrow="true"')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const host = document.createElement('div')
    host.innerHTML = html
    document.body.append(host)
    const app = createSSRApp({ render })
    app.mount(host)
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
    expect(host.querySelector('h2')?.textContent).toBe('Title')
    app.unmount()
    host.remove()
  })
})
