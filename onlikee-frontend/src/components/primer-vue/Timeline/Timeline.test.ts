// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { h } from 'vue'
import TimelineDefault, {
  Timeline,
  TimelineActions,
  TimelineAvatar,
  type TimelineSectionInstance,
} from './index'
import { FeatureFlags } from '../FeatureFlags'
import { TimelineBadgeVariants } from './constants'
import { GitMergeIcon } from '@onlikee/octicons-vue'
import { Avatar } from '../Avatar'
import { Button } from '../Button'
import { Link } from '../Link'
import { BranchName } from '../BranchName'
import { RelativeTime } from '../RelativeTime'
import { Label } from '../Label'

const wrappers: VueWrapper[] = []
afterEach(() => wrappers.splice(0).forEach((wrapper) => wrapper.unmount()))

it.each([false, true])('renders the source list semantics with flag %s', async (enabled) => {
  const wrapper = mount(FeatureFlags, {
    props: { flags: { primer_react_timeline_list_semantics: enabled } },
    slots: {
      default: () =>
        h(Timeline, { id: 'events', className: 'custom' }, () => [
          h(Timeline.Item, { condensed: true }, () => 'Event'),
          h(Timeline.Break, { title: 'Gap', className: 'custom-break' }),
        ]),
    },
  })
  wrappers.push(wrapper)
  function check(list: boolean) {
    const root = wrapper.get('#events')
    expect(root.element.tagName).toBe(list ? 'OL' : 'DIV')
    expect(root.attributes('role')).toBe(list ? 'list' : undefined)
    expect(root.classes()).toContain('custom')
    expect(root.element.children[0]?.tagName).toBe(list ? 'LI' : 'DIV')
    expect(root.element.children[0]?.getAttribute('data-condensed')).toBe('')
    const gap = root.get('[title="Gap"]')
    expect(gap.element.tagName).toBe(list ? 'LI' : 'DIV')
    expect(gap.attributes('role')).toBe(list ? 'presentation' : undefined)
    expect(gap.classes()).toContain('custom-break')
    expect((root.element.children[0] as HTMLElement).textContent).toBe('Event')
  }
  check(enabled)
  await wrapper.setProps({ flags: { primer_react_timeline_list_semantics: !enabled } })
  check(!enabled)
  const timeline = wrapper.findComponent(Timeline)
  const instance = timeline.vm as unknown as { element: HTMLElement | null }
  const item = wrapper.findComponent(Timeline.Item)
  const itemInstance = item.vm as unknown as { element: HTMLElement | null }
  const gap = wrapper.findComponent(Timeline.Break)
  const gapInstance = gap.vm as unknown as { element: HTMLElement | null }
  expect(instance.element).toBe(timeline.element)
  expect(itemInstance.element).toBe(item.element)
  expect(gapInstance.element).toBe(gap.element)
  wrapper.unmount()
  wrappers.pop()
  expect(instance.element).toBeNull()
  expect(itemInstance.element).toBeNull()
  expect(gapInstance.element).toBeNull()
})

it.each([
  [undefined, undefined],
  [false, undefined],
  [true, 'both'],
  ['both', 'both'],
  ['start', 'start'],
  ['end', 'end'],
] as const)('resolves clipSidebar %s to %s', (clipSidebar, expected) => {
  const wrapper = mount(Timeline, { props: { clipSidebar } })
  wrappers.push(wrapper)
  expect(wrapper.attributes('data-clip-sidebar')).toBe(expected)
})

it('exports all source compound components and the default Timeline', () => {
  expect(TimelineDefault).toBe(Timeline)
  expect(Timeline.Avatar).toBe(TimelineAvatar)
  expect(Timeline.Actions).toBe(TimelineActions)
})

it.each(TimelineBadgeVariants)(
  'forwards %s variant and native bindings to the inner badge only',
  async (variant) => {
    const click = vi.fn()
    const wrapper = mount(Timeline.Badge, {
      props: { variant, className: 'source' },
      attrs: {
        id: 'badge',
        class: 'vue',
        style: { paddingTop: 3 },
        'aria-label': 'Merged',
        'data-variant': 'override',
        onClick: click,
      },
      slots: { default: () => h(GitMergeIcon) },
    })
    wrappers.push(wrapper)
    const badge = wrapper.get('#badge')
    expect(badge.element).not.toBe(wrapper.element)
    expect(badge.classes()).toEqual(expect.arrayContaining(['source', 'vue']))
    expect(badge.attributes('data-variant')).toBe(variant)
    expect(badge.attributes('variant')).toBeUndefined()
    expect(badge.attributes('aria-label')).toBe('Merged')
    expect((badge.element as HTMLElement).style.paddingTop).toBe('3px')
    expect(badge.find('svg').exists()).toBe(true)
    expect(wrapper.attributes('id')).toBeUndefined()
    expect(wrapper.classes()).not.toContain('source')
    await badge.trigger('click')
    expect(click).toHaveBeenCalledOnce()
  },
)

