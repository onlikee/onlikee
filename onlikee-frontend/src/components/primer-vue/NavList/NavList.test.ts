// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Fixtures exercise compound slots, routers and custom links. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, defineComponent, Fragment, h, nextTick, shallowRef } from 'vue'
import type { VNodeChild } from 'vue'
import { createMemoryHistory, createRouter, RouterLink } from 'vue-router'
import { NavList, GroupExpand, type NavListItemInstance, type NavListGroupItem } from './index'
import { ActionList } from '../ActionList'
import { FeatureFlags } from '../FeatureFlags'
import { Link } from '../Link'
import { CounterLabel } from '../CounterLabel'
import { asSlot } from '../composables/useSlots'
import SlotsFixture from './NavListSlots.fixture.vue'

const wrappers: VueWrapper[] = []
const leaf = (text = 'Profile', props = {}, children: VNodeChild[] = []) =>
  h(NavList.Item<'a'>, { href: '#profile', ...props }, { default: () => [text, ...children] })
const subNav = (children: () => VNodeChild) => h(NavList.SubNav, null, { default: children })
const branch = (children: () => VNodeChild, props = {}) =>
  h(
    NavList.Item<'a'>,
    { href: '#ignored', ...props },
    { default: () => ['Account', subNav(children)] },
  )
const heading = (props = {}) => h(NavList.Heading, props, { default: () => 'Settings' })

function render(children: () => VNodeChild, props = {}, flags = {}) {
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          FeatureFlags,
          { flags },
          {
            default: () => h(NavList, props, { default: children }),
          },
        ),
    }),
    { attachTo: document.body },
  )
  wrappers.push(wrapper)
  return wrapper
}

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
})
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('NavList landmarks and headings', () => {
  it('extracts the heading ahead of the list and names the landmark with its generated ID', () => {
    const wrapper = render(() => [leaf(), heading()])
    const nav = wrapper.get('nav')
    const title = nav.get('h2')
    expect(nav.attributes('data-component')).toBe('NavList')
    expect(nav.attributes('aria-labelledby')).toBe(title.attributes('id'))
    expect(nav.element.firstElementChild).toBe(title.element)
    expect(nav.get('ul').find('h2').exists()).toBe(false)
    expect(title.attributes('data-component')).toBe('NavList.Heading')
    expect(title.attributes('data-variant')).toBe('small')
  })

  it.each([
    [{ 'aria-label': 'Custom' }, undefined],
    [{ 'aria-labelledby': 'external' }, 'external'],
    [{ 'aria-label': 'Custom', 'aria-labelledby': 'external' }, 'external'],
    [{ 'aria-label': '' }, 'fixed-title'],
    [{ 'aria-labelledby': '' }, ''],
  ])('preserves consumer accessible names: %j', (props, expected) => {
    const wrapper = render(() => [heading({ id: 'fixed-title' }), leaf()], props)
    expect(wrapper.get('nav').attributes('aria-labelledby')).toBe(expected)
    expect(wrapper.get('h2').attributes('id')).toBe('fixed-title')
  })

  it.each([
    [undefined, 'h3'],
    ['h2', 'h3'],
    ['h3', 'h4'],
  ] as const)('derives group levels below %s', (as, expected) => {
    const wrapper = render(() => [
      as ? heading({ as }) : null,
      h(NavList.Group, { title: 'Account' }, { default: () => leaf() }),
      h(NavList.Group, null, {
        default: () => [h(NavList.GroupHeading, null, { default: () => 'Projects' }), leaf()],
      }),
    ])
    expect(wrapper.findAll(expected).map((node) => node.text())).toEqual(['Account', 'Projects'])
  })

  it('updates heading hierarchy and names after a parent rerender', async () => {
    const level = shallowRef<'h2' | 'h3'>('h2')
    const wrapper = render(() => [
      heading({ as: level.value }),
      h(NavList.Group, { title: 'Account' }, { default: () => leaf() }),
    ])
    const id = wrapper.get('h2').attributes('id')
    level.value = 'h3'
    await nextTick()
    expect(wrapper.get('nav > h3').attributes('id')).toBe(id)
    expect(wrapper.get('h4').text()).toBe('Account')
  })

  it('keeps visually hidden headings semantic and forwards HTML, styles, classes and root refs', () => {
    const navRef = shallowRef<{ element: HTMLElement } | null>(null)
    const wrapper = render(
      () => [
        heading({
          visuallyHidden: true,
          title: 'Section',
          className: 'title',
          style: { marginLeft: 7 },
        }),
        leaf(),
      ],
      { id: 'nav', ref: navRef, style: { marginTop: 9 }, class: 'navigation' },
    )
    const title = wrapper.get('h2')
    expect(title.element.parentElement).toBe(wrapper.get('nav').element)
    expect(title.classes()).toContain('internal-visually-hidden')
    expect(title.classes()).toContain('title')
    expect(title.attributes('title')).toBe('Section')
    expect((title.element as HTMLElement).style.marginLeft).toBe('7px')
    expect(navRef.value?.element).toBe(wrapper.get('nav').element)
    expect(navRef.value?.element.style.marginTop).toBe('9px')
  })

  it('shares ActionList slot identities and exports the standalone GroupExpand', () => {
    for (const name of [
      'Description',
      'LeadingVisual',
      'TrailingVisual',
      'TrailingAction',
      'Divider',
    ] as const)
      expect(NavList[name]).toBe(ActionList[name])
    expect(GroupExpand).toBe(NavList.GroupExpand)
  })
})

