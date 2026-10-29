// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Fixtures cover source slot and overlay composition. */
import { afterEach, describe, expect, test, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import {
  createCommentVNode,
  createSSRApp,
  createVNode,
  defineComponent,
  Fragment,
  h,
  nextTick,
  shallowRef,
} from 'vue'
import { renderToString } from '@vue/server-renderer'
import { UnderlinePanels, type UnderlinePanelsProps } from './index'
import { asSlot } from '../composables/useSlots'
import { AnchoredOverlay } from '../AnchoredOverlay'
import { Button } from '../Button'
import { TextInput } from '../TextInput'

const wrappers: VueWrapper[] = []
afterEach(() => {
  for (const wrapper of wrappers.splice(0)) wrapper.unmount()
  document.body.innerHTML = ''
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
function children(values = ['one', 'two', 'three']) {
  return values.flatMap((value) => [
    h(UnderlinePanels.Tab, { value }, () => value),
    h(UnderlinePanels.Panel, { value }, () => `${value} content`),
  ])
}
function fixture(props: UnderlinePanelsProps = {}, slot = children) {
  const wrapper = mount(UnderlinePanels, {
    attachTo: document.body,
    props: { id: 'panels', 'aria-label': 'Sections', ...props },
    slots: { default: () => slot() },
  })
  wrappers.push(wrapper)
  return wrapper
}
function selection(wrapper: VueWrapper, value: string, tabStop = value) {
  for (const tab of wrapper.findAll<HTMLElement>('[role="tab"]')) {
    expect(tab.attributes('aria-selected')).toBe(String(tab.element.id === `panels-tab-${value}`))
    expect(tab.element.tabIndex).toBe(tab.element.id === `panels-tab-${tabStop}` ? 0 : -1)
  }
  for (const panel of wrapper.findAll<HTMLElement>('[role="tabpanel"]')) {
    const selected = panel.element.id === `panels-panel-${value}`
    expect(panel.element.hidden).toBe(!selected)
    expect(panel.attributes('data-selected')).toBe(selected ? '' : undefined)
    expect(panel.attributes('aria-labelledby')).toBe(panel.element.id.replace('-panel-', '-tab-'))
  }
}
async function pointer(wrapper: VueWrapper, value: string) {
  const tab = wrapper.get<HTMLElement>(`#panels-tab-${value}`)
  await tab.trigger('mousedown', { button: 0 })
  tab.element.focus()
  await tab.trigger('click')
}
async function ssr(props: UnderlinePanelsProps = {}, nodes = children()) {
  return renderToString(
    createSSRApp({
      render: () => h(UnderlinePanels, { id: 'panels', ...props }, { default: () => nodes }),
    }),
  )
}

describe('UnderlinePanels source contract', () => {
  test('pairs values and renders the wrapper and panels as siblings during SSR', async () => {
    const container = document.createElement('div')
    container.innerHTML = await ssr({ value: 'two', 'aria-label': 'Sections' })
    expect(container.children).toHaveLength(4)
    expect(container.firstElementChild?.id).toBe('panels')
    expect(container.querySelector('[role="tablist"]')?.getAttribute('aria-label')).toBe('Sections')
    expect(container.querySelector('#panels-tab-two')?.getAttribute('aria-controls')).toBe(
      'panels-panel-two',
    )
    expect(container.querySelector<HTMLElement>('#panels-panel-two')?.hidden).toBe(false)
    expect(container.querySelector<HTMLElement>('#panels-panel-one')?.hidden).toBe(true)
  })
  test('defaults by positional values and resynchronizes aria-selected without change events', async () => {
    const selected = shallowRef(1)
    const wrapper = fixture({}, () => [
      ...[0, 1].map((i) =>
        h(UnderlinePanels.Tab, { 'aria-selected': selected.value === i }, () => String(i)),
      ),
      h(UnderlinePanels.Panel),
      h(UnderlinePanels.Panel),
    ])
    selection(wrapper, '1')
    selected.value = 0
    await nextTick()
    selection(wrapper, '0')
    expect(wrapper.emitted('change')).toBeUndefined()
  })
  test('defaultValue overrides aria-selected, is only an initial value, and selection persists on parent updates', async () => {
    const text = shallowRef('first')
    const wrapper = fixture({ defaultValue: 'two' }, () => [
      h(UnderlinePanels.Tab, { value: 'one', 'aria-selected': true }, () => text.value),
      h(UnderlinePanels.Tab, { value: 'two' }, () => 'two'),
      h(UnderlinePanels.Panel, { value: 'one' }),
      h(UnderlinePanels.Panel, { value: 'two' }),
    ])
    selection(wrapper, 'two')
    await pointer(wrapper, 'one')
    await wrapper.setProps({ defaultValue: 'two' })
    text.value = 'updated'
    await nextTick()
    expect(wrapper.get('#panels-tab-one').text()).toBe('updated')
    selection(wrapper, 'one')
  })
  test('controlled selection waits for the parent and does not emit on prop updates', async () => {
    const wrapper = fixture({ value: 'one' })
    await pointer(wrapper, 'two')
    selection(wrapper, 'one')
    expect(wrapper.emitted('change')).toEqual([[{ value: 'two' }], [{ value: 'two' }]])
    await wrapper.setProps({ value: 'two' })
    selection(wrapper, 'two')
    expect(wrapper.emitted('update:value')).toEqual([['two'], ['two']])
  })
  test('mousedown selects once, click emits select, and synthetic click alone does not change value', async () => {
    const onSelect = vi.fn()
    const wrapper = fixture({}, () => [
      h(UnderlinePanels.Tab, { value: 'one' }, () => 'one'),
      h(UnderlinePanels.Tab, { value: 'two', onSelect }, () => 'two'),
      h(UnderlinePanels.Panel, { value: 'one' }),
      h(UnderlinePanels.Panel, { value: 'two' }),
    ])
    await wrapper.get('#panels-tab-two').trigger('click')
    selection(wrapper, 'one')
    expect(onSelect).toHaveBeenCalledTimes(1)
    await pointer(wrapper, 'two')
    selection(wrapper, 'two')
    expect(wrapper.emitted('change')).toEqual([[{ value: 'two' }]])
    expect(onSelect).toHaveBeenCalledTimes(2)
    await pointer(wrapper, 'two')
    expect(wrapper.emitted('change')).toHaveLength(1)
  })
  test.each([{ button: 1 }, { button: 2 }, { button: 0, ctrlKey: true }])(
    'ignores modified mousedown %o',
    async (init) => {
      const wrapper = fixture()
      const event = new MouseEvent('mousedown', { ...init, bubbles: true, cancelable: true })
      wrapper.get('#panels-tab-two').element.dispatchEvent(event)
      await nextTick()
      expect(event.defaultPrevented).toBe(true)
      selection(wrapper, 'one')
    },
  )
  test('automatic arrows wrap; Home and End move and select; arrow movement does not emit select', async () => {
    const onSelect = vi.fn()
    const wrapper = fixture({}, () =>
      children().map((node) =>
        node.type === UnderlinePanels.Tab
          ? h(UnderlinePanels.Tab, { ...node.props, onSelect }, () => node.props!.value)
          : node,
      ),
    )
    const first = wrapper.get<HTMLElement>('#panels-tab-one')
    first.element.focus()
    await first.trigger('keydown', { key: 'ArrowLeft' })
    selection(wrapper, 'three')
    expect(document.activeElement?.id).toBe('panels-tab-three')
    await wrapper.get('#panels-tab-three').trigger('keydown', { key: 'ArrowRight' })
    selection(wrapper, 'one')
    await first.trigger('keydown', { key: 'End' })
    selection(wrapper, 'three')
    await wrapper.get('#panels-tab-three').trigger('keydown', { key: 'Home' })
    selection(wrapper, 'one')
    expect(onSelect).not.toHaveBeenCalled()
  })
  test.each(['Enter', ' '])('manual navigation moves focus and commits with %s', async (key) => {
    const wrapper = fixture({ activationMode: 'manual' })
    wrapper.get<HTMLElement>('#panels-tab-one').element.focus()
    await wrapper.get('#panels-tab-one').trigger('keydown', { key: 'ArrowRight' })
    await wrapper.get('#panels-tab-two').trigger('keydown', { key: 'ArrowRight' })
    selection(wrapper, 'one', 'three')
    expect(wrapper.emitted('change')).toBeUndefined()
    await wrapper.get('#panels-tab-three').trigger('keydown', { key })
    selection(wrapper, 'three')
    expect(wrapper.emitted('change')).toEqual([[{ value: 'three' }]])
  })
  test('refreshes dynamic slots, supports compiler fragments and asSlot wrappers, and clamps removed selection', async () => {
    const values = shallowRef(['one', 'two'])
    const WrappedTab = asSlot(
      defineComponent({
        setup:
          (_, { attrs, slots }) =>
          () =>
            h(UnderlinePanels.Tab, attrs, slots),
      }),
      UnderlinePanels.Tab,
    )
    const WrappedPanel = asSlot(
      defineComponent({
        setup:
          (_, { attrs, slots }) =>
          () =>
            h(UnderlinePanels.Panel, attrs, slots),
      }),
      UnderlinePanels.Panel,
    )
    const wrapper = fixture({ defaultValue: 'two' }, () => [
      createVNode(
        Fragment,
        null,
        values.value.flatMap((value) => [
          h(WrappedTab, { value }, () => value),
          h(WrappedPanel, { value }, () => value),
        ]),
        128,
      ),
    ])
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(2)
    selection(wrapper, 'two')
    values.value = ['one', 'three']
    await nextTick()
    selection(wrapper, 'one')
    expect(wrapper.find('#panels-tab-two').exists()).toBe(false)
    expect(wrapper.find('#panels-tab-three').exists()).toBe(true)
    expect(wrapper.emitted('change')).toBeUndefined()
  })
  test('preserves explicit fragments as unrecognized children like React Children', () => {
    const wrapper = fixture({}, () => [h(Fragment, null, children())])
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(0)
  })
  test('uses CounterLabel accessible text, loading counters, icon and direct label text without nested content', async () => {
    const label = shallowRef('Code')
    const icon = () => h('svg', { 'data-icon': 'code' })
    const wrapper = fixture({}, () => [
      h(UnderlinePanels.Tab, { counter: 0, icon }, () => [
        label.value,
        createCommentVNode('conditional content'),
        h('span', 'nested'),
      ]),
      h(UnderlinePanels.Panel),
    ])
    expect(wrapper.find('[data-component="icon"] svg').exists()).toBe(true)
    expect(wrapper.get('[data-content]').attributes('data-content')).toBe('Code')
    expect(wrapper.get('[data-component="CounterLabel"]').attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('[data-component="counter"]').text()).toContain('(0)')
    label.value = 'Changed'
    await nextTick()
    expect(wrapper.get('[data-content]').attributes('data-content')).toBe('Changed')
    await wrapper.setProps({ loadingCounters: true })
    expect(wrapper.find('[data-component="CounterLabel"]').exists()).toBe(false)
    expect(wrapper.get('[data-component="counter"]').text()).toBe('')
  })
  test('forwards attributes to the intended elements and supports a custom wrapper', async () => {
    const wrapper = fixture(
      { as: 'section', className: 'source', 'aria-labelledby': 'heading' },
      () => [
        h(UnderlinePanels.Tab, { className: 'tab', 'data-tab': 'a' }, () => 'A'),
        h(UnderlinePanels.Panel, { className: 'panel', 'data-panel': 'a' }, () => 'Panel'),
      ],
    )
    expect(wrapper.get('section').classes()).toContain('source')
    expect(wrapper.get('[role="tablist"]').attributes('aria-labelledby')).toBe('heading')
    expect(wrapper.get('section').attributes('aria-labelledby')).toBeUndefined()
    expect(wrapper.get('[role="tab"]').classes()).toContain('tab')
    expect(wrapper.get('[role="tabpanel"]').classes()).toContain('panel')
    await wrapper.setProps({ as: 'nav' })
    expect(wrapper.get('nav').attributes('id')).toBe('panels')
  })
  test('updates parent labels and supports a component wrapper exposing its DOM ref', async () => {
    const CustomWrapper = defineComponent({
      setup(_, { slots, expose }) {
        const element = shallowRef<HTMLElement | null>(null)
        expose({ element })
        return () => h('section', { ref: element }, slots.default?.())
      },
    })
    const wrapper = fixture({ as: CustomWrapper })
    expect(wrapper.get('section [role="tablist"]').attributes('aria-label')).toBe('Sections')
    await wrapper.setProps({ 'aria-label': 'Updated sections' } as Record<string, unknown>)
    expect(wrapper.get('[role="tablist"]').attributes('aria-label')).toBe('Updated sections')
    expect(wrapper.get('section').attributes('aria-label')).toBeUndefined()
  })
  test.each([
    [() => [h(UnderlinePanels.Tab)], /number of tabs and panels/],
    [
      () => [
        h(UnderlinePanels.Tab, { 'aria-selected': true }),
        h(UnderlinePanels.Tab, { 'aria-selected': true }),
        h(UnderlinePanels.Panel),
        h(UnderlinePanels.Panel),
      ],
      /Only one tab/,
    ],
    [() => children(['same', 'same']), /unique `value`/],
    [
      () => [
        h(UnderlinePanels.Tab, { value: 'one' }),
        h(UnderlinePanels.Tab, { value: 'two' }),
        h(UnderlinePanels.Panel, { value: 'one' }),
        h(UnderlinePanels.Panel, { value: 'one' }),
      ],
      /Every panel must have a unique/,
    ],
    [
      () => [h(UnderlinePanels.Tab, { value: 'a' }), h(UnderlinePanels.Panel, { value: 'b' })],
      /no matching panel/,
    ],
  ] as const)('rejects invalid structure %#', async (nodes, message) => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    await expect(ssr({}, nodes())).rejects.toThrow(message)
  })
  test('warns about conflicting selection props and invalid values without change events', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = fixture({ value: 'missing', defaultValue: 'two' }, () =>
      children().map((node) =>
        node.type === UnderlinePanels.Tab
          ? h(UnderlinePanels.Tab, { ...node.props, 'aria-selected': node.props!.value === 'two' })
          : node,
      ),
    )
    selection(wrapper, 'one')
    expect(warn.mock.calls.map((args) => args.join(' ')).join(' ')).toContain('do not combine')
    expect(warn.mock.calls.map((args) => args.join(' ')).join(' ')).toContain(
      'does not match any tab',
    )
    expect(wrapper.emitted('change')).toBeUndefined()
  })
  test('observes current natural list width and reconnects when as changes', async () => {
    const observers = new Map<Element, ResizeObserverCallback>()
    vi.stubGlobal(
      'ResizeObserver',
      class {
        elements = new Set<Element>()
        callback: ResizeObserverCallback
        constructor(callback: ResizeObserverCallback) {
          this.callback = callback
        }
        observe(element: Element) {
          observers.set(element, this.callback)
          this.elements.add(element)
        }
        disconnect() {
          for (const element of this.elements) observers.delete(element)
        }
      },
    )
    const wrapper = fixture({}, () => [
      h(UnderlinePanels.Tab, { icon: () => h('svg') }),
      h(UnderlinePanels.Panel),
    ])
    await nextTick()
    const list = wrapper.get('[role="tablist"]').element
    const oldRoot = wrapper.get('[data-icons-visible]').element
    function resize(element: Element, width: number) {
      observers.get(element)!(
        [{ contentRect: { width } } as ResizeObserverEntry],
        {} as ResizeObserver,
      )
    }
    resize(list, 200)
    resize(oldRoot, 300)
    await nextTick()
    expect(wrapper.get('[data-icons-visible]').attributes('data-icons-visible')).toBe('true')
    resize(list, 280)
    resize(oldRoot, 250)
    await nextTick()
    expect(wrapper.get('[data-icons-visible]').attributes('data-icons-visible')).toBe('false')
    resize(list, 100)
    resize(oldRoot, 260)
    await nextTick()
    expect(wrapper.get('[data-icons-visible]').attributes('data-icons-visible')).toBe('false')
    await wrapper.setProps({ as: 'section' })
    expect(observers.has(oldRoot)).toBe(false)
    expect(observers.has(wrapper.get('section').element)).toBe(true)
    wrapper.unmount()
    wrappers.pop()
    expect(observers.size).toBe(0)
  })
  test('SSR hydration retains selection, input state in hidden panels and generated ARIA ids', async () => {
    const render = () =>
      h(
        UnderlinePanels,
        { defaultValue: 'two' },
        {
          default: () => [
            h(UnderlinePanels.Tab, { value: 'one' }, () => 'One'),
            h(UnderlinePanels.Tab, { value: 'two' }, () => 'Two'),
            h(UnderlinePanels.Panel, { value: 'one' }, () =>
              h(TextInput, { defaultValue: 'draft', 'aria-label': 'Draft' }),
            ),
            h(UnderlinePanels.Panel, { value: 'two' }, () => 'Second'),
          ],
        },
      )
    const host = document.createElement('div')
    host.innerHTML = await renderToString(createSSRApp({ render }))
    document.body.append(host)
    const before = host.querySelector('[role="tab"]')!.id
    const warn = vi.spyOn(console, 'error')
    const app = createSSRApp({ render })
    app.mount(host)
    expect(host.querySelector('[role="tab"]')!.id).toBe(before)
    const tabs = host.querySelectorAll<HTMLElement>('[role="tab"]')
    tabs[0]!.focus()
    await nextTick()
    const input = host.querySelector('input')!
    input.value = 'edited'
    tabs[1]!.focus()
    await nextTick()
    tabs[0]!.focus()
    await nextTick()
    expect(host.querySelector('input')).toBe(input)
    expect(input.value).toBe('edited')
    expect(warn).not.toHaveBeenCalled()
    app.unmount()
  })
  test('AnchoredOverlay disables competing focus zones, preserves one tab stop and restores anchor focus', async () => {
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(100)
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(30)
    vi.spyOn(HTMLElement.prototype, 'getClientRects').mockImplementation(function (
      this: HTMLElement,
    ) {
      return [this.getBoundingClientRect()] as unknown as DOMRectList
    })
    const open = shallowRef(false)
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            AnchoredOverlay,
            {
              open: open.value,
              onOpen: () => {
                open.value = true
              },
              onClose: () => {
                open.value = false
              },
              focusZoneSettings: { disabled: true },
              renderAnchor: (props) => h(Button, props, { default: () => 'Open' }),
            },
            {
              default: () =>
                h(
                  UnderlinePanels,
                  { id: 'panels', 'aria-label': 'Sections' },
                  { default: children },
                ),
            },
          ),
      }),
      { attachTo: document.body },
    )
    wrappers.push(wrapper)
    await wrapper.get('button').trigger('click')
    await flushPromises()
    await nextTick()
    expect(document.querySelectorAll('[role="tab"][tabindex="0"]')).toHaveLength(1)
    const first = document.querySelector<HTMLElement>('#panels-tab-one')!
    first.focus()
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    await nextTick()
    expect(document.activeElement?.id).toBe('panels-tab-two')
    expect(document.querySelectorAll('[role="tab"][tabindex="0"]')).toHaveLength(1)
    document.activeElement!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    )
    await flushPromises()
    await nextTick()
    expect(open.value).toBe(false)
    expect(document.activeElement).toBe(wrapper.get('button').element)
  })
})
