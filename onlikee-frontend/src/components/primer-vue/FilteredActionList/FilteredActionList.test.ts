// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, h, nextTick, shallowRef } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { FilteredActionList, FilteredActionListLoadingTypes } from './index'
import type { ItemInput } from './types'
import { FeatureFlags } from '../FeatureFlags'

const wrappers: VueWrapper[] = []
const scrollToDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollTo')
function render(props: Partial<InstanceType<typeof FilteredActionList>['$props']> = {}) {
  const wrapper = mount(FilteredActionList, {
    props: { items: [], ...props },
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  return wrapper
}
async function settle() {
  await nextTick()
  await flushPromises()
  await nextTick()
}
function keyboard(input: HTMLElement, key: string, type = 'keydown') {
  input.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true, cancelable: true }))
}
beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((media: string) => ({
      matches: false,
      media,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, value: vi.fn() })
})
afterEach(() => {
  wrappers.forEach((wrapper) => wrapper.unmount())
  wrappers.length = 0
  document.body.innerHTML = ''
  vi.restoreAllMocks()
  if (scrollToDescriptor)
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', scrollToDescriptor)
  else Reflect.deleteProperty(HTMLElement.prototype, 'scrollTo')
})
describe('FilteredActionList behavior', () => {
  it.each([false, true])(
    'uses the source callback-ref description branch with merged refs=%s',
    async (merged) => {
      const wrapper = mount(FeatureFlags, {
        props: { flags: { primer_react_merged_forwarded_refs: merged } },
        slots: {
          default: () =>
            h(FilteredActionList, {
              items: [{ text: 'Plain' }, { text: 'Described', description: 'Details' }],
            }),
        },
        attachTo: document.body,
      })
      wrappers.push(wrapper)
      await settle()
      expect(wrapper.get('[role="listbox"]').attributes('data-mixed-descriptions')).toBe(
        merged ? 'true' : undefined,
      )
      expect(
        wrapper.get('[data-component="ActionList.Description"]').element.parentElement?.tagName,
      ).toBe('DIV')
    },
  )
  it('retains trailing text/icon, child order, source group labels and actionList overrides', async () => {
    const Icon = () => h('svg', { 'data-test-icon': true })
    const wrapper = render({
      selectionVariant: 'single',
      showItemDividers: true,
      items: [
        {
          text: 'Alpha',
          selected: true,
          groupId: 'g',
          children: h('span', 'Prefix '),
          trailingText: 'Hint',
          trailingIcon: Icon,
        },
      ],
      groupMetadata: [{ groupId: 'g', header: { title: 'Group' } }],
      actionListProps: { selectionVariant: false, variant: 'full', showDividers: false },
    })
    await settle()
    const option = wrapper.get('[role="option"]')
    expect(option.get('[data-component="ActionList.Item.Label"]').text()).toBe('Prefix Alpha')
    expect(option.get('[data-component="ActionList.TrailingVisual"]').text()).toBe('Hint')
    expect(option.find('[data-test-icon]').exists()).toBe(true)
    expect(option.find('[data-component="ActionList.Selection"]').exists()).toBe(false)
    expect(wrapper.get('[role="group"]').attributes('aria-label')).toBe('Group')
    expect(wrapper.get('[data-component="GroupHeadingWrap"]').attributes('aria-hidden')).toBe(
      'true',
    )
    expect(wrapper.get('[role="listbox"]').attributes('data-variant')).toBe('full')
    expect(wrapper.get('[role="listbox"]').attributes('data-dividers')).toBe('false')
  })
  it('source focus zone includes disabled options but their actions remain blocked', async () => {
    const action = vi.fn()
    const wrapper = render({
      items: [
        { id: 'a', text: 'Alpha', onAction: action },
        { id: 'b', text: 'Disabled', disabled: true, onAction: action },
        { id: 'c', text: 'Charlie', onAction: action },
      ],
    })
    await settle()
    const input = wrapper.get('input').element as HTMLInputElement
    input.focus()
    keyboard(input, 'ArrowDown')
    await settle()
    expect(document.activeElement).toBe(input)
    expect(
      document.getElementById(input.getAttribute('aria-activedescendant')!)?.textContent,
    ).toContain('Disabled')
    keyboard(input, 'Enter', 'keypress')
    expect(action).not.toHaveBeenCalled()
    keyboard(input, 'ArrowDown')
    await settle()
    keyboard(input, 'Enter', 'keypress')
    expect(action.mock.calls[0]?.[0].text).toBe('Charlie')
    keyboard(input, 'ArrowDown')
    await settle()
    expect(
      document.getElementById(input.getAttribute('aria-activedescendant')!)?.textContent,
    ).toContain('Alpha')
  })
  it('uncontrolled filter updates named bindings with native event and external refs clean up', async () => {
    const inputRef = shallowRef<HTMLInputElement | null>(null)
    const scrollRef = shallowRef<HTMLDivElement | null>(null)
    const wrapper = render({ inputRef, scrollContainerRef: scrollRef, items: [{ text: 'Alpha' }] })
    await settle()
    expect(inputRef.value).toBe(wrapper.get('input').element)
    expect(scrollRef.value).toBe(
      wrapper.get('[data-component="FilteredActionList.ScrollContainer"]').element,
    )
    await wrapper.get('input').setValue('a')
    expect(wrapper.emitted('filter-change')?.[0]?.[0]).toBe('a')
    expect(wrapper.emitted('filter-change')?.[0]?.[1]).toBeInstanceOf(Event)
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('a')
    wrapper.unmount()
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    expect(inputRef.value).toBeNull()
    expect(scrollRef.value).toBeNull()
  })
  it('source ActionList roving zone wraps independently of focusOutBehavior', async () => {
    const wrapper = render({
      items: [{ text: 'Alpha' }, { text: 'Beta' }],
      _PrivateFocusManagement: 'roving-tabindex',
      focusOutBehavior: 'stop',
    })
    await settle()
    const input = wrapper.get('input').element as HTMLElement
    input.focus()
    keyboard(input, 'ArrowDown')
    const options = wrapper.findAll('[role="option"]')
    expect(document.activeElement).toBe(options[0]!.element)
    keyboard(options[0]!.element as HTMLElement, 'ArrowDown')
    expect(document.activeElement).toBe(options[1]!.element)
    keyboard(options[1]!.element as HTMLElement, 'ArrowDown')
    expect(document.activeElement).toBe(options[0]!.element)
  })
  it('virtualizes long flat lists while grouping disables virtualization', async () => {
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(32)
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 320,
      bottom: 160,
      width: 320,
      height: 160,
      toJSON: () => ({}),
    })
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(160)
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(320)
    const items = Array.from({ length: 500 }, (_unused, index) => ({
      id: index,
      text: `Option ${index}`,
    }))
    const wrapper = render({ items, virtualized: true })
    await settle()
    expect(wrapper.findAll('[role="option"]').length).toBeGreaterThan(0)
    expect(wrapper.findAll('[role="option"]').length).toBeLessThan(100)
    expect(wrapper.get('[role="listbox"]').attributes('style')).toContain('16000px')
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    await wrapper.setProps({
      items: items.slice(0, 3).map((item) => ({ ...item, groupId: 'one' })),
      groupMetadata: [{ groupId: 'one', header: { title: 'Group' } }],
    })
    await settle()
    expect(warning).toHaveBeenCalledOnce()
    expect(wrapper.findAll('[role="option"]')).toHaveLength(3)
  })
  it('source list renderer replaces item/group renderers and receives mapped items', async () => {
    const action = vi.fn()
    const ignored = vi.fn(() => h('button', 'Ignored renderer'))
    const renderer = vi.fn((item: ItemInput) =>
      h(
        'button',
        {
          role: 'option',
          tabindex: -1,
          onClick: (event: MouseEvent) => item.onAction?.(item, event),
        },
        item.text,
      ),
    )
    const wrapper = render({
      items: [
        {
          id: 'a',
          text: 'Alpha',
          selected: true,
          groupId: 'g',
          renderItem: ignored,
          onAction: action,
        },
      ],
      groupMetadata: [{ groupId: 'g', renderItem: ignored, renderGroup: ignored }],
    })
    await settle()
    expect(ignored).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Group g')
    await wrapper.setProps({ renderItem: renderer })
    expect(renderer.mock.calls[0]?.[0].selected).toBe(true)
    expect(renderer.mock.calls[0]?.[0].id).toBe('a')
    await wrapper.get('button').trigger('click')
    expect(action).toHaveBeenCalledOnce()
    expect(ignored).not.toHaveBeenCalled()
  })
  it.each(['active-descendant', 'roving-tabindex'] as const)(
    'source virtual navigation stays within mounted options with %s focus',
    async (mode) => {
      // Own the rAF queue: the source scrollToIndex leaves retries after disposal.
      vi.stubGlobal(
        'requestAnimationFrame',
        vi.fn(() => 1),
      )
      vi.stubGlobal('cancelAnimationFrame', vi.fn())
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: 320,
        bottom: 160,
        width: 320,
        height: 160,
        toJSON: () => ({}),
      })
      vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(160)
      vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(320)
      vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(32)
      vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(160)
      const wrapper = render({
        items: Array.from({ length: 500 }, (_unused, index) => ({
          id: index,
          text: `Option ${index}`,
        })),
        virtualized: true,
        _PrivateFocusManagement: mode,
        focusOutBehavior: 'wrap',
      })
      await settle()
      const input = wrapper.get('input').element as HTMLInputElement
      input.focus()
      if (mode === 'roving-tabindex') keyboard(input, 'ArrowDown')
      const options = wrapper.findAll('[role="option"]')
      const first = options[0]!.element as HTMLElement
      const last = options.at(-1)!.element as HTMLElement
      keyboard(mode === 'active-descendant' ? input : first, 'PageDown')
      await settle()
      expect(
        mode === 'active-descendant'
          ? input.getAttribute('aria-activedescendant')
          : document.activeElement?.id,
      ).toBe(last.id)
      keyboard(mode === 'active-descendant' ? input : last, 'ArrowDown')
      await settle()
      expect(
        mode === 'active-descendant'
          ? input.getAttribute('aria-activedescendant')
          : document.activeElement?.id,
      ).toBe(mode === 'active-descendant' ? last.id : first.id)
      expect(wrapper.find('[data-index="499"]').exists()).toBe(false)
      if (mode === 'active-descendant') {
        keyboard(input, 'Home')
        keyboard(input, 'End')
        await settle()
        expect(input.getAttribute('aria-activedescendant')).toBe(last.id)
      }
    },
  )
  it('textInputProps keydown replaces internal roving activation', async () => {
    const action = vi.fn(),
      keydown = vi.fn()
    const wrapper = render({
      items: [{ text: 'Alpha', onAction: action }],
      _PrivateFocusManagement: 'roving-tabindex',
      textInputProps: { onKeydown: keydown },
    })
    await settle()
    const input = wrapper.get('input').element as HTMLInputElement
    input.focus()
    keyboard(input, 'Enter')
    expect(keydown).toHaveBeenCalledOnce()
    expect(action).not.toHaveBeenCalled()
  })
  it('input focus invokes its internal callback before the caller callback', async () => {
    const order: string[] = []
    const wrapper = mount(FilteredActionList.Input, {
      props: {
        listId: 'list',
        inputDescriptionTextId: 'description',
        onInputFocus: () => order.push('internal'),
      },
      attrs: { onFocus: () => order.push('external') },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    await settle()
    ;(wrapper.get('input').element as HTMLElement).focus()
    expect(order).toEqual(['internal', 'external'])
  })
  it('replaces input/list callbacks even when no other prop changes', async () => {
    const previousInput = vi.fn(),
      nextInput = vi.fn(),
      previousList = vi.fn(),
      nextList = vi.fn()
    const wrapper = render({
      onInputRefChanged: previousInput,
      onListContainerRefChanged: previousList,
    })
    await settle()
    const input = wrapper.get('input').element,
      list = wrapper.get('[role="listbox"]').element
    const inputCalls = previousInput.mock.calls.length
    await wrapper.setProps({ onInputRefChanged: nextInput, onListContainerRefChanged: nextList })
    await settle()
    expect(previousInput).toHaveBeenCalledTimes(inputCalls)
    expect(nextInput).toHaveBeenCalledWith(input)
    expect(previousList).toHaveBeenLastCalledWith(null)
    expect(nextList).toHaveBeenCalledWith(list)
    expect(wrapper.emitted('input-ref-changed')?.at(-1)).toEqual([input])
    expect(wrapper.emitted('list-container-ref-changed')?.at(-1)).toEqual([list])
  })
  it('select-all retains the source fixed ID and label behavior across instances', async () => {
    const first = render({ showSelectAll: true, items: [{ text: 'First' }] })
    const second = render({ showSelectAll: true, items: [{ text: 'Second' }] })
    await settle()
    expect(document.querySelectorAll('#select-all-checkbox')).toHaveLength(2)
    ;(
      second.get('[data-component="FilteredActionList.SelectAllLabel"]').element as HTMLElement
    ).click()
    expect(first.emitted('select-all-change')).toEqual([[true]])
    expect(second.emitted('select-all-change')).toBeUndefined()
  })
  it('loading input retains list while body loading replaces it and SSR exposes ARIA', async () => {
    const wrapper = render({
      items: [{ text: 'Alpha' }],
      loading: true,
      loadingType: FilteredActionListLoadingTypes.input,
    })
    await settle()
    expect(wrapper.find('[role="option"]').exists()).toBe(true)
    await wrapper.setProps({ loadingType: FilteredActionListLoadingTypes.bodySpinner })
    expect(wrapper.find('[role="option"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="filtered-action-list-spinner"]').exists()).toBe(true)
    const html = await renderToString(
      createSSRApp(() => h(FilteredActionList, { items: [], placeholderText: 'Filter' })),
    )
    expect(html).toContain('aria-autocomplete="list"')
    expect(html).toContain('Items will be filtered as you type')
  })
  it('inactive and loading items remain described but cannot be selected', async () => {
    const action = vi.fn()
    const wrapper = render({
      items: [
        {
          id: 'inactive',
          text: 'Unavailable',
          inactiveText: 'Insufficient permission',
          description: 'Permission',
          onAction: action,
        },
        { id: 'loading', text: 'Pending', loading: true, onAction: action },
      ],
    })
    await settle()
    const options = wrapper.findAll('[role="option"]')
    await options[0]!.trigger('click')
    await options[0]!.trigger('keypress', { key: 'Enter' })
    await options[1]!.trigger('click')
    await options[1]!.trigger('keypress', { key: ' ' })
    expect(action).not.toHaveBeenCalled()
    expect(options[0]!.attributes('data-inactive')).toBe('true')
    const descriptionIds = options[0]!.attributes('aria-describedby')!.split(' ')
    expect(descriptionIds.map((id) => document.getElementById(id)?.textContent)).toEqual([
      'Permission',
      'Insufficient permission',
    ])
    expect(options[1]!.text()).toContain('Loading')
    expect(options[1]!.find('[data-component="Spinner"]').exists()).toBe(true)
  })
  it('consumer item attrs override computed props and item class token is duplicated like source clsx chain', async () => {
    const wrapper = render({ items: [{ text: 'Alpha', tabindex: -1, 'aria-selected': false }] })
    await settle()
    const option = wrapper.get('[role="option"]')
    expect(option.attributes('tabindex')).toBe('-1')
    expect(option.attributes('aria-selected')).toBe('false')
    const itemClasses = option.attributes('class')!.split(/\s+/)
    expect(itemClasses).toHaveLength(2)
    expect(itemClasses[0]).toBe(itemClasses[1])
    expect(itemClasses[0]).toContain('filtered-action-list__item_')
  })
  it('fullScreenOnNarrow marks the header for its narrow-screen styles', async () => {
    const wrapper = render({ items: [], fullScreenOnNarrow: true })
    await settle()
    const header = wrapper.get('[data-component="FilteredActionList.Header"]')
    expect(header.attributes('data-full-screen-on-narrow')).toBe('true')
    expect(header.attributes('class')).toMatch(/filtered-action-list__header_/)
  })
  it('body loader dispatches on enum identity, not the name string', async () => {
    const wrapper = render({
      items: [{ text: 'Alpha' }],
      loading: true,
      loadingType: { name: 'body-spinner', appearsInBody: true } as never,
    })
    await settle()
    expect(wrapper.find('[data-testid="filtered-action-list-spinner"]').exists()).toBe(false)
    expect(wrapper.find('[role="option"]').exists()).toBe(false)
  })
})