describe('NavList.Item and composed links', () => {
  it.each(['native', 'Link'])(
    'updates leaf slot content through native and composed links: %s',
    async (name) => {
      const text = shallowRef('Before')
      const wrapper = render(() => leaf(text.value, { as: name === 'Link' ? Link : undefined }))
      text.value = 'After'
      await nextTick()
      expect(wrapper.get('a').text()).toBe('After')
    },
  )
  it.each(['page', 'step', 'location', 'date', 'time', 'true', true, 'false', false, undefined])(
    'maps aria-current=%s to the link and active row',
    (current) => {
      const wrapper = render(() => leaf('Profile', { 'aria-current': current }))
      expect(wrapper.get('a').attributes('aria-current')).toBe(
        current === undefined ? undefined : String(current),
      )
      expect(wrapper.get('li').attributes('data-active')).toBe(
        current && current !== 'false' ? 'true' : undefined,
      )
      expect(wrapper.get('a').attributes('data-component')).toBe('NavList.Item')
    },
  )

  it('composes Link, visual, description, counter, trailing action and DOM refs', async () => {
    const ref = shallowRef<NavListItemInstance | null>(null)
    const click = vi.fn()
    const action = vi.fn()
    const wrapper = render(() =>
      leaf('Profile', { as: Link, ref, onClick: click }, [
        h(NavList.LeadingVisual, null, { default: () => h('svg') }),
        h(NavList.Description, { variant: 'block' }, { default: () => 'Your account' }),
        h(NavList.TrailingVisual, null, {
          default: () => h(CounterLabel, null, { default: () => '8' }),
        }),
        h(NavList.TrailingAction, { label: 'Edit', onClick: action }),
      ]),
    )
    const link = wrapper.get('a')
    expect(ref.value?.element).toBe(link.element)
    expect(link.attributes('aria-describedby')).toBe(
      wrapper.get('[data-component="ActionList.Description"]').attributes('id'),
    )
    expect(link.attributes('aria-labelledby')?.split(' ')).toHaveLength(2)
    await link.trigger('click')
    await wrapper.get('button').trigger('click')
    expect(click).toHaveBeenCalledTimes(1)
    expect(action).toHaveBeenCalledTimes(1)
  })

  it('renders an inactive item without an anchor, interaction or exposed link ref', () => {
    const click = vi.fn()
    const ref = shallowRef<NavListItemInstance | null>(null)
    const wrapper = render(() =>
      leaf('Unavailable', { inactiveText: 'No access', onClick: click, ref }),
    )
    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.text()).toContain('Unavailable')
    expect(wrapper.get('li').attributes('data-inactive')).toBe('true')
    expect(ref.value?.element).toBeNull()
    expect(click).not.toHaveBeenCalled()
  })

  it('preserves numeric styles for custom links while normalizing native link styles', () => {
    let receivedStyle: unknown
    const CustomLink = defineComponent({
      inheritAttrs: false,
      setup:
        (_, { attrs, slots }) =>
        () => {
          receivedStyle = attrs.style
          const margin = (attrs.style as { marginLeft: number }).marginLeft
          return h('a', { ...attrs, style: { marginLeft: `${margin * 2}px` } }, slots.default?.())
        },
    })
    const wrapper = render(() => [
      leaf('Custom', { as: CustomLink, style: { marginLeft: 8 } }),
      leaf('Native', { style: { marginLeft: 8 } }),
    ])
    expect(receivedStyle).toEqual({ marginLeft: 8 })
    expect((wrapper.findAll('a')[0]!.element as HTMLElement).style.marginLeft).toBe('16px')
    expect((wrapper.findAll('a')[1]!.element as HTMLElement).style.marginLeft).toBe('8px')
  })

  it('supports RouterLink current-page semantics, navigation and custom component attributes', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { render: () => null } },
        { path: '/settings', component: { render: () => null } },
      ],
    })
    await router.push('/')
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(NavList, null, {
            default: () =>
              leaf('Router', {
                as: RouterLink,
                to: '/settings',
                href: undefined,
                'data-custom': 'yes',
              }),
          }),
      }),
      { attachTo: document.body, global: { plugins: [router] } },
    )
    wrappers.push(wrapper)
    expect(wrapper.get('a').attributes('href')).toBe('/settings')
    expect(wrapper.get('a').attributes('data-custom')).toBe('yes')
    await wrapper.get('a').trigger('click')
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/settings'))
    expect(wrapper.get('a').attributes('aria-current')).toBe('page')
  })

  it('warns about defaultOpen on a leaf', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(() => leaf('Profile', { defaultOpen: true }))
    expect(error).toHaveBeenCalledWith(
      'NavList.Item must have a NavList.SubNav to use defaultOpen.',
    )
  })
})

