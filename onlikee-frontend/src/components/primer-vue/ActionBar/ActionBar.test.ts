// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Fixtures cover nested and conditional toolbar children. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, shallowRef, type VNode } from 'vue'
import { ActionBar } from './index'

const wrappers: VueWrapper[] = []
const Icon = () => h('svg', { width: 16, height: 16 })
const icon = (label: string, props = {}) => h(ActionBar.IconButton, { icon: Icon, 'aria-label': label, unsafeDisableTooltip: true, ...props })
const text = (label: string, props = {}) => h(ActionBar.Button, props, { default: () => label })
const observers: MockIntersectionObserver[] = []
class MockIntersectionObserver {
  elements = new Set<Element>()
  callback: IntersectionObserverCallback
  options: IntersectionObserverInit
  constructor(callback: IntersectionObserverCallback, options: IntersectionObserverInit) {
    this.callback = callback; this.options = options; observers.push(this)
  }
  observe(element: Element) {
    if (!(element instanceof Element)) throw new TypeError('IntersectionObserver requires an Element')
    this.elements.add(element)
  }
  unobserve(element: Element) { this.elements.delete(element) }
  disconnect() { this.elements.clear() }
  notify(elements: Element[], ratio: number) {
    this.callback(elements.map(target => ({ target, isIntersecting: ratio > 0, intersectionRatio: ratio })) as IntersectionObserverEntry[], this as unknown as IntersectionObserver)
  }
}
async function settle() { await nextTick(); await flushPromises(); await nextTick() }
function render(children: () => VNode[], props = {}) {
  const wrapper = mount(defineComponent({ setup: () => () => h(ActionBar, { 'aria-label': 'Toolbar', ...props }, { default: children }) }), { attachTo: document.body })
  wrappers.push(wrapper)
  return wrapper
}
function keyboard(element: Element, key: string, type = 'keydown') {
  const event = new KeyboardEvent(type, { key, bubbles: true, cancelable: true })
  element.dispatchEvent(event)
  return event
}
function menuItems() { return Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]')) }
async function overflow(wrapper: VueWrapper, selector = '[data-component="IconButton"], [data-component="Button"], [data-component="ActionBar.VerticalDivider"]') {
  observers[0]!.notify(wrapper.findAll(selector).map(node => node.element), 0)
  await settle()
  await wrapper.get('.action-bar-more').trigger('click')
  await settle()
}
beforeEach(() => {
  observers.length = 0
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 320, 32))
})
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount())
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('ActionBar source behavior', () => {
  it('observes the native element when a tooltip button mounts with a fragment root', async () => {
    const wrapper = render(() => [h(ActionBar.IconButton, { icon: Icon, 'aria-label': 'Tooltip button' })])
    await settle()
    expect(observers[0]!.elements.has(wrapper.get('[data-component=IconButton]').element)).toBe(true)
    await overflow(wrapper)
    const menu = document.querySelector('[role=menu]')!
    expect(menu.getAttribute('aria-labelledby')).toBe(wrapper.get('.action-bar-more').attributes('aria-labelledby'))
  })
  it('labels the toolbar and inherits size, gap and flush', async () => {
    const wrapper = render(() => [icon('Bold'), text('Code'), h(ActionBar.Group, null, { default: () => icon('Italic') }), h(ActionBar.Divider)], { size: 'large', gap: 'none', flush: true, class: 'custom' })
    await settle()
    const toolbar = wrapper.get('[role=toolbar]')
    expect(toolbar.attributes('aria-label')).toBe('Toolbar')
    expect(toolbar.attributes('data-size')).toBe('large')
    expect(toolbar.attributes('data-gap')).toBe('none')
    expect(wrapper.get('[data-component=ActionBar]').attributes('data-flush')).toBe('true')
    expect(wrapper.get('[data-component=ActionBar]').classes()).toContain('custom')
    expect(wrapper.get('[aria-label=Bold]').attributes('data-size')).toBe('large')
    expect(wrapper.get('[aria-label=Italic]').attributes('data-size')).toBe('large')
    expect(wrapper.get('[data-component="ActionBar.VerticalDivider"]').attributes('aria-hidden')).toBe('true')
    expect(observers).toHaveLength(1)
    expect(observers[0]!.options.root).toBe(toolbar.element)
  })
  it('keeps disabled icon and text buttons focusable and blocks selection both in the toolbar and overflow', async () => {
    const blocked = vi.fn(), clicked = vi.fn()
    const wrapper = render(() => [icon('Disabled', { disabled: true, onClick: blocked }), text('Disabled text', { disabled: true, onClick: blocked }), icon('Enabled', { onClick: clicked })])
    await settle()
    const button = wrapper.get('[aria-label=Disabled]')
    expect(button.attributes('disabled')).toBeUndefined()
    expect(button.attributes('aria-disabled')).toBe('true')
    ;(button.element as HTMLElement).focus()
    expect(document.activeElement).toBe(button.element)
    await button.trigger('click')
    await wrapper.get('[data-component=Button]').trigger('click')
    await wrapper.get('[aria-label=Enabled]').trigger('click')
    expect(blocked).not.toHaveBeenCalled()
    expect(clicked).toHaveBeenCalledOnce()
    await overflow(wrapper)
    menuItems()[0]!.click()
    keyboard(menuItems()[1]!, 'Enter', 'keypress')
    expect(blocked).not.toHaveBeenCalled()
    menuItems()[2]!.click()
    await settle()
    expect(clicked).toHaveBeenCalledTimes(2)
    expect(menuItems()).toHaveLength(0)
  })
  it('preserves deep child order and rich text/leading visuals in the overflow menu', async () => {
    const Nested = defineComponent({ setup: () => () => [icon('Second'), text('Third', { leadingVisual: Icon })] })
    const wrapper = render(() => [icon('First'), h(Nested), h(ActionBar.Divider), icon('Last')])
    await settle()
    await overflow(wrapper)
    expect(menuItems().map(item => item.textContent?.trim())).toEqual(['First', 'Second', 'Third', 'Last'])
    expect(document.querySelector('[role=menu] [data-component="ActionList.Divider"]')).not.toBeNull()
    expect(menuItems()[2]!.querySelector('svg')).not.toBeNull()
  })
  it('inherits clipping for grouped items and observes only the group', async () => {
    const wrapper = render(() => [icon('First'), h(ActionBar.Group, null, { default: () => [icon('Bold'), icon('Italic'), h(ActionBar.Group, null, { default: () => icon('Code') })] })])
    await settle()
    const group = wrapper.get('[data-component="ActionBar.Group"]')
    expect(observers[0]!.elements.has(group.element)).toBe(true)
    expect(observers[0]!.elements.has(wrapper.get('[aria-label=Bold]').element)).toBe(false)
    await overflow(wrapper, '[data-component="ActionBar.Group"]')
    expect(menuItems().map(item => item.textContent?.trim())).toEqual(['Bold', 'Italic', 'Code'])
    expect(wrapper.get('[aria-label=Bold]').attributes('data-overflowing')).toBe('')
    expect(wrapper.get('[aria-label=First]').attributes('data-overflowing')).toBeUndefined()
  })
  it('updates and removes conditional children without leaving stale menu entries', async () => {
    const show = shallowRef(true), label = shallowRef('Middle')
    const wrapper = render(() => [icon('First'), ...(show.value ? [icon(label.value)] : []), icon('Last')])
    await settle()
    await overflow(wrapper)
    label.value = 'Updated'; await settle()
    expect(menuItems().map(item => item.textContent?.trim())).toEqual(['First', 'Updated', 'Last'])
    show.value = false; await settle()
    expect(menuItems().map(item => item.textContent?.trim())).toEqual(['First', 'Last'])
    observers[0]!.notify([...observers[0]!.elements], 1); await settle()
    expect(menuItems()).toHaveLength(0)
    expect(wrapper.get('.action-bar-more').attributes('data-more-button-inactive')).toBe('true')
    wrapper.unmount(); wrappers.splice(wrappers.indexOf(wrapper), 1)
    expect(observers[0]!.elements.size).toBe(0)
  })
  it('tracks DOM order when a deeply nested component reorders existing buttons', async () => {
    const reversed = shallowRef(false)
    const Nested = defineComponent({ setup: () => () => (reversed.value ? ['B', 'A'] : ['A', 'B']).map(label => icon(label, { key: label })) })
    const wrapper = render(() => [h(Nested), icon('Last')])
    await settle(); await overflow(wrapper)
    reversed.value = true; await settle()
    expect(menuItems().map(item => item.textContent?.trim())).toEqual(['B', 'A', 'Last'])
  })
  it('uses horizontal wrapping and Home/End and skips overflowed controls', async () => {
    const wrapper = render(() => [icon('First'), icon('Disabled', { disabled: true }), icon('Last')])
    await settle()
    const first = wrapper.get('[aria-label=First]').element as HTMLElement
    first.focus(); keyboard(first, 'ArrowRight')
    expect(document.activeElement).toBe(wrapper.get('[aria-label=Disabled]').element)
    keyboard(document.activeElement!, 'End')
    expect(document.activeElement).toBe(wrapper.get('[aria-label=Last]').element)
    keyboard(document.activeElement!, 'ArrowRight')
    expect(document.activeElement).toBe(first)
    observers[0]!.notify([wrapper.get('[aria-label=Disabled]').element, wrapper.get('[aria-label=Last]').element], 0)
    await settle()
    first.focus(); keyboard(first, 'End')
    expect(document.activeElement).toBe(wrapper.get('.action-bar-more').element)
    keyboard(document.activeElement!, 'Home')
    expect(document.activeElement).toBe(first)
  })
  it('closes a menu on Escape or selection and returns focus to the requested element', async () => {
    const target = document.createElement('input'); document.body.append(target)
    const selected = vi.fn()
    const wrapper = render(() => [h(ActionBar.Menu, { icon: Icon, 'aria-label': 'Menu', unsafeDisableTooltip: true, returnFocusRef: target, items: [{ label: 'Copy', onClick: selected }] })])
    await settle()
    await wrapper.get('[aria-label=Menu]').trigger('click'); await settle()
    expect(document.activeElement).toBe(menuItems()[0])
    keyboard(menuItems()[0]!, 'Escape'); await settle()
    expect(menuItems()).toHaveLength(0)
    expect(document.activeElement).toBe(target)
    await wrapper.get('[aria-label=Menu]').trigger('click'); await settle()
    menuItems()[0]!.click(); await settle()
    expect(selected).toHaveBeenCalledOnce()
    expect(menuItems()).toHaveLength(0)
    expect(document.activeElement).toBe(target)
  })
  it('opens nested menus, closes only the current submenu on Escape and closes the stack on selection', async () => {
    const selected = vi.fn()
    const wrapper = render(() => [h(ActionBar.Menu, { icon: Icon, 'aria-label': 'Menu', unsafeDisableTooltip: true, items: [{ label: 'Export', items: [{ label: 'Markdown', onClick: selected }] }] })])
    await settle()
    await wrapper.get('[aria-label=Menu]').trigger('click'); await settle()
    keyboard(menuItems()[0]!, 'ArrowRight'); await settle()
    expect(menuItems().map(item => item.textContent?.trim())).toEqual(['Export', 'Markdown'])
    keyboard(menuItems()[1]!, 'Escape'); await settle()
    expect(menuItems()).toHaveLength(1)
    expect(document.activeElement).toBe(menuItems()[0])
    menuItems()[0]!.click(); await settle()
    menuItems()[1]!.click(); await settle()
    expect(selected).toHaveBeenCalledOnce()
    expect(menuItems()).toHaveLength(0)
  })
  it('renders an overflowed Menu as a submenu and respects overflowIcon=none', async () => {
    const wrapper = render(() => [h(ActionBar.Menu, { icon: Icon, overflowIcon: 'none', 'aria-label': 'Menu', unsafeDisableTooltip: true, items: [{ label: 'Copy' }] })])
    await settle()
    await overflow(wrapper, '[data-component="ActionBar.Menu.IconButton"]')
    expect(menuItems()[0]!.textContent?.trim()).toBe('Menu')
    expect(menuItems()[0]!.querySelector('[data-component="ActionList.LeadingVisual"]')).toBeNull()
    keyboard(menuItems()[0]!, 'ArrowRight'); await settle()
    expect(menuItems()[1]!.textContent?.trim()).toBe('Copy')
    keyboard(menuItems()[1]!, 'ArrowLeft'); await settle()
    expect(menuItems()).toHaveLength(1)
  })
  it('keeps the menu open when a consumer prevents selection and supports ArrowUp initial focus', async () => {
    const wrapper = render(() => [h(ActionBar.Menu, { icon: Icon, 'aria-label': 'Menu', unsafeDisableTooltip: true, items: [{ label: 'Alpha' }, { label: 'Beta', onClick: event => event.preventDefault() }] })])
    await settle()
    await wrapper.get('[aria-label=Menu]').trigger('keydown', { key: 'ArrowUp' }); await settle()
    expect(document.activeElement).toBe(menuItems()[1])
    menuItems()[1]!.click(); await settle()
    expect(menuItems()).toHaveLength(2)
    keyboard(menuItems()[1]!, 'a')
    expect(document.activeElement).toBe(menuItems()[0])
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); await settle()
    expect(menuItems()).toHaveLength(0)
  })
})
