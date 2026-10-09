// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Test fixtures exercise wrapper and provider contracts. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, Fragment, h, nextTick, reactive, shallowReactive } from 'vue'
import { ActionList, type ActionListContainerContextValue } from './index'
import { FeatureFlags } from '../FeatureFlags'
import { asSlot } from '../composables/useSlots'

const wrappers: VueWrapper[] = []
const Icon = () => h('svg', { 'data-icon': '', width: 16, height: 16 })
const item = (props = {}, children: unknown[] = ['Label']) =>
  h(ActionList.Item, props, { default: () => children })
const group = (props = {}, children: unknown[] = []) =>
  h(ActionList.Group, props, { default: () => children })
const heading = (props = {}, text = 'Group') =>
  h(ActionList.GroupHeading, props, { default: () => text })
function render(
  children: unknown[] = [],
  props = {},
  context?: ActionListContainerContextValue,
  flags?: Record<string, boolean>,
) {
  const wrapper = mount(
    defineComponent({
      setup: () => () => {
        const list = h(ActionList, props, { default: () => children })
        return flags ? h(FeatureFlags, { flags }, { default: () => list }) : list
      },
    }),
    {
      attachTo: document.body,
      global: { provide: context ? { [ActionList.ContainerContext as symbol]: context } : {} },
    },
  )
  wrappers.push(wrapper)
  return wrapper
}
function click(el: Element) {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
}
beforeEach(() =>
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  ),
)
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('ActionList complete source contracts', () => {
  it('extracts Heading before the list and shares custom/generated IDs', () => {
    const wrapper = render([
      h(
        ActionList.Heading,
        { as: 'h2', id: 'title', size: 'small', class: 'custom' },
        { default: () => 'Title' },
      ),
      item(),
    ])
    expect(wrapper.get('h2').attributes('id')).toBe('title')
    expect(
      wrapper
        .get('h2')
        .classes()
        .some((name) => name.includes('action-list-header_')),
    ).toBe(true)
    expect(wrapper.get('h2').classes()).toContain('custom')
    expect(wrapper.get('ul').attributes('aria-labelledby')).toBe('title')
    expect(wrapper.get('ul').find('h2').exists()).toBe(false)
    const generated = render([
      h(ActionList.Heading, { as: 'h3', visuallyHidden: true }, { default: () => 'Hidden' }),
    ])
    expect(generated.get('ul').attributes('aria-labelledby')).toBe(
      generated.get('h3').attributes('id'),
    )
    expect(
      generated
        .get('h3')
        .classes()
        .some((name) => name.includes('action-list-visually-hidden_')),
    ).toBe(true)
  })
  it('preserves native attrs and root polymorphism', () => {
    const wrapper = render([item()], {
      as: 'ol',
      class: 'consumer',
      className: 'legacy',
      id: 'list',
      style: { marginTop: 5 },
      'aria-label': 'Actions',
    })
    expect(wrapper.get('ol').classes()).toEqual(expect.arrayContaining(['consumer', 'legacy']))
    expect(
      wrapper
        .get('ol')
        .classes()
        .some((name) => name.includes('action-list_')),
    ).toBe(true)
    expect(wrapper.get('ol').attributes('id')).toBe('list')
    expect(wrapper.get('ol').attributes('style')).toContain('margin-top: 5px')
    expect(wrapper.get('ol').attributes('aria-label')).toBe('Actions')
  })
  it('supports Vue components for root and link polymorphism with native element refs', async () => {
    const List = defineComponent({
      inheritAttrs: false,
      setup:
        (_props, { attrs, slots }) =>
        () =>
          h('ol', attrs, slots.default?.()),
    })
    const Link = defineComponent({
      inheritAttrs: false,
      setup:
        (_props, { attrs, slots }) =>
        () =>
          h('a', attrs, slots.default?.()),
    })
    const onClick = vi.fn()
    const wrapper = render(
      [
        item({ role: 'menuitem' }),
        h(
          ActionList.LinkItem,
          { as: Link, href: '#custom', role: 'menuitem', onClick },
          { default: () => 'Custom link' },
        ),
      ],
      { as: List, role: 'menu' },
    )
    await nextTick()
    expect(wrapper.get('ol').attributes('data-component')).toBe('ActionList')
    const list = wrapper.findComponent(ActionList).vm as unknown as { element: HTMLElement }
    expect(list.element.tagName).toBe('OL')
    const link = wrapper.findComponent(ActionList.LinkItem).vm as unknown as {
      element: HTMLElement
    }
    expect(link.element.tagName).toBe('A')
    click(wrapper.get('a').element)
    expect(onClick).toHaveBeenCalledTimes(1)
  })
  it('LinkItem exposes its link in role lists and clears the ref when inactive', async () => {
    const props = reactive({
      inactiveText: undefined as string | undefined,
      privateTooltipText: 'Link details',
    })
    const LiveLink = defineComponent({
      setup: () => () =>
        h(ActionList.LinkItem, { ...props, href: '#link' }, { default: () => 'Link' }),
    })
    const wrapper = render([h(LiveLink)], { role: 'menu' })
    const link = wrapper.findComponent(ActionList.LinkItem)
    const instance = link.vm as unknown as { element: HTMLElement | null; focus: () => void }
    expect(instance.element?.tagName).toBe('A')
    instance.focus()
    expect(document.activeElement).toBe(wrapper.get('a').element)
    props.inactiveText = 'Unavailable'
    await nextTick()
    expect(instance.element).toBeNull()
    expect(wrapper.find('a').exists()).toBe(false)
    props.inactiveText = undefined
    await nextTick()
    expect(instance.element?.tagName).toBe('A')
  })
  it('group automatic labels retain the source array and element coercion', () => {
    const labels = [
      h(ActionList.GroupHeading, {}, { default: () => ['A', 'B'] }),
      h(ActionList.GroupHeading, {}, { default: () => h('strong', 'Title') }),
      h(ActionList.GroupHeading, {}, { default: () => ['A', null] }),
      h(ActionList.GroupHeading, {}, { default: () => ['A', false] }),
    ]
    const wrapper = render(
      labels.map((label) => group({}, [label, item()])),
      { role: 'menu', disableFocusZone: true },
    )
    expect(wrapper.findAll('ul[role=group]').map((node) => node.attributes('aria-label'))).toEqual([
      'A,B',
      '[object Object]',
      'A,',
      'A,false',
    ])
  })
  it('default lists retain Tab order and do not capture arrows', async () => {
    const wrapper = render([item(), item()])
    await nextTick()
    const buttons = wrapper.findAll('button')
    buttons[0].element.focus()
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    })
    buttons[0].element.dispatchEvent(event)
    expect(document.activeElement).toBe(buttons[0].element)
    expect(event.defaultPrevented).toBe(false)
    expect(buttons.map((button) => button.attributes('tabindex'))).toEqual(['0', '0'])
  })
  it('listbox stops at its edge and disableFocusZone restores native tabindex', async () => {
    const props = reactive({ role: 'listbox', selectionVariant: 'single', disableFocusZone: false })
    const wrapper = render([item(), item()], props)
    await nextTick()
    const options = wrapper.findAll('[role=option]')
    const lastOption = options[1].element as HTMLElement
    lastOption.focus()
    options[1].element.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }),
    )
    expect(document.activeElement).toBe(options[1].element)
    props.disableFocusZone = true
    await nextTick()
    expect(options.map((option) => option.attributes('tabindex'))).toEqual(['0', '0'])
  })
  it('reacts to container overrides and applies afterSelect only when not prevented', async () => {
    const afterSelect = vi.fn()
    const context = shallowReactive<ActionListContainerContextValue>({
      container: 'ActionMenu',
      listRole: 'menu',
      listLabelledBy: 'trigger',
      selectionVariant: 'single',
      afterSelect,
    })
    const prevent = vi.fn((event: Event) => event.preventDefault())
    const wrapper = render([item({ onSelect: prevent, selected: true }), item()], {}, context)
    await nextTick()
    expect(wrapper.get('ul').attributes('aria-labelledby')).toBe('trigger')
    const options = wrapper.findAll('[role=menuitemradio]')
    expect(options[0].attributes('aria-checked')).toBe('true')
    click(options[0].element)
    expect(prevent).toHaveBeenCalledTimes(1)
    expect(afterSelect).not.toHaveBeenCalled()
    click(options[1].element)
    expect(afterSelect).toHaveBeenCalledTimes(1)
    context.selectionVariant = 'multiple'
    await nextTick()
    expect(wrapper.findAll('[role=menuitemcheckbox]')).toHaveLength(2)
  })
  it('container selectionAttribute overrides the inferred attribute for selectable roles', () => {
    const wrapper = render(
      [item({ selected: false }), item({ role: 'button', selected: true })],
      { role: 'listbox', selectionVariant: 'single' },
      { selectionAttribute: 'aria-checked', enableFocusZone: false },
    )
    expect(wrapper.get('[role=option]').attributes('aria-checked')).toBe('false')
    expect(wrapper.get('[role=option]').attributes('aria-selected')).toBeUndefined()
    expect(wrapper.get('[role=button]').attributes('aria-checked')).toBeUndefined()
  })
  it('defaultTrailingVisual does not add its ID to aria-labelledby', () => {
    const wrapper = render(
      [item({ id: 'test' })],
      {},
      { defaultTrailingVisual: h('span', 'Default') },
    )
    expect(wrapper.get('[data-component="ActionList.TrailingVisual"]').text()).toBe('Default')
    expect(wrapper.get('button').attributes('aria-labelledby')).toBe('test--label')
  })
  it('tablist infers tab without adding a selection attribute or focus zone', async () => {
    const wrapper = render([item({ selected: true })], {
      role: 'tablist',
      selectionVariant: 'single',
    })
    await nextTick()
    expect(wrapper.get('li').attributes('role')).toBe('tab')
    expect(wrapper.get('li').attributes('aria-selected')).toBeUndefined()
    expect(wrapper.get('li').attributes('tabindex')).toBe('0')
  })
  it('group uses heading ID, native attrs and explicit selection override', () => {
    const wrapper = render(
      [
        group({ class: 'custom', id: 'group', selectionVariant: 'multiple' }, [
          heading({ as: 'h3', id: 'group-title', class: 'heading-class' }),
          item({ selected: true }),
        ]),
      ],
      { selectionVariant: 'single' },
    )
    expect(wrapper.get('li[class*="action-list-group_"]').attributes('id')).toBe('group')
    expect(
      wrapper
        .get('h3')
        .classes()
        .some((name) => name.includes('action-list-group-heading_')),
    ).toBe(true)
    expect(wrapper.get('h3').classes()).toContain('heading-class')
    expect(wrapper.get('ul[class*="action-list-group-list_"]').attributes('aria-labelledby')).toBe(
      'group-title',
    )
    expect(wrapper.find('[class*="action-list-checkbox_"]').exists()).toBe(true)
  })
  it('group false hides markers while retaining the source item role inference', () => {
    const wrapper = render([group({ selectionVariant: false }, [item({ selected: true })])], {
      role: 'listbox',
      selectionVariant: 'single',
      disableFocusZone: true,
    })
    expect(wrapper.find('[data-component="ActionList.Selection"]').exists()).toBe(false)
    expect(wrapper.get('[role=option]').attributes('aria-selected')).toBe('true')
  })
  it('role groups use presentational headings and accessible group labels', () => {
    const wrapper = render(
      [
        group({}, [heading({}, 'Options'), item()]),
        group({ 'aria-label': 'Explicit' }, [heading({}, 'Other'), item()]),
      ],
      { role: 'listbox', selectionVariant: 'single', disableFocusZone: true },
    )
    const unlabeled = render([group({}, [item()])], { role: 'menu', disableFocusZone: true })
    expect(unlabeled.get('ul[role=group]').attributes('aria-label')).toBeUndefined()
    const groups = wrapper.findAll('ul[role=group]')
    expect(groups.map((node) => node.attributes('aria-label'))).toEqual(['Options', 'Explicit'])
    expect(groups[0].attributes('aria-labelledby')).toBeUndefined()
    const presentation = wrapper.get('[data-component=GroupHeadingWrap]')
    expect(presentation.attributes('role')).toBe('presentation')
    expect(presentation.attributes('aria-hidden')).toBe('true')
    expect(presentation.find('span').exists()).toBe(true)
  })
  it('keeps deprecated group title behavior, including suppression when both forms exist', () => {
    const wrapper = render([
      group({ title: 'Old', auxiliaryText: 'Meta', variant: 'filled' }, [item()]),
      group({ title: 'Hidden' }, [heading({ as: 'h3' }), item()]),
    ])
    expect(wrapper.findAll('[data-component=GroupHeadingWrap]')).toHaveLength(1)
    expect(wrapper.get('h3').text()).toBe('Old')
    expect(wrapper.get('[data-component=GroupHeadingWrap]').attributes('data-variant')).toBe(
      'filled',
    )
    expect(wrapper.text()).not.toContain('Hidden')
  })
  it('rejects headings without a level in ordinary lists and levels in listboxes', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() => render([group({}, [heading()])])).toThrow('requires a heading level')
    expect(() => render([group({}, [heading({ as: 'h3' })])], { role: 'listbox' })).toThrow(
      'do not need a heading level',
    )
    warn.mockRestore()
  })
  it('rejects list Heading in ActionMenu contexts', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() =>
      render([h(ActionList.Heading, { as: 'h2' })], {}, { container: 'ActionMenu' }),
    ).toThrow("shouldn't be used")
  })
  it('renders text, icon and link trailing actions as separate controls', () => {
    const onSelect = vi.fn(),
      onClick = vi.fn()
    const wrapper = render([
      item({ onSelect }, ['Label', h(ActionList.TrailingAction, { label: 'Edit', onClick })]),
      item({}, ['Icon', h(ActionList.TrailingAction, { label: 'Manage', icon: Icon })]),
      item({}, ['Link', h(ActionList.TrailingAction, { as: 'a', href: '#test', label: 'Open' })]),
    ])
    const action = wrapper.get('[data-component="ActionList.TrailingAction"]')
    expect(action.element.parentElement?.tagName).toBe('LI')
    expect(action.get('button').text()).toBe('Edit')
    expect(action.get('button').attributes('type')).toBe('button')
    expect(action.get('button').attributes('data-component')).toBe('Button')
    click(action.get('button').element)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onSelect).not.toHaveBeenCalled()
    const iconAction = wrapper.findAll('[data-component="ActionList.TrailingAction"]')[1]
    expect(iconAction.find('[data-icon]').exists()).toBe(true)
    expect(iconAction.get('[data-component="IconButton"]').attributes('aria-label')).toBe(undefined)
    expect(wrapper.get('a').attributes('href')).toBe('#test')
    expect(wrapper.get('a').attributes('type')).toBe('button')
    expect(wrapper.get('a').attributes('disabled')).toBeUndefined()
  })
  it('keeps text actions tooltip-free and maps Link props to data attributes', () => {
    const wrapper = render([
      item({}, [
        'Label',
        h(ActionList.TrailingAction, {
          label: 'Edit',
          'aria-label': 'Edit action',
          description: 'Should not create a text-action tooltip',
        }),
      ]),
      h(
        ActionList.LinkItem,
        { href: '#link', inline: true, muted: true },
        { default: () => 'Link' },
      ),
    ])
    const textAction = wrapper.get('[data-component="ActionList.TrailingAction"]')
    expect(textAction.find('[data-component="Tooltip"]').exists()).toBe(false)
    expect(wrapper.get('a').attributes('data-inline')).toBe('true')
    expect(wrapper.get('a').attributes('data-muted')).toBe('true')
  })
  it('hides actions on inactive/loading items and rejects menu container actions', () => {
    const action = () => h(ActionList.TrailingAction, { label: 'Edit' })
    const wrapper = render([
      item({ inactiveText: 'No' }, ['A', action()]),
      item({ loading: true }, ['B', action()]),
    ])
    expect(wrapper.find('[data-component="ActionList.TrailingAction"]').exists()).toBe(false)
    expect(wrapper.find('[data-has-trailing-action]').exists()).toBe(false)
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() =>
      render([item({}, ['A', action()])], { role: 'menu' }, { container: 'ActionMenu' }),
    ).toThrow('can not be used')
    expect(
      render([item({}, ['A', action()])], { role: 'listbox' })
        .find('[data-component="ActionList.TrailingAction"]')
        .exists(),
    ).toBe(true)
  })
  it('trailing action loading exposes only rendered-action loading state', () => {
    const onClick = vi.fn()
    const wrapper = render([
      item({}, ['A', h(ActionList.TrailingAction, { label: 'Edit', loading: true, onClick })]),
    ])
    expect(wrapper.get('li').attributes('data-trailing-action-loading')).toBe('true')
    expect(wrapper.find('[data-loading=true]').exists()).toBe(true)
    click(wrapper.get('button[class*="action-list-trailing-action-button_"]').element)
    expect(onClick).not.toHaveBeenCalled()
  })
  it('group heading actions keep the disabled-flag nesting and enabled-flag sibling layout', () => {
    const children = () => [
      group({}, [
        h(
          ActionList.GroupHeading,
          { as: 'h3' },
          {
            default: () => [
              'Group',
              h(ActionList.GroupHeading.TrailingAction, { icon: Icon, label: 'Edit' }),
            ],
          },
        ),
        item(),
      ]),
    ]
    const off = render(children())
    expect(
      off.get('h3').find('[data-component="ActionList.GroupHeading.TrailingAction"]').exists(),
    ).toBe(true)
    const on = render(children(), {}, undefined, {
      primer_react_action_list_group_heading_trailing_action: true,
    })
    expect(on.get('h3').find('button').exists()).toBe(false)
    expect(on.get('[data-component=GroupHeadingWrap]').attributes('data-has-trailing-action')).toBe(
      '',
    )
    expect(
      on.get('[class*="action-list-group-heading-action_"] button').attributes('data-size'),
    ).toBe('small')
  })
  it('keeps the React Button type when a group heading action is rendered as a link', () => {
    const wrapper = render([
      group({}, [
        h(
          ActionList.GroupHeading,
          { as: 'h3' },
          {
            default: () => [
              'Group',
              h(ActionList.GroupHeading.TrailingAction, {
                as: 'a',
                href: '#edit',
                icon: Icon,
                label: 'Edit',
              }),
            ],
          },
        ),
      ]),
    ])
    expect(
      wrapper.get('[data-component="ActionList.GroupHeading.TrailingAction"]').attributes('type'),
    ).toBe('button')
  })
  it('rejects enabled group actions in semantic menus and applies the NavList gap flag only in that container', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() =>
      render(
        [
          group({}, [
            h(
              ActionList.GroupHeading,
              {},
              {
                default: () => [
                  'Group',
                  h(ActionList.GroupHeading.TrailingAction, { icon: Icon, label: 'Edit' }),
                ],
              },
            ),
          ]),
        ],
        { role: 'menu' },
        undefined,
        { primer_react_action_list_group_heading_trailing_action: true },
      ),
    ).toThrow('only supported')
    const flags = { primer_react_action_list_item_gap: true }
    expect(
      render([item()], {}, { container: 'NavList' }, flags).get('ul').attributes('data-item-gap'),
    ).toBe('')
    expect(
      render([item()], { disableItemGap: true }, { container: 'NavList' }, flags)
        .get('ul')
        .attributes('data-item-gap'),
    ).toBeUndefined()
    expect(
      render([item()], {}, undefined, flags).get('ul').attributes('data-item-gap'),
    ).toBeUndefined()
  })
  it('inactive items prefer warning indicators over loading and block activation', () => {
    const onSelect = vi.fn()
    const wrapper = render([
      item({ id: 'inactive', inactiveText: 'Permission required', loading: true, onSelect }),
    ])
    expect(wrapper.find('[data-component=Spinner]').exists()).toBe(false)
    expect(wrapper.find('[class*="action-list-inactive-button-reset_"]').exists()).toBe(true)
    expect(wrapper.get('li').attributes('tabindex')).toBeUndefined()
    click(wrapper.get('li').element)
    expect(onSelect).not.toHaveBeenCalled()
    const menu = render([item({ id: 'm', inactiveText: 'No', onSelect })], {
      role: 'listbox',
      selectionVariant: 'single',
      disableFocusZone: true,
    })
    expect(menu.get('li').attributes('aria-describedby')).toBe('m--warning-message')
    expect(menu.get('[class*="action-list-inactive-warning_"]').text()).toBe('No')
    expect(menu.find('[class*="action-list-inactive-button-reset_"]').exists()).toBe(false)
  })
  it('truncated descriptions choose Tooltip ownership for buttons and title for list semantics', async () => {
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(200)
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(50)
    const desc = () =>
      h(
        ActionList.Description,
        { truncate: true, 'data-ignored': 'yes' },
        { default: () => [h('strong', 'Full text')] },
      )
    const button = render([item({}, ['Label', desc()])])
    await nextTick()
    await nextTick()
    expect(button.get('[class*="action-list-truncate_"]').element.tagName).toBe('DIV')
    expect(button.get('[class*="action-list-truncate_"]').attributes('title')).toBe('')
    expect(
      button.get('[class*="action-list-description_"]').attributes('data-ignored'),
    ).toBeUndefined()
    expect(button.get('[data-component=Tooltip]').text()).toBe('Full text')
    const list = render([item({}, ['Label', desc()])], {
      role: 'listbox',
      selectionVariant: 'single',
      disableFocusZone: true,
    })
    await nextTick()
    expect(list.get('[class*="action-list-truncate_"]').attributes('title')).toBe('Full text')
    expect(list.find('[data-component=Tooltip]').exists()).toBe(false)
    const block = render([
      item({}, [
        'Label',
        h(ActionList.Description, { variant: 'block', truncate: true }, { default: () => 'Block' }),
      ]),
    ])
    await nextTick()
    expect(block.get('[class*="action-list-description_"]').element.tagName).toBe('SPAN')
    expect(block.find('[data-component=Tooltip]').exists()).toBe(false)
  })
  it('preserves slot marker wrappers and flattens Vue fragments', () => {
    const Visual = asSlot(
      defineComponent({
        setup: () => () => h(ActionList.LeadingVisual, { class: 'wrapped' }, { default: Icon }),
      }),
      ActionList.LeadingVisual,
    )
    const wrapper = render([item({}, [h(Fragment, null, [h(Visual)]), 'Label'])])
    expect(wrapper.get('[class*="action-list-leading-visual_"]').classes()).toContain('wrapped')
    expect(wrapper.get('[class*="action-list-label_"]').find('svg').exists()).toBe(false)
  })
  it('ignores deprecated Item as and consumes legacy integration props', () => {
    const wrapper = render([
      item({
        as: 'a',
        groupId: 'group',
        renderItem: vi.fn(),
        handleAddItem: vi.fn(),
        type: 'submit',
        'data-native': 'yes',
      }),
    ])
    const button = wrapper.get('button')
    expect(button.attributes('type')).toBe('submit')
    expect(button.attributes('data-native')).toBe('yes')
    expect(button.attributes('groupid')).toBeUndefined()
    expect(wrapper.find('a').exists()).toBe(false)
  })
  it('exposes native elements for lists, buttons, list-semantic items, links and headings', () => {
    const wrapper = render([
      h(ActionList.Heading, { as: 'h2' }, { default: () => 'Title' }),
      item(),
      item({ role: 'option' }),
      h(ActionList.LinkItem, { href: '#link' }, { default: () => 'Link' }),
    ])
    const list = wrapper.findComponent(ActionList).vm as unknown as { element: HTMLElement }
    expect(list.element.tagName).toBe('UL')
    const items = wrapper.findAllComponents(ActionList.Item)
    expect((items[0].vm as unknown as { element: HTMLElement }).element.tagName).toBe('BUTTON')
    expect((items[1].vm as unknown as { element: HTMLElement }).element.tagName).toBe('LI')
    const link = wrapper.findComponent(ActionList.LinkItem).vm as unknown as {
      element: HTMLElement
      focus: () => void
    }
    expect(link.element.tagName).toBe('A')
    link.focus()
    expect(document.activeElement).toBe(link.element)
    expect(
      (wrapper.findComponent(ActionList.Heading).vm as unknown as { element: HTMLElement }).element
        .tagName,
    ).toBe('H2')
  })
})
