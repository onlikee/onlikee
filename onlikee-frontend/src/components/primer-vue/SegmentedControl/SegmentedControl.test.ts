// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Fixtures exercise slot wrappers and controlled state. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, nextTick, shallowRef, type VNode } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { SegmentedControl } from './index'
import { asSlot } from '../composables/useSlots'

const wrappers: VueWrapper[] = []
const Icon = () => h('svg', { 'data-testid': 'icon', width: 16, height: 16 })
const button = (label: string, props = {}) => h(SegmentedControl.Button, props, () => label)
function render(children: () => VNode[], props = {}) {
  const wrapper = mount(
    defineComponent({
      setup: () => () => h(SegmentedControl, { 'aria-label': 'View', ...props }, children),
    }),
    { attachTo: document.body },
  )
  wrappers.push(wrapper)
  return wrapper
}
async function settle() {
  await nextTick()
  await flushPromises()
  await new Promise((resolve) => setTimeout(resolve, 0))
  await nextTick()
}
async function openMenu(wrapper: VueWrapper) {
  await wrapper.get('[data-component="ActionMenu.Button"]').trigger('click')
  await settle()
  return document.querySelector('[role="menu"]')!
}
function click(element: Element) {
  element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
}
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('SegmentedControl source contracts', () => {
  it('renders list semantics, forwards attributes and selects the first button', () => {
    const wrapper = render(() => [button('All'), button('Active')], {
      className: 'custom',
      id: 'view',
      'aria-describedby': 'caption',
      size: 'small',
      variant: 'subtle',
    })
    const list = wrapper.get('ul')
    expect(list.attributes()).toMatchObject({
      'data-component': 'SegmentedControl',
      'aria-label': 'View',
      'aria-describedby': 'caption',
      id: 'view',
      'data-size': 'small',
      'data-variant': 'subtle',
    })
    expect(list.classes()).toContain('custom')
    expect(wrapper.findAll('button').map((item) => item.attributes('aria-pressed'))).toEqual([
      'true',
      'false',
    ])
    expect(wrapper.get('.segmentedControl-text').attributes('data-text')).toBe('All')
  })

  it('changes uncontrolled selection and calls the original child listener once', async () => {
    const onClick = vi.fn()
    const wrapper = render(() => [button('All'), button('Active', { onClick })])
    await wrapper.findAll('button')[1]!.trigger('click')
    expect(onClick).toHaveBeenCalledOnce()
    expect(wrapper.findAll('button')[1]!.attributes('aria-pressed')).toBe('true')
  })

  it('honors controlled selection, external updates and callback order', async () => {
    const selected = shallowRef(1)
    const calls: string[] = []
    const wrapper = render(
      () => [
        button('All', { selected: selected.value === 0, onClick: () => calls.push('click') }),
        button('Active', { selected: selected.value === 1 }),
      ],
      { onChange: (i: number) => calls.push(`change:${i}`) },
    )
    await wrapper.findAll('button')[0]!.trigger('click')
    expect(calls).toEqual(['change:0', 'click'])
    expect(wrapper.findAll('button')[1]!.attributes('aria-pressed')).toBe('true')
    selected.value = 0
    await nextTick()
    expect(wrapper.findAll('button')[0]!.attributes('aria-pressed')).toBe('true')
  })

  it('treats explicitly false defaultSelected as uncontrolled and reads kebab-case props', async () => {
    const onChange = vi.fn()
    const wrapper = render(
      () => [
        button('All', { 'default-selected': false }),
        button('Active', { 'default-selected': '' }),
      ],
      { onChange },
    )
    expect(wrapper.findAll('button')[1]!.attributes('aria-pressed')).toBe('true')
    await wrapper.findAll('button')[0]!.trigger('click')
    expect(wrapper.findAll('button')[0]!.attributes('aria-pressed')).toBe('true')
    expect(onChange).toHaveBeenCalledWith(0)
  })

  it.each([
    { disabled: true },
    { disabled: '' },
    { 'aria-disabled': true },
    { 'aria-disabled': 'true' },
  ])('keeps disabled segments focusable and suppresses selection: %j', async (disabled) => {
    const onClick = vi.fn()
    const onChange = vi.fn()
    const wrapper = render(
      () => [button('All', { defaultSelected: true }), button('Active', { ...disabled, onClick })],
      { onChange },
    )
    const target = wrapper.findAll('button')[1]!
    expect(target.attributes('disabled')).toBeUndefined()
    expect(target.attributes('aria-disabled')).toBe('true')
    await target.trigger('click')
    expect(onClick).not.toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('renders CounterLabel including zero and prefers visual nodes over deprecated icons', () => {
    const wrapper = render(() => [
      button('All', { count: 0, leadingVisual: h('svg', { id: 'node' }), leadingIcon: Icon }),
      button('Active', { count: '20+', leadingIcon: Icon }),
    ])
    expect(wrapper.findAll('[data-component="CounterLabel"]').map((node) => node.text())).toEqual([
      '0',
      '20+',
    ])
    expect(wrapper.findAll('svg')).toHaveLength(2)
    expect(wrapper.find('#node').exists()).toBe(true)
    expect(wrapper.text()).toContain('(0)')
  })

  it('uses Tooltip for icon labels and descriptions while preserving button attributes', () => {
    const wrapper = render(() => [
      h(SegmentedControl.IconButton, {
        'aria-label': 'Preview',
        icon: Icon,
        defaultSelected: true,
        className: 'on-item',
      }),
      h(SegmentedControl.IconButton, {
        'aria-label': 'Code',
        icon: h('svg'),
        description: 'View raw code',
        tooltipDirection: 'n',
        id: 'code',
      }),
    ])
    const buttons = wrapper.findAll('button')
    expect(wrapper.get('[data-component="SegmentedControl.IconButton"]').classes()).toContain(
      'on-item',
    )
    expect(buttons[0]!.attributes('aria-labelledby')).toBeTruthy()
    expect(document.getElementById(buttons[0]!.attributes('aria-labelledby')!)?.textContent).toBe(
      'Preview',
    )
    expect(buttons[0]!.attributes('aria-label')).toBeUndefined()
    expect(buttons[1]!.attributes('aria-label')).toBe('Code')
    expect(document.getElementById(buttons[1]!.attributes('aria-describedby')!)?.textContent).toBe(
      'View raw code',
    )
    expect(wrapper.get('#code').attributes('aria-pressed')).toBe('false')
    expect(wrapper.findAll('[data-component="Tooltip"]')[1]!.attributes('data-direction')).toBe('n')
  })

  it('excludes wrapped dividers from segment indices and supports wrapped action slots', async () => {
    const Divider = asSlot(
      defineComponent({ setup: () => () => h(SegmentedControl.Divider) }),
      SegmentedControl.Divider,
    )
    const Action = asSlot(
      defineComponent({
        setup: () => () => h(SegmentedControl.Action, { label: 'Add', icon: Icon }),
      }),
      SegmentedControl.Action,
    )
    const onChange = vi.fn()
    const wrapper = render(() => [button('All'), h(Divider), button('Active'), h(Action)], {
      onChange,
    })
    await wrapper.findAll('ul button')[1]!.trigger('click')
    expect(onChange).toHaveBeenCalledWith(1)
    expect(
      wrapper.get('[data-component="SegmentedControl.Divider"]').attributes('aria-hidden'),
    ).toBe('true')
    expect(wrapper.get('[data-component="SegmentedControl.Action"]').text()).toContain('Add')
  })

  it('renders dropdown options, divider, selected icon and text; selection closes the menu', async () => {
    const onClick = vi.fn()
    const wrapper = render(
      () => [
        button('All', { leadingVisual: h('svg', { 'data-menu-icon': '' }) }),
        h(SegmentedControl.Divider, { className: 'divider' }),
        button('Active', { onClick }),
      ],
      { variant: { narrow: 'dropdown' } },
    )
    expect(wrapper.get('[data-component="ActionMenu.Button"]').attributes('aria-label')).toBe(
      'All, View',
    )
    expect(wrapper.find('[data-component="ActionMenu.Button"] [data-menu-icon]').exists()).toBe(
      true,
    )
    const menu = await openMenu(wrapper)
    expect(menu).not.toBeNull()
    expect(menu.querySelector('.divider')).not.toBeNull()
    expect(menu.querySelectorAll('[role="menuitemradio"]')).toHaveLength(2)
    click(menu.querySelectorAll('[role="menuitemradio"]')[1]!)
    await settle()
    expect(onClick).toHaveBeenCalledOnce()
    expect(document.querySelector('[role="menu"]')).toBeNull()
    expect(wrapper.get('[data-component="ActionMenu.Button"]').attributes('aria-label')).toBe(
      'Active, View',
    )
    expect(wrapper.findAll('ul button')[1]!.attributes('aria-pressed')).toBe('true')
  })

  it('preserves source dropdown behavior: disabled segment props are not forwarded to menu items', async () => {
    const onClick = vi.fn()
    const wrapper = render(() => [button('All'), button('Active', { disabled: true, onClick })], {
      variant: { narrow: 'dropdown' },
    })
    const menu = await openMenu(wrapper)
    const item = menu.querySelectorAll('[role="menuitemradio"]')[1]!
    expect(item.hasAttribute('aria-disabled')).toBe(false)
    click(item)
    await settle()
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('recognizes wrapped dividers and actions in the dropdown through slot markers', async () => {
    const onClick = vi.fn()
    const onChange = vi.fn()
    const Divider = asSlot(
      defineComponent({ setup: () => () => h(SegmentedControl.Divider) }),
      SegmentedControl.Divider,
    )
    const Action = asSlot(
      defineComponent({
        setup: () => () => h(SegmentedControl.Action, { label: 'Add', icon: Icon, onClick }),
      }),
      SegmentedControl.Action,
    )
    const wrapper = render(() => [button('All'), h(Divider), button('Active'), h(Action)], {
      variant: { narrow: 'dropdown' },
      onChange,
    })
    const menu = await openMenu(wrapper)
    expect(menu.querySelectorAll('[data-component="ActionList.Divider"]')).toHaveLength(2)
    click(menu.querySelector('[role="menuitem"]')!)
    expect(onClick).toHaveBeenCalledExactlyOnceWith()
    expect(onChange).not.toHaveBeenCalled()
    expect(document.querySelector('[role="menu"]')).not.toBeNull()
    click(menu.querySelectorAll('[role="menuitemradio"]')[1]!)
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('renders Action in both contexts; menu action adds segments without selecting or closing', async () => {
    const views = shallowRef(['All', 'Active'])
    const add = vi.fn(() => {
      views.value = [...views.value, 'New view']
    })
    const wrapper = render(
      () => [
        ...views.value.map((label) => button(label)),
        h(SegmentedControl.Action, { label: 'Add view', icon: Icon, onClick: add }),
      ],
      {
        variant: { narrow: 'dropdown', regular: 'subtle' },
        fullWidth: { narrow: true, regular: false },
        size: 'small',
      },
    )
    expect(wrapper.get('div').attributes()).toMatchObject({
      'data-full-width-narrow': 'true',
      'data-full-width-regular': 'false',
      'data-size': 'small',
    })
    const menu = await openMenu(wrapper)
    const action = menu.querySelector('[role="menuitem"]')!
    expect(action.getAttribute('data-component')).toBe('SegmentedControl.Action')
    expect(
      action
        .closest('[data-component="ActionList.Item"]')
        ?.previousElementSibling?.getAttribute('data-component'),
    ).toBe('ActionList.Divider')
    click(action)
    await settle()
    expect(add).toHaveBeenCalledExactlyOnceWith()
    expect(document.querySelector('[role="menu"]')).not.toBeNull()
    expect(document.querySelectorAll('[role="menuitemradio"]')).toHaveLength(3)
    expect(wrapper.get('[data-component="ActionMenu.Button"]').attributes('aria-label')).toBe(
      'All, View',
    )
    await wrapper.get('[data-component="IconButton"]').trigger('click')
    expect(add).toHaveBeenCalledTimes(2)
  })

  it.each([{ disabled: true }, { loading: true }])(
    'suppresses the menu Action callback for %j',
    async (state) => {
      const onClick = vi.fn()
      const wrapper = render(
        () => [
          button('All'),
          h(SegmentedControl.Action, { label: 'Add', icon: Icon, onClick, ...state }),
        ],
        { variant: { narrow: 'dropdown' } },
      )
      const menu = await openMenu(wrapper)
      click(menu.querySelector('[role="menuitem"]')!)
      expect(onClick).not.toHaveBeenCalled()
      expect(document.querySelector('[role="menu"]')).not.toBeNull()
    },
  )

  it('disables knob transitions only when segment count changes and cancels pending frames', async () => {
    const frame = vi.fn((_callback: FrameRequestCallback) => 42)
    const cancel = vi.fn()
    vi.stubGlobal('requestAnimationFrame', frame)
    vi.stubGlobal('cancelAnimationFrame', cancel)
    const views = shallowRef(['All'])
    const wrapper = render(() => views.value.map((label) => button(label)))
    expect(wrapper.get('ul').attributes('data-disable-knob-transition')).toBeUndefined()
    views.value = ['All', 'Active']
    await nextTick()
    expect(wrapper.get('ul').attributes('data-disable-knob-transition')).toBe('')
    frame.mock.calls[0]![0](0)
    expect(wrapper.get('ul').attributes('data-disable-knob-transition')).toBeUndefined()
    views.value = ['All']
    await nextTick()
    wrapper.unmount()
    wrappers.pop()
    expect(cancel).toHaveBeenCalledWith(42)
  })

  it('warns for a missing accessible label', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(() => [button('All')], { 'aria-label': undefined })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('aria-labelledby'))
  })

  it('preserves native styles and user overrides on root, buttons and dividers', () => {
    const wrapper = render(
      () => [
        button('All', { style: { marginTop: 3, '--separator-color': 'red' } }),
        h(SegmentedControl.Divider, { style: { marginLeft: 6 } }),
      ],
      { style: { marginTop: 4 } },
    )
    expect((wrapper.get('ul').element as HTMLElement).style.marginTop).toBe('4px')
    expect((wrapper.get('button').element as HTMLElement).style.marginTop).toBe('3px')
    expect(
      (wrapper.get('button').element as HTMLElement).style.getPropertyValue('--separator-color'),
    ).toBe('red')
    expect(
      (wrapper.get('[data-component="SegmentedControl.Divider"]').element as HTMLElement).style
        .marginLeft,
    ).toBe('6px')
  })

  it('renders SSR markup with responsive variants, counters and both action contexts', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(
            SegmentedControl,
            {
              'aria-labelledby': 'label',
              variant: { narrow: 'dropdown', regular: 'subtle' },
              fullWidth: true,
            },
            () => [
              button('All', { defaultSelected: true, count: 5 }),
              h(SegmentedControl.Action, { icon: Icon, label: 'Add' }),
            ],
          ),
      }),
    )
    expect(html).toContain('aria-labelledby="label"')
    expect(html).toContain('data-variant-narrow="dropdown"')
    expect(html).toContain('data-component="CounterLabel"')
    expect(html).toContain('data-component="SegmentedControl.Action"')
    expect(html).toContain('data-full-width="true"')
  })
})