describe('NavList.SubNav', () => {
  it.each([false, true])(
    'updates tooltip-wrapped disclosure attributes and child slots (merged refs=%s)',
    async (flag) => {
      const text = shallowRef('Before')
      const wrapper = render(
        () => branch(() => leaf(text.value, { 'aria-current': 'page' }), { tooltipText: 'Help' }),
        {},
        { primer_react_merged_forwarded_refs: flag },
      )
      await wrapper.get('button').trigger('click')
      expect(wrapper.get('button').attributes('aria-expanded')).toBe('false')
      text.value = 'After'
      await nextTick()
      expect(wrapper.get('a').text()).toBe('After')
    },
  )
  it('renders a button with labelled and controlled subnav, filtering parent trailing actions and native props', async () => {
    const click = vi.fn()
    const itemRef = shallowRef<NavListItemInstance | null>(null)
    const wrapper = render(() =>
      h(
        NavList.Item<'a'>,
        {
          href: '#ignored',
          id: 'ignored',
          'aria-current': 'page',
          onClick: click,
          ref: itemRef,
        },
        {
          default: () => [
            'Account',
            h(NavList.TrailingAction, { label: 'Ignored' }),
            subNav(() => leaf('Profile', {}, [h(NavList.TrailingAction, { label: 'Edit' })])),
          ],
        },
      ),
    )
    const button = wrapper.get('button')
    const list = wrapper.get('[data-component="NavList.SubNav"]')
    expect(button.attributes('aria-expanded')).toBe('false')
    expect(button.attributes('aria-current')).toBeUndefined()
    expect(button.attributes('href')).toBeUndefined()
    expect(button.attributes('id')).not.toBe('ignored')
    expect(button.attributes('aria-controls')).toBe(list.attributes('id'))
    expect(list.attributes('aria-labelledby')).toBe(button.attributes('id'))
    expect(wrapper.findAll('button').map((node) => node.text())).not.toContain('Ignored')
    expect(itemRef.value?.element).toBeNull()
    await button.trigger('click')
    expect(button.attributes('aria-expanded')).toBe('true')
    expect(click).not.toHaveBeenCalled()
    await button.trigger('click')
    expect(button.attributes('aria-expanded')).toBe('false')
  })

  it.each([true, false, 'false', 'page', 'step', undefined])(
    'initializes current descendants (%s), even with defaultOpen=false',
    (current) => {
      const wrapper = render(() =>
        branch(() => leaf('Profile', { 'aria-current': current }), { defaultOpen: false }),
      )
      expect(wrapper.get('button').attributes('aria-expanded')).toBe(
        current && current !== 'false' ? 'true' : 'false',
      )
    },
  )

  it('marks a collapsed parent active and reopens when current descendants change', async () => {
    const current = shallowRef<string | undefined>('page')
    const wrapper = render(() => branch(() => leaf('Profile', { 'aria-current': current.value })))
    await wrapper.get('button').trigger('click')
    expect(wrapper.get('li').attributes('data-active')).toBe('true')
    current.value = 'step'
    await nextTick()
    expect(wrapper.get('button').attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('li').attributes('data-active')).toBeUndefined()
    current.value = undefined
    await nextTick()
    expect(wrapper.get('button').attributes('aria-expanded')).toBe('true')
  })

  it('detects current pages computed inside custom links after mount', async () => {
    const CustomLink = defineComponent({
      inheritAttrs: false,
      setup:
        (_, { attrs, slots }) =>
        () =>
          h('a', { ...attrs, 'aria-current': 'page' }, slots.default?.()),
    })
    const wrapper = render(() => branch(() => leaf('Profile', { as: CustomLink })))
    await nextTick()
    expect(wrapper.get('button').attributes('aria-expanded')).toBe('true')
  })

  it('limits nesting to four subnav levels and increments indentation', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const nested = (remaining: number): VNodeChild =>
      remaining === 0 ? leaf() : branch(() => nested(remaining - 1), { defaultOpen: true })
    const wrapper = render(() => nested(5))
    expect(wrapper.findAll('[data-component="NavList.SubNav"]')).toHaveLength(4)
    expect(
      wrapper
        .findAll('button')
        .map((button) => (button.element as HTMLElement).style.getPropertyValue('--subitem-depth')),
    ).toEqual(['0', '1', '2', '3', '4'])
    expect(error).toHaveBeenCalledWith('NavList.SubNav only supports four levels of nesting')
  })

  it('warns when used outside an Item and drops unsupported attributes', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = render(() =>
      h(NavList.SubNav, { id: 'ignored', title: 'ignored' }, { default: () => leaf() }),
    )
    expect(error).toHaveBeenCalledWith('NavList.SubNav must be a child of a NavList.Item')
    expect(wrapper.get('[data-component="NavList.SubNav"]').attributes('title')).toBeUndefined()
  })

  it('renders open on the server when a deeply nested item is current and hydrates without mismatches', async () => {
    const App = defineComponent({
      setup: () => () =>
        h(NavList, null, {
          default: () => [
            heading(),
            branch(() => branch(() => leaf('Current', { 'aria-current': 'page' }))),
          ],
        }),
    })
    const html = await renderToString(createSSRApp(App))
    expect(html.match(/aria-expanded="true"/g)).toHaveLength(2)
    const host = document.createElement('div')
    host.innerHTML = html
    document.body.append(host)
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const app = createSSRApp(App)
    app.mount(host)
    await nextTick()
    expect(warning.mock.calls.flat().join(' ')).not.toMatch(/hydration|mismatch/i)
    expect(host.querySelector('nav')?.getAttribute('aria-labelledby')).toBe(
      host.querySelector('h2')?.id,
    )
    app.unmount()
  })

  it.each([false, true])(
    'composes Tooltip with leaf and expandable items (merged refs=%s)',
    (flag) => {
      const wrapper = render(
        () => [
          leaf('Profile', { tooltipText: 'Profile help' }),
          branch(() => leaf(), { tooltipText: 'Account help' }),
        ],
        {},
        { primer_react_merged_forwarded_refs: flag },
      )
      const [leafTooltip, buttonTooltip] = wrapper.findAll('[role="tooltip"]')
      expect(leafTooltip).toBeDefined()
      expect(buttonTooltip).toBeDefined()
      expect(leafTooltip!.text()).toBe('Profile help')
      expect(buttonTooltip!.text()).toBe('Account help')
      expect(wrapper.get('a').attributes('aria-describedby')).toContain(
        leafTooltip!.attributes('id'),
      )
      expect(wrapper.get('button').attributes('aria-describedby')).toContain(
        buttonTooltip!.attributes('id'),
      )
    },
  )
})

