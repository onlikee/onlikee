// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Independent test fixtures cover reactive providers. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, nextTick, shallowRef, type Component } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { LiveRegionElement } from '@primer/live-region-element'
import { SelectPanel } from './index'
import { FeatureFlags } from '../FeatureFlags'
import { FormControl } from '../FormControl'
import type { ItemInput } from '../FilteredActionList/types'

globalThis.Element.prototype.scrollTo = vi.fn()

const items: ItemInput[] = [
  { id: 'one', text: 'One' },
  { id: 'two', text: 'Two' },
  { id: 'three', text: 'Three', disabled: true },
]
const wrappers: VueWrapper[] = []
function render(component: Component, options?: { props?: Record<string, unknown> }) {
  const wrapper = mount(component, { attachTo: document.body, ...options })
  wrappers.push(wrapper)
  return wrapper
}
async function settle() {
  await nextTick()
  await flushPromises()
  await nextTick()
}
function option(index = 0) {
  return document.querySelectorAll<HTMLElement>('[role="option"]')[index]!
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
})
afterEach(() => {
  wrappers.forEach((wrapper) => wrapper.unmount())
  wrappers.length = 0
  document.body.innerHTML = ''
  document.body.style.overflow = ''
  vi.restoreAllMocks()
  vi.useRealTimers()
})
describe('SelectPanel behavior', () => {
  it('honors ignored outside refs and source overlay close-handler overrides', async () => {
    const ignored = document.createElement('button')
    document.body.append(ignored)
    const escape = vi.fn(),
      outside = vi.fn()
    const wrapper = render(SelectPanel, {
      props: {
        open: true,
        selected: undefined,
        items,
        overlayProps: {
          ignoreClickRefs: [shallowRef(ignored)],
          onEscape: escape,
          onClickOutside: outside,
        },
      },
    })
    await settle()
    ignored.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    document.body.dispatchEvent(new MouseEvent('mousedown', { button: 2, bubbles: true }))
    expect(outside).not.toHaveBeenCalled()
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    expect(outside).toHaveBeenCalledOnce()
    expect(wrapper.emitted('open-change')).toBeUndefined()
    // 在 body 上派发（真实浏览器中 keydown 的 target 总是元素；popover-polyfill 的
    // Escape 处理读取 target.ownerDocument，直接在 document 上派发会使其为 null）
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    )
    expect(escape).toHaveBeenCalledOnce()
    expect(wrapper.emitted('open-change')).toBeUndefined()
  })
  it('announces rendered notice content again when reopened using source triggers', async () => {
    const region = new LiveRegionElement()
    region.delay = 0
    document.body.append(region)
    const announce = vi.spyOn(region, 'announceFromElement')
    const clear = vi.spyOn(region, 'clear')
    const Notice = defineComponent({
      setup: () => () => h('span', ['Some items ', h('strong', 'unavailable')]),
    })
    const wrapper = render(SelectPanel, {
      props: {
        open: true,
        selected: undefined,
        items,
        notice: { variant: 'warning', text: Notice },
      },
    })
    await settle()
    expect(
      announce.mock.calls.some(([element]) =>
        element.textContent?.includes('Some items unavailable'),
      ),
    ).toBe(true)
    expect(clear).toHaveBeenCalled()
    const count = announce.mock.calls.filter(([element]) =>
      element.textContent?.includes('Some items unavailable'),
    ).length
    await wrapper.setProps({ open: false })
    await settle()
    await wrapper.setProps({ open: true })
    await settle()
    expect(
      announce.mock.calls.filter(([element]) =>
        element.textContent?.includes('Some items unavailable'),
      ),
    ).toHaveLength(count + 1)
    await wrapper.setProps({ open: false })
    await settle()
    region.clear()
    region.remove()
  })
  it('supports subtitle and secondary action slots with their ARIA and footer behavior', async () => {
    const wrapper = mount(SelectPanel, {
      props: { open: true, selected: undefined, items },
      slots: {
        subtitle: 'Slot description',
        secondaryAction: () =>
          h(SelectPanel.SecondaryActionLink, { href: '/labels' }, () => 'Manage labels'),
      },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    await settle()
    const overlay = document.querySelector('[data-component="AnchoredOverlay"]')!
    expect(document.getElementById(overlay.getAttribute('aria-describedby')!)?.textContent).toBe(
      'Slot description',
    )
    expect(
      document
        .querySelector('[data-component="SelectPanel.Footer"]')
        ?.getAttribute('data-display-footer'),
    ).toBe('always')
    const link = document.querySelector<HTMLAnchorElement>(
      '[data-component="SelectPanel.SecondaryActionLink"]',
    )!
    expect(link.tagName).toBe('A')
    expect(link.getAttribute('href')).toBe('/labels')
    expect(link.getAttribute('data-block')).toBe('block')
    expect(link.getAttribute('data-variant')).toBe('invisible')
    const message = mount(SelectPanel.Message, {
      props: { title: 'Details', variant: 'empty' },
      slots: { default: 'Slot body', action: '<button>Retry</button>' },
    })
    wrappers.push(message)
    expect(message.text()).toContain('Slot body')
    expect(message.find('button').text()).toBe('Retry')
  })
  it('uses content width, source icons and single/modal selection visuals', async () => {
    const wrapper = render(SelectPanel, { props: { open: true, selected: items[0], items } })
    await settle()
    expect(
      document.querySelector('[data-component="AnchoredOverlay"]')?.getAttribute('data-width'),
    ).toBe('auto')
    expect(wrapper.find('[data-octicon="triangle-down"]').exists()).toBe(true)
    expect(
      document.querySelector('[data-component="TextInput.LeadingVisual"] [data-octicon="search"]'),
    ).not.toBeNull()
    expect(option().querySelector('[data-octicon="check"]')).not.toBeNull()
    expect(
      document.querySelector('[data-component="SelectPanel.Header"]')?.textContent,
    ).not.toContain('×')
    await wrapper.setProps({ variant: 'modal', onCancel: () => undefined })
    await settle()
    expect(option().querySelector('input[type="radio"]')?.hasAttribute('aria-hidden')).toBe(false)
    expect(option().querySelector('input[type="radio"]')?.getAttribute('tabindex')).toBe('-1')
    expect(
      document.querySelector('[data-component="SelectPanel.CloseButton"] [data-octicon="x"]'),
    ).not.toBeNull()
  })
  it('textInputProps and overlayProps override defaults and preserve placement options', async () => {
    const wrapper = render(SelectPanel, {
      props: {
        open: true,
        selected: undefined,
        items,
        width: 'large',
        height: 'large',
        textInputProps: { leadingVisual: null, 'aria-label': 'Custom filter' },
        overlayProps: {
          width: 'small',
          height: 'small',
          maxWidth: 'medium',
          maxHeight: 'xsmall',
          anchorSide: 'outside-top',
          top: 100,
          left: 50,
          overflow: 'hidden',
          position: 'fixed',
        },
      },
    })
    await settle()
    const overlay = document.querySelector<HTMLElement>('[data-component="AnchoredOverlay"]')!
    expect(overlay.dataset.width).toBe('small')
    expect(overlay.dataset.height).toBe('small')
    expect(overlay.dataset.maxHeight).toBe('xsmall')
    expect(overlay.dataset.maxWidth).toBe('medium')
    expect(overlay.dataset.side).toBe('outside-bottom')
    expect(overlay.style.getPropertyValue('--top')).toBe('100px')
    expect(overlay.style.getPropertyValue('--left')).toBe('50px')
    expect(overlay.style.position).toBe('fixed')
    expect(overlay.getAttribute('overflow')).toBe('hidden')
    expect(overlay.hasAttribute('data-overflow-hidden')).toBe(true)
    expect(overlay.style.overflow).toBe('')
    expect(document.querySelector('[data-octicon="search"]')).toBeNull()
    expect(document.querySelector('[role="combobox"]')?.getAttribute('aria-label')).toBe(
      'Custom filter',
    )
    expect(wrapper.exists()).toBe(true)
  })
  it('calls overlay keydown before stopping printable shortcuts outside the filter', async () => {
    const external = vi.fn()
    const global = vi.fn()
    document.addEventListener('keydown', global)
    render(SelectPanel, {
      props: {
        open: true,
        selected: undefined,
        items,
        variant: 'modal',
        onCancel: () => undefined,
        overlayProps: { onKeydown: external },
      },
    })
    await settle()
    const button = document.querySelector<HTMLButtonElement>(
      '[data-component="SelectPanel.CancelButton"]',
    )!
    button.focus()
    button.dispatchEvent(new KeyboardEvent('keydown', { key: '/', bubbles: true }))
    expect(external).toHaveBeenCalledOnce()
    expect(global).not.toHaveBeenCalled()
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, bubbles: true }))
    expect(external).toHaveBeenCalledTimes(2)
    expect(global).toHaveBeenCalledOnce()
    document.removeEventListener('keydown', global)
  })
  it('delays subsequent filter loading by 1000 ms and aborts on new results', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const wrapper = render(SelectPanel, { props: { open: true, selected: undefined, items } })
    await settle()
    const input = document.querySelector<HTMLInputElement>('[role="combobox"]')!
    input.value = 'updated'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await settle()
    await vi.advanceTimersByTimeAsync(999)
    expect(document.querySelector('[data-component="TextInput"]')?.getAttribute('aria-busy')).toBe(
      'false',
    )
    await vi.advanceTimersByTimeAsync(1)
    await settle()
    expect(document.querySelector('[data-component="TextInput"]')?.getAttribute('aria-busy')).toBe(
      'true',
    )
    await wrapper.setProps({ items: [...items] })
    await settle()
    expect(document.querySelector('[data-component="TextInput"]')?.getAttribute('aria-busy')).toBe(
      'false',
    )
    input.value = 'quick'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await settle()
    await vi.advanceTimersByTimeAsync(500)
    await wrapper.setProps({ items: [...items] })
    await settle()
    await vi.advanceTimersByTimeAsync(1000)
    expect(document.querySelector('[data-component="TextInput"]')?.getAttribute('aria-busy')).toBe(
      'false',
    )
  })
  it('loads an initially empty panel once and changes later loads to input feedback', async () => {
    const wrapper = render(SelectPanel, { props: { open: true, selected: undefined, items: [] } })
    await settle()
    expect(wrapper.emitted('filter-change')).toEqual([['', null]])
    expect(document.querySelector('[data-component="FilteredActionList.Spinner"]')).not.toBeNull()
    await wrapper.setProps({ items })
    await settle()
    expect(document.querySelector('[data-component="FilteredActionList.Spinner"]')).toBeNull()
    await wrapper.setProps({ open: false })
    await wrapper.setProps({ open: true })
    await settle()
    expect(wrapper.emitted('filter-change')).toHaveLength(1)
  })
  it('debounces the initially open narrow viewport, ignores zoom and cleans up on close', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    vi.stubGlobal(
      'matchMedia',
      vi.fn((media: string) => ({
        matches: media.includes('max-width'),
        media,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )
    const viewport = Object.assign(new EventTarget(), { height: 800, scale: 1 })
    vi.stubGlobal('visualViewport', viewport)
    const wrapper = render(SelectPanel, { props: { open: true, selected: undefined, items } })
    await settle()
    viewport.height = 480
    viewport.dispatchEvent(new Event('resize'))
    await vi.advanceTimersByTimeAsync(99)
    const overlay = document.querySelector<HTMLElement>('[data-component="AnchoredOverlay"]')!
    expect(overlay.style.maxHeight).toBe('')
    await vi.advanceTimersByTimeAsync(1)
    await settle()
    expect(overlay.style.maxHeight).toBe('480px')
    viewport.scale = 2
    viewport.height = 240
    viewport.dispatchEvent(new Event('resize'))
    await vi.advanceTimersByTimeAsync(100)
    await settle()
    expect(overlay.style.maxHeight).toBe('480px')
    viewport.scale = 1
    viewport.height = 800
    viewport.dispatchEvent(new Event('resize'))
    await vi.advanceTimersByTimeAsync(100)
    await settle()
    expect(overlay.style.maxHeight).toBe('')
    await wrapper.setProps({ open: false })
    await settle()
    viewport.height = 400
    viewport.dispatchEvent(new Event('resize'))
    await vi.advanceTimersByTimeAsync(100)
    await wrapper.setProps({ open: true })
    await settle()
    expect(
      document.querySelector<HTMLElement>('[data-component="AnchoredOverlay"]')?.style.maxHeight,
    ).toBe('')
  })
  it.each([false, true])(
    'keeps responsive multi footer stretch rules with cancel=%s',
    async (withCancel) => {
      render(
        defineComponent({
          setup: () => () =>
            h(
              FeatureFlags,
              { flags: { primer_react_select_panel_fullscreen_on_narrow: true } },
              {
                default: () =>
                  h(SelectPanel, {
                    open: true,
                    selected: [],
                    items,
                    onCancel: withCancel ? () => undefined : undefined,
                  }),
              },
            ),
        }),
      )
      await settle()
      const footer = document.querySelector<HTMLElement>('[data-component="SelectPanel.Footer"]')!
      expect(footer.dataset.displayFooter).toBe('only-small')
      expect(footer.dataset.stretchSecondaryAction).toBe('only-big')
      expect(footer.dataset.stretchSaveButton).toBe(withCancel ? 'never' : 'only-small')
      expect(document.querySelector('[data-component="SelectPanel.CancelButton"]') !== null).toBe(
        withCancel,
      )
      expect(
        document
          .querySelector('[data-component="SelectPanel.SaveAndCloseButton"]')
          ?.getAttribute('data-block'),
      ).toBe(withCancel ? undefined : 'block')
    },
  )
  it('exposes source compounds and uses controlled anchor open gestures', async () => {
    expect(SelectPanel.Message).toBeTruthy()
    expect(SelectPanel.SecondaryActionButton).toBeTruthy()
    const wrapper = render(SelectPanel, {
      props: { open: false, items, selected: undefined, placeholder: 'Pick' },
    })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('open-change')).toEqual([[true, 'anchor-click']])
    expect(document.querySelector('[data-component="SelectPanel"]')).toBeNull()
    await wrapper.setProps({ open: true })
    await settle()
    expect(document.querySelector('input')?.getAttribute('role')).toBe('combobox')
    expect(document.activeElement).toBe(document.querySelector('input'))
    expect(option().getAttribute('aria-selected')).toBe('false')
  })
  it('single anchored selection emits selection then closes; a prevented item action vetoes it', async () => {
    const wrapper = render(SelectPanel, { props: { open: true, items, selected: undefined } })
    await settle()
    option().click()
    expect(wrapper.emitted('selected-change')?.[0]).toEqual([items[0]])
    expect(wrapper.emitted('open-change')?.[0]).toEqual([false, 'selection'])
    const action = vi.fn((_item: ItemInput, event: MouseEvent | KeyboardEvent) =>
      event.preventDefault(),
    )
    await wrapper.setProps({ items: [{ id: 'veto', text: 'Veto', onAction: action }] })
    option().click()
    expect(action).toHaveBeenCalledOnce()
    expect(wrapper.emitted('selected-change')).toHaveLength(1)
  })
  it('multi selection and select-all preserve selections outside the filtered view', async () => {
    const other: ItemInput = { id: 'outside', text: 'Outside' }
    const selected = shallowRef<ItemInput[]>([other])
    const wrapper = render(
      defineComponent({
        setup: () => () =>
          h(SelectPanel, {
            open: true,
            selected: selected.value,
            items: items.slice(0, 2),
            showSelectAll: true,
            'onUpdate:selected': (value: ItemInput | ItemInput[] | undefined) => {
              selected.value = value as ItemInput[]
            },
          }),
      }),
    )
    await settle()
    option().click()
    await settle()
    expect(selected.value.map((item) => item.id)).toEqual(['outside', 'one'])
    const checkbox = document.querySelector<HTMLInputElement>(
      '[data-component="FilteredActionList"] input[type="checkbox"]',
    )!
    checkbox.click()
    await settle()
    expect(selected.value.map((item) => item.id)).toEqual(['outside', 'one', 'two'])
    checkbox.click()
    await settle()
    expect(selected.value.map((item) => item.id)).toEqual(['outside'])
    expect(wrapper.findComponent(SelectPanel).emitted('open-change')).toBeUndefined()
  })
  it('single modal defers updates until Save and Cancel discards intermediate state', async () => {
    const cancel = vi.fn()
    const wrapper = render(SelectPanel, {
      props: { open: true, selected: items[0], items, variant: 'modal', onCancel: cancel },
    })
    await settle()
    expect(document.body.style.overflow).toBe('hidden')
    option(1).click()
    await settle()
    expect(wrapper.emitted('selected-change')).toBeUndefined()
    expect(option(1).getAttribute('aria-selected')).toBe('true')
    document
      .querySelector<HTMLButtonElement>('[data-component="SelectPanel.CancelButton"]')!
      .click()
    expect(cancel).toHaveBeenCalledOnce()
    expect(wrapper.emitted('open-change')?.[0]).toEqual([false, 'cancel'])
    await wrapper.setProps({ open: false })
    await wrapper.setProps({ open: true })
    await settle()
    expect(option().getAttribute('aria-selected')).toBe('true')
    option(1).click()
    await settle()
    document.querySelector<HTMLButtonElement>('[data-component="SelectPanel.SaveButton"]')!.click()
    expect(wrapper.emitted('selected-change')?.[0]).toEqual([items[1]])
    expect(wrapper.emitted('open-change')?.[1]).toEqual([false, 'selection'])
  })
  it('outside cancel and Escape keep their distinct source callback behavior', async () => {
    const cancel = vi.fn()
    const wrapper = render(SelectPanel, {
      props: { open: true, selected: undefined, items, variant: 'modal', onCancel: cancel },
    })
    await settle()
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    expect(cancel).toHaveBeenCalledOnce()
    expect(wrapper.emitted('open-change')?.[0]).toEqual([false, 'click-outside'])
    // 在 body 上派发（真实浏览器中 keydown 的 target 总是元素；popover-polyfill 的
    // Escape 处理读取 target.ownerDocument，直接在 document 上派发会使其为 null）
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    )
    expect(wrapper.emitted('open-change')?.[1]).toEqual([false, 'escape'])
    expect(cancel).toHaveBeenCalledOnce()
  })
  it('forwards filtering events and restores rejected controlled input updates', async () => {
    const wrapper = render(SelectPanel, {
      props: { open: true, selected: undefined, items, filterValue: 'One' },
    })
    await settle()
    const input = document.querySelector<HTMLInputElement>('input')!
    input.value = 'Two'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await settle()
    expect(wrapper.emitted('filter-change')?.[0]?.[0]).toBe('Two')
    expect(wrapper.emitted('update:filterValue')?.[0]).toEqual(['Two'])
    expect(input.value).toBe('One')
  })
  it('renders grouped items, loading skeleton, message actions and secondary footer', async () => {
    const wrapper = render(SelectPanel, {
      props: {
        open: true,
        selected: undefined,
        items: [],
        loading: true,
        initialLoadingType: 'skeleton',
        secondaryAction: h(SelectPanel.SecondaryActionButton, {}, { default: () => 'Create' }),
      },
    })
    await settle()
    expect(document.querySelector('[data-testid="filtered-action-list-skeleton"]')).not.toBeNull()
    expect(
      document.querySelector('[data-component="SelectPanel.SecondaryActionButton"]')?.textContent,
    ).toBe('Create')
    await wrapper.setProps({
      loading: false,
      items: [
        { id: 'a', text: 'Alpha', groupId: 'a' },
        { id: 'b', text: 'Beta', groupId: 'b' },
      ],
      groupMetadata: [
        { groupId: 'b', header: { title: 'B group' } },
        { groupId: 'a', header: { title: 'A group' } },
      ],
    })
    expect(option().textContent).toContain('Beta')
    await wrapper.setProps({
      message: {
        title: 'Failed',
        body: 'Try again',
        variant: 'error',
        action: h('button', 'Retry'),
      },
    })
    expect(document.querySelector('[data-component="SelectPanel.Message"]')?.textContent).toContain(
      'Retry',
    )
  })
  it('auto-wires FormControl label and selected-value IDs without label for', async () => {
    render(
      defineComponent({
        setup: () => () =>
          h(
            FormControl,
            { id: 'control' },
            {
              default: () => [
                h(FormControl.Label, {}, { default: () => 'Labels' }),
                h(SelectPanel, { open: false, items, selected: items[0] }),
              ],
            },
          ),
      }),
    )
    await settle()
    const button = document.querySelector('button')!
    expect(button.getAttribute('aria-labelledby')).toBe('control-label control-selected-value')
    expect(document.querySelector('label')?.hasAttribute('for')).toBe(false)
    expect(document.getElementById('control-selected-value')?.textContent).toBe('One')
  })
  it('orders selected items only when the feature is enabled', async () => {
    const wrapper = render(
      defineComponent({
        setup: () => () =>
          h(
            FeatureFlags,
            { flags: { primer_react_select_panel_order_selected_at_top: true } },
            { default: () => h(SelectPanel, { open: true, selected: [items[1]!], items }) },
          ),
      }),
    )
    await settle()
    expect(option().textContent).toContain('One')
    expect(wrapper.exists()).toBe(true)
  })
  it('fullscreen feature is reactive and disableFullscreenOnNarrow overrides it', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((media: string) => ({
        matches: media.includes('max-width'),
        media,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )
    const disabled = shallowRef(false)
    render(
      defineComponent({
        setup: () => () =>
          h(
            FeatureFlags,
            { flags: { primer_react_select_panel_fullscreen_on_narrow: true } },
            {
              default: () =>
                h(SelectPanel, {
                  open: true,
                  selected: [],
                  items,
                  disableFullscreenOnNarrow: disabled.value,
                }),
            },
          ),
      }),
    )
    await settle()
    expect(document.querySelector('[data-responsive="fullscreen"]')).not.toBeNull()
    expect(document.body.style.overflow).toBe('hidden')
    expect(
      document.querySelector('[data-component="SelectPanel.SaveAndCloseButton"]'),
    ).not.toBeNull()
    disabled.value = true
    await settle()
    expect(document.querySelector('[data-responsive="fullscreen"]')).toBeNull()
    expect(document.body.style.overflow).toBe('')
  })
  it('keyboard opening and clicking an already open anchor preserve source gestures and focus returns', async () => {
    const wrapper = render(SelectPanel, { props: { open: false, selected: undefined, items } })
    const button = wrapper.get('button')
    button.element.focus()
    await button.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('open-change')?.[0]).toEqual([true, 'anchor-key-press'])
    await wrapper.setProps({ open: true })
    await settle()
    await button.trigger('click')
    expect(wrapper.emitted('open-change')?.[1]).toEqual([false, 'anchor-click'])
    await wrapper.setProps({ open: false })
    await settle()
    expect(document.activeElement).toBe(button.element)
  })
  it('SSR emits a stable anchor without accessing the browser', async () => {
    const html = await renderToString(
      createSSRApp(() =>
        h(SelectPanel, { open: false, selected: items[0], items, id: 'ssr-panel' }),
      ),
    )
    expect(html).toContain('id="ssr-panel"')
    expect(html).toContain('aria-expanded="false"')
    expect(html).not.toContain('data-component="SelectPanel"')
  })
  it('uses explicit visual properties before corresponding named slots', async () => {
    const wrapper = mount(SelectPanel, {
      props: {
        open: true,
        selected: undefined,
        items,
        title: 'Property title',
        subtitle: 'Property subtitle',
        footer: 'Property footer',
        renderAnchor: (props) => h('button', props, 'Property anchor'),
      },
      slots: {
        title: 'Slot title',
        subtitle: 'Slot subtitle',
        footer: 'Slot footer',
        anchor: 'Slot anchor',
      },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    await settle()
    expect(wrapper.text()).toContain('Property anchor')
    expect(wrapper.text()).not.toContain('Slot anchor')
    expect(document.querySelector('[data-component="SelectPanel.Title"]')?.textContent).toBe(
      'Property title',
    )
    expect(document.querySelector('[data-component="SelectPanel.Subtitle"]')?.textContent).toBe(
      'Property subtitle',
    )
    expect(document.querySelector('[data-component="SelectPanel.Footer"]')?.textContent).toBe(
      'Property footer',
    )
  })
  it('renders component-valued nodes, discards overlay styles and retains item/list numeric units', async () => {
    const Title = defineComponent({ setup: () => () => h('strong', 'Component title') })
    const Body = defineComponent({ setup: () => () => h('em', 'Component body') })
    const Action = defineComponent({ setup: () => () => h('button', 'Component action') })
    const wrapper = render(SelectPanel, {
      props: {
        open: true,
        selected: undefined,
        title: Title,
        footer: Action,
        items: [{ id: 'styled', text: 'Styled item', style: { marginTop: 4 } }],
        actionListProps: { style: { paddingTop: 12 } },
        overlayProps: {
          style: { paddingTop: 24, width: 480, lineHeight: 1.5, opacity: 0.9, '--panel-scale': 2 },
        },
      },
    })
    await settle()
    expect(document.querySelector('[data-component="SelectPanel.Title"] strong')?.textContent).toBe(
      'Component title',
    )
    expect(
      document.querySelector('[data-component="SelectPanel.Footer"] button')?.textContent,
    ).toBe('Component action')
    const overlay = document.querySelector<HTMLElement>('[data-component="AnchoredOverlay"]')!
    expect(overlay.style.paddingTop).toBe('')
    expect(overlay.style.width).toBe('')
    expect(overlay.style.lineHeight).toBe('')
    expect(overlay.style.opacity).toBe('')
    expect(overlay.style.getPropertyValue('--panel-scale')).toBe('')
    expect(document.querySelector<HTMLElement>('[role="listbox"]')?.style.paddingTop).toBe('12px')
    expect(option().style.marginTop).toBe('4px')
    await wrapper.setProps({
      message: { title: 'Message', variant: 'error', body: Body, action: Action },
    })
    expect(
      document.querySelector('[data-component="SelectPanel.MessageBody"] em')?.textContent,
    ).toBe('Component body')
    expect(
      document.querySelector('[data-component="SelectPanel.MessageAction"] button')?.textContent,
    ).toBe('Component action')
  })
  it('omits the header data-variant when fullscreen is not enabled', async () => {
    // useResponsiveValue 收到非响应式值 undefined 时原样返回（useResponsiveValue.ts:72-76）→ 属性整体省略
    render(SelectPanel, { props: { open: true, selected: undefined, items } })
    await settle()
    expect(
      document.querySelector('[data-component="SelectPanel.Header"]')?.hasAttribute('data-variant'),
    ).toBe(false)
  })
  it('resolves the header data-variant responsively when fullscreen is enabled', async () => {
    const FlagOn = defineComponent({
      setup: () => () =>
        h(
          FeatureFlags,
          { flags: { primer_react_select_panel_fullscreen_on_narrow: true } },
          { default: () => h(SelectPanel, { open: true, selected: undefined, items }) },
        ),
    })
    // 常规视口（beforeEach 的 matchMedia 桩 matches:false）→ regular 值 'anchored'
    render(FlagOn)
    await settle()
    expect(
      document
        .querySelectorAll('[data-component="SelectPanel.Header"]')[0]
        ?.getAttribute('data-variant'),
    ).toBe('anchored')
    // narrow 视口 → 'fullscreen'
    vi.stubGlobal(
      'matchMedia',
      vi.fn((media: string) => ({
        matches: media.includes('max-width'),
        media,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )
    render(FlagOn)
    await settle()
    expect(
      document
        .querySelectorAll('[data-component="SelectPanel.Header"]')[1]
        ?.getAttribute('data-variant'),
    ).toBe('fullscreen')
  })
  it('renders the modal Backdrop as an in-place sibling, not teleported to body', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const wrapper = mount(SelectPanel, {
      attachTo: host,
      props: {
        open: true,
        variant: 'modal',
        onCancel: () => undefined,
        selected: undefined,
        items,
      },
    })
    wrappers.push(wrapper)
    await settle()
    expect(
      document.body.querySelector(':scope > [data-component="SelectPanel.Backdrop"]'),
    ).toBeNull()
    expect(host.querySelector('[data-component="SelectPanel.Backdrop"]')).not.toBeNull()
  })
  it('SecondaryActionLink defaults as to "a" and lets a consumer as win', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const host = document.createElement('div')
    document.body.append(host)
    const link = mount(SelectPanel.SecondaryActionLink, {
      attachTo: host,
      attrs: { href: '/labels' },
      slots: { default: 'Manage' },
    })
    wrappers.push(link)
    await settle()
    expect(
      host
        .querySelector('a[data-component="SelectPanel.SecondaryActionLink"]')
        ?.getAttribute('href'),
    ).toBe('/labels')
    const customHost = document.createElement('div')
    document.body.append(customHost)
    const custom = mount(SelectPanel.SecondaryActionLink, {
      attachTo: customHost,
      attrs: { as: 'span' },
      slots: { default: 'Manage' },
    })
    wrappers.push(custom)
    await settle()
    expect(
      customHost.querySelector('span[data-component="SelectPanel.SecondaryActionLink"]'),
    ).not.toBeNull()
    expect(customHost.querySelector('a')).toBeNull()
    warn.mockRestore()
  })
})
