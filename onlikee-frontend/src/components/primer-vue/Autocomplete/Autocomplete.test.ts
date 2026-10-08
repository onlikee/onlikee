// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Test fixtures exercise controlled component composition. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { renderToString } from '@vue/server-renderer'
import Autocomplete, { type AutocompleteMenuItem } from './index'

const items = [
  { id: 'zero', text: 'zero' },
  { id: 'one', text: 'one' },
  { id: 'two', text: 'two' },
  { id: 'twenty', text: 'twenty' },
]
const mounted: VueWrapper[] = []
const originalScrollTo = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollTo')
const tick = async () => {
  await nextTick()
  await nextTick()
  await nextTick()
}

function setup(
  inputProps: Record<string, unknown> = {},
  menuProps: Record<string, unknown> = {},
  overlay = true,
) {
  const wrapper = mount(
    defineComponent({
      setup() {
        return () =>
          h('div', [
            h('label', { for: 'input', id: 'label' }, 'Autocomplete field'),
            h(
              Autocomplete,
              { id: 'autocomplete' },
              {
                default: () => [
                  h(Autocomplete.Input, { id: 'input', ...inputProps }),
                  overlay
                    ? h(
                        Autocomplete.Overlay,
                        {},
                        {
                          default: () =>
                            h(Autocomplete.Menu, {
                              items,
                              selectedItemIds: [],
                              'aria-labelledby': 'label',
                              ...menuProps,
                            }),
                        },
                      )
                    : h(Autocomplete.Menu, {
                        items,
                        selectedItemIds: [],
                        'aria-labelledby': 'label',
                        ...menuProps,
                      }),
                ],
              },
            ),
            h('button', { id: 'outside' }, 'Outside'),
          ])
      },
    }),
    { attachTo: document.body },
  )
  mounted.push(wrapper)
  return {
    wrapper,
    input: wrapper.get('input'),
    element: wrapper.get('input').element as HTMLInputElement,
  }
}

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  )
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, value: vi.fn() })
})
afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
  vi.useRealTimers()
  if (originalScrollTo) Object.defineProperty(HTMLElement.prototype, 'scrollTo', originalScrollTo)
  else Reflect.deleteProperty(HTMLElement.prototype, 'scrollTo')
})

