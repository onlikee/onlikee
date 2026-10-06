// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Fixtures exercise controlled bindings and source feature branches. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, reactive, shallowRef, toRaw, type Component } from 'vue'
import { LiveRegionElement } from '@primer/live-region-element'
import { SelectPanel } from './index'
import { FeatureFlags } from '../FeatureFlags'
import type { ItemInput } from './index'

globalThis.Element.prototype.scrollTo = vi.fn()
const options: ItemInput[] = [{ id: 0, text: 'Zero' }, { id: 'two', text: 'Two' }]
const wrappers: VueWrapper[] = []
function render(component: Component = SelectPanel, props: Record<string, unknown> = {}) {
  const wrapper = mount(component, { props: component === SelectPanel ? { open: true, items: options, selected: undefined, ...props } : props, attachTo: document.body })
  wrappers.push(wrapper)
  return wrapper
}
async function settle() { await nextTick(); await flushPromises(); await nextTick() }
async function filter(text: string) { const input = document.querySelector<HTMLInputElement>('input')!; input.value = text; input.dispatchEvent(new Event('input', { bubbles: true })); await settle() }
function option(index = 0) { return document.querySelectorAll<HTMLElement>('[role="option"]')[index]! }
function liveRegion() { const region = new LiveRegionElement(); region.delay = 0; document.body.append(region); return region }
beforeEach(() => vi.stubGlobal('matchMedia', vi.fn((media: string) => ({ matches: false, media, addEventListener: vi.fn(), removeEventListener: vi.fn() }))))
afterEach(() => {
  for (const wrapper of wrappers) wrapper.unmount()
  wrappers.length = 0
  document.querySelector('live-region')?.clear()
  document.body.innerHTML = ''
  document.body.style.overflow = ''
  vi.restoreAllMocks(); vi.useRealTimers()
})
describe('SelectPanel behavior', () => {
  it.each(['same', 'copy', 'proxy'] as const)('anchored toggle uses reference identity with %s selection', async kind => {
    const selected = kind === 'copy' ? { ...options[0] } : kind === 'proxy' ? reactive(options[0]! as object) as ItemInput : options[0]
    const wrapper = render(SelectPanel, { selected })
    await settle()
    expect(option().getAttribute('aria-selected')).toBe('true')
    option().click()
    expect(wrapper.emitted('selected-change')?.[0]).toEqual([kind === 'copy' ? options[0] : undefined])
    expect(wrapper.emitted('open-change')?.[0]).toEqual([false, 'selection'])
  })
  it('single modal toggles matching IDs but leaves a first no-ID click unselected', async () => {
    const wrapper = render(SelectPanel, { variant: 'modal', onCancel: () => undefined, selected: { ...options[0] } })
    await settle()
    option().click(); await settle()
    expect(option().getAttribute('aria-selected')).toBe('false')
    document.querySelector<HTMLButtonElement>('[data-component="SelectPanel.SaveButton"]')!.click()
    expect(wrapper.emitted('selected-change')?.[0]).toEqual([undefined])
    await wrapper.setProps({ items: [{ text: 'No ID' }], selected: undefined }); await settle()
    option().click(); await settle()
    expect(option().getAttribute('aria-selected')).toBe('false')
    document.querySelector<HTMLButtonElement>('[data-component="SelectPanel.SaveButton"]')!.click()
    expect(wrapper.emitted('selected-change')?.[1]).toEqual([undefined])
  })
  it('multi selection uses IDs or underlying object references and retains the original item', async () => {
    const noId: ItemInput = { text: 'No ID' }
    const wrapper = render(SelectPanel, { items: [...options, noId], selected: [{ ...options[0] }, reactive(noId as object) as ItemInput] })
    await settle()
    option().click()
    expect(wrapper.emitted('selected-change')?.[0]).toEqual([[noId]])
    option(2).click()
    expect(wrapper.emitted('selected-change')?.[1]).toEqual([[options[0]]])
  })
  it('inherited selected: undefined suppresses selection attributes', async () => {
    const inherited = Object.assign(Object.create({ selected: undefined }) as ItemInput, { id: 'inherited', text: 'Inherited' })
    render(SelectPanel, { items: [inherited], selected: inherited })
    await settle()
    expect(option().hasAttribute('aria-selected')).toBe(false)
  })
  it('item action runs before selection and close, and receives the mapped item', async () => {
    const calls: string[] = []
    const action = vi.fn(() => calls.push('action'))
    render(SelectPanel, { items: [{ ...options[0], onAction: action, item: options[1] }], onSelectedChange: () => calls.push('selected'), onOpenChange: () => calls.push('close') })
    await settle()
    option().click()
    expect(calls).toEqual(['action', 'selected', 'close'])
    expect(action.mock.calls[0]).toBeDefined()
    const passed = (action.mock.calls[0] as unknown as [ItemInput])[0]
    expect(passed.id).toBe(0)
    expect(passed.selected).toBe(false)
    expect(toRaw(passed.item as object)).toBe(options[1])
  })
  it('sort snapshot resets on opening and filter clear, not selection changes', async () => {
    const open = shallowRef(false), selected = shallowRef<ItemInput[]>([options[1]!])
    render(defineComponent({ setup: () => () => h(FeatureFlags, { flags: { primer_react_select_panel_order_selected_at_top: true } }, () => h(SelectPanel, { open: open.value, selected: selected.value, items: options })) }))
    await settle(); open.value = true; await settle()
    expect(option().textContent).toContain('Two')
    selected.value = [options[0]!]; await settle()
    expect(option().textContent).toContain('Two')
    const input = document.querySelector<HTMLInputElement>('input')!
    input.value = 'x'; input.dispatchEvent(new Event('input', { bubbles: true })); await settle()
    input.value = ''; input.dispatchEvent(new Event('input', { bubbles: true })); await settle()
    expect(option().textContent).toContain('Zero')
  })
  it('first items arriving reset sort but copied no-ID items keep source order', async () => {
    const items = shallowRef<ItemInput[]>([])
    const noId = { text: 'No ID' }
    render(defineComponent({ setup: () => () => h(FeatureFlags, { flags: { primer_react_select_panel_order_selected_at_top: true } }, () => h(SelectPanel, { open: true, loading: false, selected: [options[1]!, noId], items: items.value })) }))
    await settle(); items.value = [noId, ...options]; await settle()
    expect(option().textContent).toContain('Two')
    expect(option(1).textContent).toContain('No ID')
  })
  it('first population reacts to filter changes and switching to internal loading', async () => {
    const wrapper = render(SelectPanel, { items: [], loading: false, filterValue: 'first' })
    await settle()
    expect(wrapper.emitted('filter-change')).toBeUndefined()
    await wrapper.setProps({ loading: undefined }); await settle()
    expect(wrapper.emitted('filter-change')).toEqual([['first', null]])
    await wrapper.setProps({ filterValue: 'second' }); await settle()
    expect(wrapper.emitted('filter-change')?.[1]).toEqual(['second', null])
    await wrapper.setProps({ items: [] }); await settle()
    expect(wrapper.emitted('filter-change')).toHaveLength(2)
    expect(document.querySelector('[data-component="SelectPanel.Message"]')?.textContent).toContain('No items available')
  })
  it('external false does not suppress existing internal loading and item changes do not reset it', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const wrapper = render()
    await settle(); await filter('slow')
    await vi.advanceTimersByTimeAsync(1000); await settle()
    await wrapper.setProps({ loading: false, items: [...options] }); await settle()
    expect(document.querySelector('[data-component="TextInput"]')?.getAttribute('aria-busy')).toBe('true')
    await wrapper.setProps({ loading: undefined }); await settle()
    expect(document.querySelector('[data-component="TextInput"]')?.getAttribute('aria-busy')).toBe('true')
    await wrapper.setProps({ items: [...options] }); await settle()
    expect(document.querySelector('[data-component="TextInput"]')?.getAttribute('aria-busy')).toBe('false')
  })
  it('loading timer still announces after close with the source 500ms announcement delay', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const region = liveRegion(), announce = vi.spyOn(region, 'announce')
    const wrapper = render()
    await settle(); await filter('slow')
    await wrapper.setProps({ open: false }); await settle()
    await vi.advanceTimersByTimeAsync(1000); await settle()
    expect(announce.mock.calls.filter(([text]) => text === 'Loading.')).toHaveLength(1)
    expect(announce.mock.calls.find(([text]) => text === 'Loading.')?.[1]?.delayMs).toBe(500)
    await wrapper.setProps({ open: true }); await settle()
    await filter('again')
    await vi.advanceTimersByTimeAsync(1000); await settle()
    expect(announce.mock.calls.filter(([text]) => text === 'Loading.')).toHaveLength(2)
  })
  it('unmount clears loading timers, and external loading alone does not announce Loading', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const region = liveRegion(), announce = vi.spyOn(region, 'announce')
    const wrapper = render()
    await settle(); await filter('slow')
    wrapper.unmount(); wrappers.splice(wrappers.indexOf(wrapper), 1)
    await vi.advanceTimersByTimeAsync(1500); await settle()
    expect(announce.mock.calls.filter(([text]) => text === 'Loading.')).toHaveLength(0)
    const external = render(SelectPanel, { loading: true, items: [] })
    await settle(); await vi.advanceTimersByTimeAsync(1500)
    expect(announce.mock.calls.filter(([text]) => text === 'Loading.')).toHaveLength(0)
    expect(external.emitted('filter-change')).toBeUndefined()
  })
  it('notice uses library default delay and repeats on equal-content replacement', async () => {
    const region = liveRegion(), announce = vi.spyOn(region, 'announceFromElement')
    const wrapper = render(SelectPanel, { notice: { text: 'Notice text', variant: 'info' } })
    await settle()
    const noticeCalls = () => announce.mock.calls.filter(([node]) => node.textContent?.includes('Notice text'))
    expect(noticeCalls()).toHaveLength(1)
    expect(noticeCalls()[0]?.[1]?.delayMs).toBeUndefined()
    await wrapper.setProps({ notice: { text: 'Notice text', variant: 'info' } }); await settle()
    expect(noticeCalls()).toHaveLength(2)
  })
  it('external ref callbacks replace panel ref handling rather than composing it', async () => {
    const inputChanged = vi.fn(), listChanged = vi.fn()
    const wrapper = render(SelectPanel, { onInputRefChanged: inputChanged, onListContainerRefChanged: listChanged })
    await settle()
    expect(inputChanged).toHaveBeenCalledWith(document.querySelector('input'))
    expect(listChanged).toHaveBeenCalledWith(document.querySelector('[role="listbox"]'))
    const panel = wrapper.vm as unknown as { input: HTMLInputElement | null; list: HTMLElement | null }
    expect(panel.input).toBeNull(); expect(panel.list).toBeNull()
  })
  it('changing ref callbacks notifies the replacement and detaches the old list callback', async () => {
    const previousInput = vi.fn(), nextInput = vi.fn(), previousList = vi.fn(), nextList = vi.fn()
    const wrapper = render(SelectPanel, { onInputRefChanged: previousInput, onListContainerRefChanged: previousList })
    await settle()
    const element = document.querySelector('input'), list = document.querySelector('[role="listbox"]')
    const previousInputCalls = previousInput.mock.calls.length
    await wrapper.setProps({ onInputRefChanged: nextInput, onListContainerRefChanged: nextList }); await settle()
    expect(previousInput).toHaveBeenCalledTimes(previousInputCalls)
    expect(nextInput).toHaveBeenCalledWith(element)
    expect(previousList).toHaveBeenLastCalledWith(null)
    expect(nextList).toHaveBeenCalledWith(list)
  })
  it('replacing anchorRef rewires the rendered anchor and clears its previous ref', async () => {
    const previous = shallowRef<HTMLElement | null>(null), next = shallowRef<HTMLElement | null>(null)
    const useNext = shallowRef(false)
    const wrapper = render(defineComponent({ setup: () => () => h(SelectPanel, { open: false, selected: undefined, items: options, anchorRef: useNext.value ? next : previous }) }))
    await settle()
    const button = wrapper.get('button').element
    expect(previous.value).toBe(button)
    useNext.value = true; await settle()
    expect(previous.value).toBeNull(); expect(next.value).toBe(button)
    expect(button.getAttribute('aria-haspopup')).toBe('true')
    expect(button.getAttribute('tabindex')).toBe('0')
    expect(button.hasAttribute('aria-controls')).toBe(false)
    expect((wrapper.findComponent(SelectPanel).vm as unknown as { anchor: HTMLElement }).anchor).toBe(button)
  })
  it('numeric keys follow source propagation rules and modifier shortcuts bubble', async () => {
    const global = vi.fn(), external = vi.fn()
    document.addEventListener('keydown', global)
    try {
      render(SelectPanel, { variant: 'modal', onCancel: () => undefined, overlayProps: { onKeydown: external } })
      await settle()
      const button = document.querySelector<HTMLButtonElement>('[data-component="SelectPanel.CancelButton"]')!
      button.focus(); button.dispatchEvent(new KeyboardEvent('keydown', { key: '7', bubbles: true }))
      expect(external).toHaveBeenCalledOnce(); expect(global).not.toHaveBeenCalled()
      button.dispatchEvent(new KeyboardEvent('keydown', { key: '7', ctrlKey: true, bubbles: true }))
      expect(global).toHaveBeenCalledOnce()
    } finally { document.removeEventListener('keydown', global) }
  })
  it('message title fallback uses source truthiness and explicit messages suppress internal loading', async () => {
    const wrapper = render(SelectPanel, { items: [], message: { title: '', body: 'Details', variant: 'error' } })
    await settle()
    expect(document.querySelector('[data-component="FilteredActionList.Spinner"]')).toBeNull()
    expect(document.querySelector('[data-component="SelectPanel.MessageBody"]')?.textContent).toBe('Details')
    expect(wrapper.findComponent({ name: 'FilteredActionList' }).props('messageText')).toEqual({ title: 'No items available', description: 'Details' })
  })
  it('keeps source DOM wrappers and hidden help text before select-all and the scroll body', async () => {
    render(SelectPanel, { selected: [], placeholder: 'Select items', showSelectAll: true, notice: { text: 'Notice body', variant: 'info' } })
    await settle()
    expect(document.querySelector('[data-component="SelectPanel.Header"]')?.tagName).toBe('DIV')
    const banner = document.querySelector('[data-component="Banner"]')!
    expect(banner.tagName).toBe('SECTION')
    expect(banner.querySelector('[data-component="Banner.Title"]')?.tagName).toBe('H2')
    expect(banner.querySelector('[data-component="Banner.Description"]')?.textContent).toBe('Notice body')
    const list = document.querySelector('[data-component="FilteredActionList"]')!
    expect(Array.from(list.children).map(node => node.tagName)).toEqual(['DIV', 'SPAN', 'DIV', 'DIV'])
    const row = option().firstElementChild!
    expect(row.tagName).toBe('DIV')
    expect(row.children[0]?.tagName).toBe('SPAN')
    expect(row.querySelector('[data-component="ActionList.Selection"]')?.firstElementChild?.tagName).toBe('DIV')
    const anchor = document.querySelector('[data-component="Button"]')!
    expect(anchor.querySelector('[data-component="buttonContent"]')?.children).toHaveLength(1)
    expect(anchor.children[1]?.getAttribute('data-component')).toBe('trailingAction')
  })
  it('viewport height survives close/reopen and uses the fractional narrow breakpoint', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const matchMedia = vi.fn((media: string) => ({ matches: media.includes('max-width'), media, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    vi.stubGlobal('matchMedia', matchMedia)
    const viewport = Object.assign(new EventTarget(), { height: 800, scale: 1 })
    vi.stubGlobal('visualViewport', viewport)
    const wrapper = render(); await settle()
    viewport.height = 480; viewport.dispatchEvent(new Event('resize'))
    await vi.advanceTimersByTimeAsync(100); await settle()
    await wrapper.setProps({ open: false }); await wrapper.setProps({ open: true }); await settle()
    expect(document.querySelector<HTMLElement>('[data-component="AnchoredOverlay"]')?.style.maxHeight).toBe('480px')
    expect(matchMedia).toHaveBeenCalledWith('(max-width: calc(768px - 0.02px))')
  })
})
