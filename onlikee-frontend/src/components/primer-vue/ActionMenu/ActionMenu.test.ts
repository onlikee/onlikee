// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Fixtures exercise public menu composition and nested state. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, provide, shallowRef, type VNode } from 'vue'
import { ActionMenu } from './index'
import { ActionList } from '../ActionList'
import Button from '../SelectPanel/SelectPanelButton.vue'
import Tooltip from '../TooltipV2/Tooltip.vue'
import { FeatureFlags } from '../FeatureFlags'
import { getAnchoredPosition } from '@primer/behaviors'
import { dialogContextKey } from '../Dialog/context'
import { registerPortalRoot } from '../Portal'

vi.mock('@primer/behaviors', async importOriginal => {
  const actual = await importOriginal<typeof import('@primer/behaviors')>()
  return { ...actual, getAnchoredPosition: vi.fn(actual.getAnchoredPosition) }
})

const wrappers: VueWrapper[] = []
const Icon = () => h('svg', { width: 16, height: 16 })
const item = (label: string, props = {}) => h(ActionList.Item, props, { default: () => label })
async function settle() { await nextTick(); await flushPromises(); await new Promise(resolve => setTimeout(resolve, 0)); await nextTick() }
function keyboard(element: Element, key: string, type = 'keydown') {
  const event = new KeyboardEvent(type, { key, code: key === ' ' ? 'Space' : key, bubbles: true, cancelable: true })
  element.dispatchEvent(event)
  return event
}
function click(element: Element, detail = 1) { element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail })) }
function render(children: () => VNode[], props = {}) {
  const wrapper = mount(defineComponent({ setup: () => () => h(ActionMenu, props, { default: children }) }), { attachTo: document.body })
  wrappers.push(wrapper)
  return wrapper
}
function basic(children = () => [item('Copy'), item('Delete', { disabled: true }), item('Edit')], props = {}) {
  return render(() => [h(ActionMenu.Button, { id: 'menu-trigger', ...props }, { default: () => 'Open menu' }), h(ActionMenu.Overlay, { width: 'medium' }, { default: () => h(ActionList, null, { default: children }) })])
}
const menus = () => Array.from(document.querySelectorAll<HTMLElement>('[role="menu"]'))
const items = () => Array.from(document.querySelectorAll<HTMLElement>('[role^="menuitem"]'))
beforeEach(() => {
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 320, 32))
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([new DOMRect(0, 0, 320, 32)] as unknown as DOMRectList)
})
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount())
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('ActionMenu public behavior', () => {
  it('renders the extracted anchor at the Overlay slot position', async () => {
    const wrapper = render(() => [h(ActionMenu.Button, null, { default: () => 'Trigger' }), h('span', { id: 'before-menu' }, 'Before'), h(ActionMenu.Overlay, null, { default: () => h(ActionList, null, { default: () => item('Copy') }) })])
    const before = wrapper.get('#before-menu').element
    const trigger = wrapper.get('button').element
    expect(before.compareDocumentPosition(trigger) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    click(trigger); await settle()
    expect(menus()).toHaveLength(1)
  })

  it('opens by mouse, labels the menu, traps focus and toggles closed', async () => {
    const wrapper = basic()
    const anchor = wrapper.get('button').element as HTMLElement
    expect(anchor.getAttribute('aria-haspopup')).toBe('true')
    expect(anchor.getAttribute('aria-expanded')).toBe('false')
    expect(anchor.querySelector('[data-component="trailingAction"]')).not.toBeNull()
    click(anchor); await settle()
    expect(menus()).toHaveLength(1)
    expect(menus()[0]!.getAttribute('aria-labelledby')).toBe('menu-trigger')
    expect(document.querySelector('[data-component="ActionMenu.Overlay"]')?.getAttribute('data-width')).toBe('medium')
    expect(document.activeElement).toBe(items()[0])
    click(anchor); await settle()
    expect(menus()).toHaveLength(0)
  })

  it('opens with keyboard at first/last item and wraps vertical/Home/End navigation', async () => {
    const wrapper = basic()
    const anchor = wrapper.get('button').element
    keyboard(anchor, 'ArrowUp'); await settle()
    expect(document.activeElement).toBe(items()[2])
    keyboard(items()[2]!, 'ArrowDown'); await settle()
    expect(document.activeElement).toBe(items()[0])
    keyboard(items()[0]!, 'End'); await settle()
    expect(document.activeElement).toBe(items()[2])
    keyboard(items()[2]!, 'Home'); await settle()
    expect(document.activeElement).toBe(items()[0])
    keyboard(document.activeElement!, 'Escape'); await settle()
    expect(menus()).toHaveLength(0)
    expect(document.activeElement).toBe(anchor)
    keyboard(anchor, 'Enter'); await settle()
    expect(document.activeElement).toBe(items()[0])
  })

  it('moves focus from a mouse-opened anchor with arrows and closes on Tab', async () => {
    const wrapper = basic()
    const anchor = wrapper.get('button').element
    click(anchor); await settle()
    keyboard(anchor, 'ArrowUp'); await settle()
    expect(document.activeElement).toBe(items()[2])
    keyboard(items()[2]!, 'Tab'); await settle()
    expect(menus()).toHaveLength(0)
    expect(document.activeElement).toBe(anchor)
  })

  it('preserves selection callbacks, disabled items, and preventDefault before closing', async () => {
    const select = vi.fn()
    const wrapper = basic(() => [item('Keep open', { onSelect: (event: Event) => event.preventDefault() }), item('Disabled', { disabled: true, onSelect: select }), item('Select', { onSelect: select })])
    click(wrapper.get('button').element); await settle()
    click(items()[0]!); await settle()
    expect(menus()).toHaveLength(1)
    click(items()[1]!); keyboard(items()[1]!, 'Enter', 'keypress'); await settle()
    expect(select).not.toHaveBeenCalled()
    expect(menus()).toHaveLength(1)
    keyboard(items()[2]!, ' ', 'keypress'); await settle()
    expect(select).toHaveBeenCalledOnce()
    expect(menus()).toHaveLength(0)
  })

  it('uses native controlled state with update:open and openChange without mutating props', async () => {
    const open = shallowRef(false)
    const change = vi.fn()
    const wrapper = mount(defineComponent({ setup: () => () => h(ActionMenu, { open: open.value, 'onUpdate:open': value => { open.value = value }, onOpenChange: change }, { default: () => [h(ActionMenu.Button, null, { default: () => 'Controlled' }), h(ActionMenu.Overlay, null, { default: () => h(ActionList, null, { default: () => item('Close') }) })] }) }), { attachTo: document.body })
    wrappers.push(wrapper)
    click(wrapper.get('button').element); await settle()
    expect(open.value).toBe(true)
    expect(change).toHaveBeenLastCalledWith(true)
    click(items()[0]!); await settle()
    expect(open.value).toBe(false)
    expect(change).toHaveBeenLastCalledWith(false)
  })

  it('does not open when a controlled owner declines the request', async () => {
    const change = vi.fn()
    const wrapper = render(() => [h(ActionMenu.Button, null, { default: () => 'Controlled' }), h(ActionMenu.Overlay, null, { default: () => h(ActionList, null, { default: () => item('Copy') }) })], { open: false, onOpenChange: change })
    click(wrapper.get('button').element); await settle()
    expect(change).toHaveBeenCalledWith(true)
    expect(menus()).toHaveLength(0)
  })

  it('captures the anchor label when the ref is attached rather than recapturing on attribute changes', async () => {
    const labelledBy = shallowRef('first-label')
    const wrapper = render(() => [h(ActionMenu.Button, { 'aria-labelledby': labelledBy.value }, { default: () => 'Menu' }), h(ActionMenu.Overlay, null, { default: () => h(ActionList, null, { default: () => item('Copy') }) })])
    await settle()
    click(wrapper.get('button').element); await settle()
    expect(menus()[0]!.getAttribute('aria-labelledby')).toBe('first-label')
    labelledBy.value = 'second-label'; await settle()
    expect(menus()[0]!.getAttribute('aria-labelledby')).toBe('first-label')
  })

  it('tracks detached anchors without changing their IDs or refocusing the open menu', async () => {
    const open = shallowRef(false)
    const anchor = shallowRef<HTMLElement | null>(null)
    const version = shallowRef(0)
    const wrapper = mount(defineComponent({ setup: () => () => [
      h('button', { key: version.value, ref: anchor, onClick: () => { open.value = !open.value } }, 'Detached'),
      h(ActionMenu, { anchorRef: anchor, open: open.value, 'onUpdate:open': value => { open.value = value } }, { default: () => h(ActionMenu.Overlay, null, { default: () => h(ActionList, null, { default: () => item('Replace', { onSelect: (event: Event) => { event.preventDefault(); version.value++ } }) }) }) })
    ] }), { attachTo: document.body })
    wrappers.push(wrapper)
    await settle()
    click(wrapper.get('button').element); await settle()
    expect(menus()[0]!.getAttribute('aria-labelledby')).toMatch(/-anchor$/)
    expect(anchor.value!.id).toBe('')
    expect(document.activeElement).toBe(items()[0])
    keyboard(anchor.value!, 'ArrowDown'); await settle()
    expect(document.activeElement).toBe(items()[0])
    const previous = anchor.value
    click(items()[0]!); await settle()
    expect(anchor.value).not.toBe(previous)
    expect(menus()).toHaveLength(1)
    keyboard(items()[0]!, 'Escape'); await settle()
    expect(menus()).toHaveLength(0)
    expect(document.activeElement).toBe(document.body)
  })

  it('preserves custom anchor handlers, refs, ids and classes', async () => {
    const selected = vi.fn(), keydown = vi.fn()
    const target = shallowRef<{ element: HTMLElement } | null>(null)
    const wrapper = render(() => [h(ActionMenu.Anchor, { id: 'custom', className: 'custom-class' }, { default: () => h(Button, { ref: target, onClick: selected, onKeydown: keydown }, { default: () => 'Custom' }) }), h(ActionMenu.Overlay, null, { default: () => h(ActionList, null, { default: () => item('Copy') }) })])
    const anchor = wrapper.get('button').element
    click(anchor); await settle()
    expect(selected).toHaveBeenCalledOnce()
    expect(target.value?.element).toBe(anchor)
    expect(anchor.id).toBe('custom')
    expect(anchor.classList.contains('custom-class')).toBe(true)
    keyboard(anchor, 'ArrowDown'); await settle()
    expect(keydown).toHaveBeenCalledOnce()
    expect(document.activeElement).toBe(items()[0])
  })

  it('labels icon anchors from their tooltip and supports Tooltip on either anchor side', async () => {
    const wrapper = render(() => [h(ActionMenu.Anchor, null, { default: () => h(Tooltip, { text: 'Tools', type: 'label' }, { default: () => h(Button, { icon: Icon, 'aria-label': 'Tools' }) }) }), h(ActionMenu.Overlay, null, { default: () => h(ActionList, null, { default: () => item('Copy') }) })])
    click(wrapper.get('button').element); await settle()
    expect(menus()[0]!.getAttribute('aria-labelledby')).toBe(wrapper.get('button').attributes('aria-labelledby'))
    expect(wrapper.get('button').attributes('aria-expanded')).toBe('true')
    keyboard(wrapper.get('button').element, 'Escape'); await settle()
    wrapper.unmount(); wrappers.splice(wrappers.indexOf(wrapper), 1)
    const outer = render(() => [h(Tooltip, { text: 'Description' }, { default: () => h(ActionMenu.Button, null, { default: () => 'Menu' }) }), h(ActionMenu.Overlay, null, { default: () => h(ActionList, null, { default: () => item('Copy') }) })])
    click(outer.get('button').element); await settle()
    expect(menus()).toHaveLength(1)
  })

  it('uses aria-keyshortcuts and cycles matching mnemonics, preserving text input typing', async () => {
    const wrapper = basic(() => [item('Copy'), item('Clone'), item('Edit', { 'aria-keyshortcuts': 's' }), h('input', { 'aria-label': 'Filter' })])
    keyboard(wrapper.get('button').element, 'Enter'); await settle()
    keyboard(items()[0]!, 'c'); await settle()
    expect(document.activeElement).toBe(items()[1])
    keyboard(items()[1]!, 'c'); await settle()
    expect(document.activeElement).toBe(items()[0])
    keyboard(items()[0]!, 's'); await settle()
    expect(document.activeElement).toBe(items()[2])
    const input = document.querySelector('input')!
    input.focus(); keyboard(input, 'c'); await settle()
    expect(document.activeElement).toBe(input)
  })

  it('closes after selecting links and propagates menu radio/checkbox selection roles', async () => {
    const wrapper = basic(() => [h(ActionList.Group, { selectionVariant: 'single' }, { default: () => item('Radio', { selected: true }) }), h(ActionList.Group, { selectionVariant: 'multiple' }, { default: () => item('Checkbox', { selected: false }) }), h(ActionList.LinkItem, { href: '#destination' }, { default: () => 'Link' }), h(ActionMenu.Divider)])
    click(wrapper.get('button').element); await settle()
    expect(items()[0]!.getAttribute('role')).toBe('menuitemradio')
    expect(items()[0]!.getAttribute('aria-checked')).toBe('true')
    expect(items()[1]!.getAttribute('role')).toBe('menuitemcheckbox')
    expect(items()[1]!.getAttribute('aria-checked')).toBe('false')
    click(items()[2]!); await settle()
    expect(menus()).toHaveLength(0)
  })

  it('opens submenus with Right, closes only one layer with Left/Escape and all on leaf selection', async () => {
    const selected = vi.fn()
    const wrapper = basic(() => [item('Copy'), h(ActionMenu, null, { default: () => [h(ActionMenu.Anchor, null, { default: () => item('Export') }), h(ActionMenu.Overlay, null, { default: () => h(ActionList, null, { default: () => item('Markdown', { onSelect: selected }) }) })] })])
    keyboard(wrapper.get('button').element, 'ArrowRight'); await settle()
    expect(menus()).toHaveLength(0)
    keyboard(wrapper.get('button').element, 'Enter'); await settle()
    const anchor = items()[1]!
    expect(anchor.getAttribute('aria-haspopup')).toBe('true')
    expect(anchor.querySelector('[data-component="ActionList.TrailingVisual"]')).not.toBeNull()
    keyboard(anchor, 'ArrowRight'); await settle()
    expect(menus()).toHaveLength(2)
    expect(anchor.getAttribute('aria-expanded')).toBe('true')
    keyboard(items()[2]!, 'ArrowLeft'); await settle()
    expect(menus()).toHaveLength(1)
    expect(document.activeElement).toBe(anchor)
    keyboard(anchor, 'ArrowRight'); await settle()
    keyboard(items()[2]!, 'Escape'); await settle()
    expect(menus()).toHaveLength(1)
    click(anchor); await settle()
    expect(menus()).toHaveLength(2)
    expect(document.activeElement).toBe(items()[2])
    click(anchor); await settle()
    expect(menus()).toHaveLength(1)
    click(anchor); await settle()
    expect(menus()).toHaveLength(2)
    click(items()[2]!); await settle()
    expect(selected).toHaveBeenCalledOnce()
    expect(menus()).toHaveLength(0)
    expect(document.activeElement).toBe(wrapper.get('button').element)
  })

  it('closes on outside click and respects disabled trigger and overridden escape callback', async () => {
    const wrapper = basic()
    click(wrapper.get('button').element); await settle()
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); await settle()
    expect(menus()).toHaveLength(0)
    const disabled = basic(undefined, { disabled: true })
    click(disabled.get('button').element); keyboard(disabled.get('button').element, 'Enter'); await settle()
    expect(menus()).toHaveLength(0)
    const escape = vi.fn()
    const override = render(() => [h(ActionMenu.Button, null, { default: () => 'Override' }), h(ActionMenu.Overlay, { onEscape: escape }, { default: () => h(ActionList, null, { default: () => item('Copy') }) })])
    click(override.get('button').element); await settle()
    keyboard(override.get('button').element, 'Escape'); await settle()
    expect(escape).toHaveBeenCalledOnce()
    expect(menus()).toHaveLength(1)
  })

  it('preserves trigger prevention and disabled submenu selection', async () => {
    const prevent = vi.fn((event: Event) => event.preventDefault())
    const wrapper = basic(undefined, { onClick: prevent })
    click(wrapper.get('button').element); await settle()
    expect(prevent).toHaveBeenCalledOnce()
    expect(menus()).toHaveLength(0)
    const nested = basic(() => [h(ActionMenu, null, { default: () => [
      h(ActionMenu.Anchor, null, { default: () => item('Disabled submenu', { disabled: true }) }),
      h(ActionMenu.Overlay, null, { default: () => h(ActionList, null, { default: () => item('Leaf') }) })
    ] })])
    click(nested.get('button').element); await settle()
    click(items()[0]!); keyboard(items()[0]!, 'ArrowRight'); await settle()
    expect(menus()).toHaveLength(1)
    expect(items()[0]!.getAttribute('aria-expanded')).toBe('false')
  })

  it('keeps fullscreen menus open on Tab at a narrow breakpoint and exposes a close button', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
    const wrapper = render(() => [h(ActionMenu.Button, null, { default: () => 'Responsive' }), h(ActionMenu.Overlay, { variant: { narrow: 'fullscreen' }, maxHeight: 'small', overflow: 'auto' }, { default: () => h(ActionList, null, { default: () => item('Copy') }) })])
    keyboard(wrapper.get('button').element, 'Enter'); await settle()
    expect(document.querySelector('[class*="action-menu-container_"]')?.getAttribute('data-variant')).toBe('fullscreen')
    keyboard(items()[0]!, 'Tab'); await settle()
    expect(menus()).toHaveLength(1)
    click(document.querySelector('[data-component="AnchoredOverlay.CloseButton"]')!); await settle()
    expect(menus()).toHaveLength(0)
  })

  it('defaults to viewport positioning inside dialogs and reports actual positions', async () => {
    const positions = vi.fn()
    const wrapper = mount(defineComponent({ setup() {
      provide(dialogContextKey, true)
      return () => h('div', { role: 'dialog' }, [h(FeatureFlags, { flags: { primer_react_css_anchor_positioning: false } }, { default: () => h(ActionMenu, null, { default: () => [h(ActionMenu.Button, null, { default: () => 'Dialog menu' }), h(ActionMenu.Overlay, { onPositionChange: positions }, { default: () => h(ActionList, null, { default: () => item('Copy') }) })] }) })])
    } }), { attachTo: document.body })
    wrappers.push(wrapper)
    click(wrapper.get('button').element); await settle()
    expect(getAnchoredPosition).toHaveBeenLastCalledWith(expect.any(HTMLElement), expect.any(HTMLElement), expect.objectContaining({ displayInViewport: true }))
    window.dispatchEvent(new Event('scroll'))
    await new Promise(resolve => requestAnimationFrame(resolve))
    await settle()
    expect(positions).toHaveBeenCalledWith({ position: expect.objectContaining({ anchorSide: 'outside-bottom' }) })
  })

  it('suspends a fullscreen parent trap while its anchored submenu owns focus', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
    const wrapper = render(() => [h(ActionMenu.Button, null, { default: () => 'Fullscreen parent' }), h(ActionMenu.Overlay, { variant: { narrow: 'fullscreen' } }, { default: () => h(ActionList, null, { default: () => h(ActionMenu, null, { default: () => [
      h(ActionMenu.Anchor, null, { default: () => item('Export') }),
      h(ActionMenu.Overlay, null, { default: () => h(ActionList, null, { default: () => item('Markdown') }) })
    ] }) }) })])
    keyboard(wrapper.get('button').element, 'Enter'); await settle()
    keyboard(items()[0]!, 'ArrowRight'); await settle()
    expect(menus()).toHaveLength(2)
    expect(document.activeElement).toBe(items()[1])
    expect(document.querySelectorAll('[data-focus-trap="active"]')).toHaveLength(1)
    expect(document.querySelectorAll('[data-focus-trap="suspended"]')).toHaveLength(1)
    keyboard(items()[1]!, 'Escape'); await settle()
    expect(menus()).toHaveLength(1)
    expect(document.activeElement).toBe(items()[0])
  })

  it('retains internal state when a controlled owner releases control', async () => {
    const controlled = shallowRef<boolean | undefined>(false)
    const wrapper = mount(defineComponent({ setup: () => () => h(ActionMenu, {
      open: controlled.value, onOpenChange: value => { controlled.value = value }
    }, { default: () => [h(ActionMenu.Button, null, { default: () => 'Controlled' }), h(ActionMenu.Overlay, null, { default: () => h(ActionList, null, { default: () => item('Copy') }) })] }) }), { attachTo: document.body })
    wrappers.push(wrapper)
    click(wrapper.get('button').element); await settle()
    controlled.value = undefined; await settle()
    expect(menus()).toHaveLength(1)
    keyboard(items()[0]!, 'Escape'); await settle()
    expect(menus()).toHaveLength(0)
  })

  it('keeps controlled anchored menus open on Tab on narrow screens', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
    const change = vi.fn()
    render(() => [h(ActionMenu.Button, null, { default: () => 'Controlled' }), h(ActionMenu.Overlay, null, { default: () => h(ActionList, null, { default: () => item('Copy') }) })], { open: true, onOpenChange: change })
    await settle()
    keyboard(items()[0]!, 'Tab'); await settle()
    expect(change).not.toHaveBeenCalled()
    expect(menus()).toHaveLength(1)
  })

  it('forwards polymorphic surfaces and named portal roots', async () => {
    const portal = document.createElement('div')
    document.body.appendChild(portal)
    registerPortalRoot(portal, 'menu-test')
    const wrapper = render(() => [h(ActionMenu.Button, null, { default: () => 'Portal' }), h(ActionMenu.Overlay, { as: 'section', portalContainerName: 'menu-test', 'aria-labelledby': 'explicit-label' }, { default: () => h(ActionList, null, { default: () => item('Copy') }) })])
    click(wrapper.get('button').element); await settle()
    expect(portal.querySelector('[data-component="ActionMenu.Overlay"]')?.tagName).toBe('SECTION')
    expect(menus()[0]!.getAttribute('aria-labelledby')).toBe('explicit-label')
    expect(portal.querySelector('[data-component="ActionMenu.Overlay"]')?.hasAttribute('aria-labelledby')).toBe(false)
  })

  it('renders without a Portal wrapper only when requested with the CSS feature flag', async () => {
    const wrapper = mount(defineComponent({ setup: () => () => h(FeatureFlags, { flags: { primer_react_css_anchor_positioning: true } }, {
      default: () => h(ActionMenu, null, { default: () => [h(ActionMenu.Button, null, { default: () => 'Inline' }), h(ActionMenu.Overlay, { _PrivateDisablePortal: true }, { default: () => h(ActionList, null, { default: () => item('Copy') }) })] })
    }) }), { attachTo: document.body })
    wrappers.push(wrapper)
    click(wrapper.get('button').element); await settle()
    const surface = document.querySelector('[data-component="ActionMenu.Overlay"]')
    expect(surface).not.toBeNull()
    expect(wrapper.html()).toContain('data-component="ActionMenu.Overlay"')
    expect(surface?.closest('[data-component="Portal"]')).toBeNull()
  })

  it('resolves a custom surface component to its DOM element for focus management', async () => {
    const Surface = defineComponent({ inheritAttrs: false, setup: (_props, { attrs, slots }) => () => h('section', attrs, slots.default?.()) })
    const overlay = shallowRef<{ element: HTMLElement | null } | null>(null)
    const wrapper = render(() => [h(ActionMenu.Button, null, { default: () => 'Custom surface' }), h(ActionMenu.Overlay, { as: Surface, ref: overlay }, { default: () => h(ActionList, null, { default: () => item('Copy') }) })])
    click(wrapper.get('button').element); await settle()
    expect(overlay.value?.element?.tagName).toBe('SECTION')
    expect(document.activeElement).toBe(items()[0])
    expect(overlay.value?.element?.getAttribute('data-focus-trap')).toBe('active')
  })
})