describe('Autocomplete source contract', () => {
  it('renders the combobox contract without opening on ordinary focus', async () => {
    const { input, element } = setup()
    element.focus()
    await tick()
    expect(input.attributes('role')).toBe('combobox')
    expect(input.attributes('aria-controls')).toBe('autocomplete-listbox')
    expect(input.attributes('aria-owns')).toBe('autocomplete-listbox')
    expect(input.attributes('aria-autocomplete')).toBe('both')
    expect(input.attributes('aria-expanded')).toBe('false')
    expect(input.attributes('data-component')).toBe('Autocomplete.Input')
  })

  it('supports the deprecated openOnFocus behavior', async () => {
    const { input, element } = setup({ openOnFocus: true })
    element.focus()
    await tick()
    expect(input.attributes('aria-expanded')).toBe('true')
    expect(document.querySelector('[data-component="Autocomplete.Menu"]')).not.toBeNull()
  })

  it('normalizes arbitrary numeric styles on input, overlay, list and items', async () => {
    const wrapper = mount(Autocomplete, {
      slots: {
        default: () => [
          h(Autocomplete.Input, { style: { width: 240, fontSize: 16, opacity: 0.7 } }),
          h(
            Autocomplete.Overlay,
            { style: { width: 300, maxHeight: 120 } },
            {
              default: () =>
                h(Autocomplete.Menu, {
                  items: [{ id: 'styled', text: 'Styled', style: { fontSize: 16, opacity: 0.7 } }],
                  selectedItemIds: [],
                  'aria-labelledby': 'label',
                  style: { padding: 12 },
                }),
            },
          ),
        ],
      },
    })
    mounted.push(wrapper)
    const inputRoot = wrapper.get('[data-component="Autocomplete.Input"]').element as HTMLElement
    expect(inputRoot.style.width).toBe('240px')
    expect(inputRoot.style.fontSize).toBe('16px')
    expect(inputRoot.style.opacity).toBe('0.7')
    await wrapper.get('input').trigger('keydown', { key: 'ArrowDown' })
    await tick()
    const overlay = document.querySelector<HTMLElement>('[data-component="Autocomplete.Overlay"]')!
    expect(overlay.style.width).toBe('300px')
    expect(overlay.style.maxHeight).toBe('120px')
    expect(
      overlay.querySelector<HTMLElement>('[data-component="Autocomplete.Menu"]')!.style.padding,
    ).toBe('12px')
    expect(overlay.querySelector<HTMLElement>('#styled')!.style.fontSize).toBe('16px')
    expect(overlay.querySelector<HTMLElement>('#styled')!.style.opacity).toBe('0.7')
  })

  it('preserves explicit input attributes after the combobox defaults', () => {
    const { input } = setup({
      'aria-controls': 'external-menu',
      'aria-describedby': 'caption',
      autocomplete: 'new-password',
      'data-component': 'Override',
    })
    expect(input.attributes('aria-controls')).toBe('external-menu')
    expect(input.attributes('aria-describedby')).toBe('caption')
    expect(input.attributes('autocomplete')).toBe('new-password')
    expect(input.attributes('data-component')).toBe('Autocomplete.Input')
  })

  it('opens on arrows, retains input focus and navigates active descendants', async () => {
    const { input, element } = setup()
    element.focus()
    await input.trigger('keydown', { key: 'ArrowDown' })
    await tick()
    expect(input.attributes('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(element)
    expect(input.attributes('aria-activedescendant')).toBe('zero')
    await input.trigger('keydown', { key: 'ArrowDown' })
    await tick()
    expect(input.attributes('aria-activedescendant')).toBe('one')
    await input.trigger('keydown', { key: 'End' })
    await tick()
    expect(input.attributes('aria-activedescendant')).toBe('one')
    await input.trigger('keydown', { key: 'Home' })
    await tick()
    expect(input.attributes('aria-activedescendant')).toBe('one')
    // Ctrl+ArrowDown/Up → end/start（focus-zone.mjs:72-78；jsdom 非 Mac → ctrlKey 分支）
    await input.trigger('keydown', { key: 'ArrowDown', ctrlKey: true })
    await tick()
    expect(input.attributes('aria-activedescendant')).toBe('twenty')
    await input.trigger('keydown', { key: 'ArrowUp', ctrlKey: true })
    await tick()
    expect(input.attributes('aria-activedescendant')).toBe('zero')
    await input.trigger('keydown', { key: 'ArrowUp' })
    await tick()
    expect(input.attributes('aria-activedescendant')).toBe('twenty')
  })

  it('still highlights disabled items while blocking their selection', async () => {
    const selected = vi.fn()
    const { input, element } = setup(
      {},
      {
        items: [
          { id: 'a', text: 'a' },
          { id: 'b', text: 'b', disabled: true },
        ],
        onSelectedChange: selected,
      },
      false,
    )
    element.focus()
    await input.trigger('keydown', { key: 'ArrowDown' })
    await tick()
    await input.trigger('keydown', { key: 'ArrowDown' })
    await tick()
    expect(input.attributes('aria-activedescendant')).toBe('b')
    expect(
      document
        .querySelector<HTMLElement>('[role="option"][id="b"]')!
        .getAttribute('data-is-disabled'),
    ).toBe('true')
    await input.trigger('keypress', { key: 'Enter' })
    await tick()
    expect(selected).not.toHaveBeenCalled()
    expect(input.attributes('aria-expanded')).toBe('true')
  })

  it('does not open on Alt+arrow or during composition', async () => {
    const { input } = setup()
    await input.trigger('keydown', { key: 'ArrowDown', altKey: true })
    expect(input.attributes('aria-expanded')).toBe('false')
    await input.trigger('compositionstart')
    await input.trigger('keydown', { key: 'ArrowDown', isComposing: true })
    expect(input.attributes('aria-expanded')).toBe('false')
  })

  it('updates once when a composed value finishes and then filters it', async () => {
    const update = vi.fn()
    const { input, element } = setup({ 'onUpdate:value': update })
    await input.trigger('compositionstart')
    element.value = 'tw'
    await input.trigger('input')
    expect(update).not.toHaveBeenCalled()
    await input.trigger('compositionend')
    await tick()
    expect(update).toHaveBeenCalledTimes(1)
    expect(update).toHaveBeenCalledWith('tw')
    expect(input.attributes('aria-expanded')).toBe('true')
    expect(document.querySelectorAll('[role="option"]')).toHaveLength(2)
    element.value = 'tw'
    await input.trigger('input', { isComposing: false })
    await tick()
    expect(update).toHaveBeenCalledTimes(1)
    await input.setValue('two')
    await tick()
    expect(update).toHaveBeenCalledTimes(2)
    expect(update).toHaveBeenLastCalledWith('two')
  })

  it('filters prefixes without case sensitivity and highlights the inline completion', async () => {
    const { input, element } = setup()
    element.focus()
    await input.setValue('ze')
    await tick()
    expect(document.querySelectorAll('[role="option"]')).toHaveLength(1)
    expect(element.value).toBe('zero')
    expect(element.selectionStart).toBe(2)
    expect(element.selectionEnd).toBe(4)
    await input.setValue('TW')
    await tick()
    expect(document.querySelectorAll('[role="option"]')).toHaveLength(2)
  })

  it('does not reapply the suggestion while Backspace is held, then restores typed text on blur', async () => {
    vi.useFakeTimers()
    const { input, element } = setup()
    element.focus()
    await input.setValue('ze')
    await tick()
    await input.trigger('keydown', { key: 'Backspace' })
    await input.setValue('z')
    await tick()
    expect(element.value).toBe('z')
    await input.trigger('keyup', { key: 'Backspace' })
    await input.trigger('blur', { relatedTarget: document.getElementById('outside') })
    vi.runAllTimers()
    await tick()
    expect(element.value).toBe('z')
    expect(input.attributes('aria-expanded')).toBe('false')
    expect(input.attributes('aria-activedescendant')).toBeUndefined()
  })

  it('clears the typed value and closes on Escape', async () => {
    const { input, element } = setup()
    element.focus()
    await input.setValue('ze')
    await tick()
    await input.trigger('keydown', { key: 'Escape' })
    await tick()
    expect(element.value).toBe('')
    expect(input.attributes('aria-expanded')).toBe('false')
    await input.trigger('keydown', { key: 'Escape' })
    await tick()
    expect(element.value).toBe('')
  })

  it('emits selected item arrays and selected ID updates on Enter', async () => {
    const selected = vi.fn(),
      ids = vi.fn()
    const { input, element } = setup(
      {},
      { onSelectedChange: selected, 'onUpdate:selectedItemIds': ids },
    )
    element.focus()
    await input.trigger('keydown', { key: 'ArrowDown' })
    await tick()
    await input.trigger('keypress', { key: 'Enter' })
    await tick()
    expect(selected).toHaveBeenCalledWith([items[0]])
    expect(ids).toHaveBeenCalledWith(['zero'])
    expect(input.attributes('aria-expanded')).toBe('false')
  })

  it('uses the default selection callback to update input text', async () => {
    const { input, element } = setup()
    element.focus()
    await input.trigger('keydown', { key: 'ArrowDown' })
    await tick()
    document.querySelector<HTMLElement>('[role="option"][id="one"]')!.click()
    await tick()
    expect(element.value).toBe('one')
  })

  it('keeps the chosen text when unrelated input attributes rerender', async () => {
    const placeholder = ref('Before')
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            Autocomplete,
            {},
            {
              default: () => [
                h(Autocomplete.Input, { placeholder: placeholder.value }),
                h(Autocomplete.Menu, { items, selectedItemIds: [], 'aria-labelledby': 'label' }),
              ],
            },
          ),
      }),
      { attachTo: document.body },
    )
    mounted.push(wrapper)
    const input = wrapper.get('input')
    await input.trigger('keydown', { key: 'ArrowDown' })
    await tick()
    await wrapper.get('[role="option"][id="one"]').trigger('click')
    await tick()
    expect((input.element as HTMLInputElement).value).toBe('one')
    placeholder.value = 'After'
    await tick()
    expect((input.element as HTMLInputElement).value).toBe('one')
  })

  it('keeps multiple-selection menu open and toggles controlled IDs', async () => {
    const ids = ref<string[]>([])
    const selected = vi.fn()
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            Autocomplete,
            { id: 'multi' },
            {
              default: () => [
                h(Autocomplete.Input),
                h(Autocomplete.Menu, {
                  items,
                  selectedItemIds: ids.value,
                  selectionVariant: 'multiple',
                  'aria-labelledby': 'label',
                  'onUpdate:selectedItemIds': (value: string[]) => {
                    ids.value = value
                  },
                  onSelectedChange: selected,
                }),
              ],
            },
          ),
      }),
      { attachTo: document.body },
    )
    mounted.push(wrapper)
    const input = wrapper.get('input')
    await input.trigger('keydown', { key: 'ArrowDown' })
    await tick()
    await wrapper.get('[role="option"][id="one"]').trigger('click')
    await tick()
    expect(ids.value).toEqual(['one'])
    expect(input.attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('[role="option"][id="one"]').attributes('aria-selected')).toBe('true')
    const ul = document.querySelector('[data-component="Autocomplete.Menu"]')!
    expect(ul.getAttribute('data-dividers')).toBe('false')
    expect(ul.getAttribute('data-variant')).toBe('inset')
    expect(ul.hasAttribute('aria-multiselectable')).toBe(false)
    await wrapper.get('[role="option"][id="one"]').trigger('click')
    await tick()
    expect(ids.value).toEqual([])
    expect(selected).toHaveBeenLastCalledWith([])
  })

  it('emits the source pair when single-selecting over an existing selection', async () => {
    const ids = vi.fn()
    const { input, element } = setup(
      {},
      { selectedItemIds: ['one'], 'onUpdate:selectedItemIds': ids },
    )
    element.focus()
    await input.trigger('keydown', { key: 'ArrowDown' })
    await tick()
    document.querySelector<HTMLElement>('[role="option"][id="two"]')!.click()
    await tick()
    expect(ids).toHaveBeenCalledWith(['one', 'two'])
  })

  it('rejects multiple IDs in single mode', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() =>
      mount(Autocomplete, {
        slots: {
          default: () =>
            h(Autocomplete.Menu, {
              items,
              selectedItemIds: ['one', 'two'],
              'aria-labelledby': 'label',
            }),
        },
      }),
    ).toThrow('selectionVariant "single" cannot be used with multiple selected items')
  })

  it('supports a custom filter, sort and add-new item callback', async () => {
    const filter = vi.fn((item: AutocompleteMenuItem) => item.id !== 'one')
    const sort = vi.fn((a: string, b: string) => b.localeCompare(a))
    const add = vi.fn()
    const { input } = setup(
      {},
      {
        filterFn: filter,
        sortOnCloseFn: sort,
        selectionVariant: 'multiple',
        addNewItem: { id: 'add', text: 'Add new', handleAddItem: add },
      },
      false,
    )
    await input.trigger('keydown', { key: 'ArrowDown' })
    await tick()
    expect(filter).toHaveBeenCalled()
    expect(sort).toHaveBeenCalled()
    document.querySelector<HTMLElement>('[role="option"][id="add"]')!.click()
    await tick()
    expect(add).toHaveBeenCalledWith(expect.objectContaining({ id: 'add', text: 'Add new' }))
    expect(input.attributes('aria-expanded')).toBe('true')
  })

  it('renders loading and suppressible empty states', async () => {
    const { input } = setup({}, { items: [], loading: true }, false)
    await input.trigger('keydown', { key: 'ArrowDown' })
    await tick()
    expect(document.querySelector('[data-component="Spinner"]')).not.toBeNull()
    const empty = setup({}, { items: [], emptyStateText: false }, false)
    await empty.input.trigger('keydown', { key: 'ArrowDown' })
    await tick()
    expect(empty.wrapper.text()).not.toContain('No selectable options')
  })

  it('supports component-valued nodes and keeps explicit empty text ahead of its slot', async () => {
    const Label = defineComponent({ setup: () => () => h('strong', 'Node label') })
    const Description = defineComponent({ setup: () => () => h('small', 'Node description') })
    const { input, wrapper } = setup(
      {},
      { items: [{ id: 'node', text: 'Node', children: Label, description: Description }] },
      false,
    )
    await input.trigger('keydown', { key: 'ArrowDown' })
    await tick()
    expect(wrapper.get('#node strong').text()).toBe('Node label')
    expect(wrapper.find('#node small').exists()).toBe(false)
    const empty = mount(Autocomplete, {
      slots: {
        default: () => [
          h(Autocomplete.Input),
          h(
            Autocomplete.Menu,
            {
              items: [],
              selectedItemIds: [],
              'aria-labelledby': 'label',
              emptyStateText: Description,
            },
            { emptyState: () => 'Slot text' },
          ),
        ],
      },
    })
    mounted.push(empty)
    await empty.get('input').trigger('keydown', { key: 'ArrowDown' })
    await tick()
    expect(empty.text()).toContain('Node description')
    expect(empty.text()).not.toContain('Slot text')
  })

  it('renders source inactive and loading descriptions while blocking their actions', async () => {
    const selected = vi.fn()
    const sourceItems = [
      {
        id: 'inactive',
        text: 'Unavailable',
        inactiveText: 'Requires permission',
        description: 'Details',
        loading: true,
      },
      { id: 'loading', text: 'Processing', loading: true, trailingVisual: 'Status' },
      { id: 'danger', text: 'Delete', variant: 'danger', size: 'large' },
    ]
    const { input, wrapper } = setup({}, { items: sourceItems, onSelectedChange: selected }, false)
    await input.trigger('keydown', { key: 'ArrowDown' })
    await tick()
    const inactive = wrapper.get('#inactive')
    expect(inactive.attributes('aria-describedby')).toBe('inactive--warning-message')
    expect(inactive.attributes('description')).toBe('Details')
    expect(inactive.attributes('data-has-description')).toBe('false')
    expect(inactive.text()).toContain('Requires permission')
    expect(inactive.get('[data-component="ActionList.Item.Label"]').text()).not.toContain('Loading')
    expect(inactive.attributes('data-loading')).toBeUndefined()
    await inactive.trigger('click')
    await inactive.trigger('keypress', { key: 'Enter' })
    const loading = wrapper.get('#loading')
    expect(loading.attributes('data-loading')).toBe('true')
    expect(loading.text()).toContain('Loading')
    expect(loading.attributes('aria-labelledby')).toBe('loading--label loading--trailing-visual')
    expect(
      loading.get('#loading--trailing-visual').find('[data-component="Spinner"]').exists(),
    ).toBe(true)
    await loading.trigger('click')
    await loading.trigger('keypress', { key: 'Enter' })
    expect(selected).not.toHaveBeenCalled()
    const danger = wrapper.get('#danger')
    expect(danger.attributes('data-variant')).toBe('danger')
    expect(danger.attributes('data-size')).toBeUndefined()
    expect(danger.get('[data-size="large"]').attributes('data-size')).toBe('large')
    expect(danger.attributes('tabindex')).toBe('0')
    await danger.trigger('keypress', { key: 'Enter' })
    expect(selected).toHaveBeenCalledWith([sourceItems[2]])
  })

  it('supports controlled numeric zero and restoring a rejected edit', async () => {
    const changed = vi.fn(),
      value = vi.fn()
    const { input, element } = setup({ value: 0, onChange: changed, 'onUpdate:value': value })
    await tick()
    expect(element.value).toBe('0')
    await input.setValue('new')
    await tick()
    expect(value).toHaveBeenCalledWith('new')
    expect(changed).toHaveBeenCalled()
    expect(element.value).toBe('0')
  })

  it('resets native text to defaultValue and closes without emitting an edit', async () => {
    const changed = vi.fn()
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h('form', [
            h(
              Autocomplete,
              { id: 'reset' },
              {
                default: () => [
                  h(Autocomplete.Input, {
                    name: 'language',
                    defaultValue: 'one',
                    onChange: changed,
                  }),
                  h(Autocomplete.Menu, { items, selectedItemIds: [], 'aria-labelledby': 'label' }),
                ],
              },
            ),
          ]),
      }),
      { attachTo: document.body },
    )
    mounted.push(wrapper)
    const input = wrapper.get('input')
    await input.setValue('Edited')
    await tick()
    const changeCount = changed.mock.calls.length
    ;(wrapper.element as HTMLFormElement).reset()
    await tick()
    expect(new FormData(wrapper.element as HTMLFormElement).get('language')).toBe('one')
    expect(input.attributes('aria-expanded')).toBe('false')
    expect(changed).toHaveBeenCalledTimes(changeCount)
    const removed = vi.spyOn(wrapper.element, 'removeEventListener')
    wrapper.unmount()
    expect(removed).toHaveBeenCalledWith('reset', expect.any(Function))
    mounted.pop()
  })

  it('closes on outside click and renders overlay-free SSR deterministically', async () => {
    const { input } = setup()
    await input.trigger('keydown', { key: 'ArrowDown' })
    await tick()
    document
      .getElementById('outside')!
      .dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await tick()
    expect(input.attributes('aria-expanded')).toBe('false')
    const markup = await renderToString(
      h(
        Autocomplete,
        { id: 'ssr' },
        {
          default: () => [
            h(Autocomplete.Input),
            h(
              Autocomplete.Overlay,
              {},
              {
                default: () =>
                  h(Autocomplete.Menu, { items, selectedItemIds: [], 'aria-labelledby': 'label' }),
              },
            ),
          ],
        },
      ),
    )
    expect(markup).toContain('aria-controls="ssr-listbox"')
    expect(markup).not.toContain('data-component="Autocomplete.Overlay"')
  })
})
