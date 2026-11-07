// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Local fixtures exercise slots and component composition. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import {
  createSSRApp,
  defineComponent,
  h,
  nextTick,
  ref,
  shallowRef,
  type Component,
  type VNodeChild,
} from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createMemoryHistory, createRouter, RouterLink } from 'vue-router'
import {
  Banner,
  BannerTitle,
  BannerDescription,
  BannerPrimaryAction,
  BannerSecondaryAction,
} from './index'
import { Button, IconButton } from '../Button'
import { Dialog } from '../Dialog'
import { Link } from '../Link'
import { Stack } from '../Stack'

const wrappers: VueWrapper[] = []
type Slots = Record<string, () => VNodeChild>
function render(props: Record<string, unknown> = {}, slots: Slots = {}) {
  const wrapper = mount(Banner, {
    props: { title: 'Banner title', ...props },
    slots,
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  return wrapper
}
const action = (component: Component, label: string, props: Record<string, unknown> = {}) =>
  h(component, props, () => label)

afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('Banner', () => {
  it('exports the compound components and removes the old notification service', () => {
    expect(Banner.Title).toBe(BannerTitle)
    expect(Banner.Description).toBe(BannerDescription)
    expect(Banner.PrimaryAction).toBe(BannerPrimaryAction)
    expect(Banner.SecondaryAction).toBe(BannerSecondaryAction)
    for (const name of ['info', 'success', 'warning', 'critical', 'upsell', 'error', 'close']) {
      expect(name in Banner).toBe(false)
    }
  })

  it('renders one section in place and names the landmark using its h2 title', () => {
    const wrapper = render()
    expect(wrapper.element.tagName).toBe('SECTION')
    expect(wrapper.attributes()).toMatchObject({
      'data-component': 'Banner',
      'data-variant': 'info',
      'data-actions-layout': 'default',
      'data-layout': 'default',
      tabindex: '-1',
      'aria-labelledby': wrapper.get('h2').attributes('id'),
    })
    expect(wrapper.get('h2').text()).toBe('Banner title')
    expect(wrapper.attributes('aria-label')).toBeUndefined()
    expect(wrapper.find('[data-component="IconButton"]').exists()).toBe(false)
    expect(document.querySelector('#banner-host')).toBeNull()
    expect(document.querySelectorAll('section')).toHaveLength(1)
  })

  it('renders the full hierarchy with rich description, actions and IconButton', () => {
    const wrapper = render({
      title: h('strong', 'Important'),
      description: h(Link, { href: '#details' }, () => 'Details'),
      primaryAction: action(Banner.PrimaryAction, 'Primary'),
      secondaryAction: action(Banner.SecondaryAction, 'Secondary'),
      onDismiss: vi.fn(),
    })
    for (const name of ['Icon', 'Content', 'Title', 'Description', 'Actions']) {
      expect(wrapper.find(`[data-component="Banner.${name}"]`).exists()).toBe(true)
    }
    expect(wrapper.get('h2 strong').text()).toBe('Important')
    expect(wrapper.get('[data-component="Banner.Description"]').element.tagName).toBe('DIV')
    expect(wrapper.get('a').attributes('href')).toBe('#details')
    expect(wrapper.findComponent(Button).exists()).toBe(true)
    expect(wrapper.findComponent(IconButton).exists()).toBe(true)
    expect(wrapper.attributes('data-dismissible')).toBe('')
    expect(wrapper.attributes('data-has-actions')).toBe('')
    const rows = wrapper.get('[data-component="Banner.Actions"]').element.children
    expect(Array.from(rows[0]!.children, (child) => child.textContent)).toEqual([
      'Secondary',
      'Primary',
    ])
    expect(Array.from(rows[1]!.children, (child) => child.textContent)).toEqual([
      'Primary',
      'Secondary',
    ])
  })

  it.each(['critical', 'info', 'success', 'upsell', 'warning'] as const)(
    'preserves the title association and default visual for %s',
    (variant) => {
      const wrapper = render({ variant })
      expect(wrapper.attributes('data-variant')).toBe(variant)
      expect(wrapper.attributes('aria-labelledby')).toBe(wrapper.get('h2').attributes('id'))
      expect(wrapper.find('[data-component="Banner.Icon"] svg').exists()).toBe(true)
    },
  )

  it('gives aria-labelledby precedence over aria-label and reacts to changes', async () => {
    const wrapper = render({ 'aria-label': 'Custom name' })
    expect(wrapper.attributes('aria-label')).toBe('Custom name')
    expect(wrapper.attributes('aria-labelledby')).toBeUndefined()
    await wrapper.setProps({ 'aria-labelledby': 'external-name' })
    expect(wrapper.attributes('aria-labelledby')).toBe('external-name')
    expect(wrapper.attributes('aria-label')).toBeUndefined()
    await wrapper.setProps({ 'aria-labelledby': undefined, 'aria-label': undefined })
    expect(wrapper.attributes('aria-labelledby')).toBe(wrapper.get('h2').attributes('id'))
    expect(wrapper.attributes('aria-label')).toBeUndefined()
  })

  it('uses the provided Title as the landmark name and isolates nested title contexts', () => {
    const wrapper = render(
      { title: undefined },
      {
        default: () => [
          h(Banner.Title, null, () => 'Outer title'),
          h(Banner.Description, null, () => 'Description'),
          h(Banner, null, { default: () => h(Banner.Title, { as: 'h3' }, () => 'Inner title') }),
        ],
      },
    )
    const headings = wrapper.findAll('[data-component="Banner.Title"]')
    const sections = wrapper.findAll('section')
    expect(headings[0]!.attributes('id')).not.toBe(headings[1]!.attributes('id'))
    expect(sections[0]!.attributes('aria-labelledby')).toBe(headings[0]!.attributes('id'))
    expect(sections[1]!.attributes('aria-labelledby')).toBe(headings[1]!.attributes('id'))
    expect(wrapper.get('h3').text()).toBe('Inner title')
  })

  it('supports an explicit Title id together with explicit aria-labelledby', () => {
    const wrapper = render(
      { title: undefined, 'aria-labelledby': 'custom-title' },
      {
        default: () => h(Banner.Title, { id: 'custom-title' }, () => 'Explicit title'),
      },
    )
    expect(wrapper.attributes('aria-labelledby')).toBe('custom-title')
    expect(wrapper.get('h2').attributes('id')).toBe('custom-title')
  })

  it('reports a missing title instead of inventing a default title', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() => mount(Banner)).toThrow('Expected a title to be provided')
  })

  it('retains an accessible heading when the generated title is hidden', async () => {
    const wrapper = render({ hideTitle: true })
    expect(wrapper.attributes('data-title-hidden')).toBe('')
    expect(wrapper.get('h2').text()).toBe('Banner title')
    expect(wrapper.get('h2').element.parentElement?.tagName).toBe('SPAN')
    expect(wrapper.attributes('aria-labelledby')).toBe(wrapper.get('h2').attributes('id'))
    await wrapper.setProps({ hideTitle: false })
    expect(wrapper.attributes('data-title-hidden')).toBeUndefined()
    expect(wrapper.get('h2').element.parentElement?.dataset.component).toBe('Banner.Content')
  })

  it('keeps custom compound headings visible when hideTitle is set without a title prop', () => {
    const wrapper = render(
      { title: undefined, hideTitle: true },
      {
        default: () => h(Banner.Title, null, () => 'Custom title'),
      },
    )
    expect(wrapper.get('h2').element.parentElement?.dataset.component).toBe('Banner.Content')
  })

  it.each(['info', 'upsell'] as const)('allows custom visuals only for %s', async (variant) => {
    const wrapper = render({ variant, icon: h('svg', { id: 'deprecated-icon' }) })
    expect(wrapper.find('#deprecated-icon').exists()).toBe(true)
    await wrapper.setProps({ leadingVisual: h('svg', { id: 'leading-visual' }) })
    expect(wrapper.find('#leading-visual').exists()).toBe(true)
    expect(wrapper.find('#deprecated-icon').exists()).toBe(false)
    for (const nextVariant of ['critical', 'success', 'warning'] as const) {
      await wrapper.setProps({ variant: nextVariant })
      expect(wrapper.find('#leading-visual').exists()).toBe(false)
      expect(wrapper.find('#deprecated-icon').exists()).toBe(false)
      expect(wrapper.find('[data-component="Banner.Icon"] svg').exists()).toBe(true)
    }
  })

  it('renders slots and updates optional content without remounting the Banner', async () => {
    const expanded = ref(false)
    const Fixture = defineComponent({
      setup: () => () =>
        h(Banner, null, {
          title: () => h('strong', expanded.value ? 'Expanded' : 'Collapsed'),
          description: () => (expanded.value ? h(Link, { href: '#more' }, () => 'More') : null),
          leadingVisual: () => h('svg', { id: 'slot-icon' }),
          primaryAction: () => (expanded.value ? action(Banner.PrimaryAction, 'Continue') : null),
          default: () => h('p', 'Custom content'),
        }),
    })
    const wrapper = mount(Fixture)
    wrappers.push(wrapper)
    const section = wrapper.get('section').element
    expect(wrapper.get('h2 strong').text()).toBe('Collapsed')
    expect(wrapper.find('[data-component="Banner.Description"]').exists()).toBe(false)
    expect(wrapper.find('[data-component="Banner.Actions"]').exists()).toBe(false)
    expect(wrapper.attributes('data-has-actions')).toBeUndefined()
    expect(wrapper.find('#slot-icon').exists()).toBe(true)
    expanded.value = true
    await nextTick()
    expect(wrapper.get('section').element).toBe(section)
    expect(wrapper.get('h2 strong').text()).toBe('Expanded')
    expect(wrapper.get('a').attributes('href')).toBe('#more')
    expect(wrapper.attributes('data-has-actions')).toBe('')
    expect(wrapper.findAll('[data-component="Banner.PrimaryAction"]')).toHaveLength(2)
    expect(wrapper.get('p').text()).toBe('Custom content')
    expanded.value = false
    await nextTick()
    expect(wrapper.attributes('data-has-actions')).toBeUndefined()
    expect(wrapper.find('[data-component="Banner.Actions"]').exists()).toBe(false)
  })

  it('only requests dismissal and leaves visibility controlled by the caller', async () => {
    const onDismiss = vi.fn()
    const wrapper = render({ onDismiss })
    const dismiss = wrapper.get('[data-component="IconButton"]')
    const labelId = dismiss.attributes('aria-labelledby')
    expect(labelId).toBeTruthy()
    expect(document.getElementById(labelId!)?.textContent).toBe('Dismiss banner')
    expect(dismiss.attributes('data-variant')).toBe('invisible')
    await dismiss.trigger('click')
    expect(onDismiss).toHaveBeenCalledOnce()
    expect(wrapper.find('section').exists()).toBe(true)
    await wrapper.setProps({ onDismiss: undefined })
    expect(wrapper.find('[data-component="IconButton"]').exists()).toBe(false)
    expect(wrapper.attributes('data-dismissible')).toBeUndefined()
  })

  it('does not schedule automatic dismissal', () => {
    vi.useFakeTimers()
    try {
      const onDismiss = vi.fn()
      const wrapper = render({ onDismiss })
      vi.advanceTimersByTime(60_000)
      expect(onDismiss).not.toHaveBeenCalled()
      expect(wrapper.find('section').exists()).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it('forwards section attributes, style, classes and events and exposes the native element', async () => {
    const click = vi.fn()
    const wrapper = render({
      id: 'notice',
      className: 'source-class',
      class: 'vue-class',
      style: { maxWidth: '500px' },
      'data-testid': 'notice',
      'aria-describedby': 'details',
      onClick: click,
    })
    expect(wrapper.attributes()).toMatchObject({
      id: 'notice',
      'data-testid': 'notice',
      'aria-describedby': 'details',
    })
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['source-class', 'vue-class']))
    expect((wrapper.element as HTMLElement).style.maxWidth).toBe('500px')
    await wrapper.trigger('click')
    expect(click).toHaveBeenCalledOnce()
    expect((wrapper.vm as unknown as { element: HTMLElement }).element).toBe(wrapper.element)
    ;(wrapper.vm as unknown as { element: HTMLElement }).element.focus()
    expect(document.activeElement).toBe(wrapper.element)
  })

  it.each(['default', 'inline', 'stacked'] as const)(
    'supports %s actions layout',
    (actionsLayout) => {
      expect(render({ actionsLayout }).attributes('data-actions-layout')).toBe(actionsLayout)
    },
  )

  it('updates compact layout and flush presence attributes', async () => {
    const wrapper = render({ layout: 'compact', flush: true })
    expect(wrapper.attributes('data-layout')).toBe('compact')
    expect(wrapper.attributes('data-flush')).toBe('')
    await wrapper.setProps({ layout: 'default', flush: false })
    expect(wrapper.attributes('data-layout')).toBe('default')
    expect(wrapper.attributes('data-flush')).toBeUndefined()
  })

  it.each(['h2', 'h3', 'h4', 'h5', 'h6'] as const)(
    'supports %s for Title with native attrs',
    async (as) => {
      const click = vi.fn()
      const wrapper = render(
        { title: undefined },
        {
          default: () =>
            h(
              Banner.Title,
              {
                as,
                className: 'source-heading',
                class: 'vue-heading',
                'data-testid': 'heading',
                onClick: click,
              },
              () => 'Custom title',
            ),
        },
      )
      const heading = wrapper.get(as)
      expect(heading.attributes('data-banner-title')).toBe('')
      expect(heading.attributes('data-testid')).toBe('heading')
      expect(heading.classes()).toEqual(expect.arrayContaining(['source-heading', 'vue-heading']))
      await heading.trigger('click')
      expect(click).toHaveBeenCalledOnce()
    },
  )

  it('renders Description independently and forwards div attrs, classes and rich children', () => {
    const wrapper = mount(Banner.Description, {
      props: { id: 'details', className: 'source-description', class: 'vue-description' },
      slots: { default: () => h(Link, { href: '#guide' }, () => 'Guide') },
    })
    wrappers.push(wrapper)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('id')).toBe('details')
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['BannerDescription', 'source-description', 'vue-description']),
    )
    expect(wrapper.get('a').attributes('href')).toBe('#guide')
  })

  it.each([
    [Banner.PrimaryAction, 'Banner.PrimaryAction', 'default'],
    [Banner.SecondaryAction, 'Banner.SecondaryAction', 'invisible'],
  ] as const)(
    'forwards Button state, events and native ref from %s',
    async (component, marker, variant) => {
      const click = vi.fn()
      const wrapper = mount(component, {
        props: { type: 'submit', disabled: true, onClick: click, className: 'custom-action' },
        slots: { default: () => 'Continue' },
        attachTo: document.body,
      })
      wrappers.push(wrapper)
      const button = wrapper.get('button')
      expect(button.attributes('data-component')).toBe(marker)
      expect(button.attributes('data-variant')).toBe(variant)
      expect(button.attributes('type')).toBe('submit')
      expect(button.classes()).toContain('custom-action')
      ;(button.element as HTMLButtonElement).click()
      expect(click).not.toHaveBeenCalled()
      await wrapper.setProps({ disabled: false })
      await button.trigger('click')
      expect(click).toHaveBeenCalledOnce()
      expect(click.mock.calls[0]![0]).toBeInstanceOf(MouseEvent)
      expect((wrapper.vm as unknown as { element: HTMLElement }).element).toBe(button.element)
    },
  )

  it('preserves loading and anchor behavior through the action wrappers', () => {
    const wrapper = render(
      {},
      {
        primaryAction: () =>
          h(
            Banner.PrimaryAction,
            {
              as: 'a',
              href: '#upgrade',
              loading: true,
              loadingAnnouncement: 'Upgrading',
            },
            () => 'Upgrade',
          ),
        secondaryAction: () =>
          h(Banner.SecondaryAction, { as: 'a', href: '#details' }, () => 'Details'),
      },
    )
    expect(wrapper.findAll('a[href="#upgrade"]')).toHaveLength(2)
    expect(wrapper.findAll('a[href="#details"]')).toHaveLength(2)
    expect(wrapper.findAll('[data-component="Spinner"]')).toHaveLength(2)
    expect(wrapper.text()).toContain('Upgrading')
  })

  it('preserves explicit undefined type and omitted disabled props for custom action roots', () => {
    const Probe = defineComponent({
      inheritAttrs: false,
      setup:
        (_, { attrs, slots }) =>
        () =>
          h(
            'button',
            {
              ...attrs,
              'data-disabled-provided': Object.prototype.hasOwnProperty.call(attrs, 'disabled'),
            },
            slots.default?.(),
          ),
    })
    const omitted = mount(Banner.PrimaryAction, {
      props: { as: Probe },
      slots: { default: () => 'Default' },
    })
    const explicit = mount(Banner.SecondaryAction, {
      props: { as: Probe, type: undefined, disabled: undefined },
      slots: { default: () => 'Explicit' },
    })
    wrappers.push(omitted, explicit)
    expect(omitted.get('button').attributes('type')).toBe('button')
    expect(omitted.get('button').attributes('data-disabled-provided')).toBe('false')
    expect(explicit.get('button').attributes('type')).toBeUndefined()
    expect(explicit.get('button').attributes('data-disabled-provided')).toBe('true')
    expect(explicit.get('button').attributes('disabled')).toBeUndefined()
  })

  it('supports RouterLink actions and Link descriptions inside Stack', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }],
    })
    await router.push('/')
    await router.isReady()
    const Fixture = defineComponent({
      render: () =>
        h(Stack, { gap: 'normal' }, () => [
          h(
            Banner,
            { title: 'Upgrade' },
            {
              description: () => h(Link, { href: '#guide' }, () => 'Read the guide'),
              primaryAction: () =>
                h(Banner.PrimaryAction, { as: RouterLink, to: '/upgrade' }, () => 'Upgrade'),
            },
          ),
        ]),
    })
    const wrapper = mount(Fixture, { global: { plugins: [router] } })
    wrappers.push(wrapper)
    expect(wrapper.attributes('data-component')).toBe('Stack')
    expect(wrapper.get('[data-component="Banner.Description"] a').attributes('href')).toBe('#guide')
    const link = wrapper.findAll('[data-component="Banner.PrimaryAction"]')[0]!
    expect(link.element.tagName).toBe('A')
    expect(link.attributes('href')).toBe('/upgrade')
    await link.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/upgrade')
  })

  it('stays inside Dialog and allows its action to dismiss the controlled Banner', async () => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect() {}
        unobserve() {}
      },
    )
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )
    const show = ref(true)
    const onClose = vi.fn()
    const Fixture = defineComponent({
      render: () =>
        h(
          Dialog,
          { title: 'Settings', onClose },
          {
            default: () =>
              h(Stack, { gap: 'normal' }, () => [
                show.value
                  ? h(
                      Banner,
                      {
                        title: 'Settings warning',
                        flush: true,
                        onDismiss: () => {
                          show.value = false
                        },
                      },
                      {
                        primaryAction: () =>
                          h(
                            Banner.PrimaryAction,
                            {
                              onClick: () => {
                                show.value = false
                              },
                            },
                            () => 'Resolve',
                          ),
                      },
                    )
                  : null,
              ]),
          },
        ),
    })
    const wrapper = mount(Fixture, { attachTo: document.body })
    wrappers.push(wrapper)
    await nextTick()
    await flushPromises()
    const dialog = document.querySelector('[role="dialog"]')!
    const banner = dialog.querySelector('[data-component="Banner"]')!
    expect(banner).not.toBeNull()
    expect(banner.closest('[data-component="Dialog.Body"]')).not.toBeNull()
    expect(banner.hasAttribute('data-flush')).toBe(true)
    ;(banner.querySelector('[data-component="Banner.PrimaryAction"]') as HTMLButtonElement).click()
    await nextTick()
    expect(dialog.querySelector('[data-component="Banner"]')).toBeNull()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('hydrates stable title IDs and retains interactive action refs', async () => {
    const click = vi.fn()
    const button = shallowRef<{ element: HTMLElement } | null>(null)
    const renderTree = () =>
      h(Stack, null, () => [
        h(
          Banner,
          { title: 'Server title', hideTitle: true },
          {
            primaryAction: () =>
              h(Banner.PrimaryAction, { ref: button, onClick: click }, () => 'Continue'),
          },
        ),
        h(Banner, null, { default: () => h(Banner.Title, null, () => 'Compound server title') }),
      ])
    const host = document.createElement('div')
    host.innerHTML = await renderToString(createSSRApp({ render: renderTree }))
    document.body.appendChild(host)
    const titleIds = Array.from(host.querySelectorAll('section'), (section) =>
      section.getAttribute('aria-labelledby'),
    )
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const app = createSSRApp({ render: renderTree })
    try {
      app.mount(host)
      await nextTick()
      expect(
        Array.from(host.querySelectorAll('section'), (section) =>
          section.getAttribute('aria-labelledby'),
        ),
      ).toEqual(titleIds)
      for (const id of titleIds) expect(host.querySelector(`[id="${id}"]`)).not.toBeNull()
      expect(warn).not.toHaveBeenCalled()
      expect(error).not.toHaveBeenCalled()
      expect(button.value?.element).toBeInstanceOf(HTMLButtonElement)
      button.value?.element.click()
      expect(click).toHaveBeenCalledOnce()
    } finally {
      app.unmount()
    }
  })
})