describe('NavList.Group and GroupExpand', () => {
  it('updates compiler-generated conditional and loop fragments without duplicating headings', async () => {
    const wrapper = mount(SlotsFixture, {
      props: { showHeading: true, items: ['a', 'b'], current: 'a' },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    expect(wrapper.get('h4').text()).toBe('a')
    expect(wrapper.get('[data-component="ActionList.Group"] > ul').element.children).toHaveLength(3)
    expect(wrapper.get('button').attributes('aria-expanded')).toBe('true')
    await wrapper.setProps({ current: 'b', items: ['b', 'c'] })
    expect(wrapper.findAll('#b-heading')).toHaveLength(1)
    expect(wrapper.get('h4').text()).toBe('b')
    expect(
      wrapper
        .get('[data-component="ActionList.Group"] > ul')
        .findAll('a')
        .map((link) => link.text()),
    ).toEqual(['Fixed', 'b', 'c'])
    await wrapper.setProps({ showHeading: false })
    expect(wrapper.find('h4').exists()).toBe(false)
    expect(wrapper.get('h3').text()).toBe('Fallback')
    expect(wrapper.get('[data-component="ActionList.Group"] > ul').element.children).toHaveLength(2)
  })
  it.each([false, true])(
    'extracts a Fragment heading once and connects group labels (wrapped=%s)',
    (wrapped) => {
      const WrappedHeading = asSlot(
        defineComponent({
          inheritAttrs: false,
          setup:
            (_, { attrs, slots }) =>
            () =>
              h(NavList.GroupHeading, attrs, slots),
        }),
        NavList.GroupHeading,
      )
      const wrapper = render(() =>
        h(
          NavList.Group,
          { title: 'Ignored', 'aria-label': 'Templates' },
          {
            default: () => [
              h(Fragment, null, [
                h(Fragment, null, [
                  h(
                    wrapped ? WrappedHeading : NavList.GroupHeading,
                    { id: 'projects', as: 'h4' },
                    {
                      default: () => h(Link, { href: '#projects' }, { default: () => 'Projects' }),
                    },
                  ),
                  leaf(),
                ]),
              ]),
              leaf('Recent'),
            ],
          },
        ),
      )
      const group = wrapper.get('[data-component="ActionList.Group"]')
      const title = group.get('h4')
      const list = group.get('ul')
      expect(title.element.parentElement?.tagName).toBe('DIV')
      expect(title.element.parentElement?.parentElement).toBe(group.element)
      expect(wrapper.findAll('#projects')).toHaveLength(1)
      expect(list.find('h4').exists()).toBe(false)
      expect(list.attributes('aria-labelledby')).toBe('projects')
      expect(list.attributes('aria-label')).toBe('Templates')
      expect(list.element.children).toHaveLength(2)
      expect(wrapper.text()).not.toContain('Ignored')
    },
  )

  it.each([false, true])('controls the preceding divider (hideDivider=%s)', (hideDivider) => {
    const wrapper = render(() =>
      h(NavList.Group, { title: 'Account', hideDivider }, { default: () => leaf() }),
    )
    expect(wrapper.find('[data-component="ActionList.Divider"]').exists()).toBe(!hideDivider)
    expect(wrapper.get('h3').attributes('data-component')).toBe('ActionList.GroupHeading')
  })

  it('uses a list-item wrapper for standalone GroupHeading and composes group heading actions', () => {
    const wrapper = render(
      () => [
        h(NavList.GroupHeading, null, { default: () => 'Standalone' }),
        h(NavList.Group, null, {
          default: () => [
            h(NavList.GroupHeading, null, {
              default: () => [
                'Projects',
                h(ActionList.GroupHeading.TrailingAction, {
                  label: 'Edit projects',
                  icon: () => h('svg'),
                }),
              ],
            }),
            leaf(),
          ],
        }),
      ],
      {},
      { primer_react_action_list_group_heading_trailing_action: true },
    )
    expect(wrapper.get('h3').element.parentElement?.tagName).toBe('LI')
    expect(wrapper.get('button').attributes('aria-labelledby')).toBeTruthy()
    expect(wrapper.text()).toContain('Edit projects')
  })

  const items = Array.from({ length: 5 }, (_, i) => ({ text: `Item ${i}`, href: `#${i}` }))
  it.each([0, 2, 3])('expands pages=%s and focuses each newly revealed batch', async (pages) => {
    const ref = shallowRef<{ element: HTMLButtonElement | null } | null>(null)
    const wrapper = render(() => h(NavList.GroupExpand, { items, pages, ref }))
    expect(wrapper.findAll('a')).toHaveLength(0)
    expect(ref.value?.element).toBe(wrapper.get('button').element)
    const steps = pages || 1
    for (let page = 1; page <= steps; page++) {
      await wrapper.get('button').trigger('click')
      const amount = Math.ceil((items.length / steps) * page)
      expect(wrapper.findAll('a')).toHaveLength(amount)
      const focusIndex = page === 1 ? 0 : amount - Math.floor(items.length / pages)
      expect(document.activeElement).toBe(wrapper.findAll('a')[focusIndex]?.element)
    }
    expect(wrapper.find('button').exists()).toBe(false)
    expect(ref.value?.element).toBeNull()
  })

  it('supports default icons, trailing actions and custom renderItem focus markers across groups', async () => {
    const icon = () => h('svg', { 'data-icon': 'custom' })
    const customItems: NavListGroupItem[] = [
      {
        text: 'Extra',
        href: '#extra',
        leadingVisual: icon,
        trailingVisual: icon,
        trailingAction: { label: 'Edit' },
      },
    ]
    const calls = vi.fn((item: NavListGroupItem) => leaf(item.text, { ...item, as: Link }))
    const wrapper = render(() => [
      h(NavList.GroupExpand, { items: customItems, label: 'Default' }),
      h(NavList.GroupExpand, { items: customItems, label: 'Custom', renderItem: calls }),
    ])
    await wrapper.findAll('button')[0]!.trigger('click')
    expect(wrapper.findAll('svg[data-icon]')).toHaveLength(2)
    const second = wrapper.findAll('button').find((button) => button.text().includes('Custom'))!
    await second.trigger('click')
    expect(calls).toHaveBeenCalled()
    expect(calls.mock.calls[0]?.[0]['data-expand-focus-target']).toBeTruthy()
    expect(document.activeElement).toBe(wrapper.findAll('a')[1]?.element)
  })

  it.each([
    [false, false, false],
    [true, false, true],
    [true, true, false],
  ])('applies NavList gap flag=%s, disabled=%s', (flag, disableItemGap, expected) => {
    const wrapper = render(
      () => branch(() => leaf(), { defaultOpen: true }),
      { disableItemGap },
      { primer_react_action_list_item_gap: flag },
    )
    expect(wrapper.get('nav > ul').attributes('data-item-gap')).toBe(expected ? '' : undefined)
    expect(wrapper.get('nav').attributes('disableitemgap')).toBeUndefined()
  })
})