it('omits the badge variant when not supplied, including an attempted data-variant override', () => {
  const wrapper = mount(Timeline.Badge, { attrs: { 'data-variant': 'done' } })
  wrappers.push(wrapper)
  expect(wrapper.get('div > div').attributes('data-variant')).toBeUndefined()
})

it.each(['Body', 'Avatar', 'Actions'] as const)(
  'forwards %s attributes, events, styles and a cleared DOM ref',
  async (name) => {
    const click = vi.fn()
    const wrapper = mount(Timeline[name], {
      props: { className: 'source' },
      attrs: {
        class: 'vue',
        id: name,
        style: { marginTop: 4, opacity: 0.5 },
        title: 'Title',
        onClick: click,
      },
      slots: { default: () => 'Content' },
    })
    wrappers.push(wrapper)
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['source', 'vue']))
    expect(wrapper.attributes()).toMatchObject({ id: name, title: 'Title' })
    expect((wrapper.element as HTMLElement).style.marginTop).toBe('4px')
    expect((wrapper.element as HTMLElement).style.opacity).toBe('0.5')
    expect(wrapper.text()).toBe('Content')
    const instance = wrapper.vm as unknown as TimelineSectionInstance
    expect(instance.element).toBe(wrapper.element)
    await wrapper.trigger('click')
    expect(click).toHaveBeenCalledOnce()
    wrapper.unmount()
    wrappers.pop()
    expect(instance.element).toBeNull()
  },
)

it.each([false, true])(
  'keeps source marker precedence and native list attributes with flag %s',
  (enabled) => {
    const wrapper = mount(FeatureFlags, {
      props: { flags: { primer_react_timeline_list_semantics: enabled } },
      slots: {
        default: () =>
          h(
            Timeline,
            {
              role: 'navigation',
              clipSidebar: 'end',
              'data-clip-sidebar': 'start',
              reversed: true,
              start: 3,
            },
            () => [
              h(Timeline.Item, { condensed: false, 'data-condensed': 'override', value: 4 }),
              h(Timeline.Break, { role: 'separator' }),
            ],
          ),
      },
    })
    wrappers.push(wrapper)
    const root = wrapper.findComponent(Timeline)
    expect(root.attributes('role')).toBe(enabled ? 'list' : 'navigation')
    expect(root.attributes('data-clip-sidebar')).toBe('end')
    expect(root.attributes('start')).toBe('3')
    expect(root.attributes('reversed')).toBeDefined()
    expect(root.findComponent(Timeline.Item).attributes('value')).toBe('4')
    expect(root.findComponent(Timeline.Item).attributes('data-condensed')).toBeUndefined()
    expect(root.findComponent(Timeline.Break).attributes('role')).toBe(
      enabled ? 'presentation' : 'separator',
    )
  },
)

it.each([false, true])(
  'composes Avatar, icons, Link, BranchName, RelativeTime, Label and Button with list flag %s',
  async (enabled) => {
    const clicked = vi.fn()
    const wrapper = mount(FeatureFlags, {
      props: { flags: { primer_react_timeline_list_semantics: enabled } },
      slots: {
        default: () =>
          h(Timeline, null, () => [
            h(Timeline.Item, null, () => [
              h(Timeline.Avatar, null, () => h(Avatar, { alt: 'Monalisa', size: 40 })),
              h(Timeline.Badge, { variant: 'done' }, () =>
                h(GitMergeIcon, { 'aria-label': 'Merged' }),
              ),
              h(Timeline.Body, null, () => [
                h(Link, { href: '#actor' }, () => 'Monalisa'),
                ' merged into ',
                h(BranchName, { href: '#main' }, () => 'main'),
                h(RelativeTime, { datetime: '2026-10-17T00:00:00Z' }),
                h(Label, null, () => 'Verified'),
              ]),
              h(Timeline.Actions, null, () =>
                h(Button, { onClick: clicked }, () => 'View details'),
              ),
            ]),
            h(Timeline.Break),
            h(Timeline.Item, { condensed: true }, () => h(Timeline.Body, null, () => 'Next event')),
          ]),
      },
    })
    wrappers.push(wrapper)
    await flushPromises()
    const root = wrapper.findComponent(Timeline)
    expect([...root.element.children].map((node) => node.tagName)).toEqual(
      enabled ? ['LI', 'LI', 'LI'] : ['DIV', 'DIV', 'DIV'],
    )
    expect(root.get('[data-variant="done"] svg').attributes('aria-label')).toBe('Merged')
    expect(
      root.findComponent(Timeline.Avatar).get('[data-component="Avatar"]').attributes('aria-label'),
    ).toBe('Monalisa')
    expect(root.get('a[href="#actor"]').text()).toBe('Monalisa')
    expect(root.get('a[href="#main"]').text()).toBe('main')
    expect(root.get('relative-time').attributes('datetime')).toBe('2026-10-17T00:00:00Z')
    expect(root.text()).toContain('Verified')
    await root.get('button').trigger('click')
    expect(clicked).toHaveBeenCalledOnce()
  },
)
