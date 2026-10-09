// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, nextTick, shallowRef } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { AnchoredOverlay, type AnchorRenderProps } from './index'
import { FeatureFlags } from '../FeatureFlags'
import LegacyTooltip from '../Tooltip/Tooltip.vue'
import { registerPortalRoot } from '../Portal'

const wrappers: VueWrapper[] = []
async function settle() {
  await nextTick()
  await flushPromises()
  await nextTick()
}
function overlay() {
  return document.querySelector<HTMLElement>('[data-component="AnchoredOverlay"]')
}
const renderAnchor = (props: AnchorRenderProps) => h('button', { type: 'button', ...props }, 'Open')
function fixture(extra: Record<string, unknown> = {}, flags = false) {
  const open = shallowRef(false)
  const onOpen = vi.fn()
  const onClose = vi.fn()
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          FeatureFlags,
          { flags: { primer_react_css_anchor_positioning: flags } },
          {
            default: () =>
              h(
                AnchoredOverlay,
                {
                  open: open.value,
                  renderAnchor,
                  onOpen: (...args: unknown[]) => {
                    onOpen(...args)
                    open.value = true
                  },
                  onClose: (...args: unknown[]) => {
                    onClose(...args)
                    open.value = false
                  },
                  ...extra,
                },
                {
                  default: () => [
                    h('button', { id: 'first' }, 'First'),
                    h('button', { id: 'last' }, 'Last'),
                  ],
                },
              ),
          },
        ),
    }),
    { attachTo: document.body },
  )
  wrappers.push(wrapper)
  return {
    wrapper,
    open,
    onOpen,
    onClose,
    get anchor() {
      return wrapper.get('button')
    },
  }
}
function nativeSupport() {
  for (const property of ['anchorName', 'positionTryFallbacks', 'positionVisibility']) {
    Object.defineProperty(document.documentElement.style, property, {
      value: '',
      configurable: true,
      writable: true,
    })
  }
}
beforeEach(() => {
  // jsdom has no layout; focusTrap's strict tabbability check needs visible rectangles.
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(100)
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(30)
  vi.spyOn(HTMLElement.prototype, 'offsetParent', 'get').mockReturnValue(document.body)
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockImplementation(function (
    this: HTMLElement,
  ) {
    return [this.getBoundingClientRect()] as unknown as DOMRectList
  })
})
afterEach(() => {
  wrappers.forEach((wrapper) => wrapper.unmount())
  wrappers.length = 0
  document.body.innerHTML = ''
  for (const property of ['anchorName', 'positionTryFallbacks', 'positionVisibility']) {
    Reflect.deleteProperty(document.documentElement.style, property)
  }
  vi.restoreAllMocks()
})

describe('AnchoredOverlay public contract', () => {
  it('toggles from a primary anchor click, ignores secondary and prevented clicks, and returns focus', async () => {
    const { anchor, onOpen, onClose } = fixture()
    expect(anchor.attributes('aria-haspopup')).toBe('true')
    expect(anchor.attributes('aria-expanded')).toBe('false')
    expect(overlay()).toBeNull()
    await anchor.trigger('click', { button: 1 })
    const prevented = new MouseEvent('click', { bubbles: true, cancelable: true })
    prevented.preventDefault()
    anchor.element.dispatchEvent(prevented)
    expect(onOpen).not.toHaveBeenCalled()
    await anchor.trigger('click')
    await settle()
    expect(onOpen.mock.calls[0]?.[0]).toBe('anchor-click')
    expect(anchor.attributes('aria-expanded')).toBe('true')
    expect(overlay()?.getAttribute('role')).toBe('none')
    expect(document.activeElement?.id).toBe('first')
    await anchor.trigger('click')
    await settle()
    expect(onClose.mock.calls[0]?.[0]).toBe('anchor-click')
    expect(overlay()).toBeNull()
    expect(document.activeElement).toBe(anchor.element)
  })
  it.each(['ArrowDown', 'ArrowUp', ' ', 'Enter'])(
    'opens from %s and closes on Escape',
    async (key) => {
      const { anchor, onOpen, onClose } = fixture()
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      anchor.element.dispatchEvent(event)
      await settle()
      expect(event.defaultPrevented).toBe(true)
      expect(onOpen.mock.calls[0]?.[0]).toBe('anchor-key-press')
      document.activeElement!.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
      )
      await settle()
      expect(onClose.mock.calls[0]?.[0]).toBe('escape')
      expect(document.activeElement).toBe(anchor.element)
    },
  )
  it('honors prevented opening keys and stays controlled without an update listener', async () => {
    const wrapper = mount(AnchoredOverlay, {
      props: { open: false, renderAnchor },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    const prevented = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    })
    prevented.preventDefault()
    wrapper.get('button').element.dispatchEvent(prevented)
    expect(wrapper.emitted('open')).toBeUndefined()
    await wrapper.get('button').trigger('click')
    await settle()
    expect(wrapper.emitted('open')?.[0]).toEqual(['anchor-click'])
    expect(overlay()).toBeNull()
  })
  it('closes on outside primary clicks, ignores anchor and secondary clicks', async () => {
    const { anchor, onClose } = fixture()
    await anchor.trigger('click')
    await settle()
    anchor.element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    document.body.dispatchEvent(new MouseEvent('mousedown', { button: 2, bubbles: true }))
    expect(onClose).not.toHaveBeenCalled()
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await settle()
    expect(onClose.mock.calls[0]?.[0]).toBe('click-outside')
    expect(overlay()).toBeNull()
  })
  it('renders the anchor, forwards and clears anchor and overlay refs, and merges classes', async () => {
    const anchorRef = shallowRef<HTMLElement | null>(null)
    const overlayRef = shallowRef<HTMLElement | null>(null)
    const wrapper = mount(AnchoredOverlay, {
      props: {
        open: false,
        renderAnchor,
        anchorRef,
        anchorId: 'custom-anchor',
        className: 'outer',
        overlayProps: {
          ref: overlayRef,
          className: 'inner',
          width: 'large',
          role: 'dialog',
          'aria-label': 'Actions',
        },
      },
      attrs: { class: 'consumer', 'data-extra': 'forwarded' },
      slots: {
        default: '<button>Action</button>',
      },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    expect(anchorRef.value?.id).toBe('custom-anchor')
    await wrapper.setProps({ open: true })
    await settle()
    expect(overlayRef.value).toBe(overlay())
    expect(overlay()?.className).toContain('outer')
    expect(overlay()?.className).toContain('inner')
    expect(overlay()?.className).toContain('consumer')
    expect(overlay()?.hasAttribute('data-extra')).toBe(false)
    expect(overlay()?.hasAttribute('data-width-large')).toBe(true)
    expect(overlay()?.getAttribute('aria-label')).toBe('Actions')
    await wrapper.setProps({ open: false })
    await settle()
    expect(overlayRef.value).toBeNull()
    wrapper.unmount()
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    expect(anchorRef.value).toBeNull()
  })
  it('positions against a detached anchor and lets overlay escape callbacks override closing', async () => {
    const detached = document.createElement('button')
    document.body.append(detached)
    const escape = vi.fn()
    const { onClose } = fixture({
      open: true,
      renderAnchor: null,
      anchorRef: shallowRef(detached),
      overlayProps: { onEscape: escape },
    })
    await settle()
    expect(document.querySelectorAll('button')).toHaveLength(3)
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    )
    expect(escape).toHaveBeenCalledOnce()
    expect(onClose).not.toHaveBeenCalled()
    expect(overlay()).not.toBeNull()
  })
  it('uses initial and return focus settings and moves focus with the arrow keys', async () => {
    const initialFocus = shallowRef<HTMLElement | null>(null)
    const returnTo = document.createElement('button')
    document.body.append(returnTo)
    const { anchor, open } = fixture({
      focusTrapSettings: { initialFocusRef: initialFocus, returnFocusRef: shallowRef(returnTo) },
    })
    await anchor.trigger('click')
    await settle()
    document.getElementById('first')!.focus()
    document
      .getElementById('first')!
      .dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }),
      )
    expect(document.activeElement?.id).toBe('last')
    open.value = false
    await settle()
    expect(document.activeElement).toBe(anchor.element)
  })
  it('focuses the requested initial element after positioning has reached the DOM', async () => {
    const initialFocusRef = shallowRef<HTMLElement | null>(null)
    const wrapper = mount(AnchoredOverlay, {
      props: {
        open: true,
        renderAnchor,
        overlayProps: { preventFocusOnOpen: true },
        focusTrapSettings: { initialFocusRef },
      },
      slots: {
        default: () => [h('button', 'First'), h('button', { ref: initialFocusRef }, 'Requested')],
      },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    await settle()
    expect(document.activeElement).toBe(initialFocusRef.value)
  })
  it('allows an outside click to release focus when the owner keeps the overlay open', async () => {
    const outside = document.createElement('button')
    document.body.append(outside)
    const { anchor, open } = fixture({
      focusTrapSettings: { allowOutsideClick: true },
      overlayProps: { onClickOutside: vi.fn() },
    })
    await anchor.trigger('click')
    await settle()
    outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    outside.focus()
    expect(document.activeElement).toBe(outside)
    expect(overlay()?.hasAttribute('data-focus-trap')).toBe(false)
    open.value = false
    await settle()
    expect(document.activeElement).toBe(anchor.element)
  })
  it('requires an onClose callback for the fullscreen close button', async () => {
    const wrapper = mount(AnchoredOverlay, {
      props: {
        open: true,
        renderAnchor,
        variant: { narrow: 'fullscreen' },
      },
      slots: { default: '<button>Action</button>' },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    await settle()
    expect(document.querySelector('[data-component="AnchoredOverlay.CloseButton"]')).toBeNull()
    await wrapper.setProps({ onClose: vi.fn() })
    expect(document.querySelector('[data-component="AnchoredOverlay.CloseButton"]')).not.toBeNull()
    await wrapper.setProps({ displayCloseButton: false })
    expect(document.querySelector('[data-component="AnchoredOverlay.CloseButton"]')).toBeNull()
  })
  it('renders the fullscreen close button with onClose and gives aria-labelledby precedence', async () => {
    const { anchor, onClose } = fixture({
      variant: { narrow: 'fullscreen' },
      closeButtonProps: {
        'aria-labelledby': 'label',
        'aria-label': 'Ignored',
        className: 'custom-close',
      },
    })
    await anchor.trigger('click')
    await settle()
    const button = document.querySelector<HTMLButtonElement>(
      '[data-component="AnchoredOverlay.CloseButton"]',
    )!
    expect(button.getAttribute('aria-labelledby')).toBe('label')
    expect(button.hasAttribute('aria-label')).toBe(false)
    expect(button.className).toContain('custom-close')
    button.click()
    await settle()
    expect(onClose.mock.calls[0]?.[0]).toBe('close')
    expect(overlay()).toBeNull()
  })
  it('omits browser overlay content during SSR and preserves the anchor', async () => {
    const html = await renderToString(
      createSSRApp(() =>
        h(AnchoredOverlay, { open: true, renderAnchor }, { default: () => 'Popup' }),
      ),
    )
    expect(html).toContain('Open')
    expect(html).toContain('aria-expanded="true"')
    expect(html).not.toContain('Popup')
  })
})

describe('AnchoredOverlay native positioning', () => {
  it('keeps the CSS anchor name while closed, replaces detached anchors and cleans names on unmount', async () => {
    nativeSupport()
    const first = document.createElement('button')
    const second = document.createElement('button')
    document.body.append(first, second)
    const anchorRef = shallowRef<HTMLElement | null>(first)
    const { wrapper, open } = fixture({ renderAnchor: null, anchorRef }, true)
    await settle()
    const name = first.style.getPropertyValue('anchor-name')
    expect(name).toMatch(/^--anchored-overlay-anchor-/)
    open.value = true
    await settle()
    expect(overlay()?.style.getPropertyValue('position-anchor')).toBe(name)
    open.value = false
    await settle()
    expect(first.style.getPropertyValue('anchor-name')).toBe(name)
    anchorRef.value = second
    await settle()
    expect(first.style.getPropertyValue('anchor-name')).toBe('')
    expect(second.style.getPropertyValue('anchor-name')).toBe(name)
    wrapper.unmount()
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    expect(second.style.getPropertyValue('anchor-name')).toBe('')
  })
  it('uses manual popovers, links the target, preserves an existing anchor name and clears forwarded refs', async () => {
    nativeSupport()
    const matches = HTMLElement.prototype.matches
    vi.spyOn(HTMLElement.prototype, 'matches').mockImplementation(function (
      this: HTMLElement,
      selector,
    ) {
      return selector === ':popover-open' ? false : matches.call(this, selector)
    })
    const show = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'showPopover', { value: show, configurable: true })
    const ref = vi.fn()
    const { anchor, open } = fixture({ renderAs: 'popover', overlayProps: { ref } }, true)
    ;(anchor.element as HTMLElement).style.setProperty('anchor-name', '--existing')
    await anchor.trigger('click')
    await settle()
    expect(overlay()?.getAttribute('popover')).toBe('manual')
    expect(anchor.attributes('popovertarget')).toBe(overlay()?.id)
    expect(overlay()?.dataset.anchorPosition).toBe('true')
    expect(overlay()?.style.getPropertyValue('position-anchor')).toBe('--existing')
    expect(show).toHaveBeenCalledOnce()
    expect(ref).toHaveBeenCalledWith(overlay())
    open.value = false
    await settle()
    expect(ref).toHaveBeenLastCalledWith(null)
    expect((anchor.element as HTMLElement).style.getPropertyValue('anchor-name')).toBe('--existing')
    Reflect.deleteProperty(HTMLElement.prototype, 'showPopover')
  })
  it.each([
    [{ fallbackStrategy: 'none' }, 'none'],
    [{ fallbackStrategy: 'opposite-side' }, 'flip-inline'],
  ] as const)('applies the CSS fallback strategy %j', async (settings, expected) => {
    nativeSupport()
    const { anchor } = fixture(
      { cssAnchorPositioningSettings: settings, side: 'outside-right' },
      true,
    )
    await anchor.trigger('click')
    await settle()
    expect(overlay()?.style.getPropertyValue('position-try-fallbacks')).toBe(expected)
  })
  it.each(['flag', 'support', 'disable', 'portal'])(
    'falls back to JS when blocked by %s',
    async (reason) => {
      if (reason !== 'support') nativeSupport()
      else
        vi.spyOn(document.documentElement, 'style', 'get').mockReturnValue(
          {} as CSSStyleDeclaration,
        )
      const root = document.createElement('div')
      document.body.append(root)
      registerPortalRoot(root, 'test-named-portal')
      const { anchor } = fixture(
        {
          renderAs: 'popover',
          cssAnchorPositioningSettings: { disable: reason === 'disable' },
          overlayProps: reason === 'portal' ? { portalContainerName: 'test-named-portal' } : {},
        },
        reason !== 'flag',
      )
      await anchor.trigger('click')
      await settle()
      expect(overlay()?.dataset.anchorPosition).toBe('false')
      expect(overlay()?.hasAttribute('popover')).toBe(false)
      expect(anchor.attributes('popovertarget')).toBeUndefined()
      if (reason === 'portal') expect(root.contains(overlay())).toBe(true)
    },
  )
})

describe('AnchoredOverlay source parity regressions', () => {
  it('uses the source callback payloads for click, keyboard and close gestures', async () => {
    const { anchor, onOpen, onClose } = fixture()
    await anchor.trigger('click')
    await settle()
    expect(onOpen.mock.calls[0]).toEqual(['anchor-click'])
    await anchor.trigger('click')
    await settle()
    expect(onClose.mock.calls[0]).toEqual(['anchor-click'])
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    anchor.element.dispatchEvent(event)
    await settle()
    expect(onOpen.mock.calls[1]).toEqual(['anchor-key-press', event])
  })
  it('keeps an unresolved detached anchor hidden until it can be positioned', async () => {
    const anchorRef = shallowRef<HTMLElement | null>(null)
    fixture({ open: true, renderAnchor: null, anchorRef })
    await settle()
    expect(overlay()?.hasAttribute('data-visibility-hidden')).toBe(true)
    const anchor = document.createElement('button')
    document.body.append(anchor)
    anchorRef.value = anchor
    await settle()
    expect(overlay()?.hasAttribute('data-visibility-visible')).toBe(true)
  })
  it('returns focus when disabling the trap while the overlay stays open', async () => {
    const outside = document.createElement('button')
    document.body.append(outside)
    outside.focus()
    const returnFocusRef = shallowRef(outside)
    const settings = shallowRef({ returnFocusRef, disabled: false })
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            AnchoredOverlay,
            { open: true, renderAnchor, focusTrapSettings: settings.value },
            { default: () => h('button', 'First') },
          ),
      }),
      { attachTo: document.body },
    )
    wrappers.push(wrapper)
    await settle()
    expect(document.activeElement?.textContent).toBe('First')
    settings.value = { returnFocusRef, disabled: true }
    await settle()
    expect(document.activeElement).toBe(outside)
    expect(overlay()).not.toBeNull()
    expect(overlay()?.hasAttribute('data-focus-trap')).toBe(false)
  })
  it('restores the preceding focus when restoreFocusOnCleanUp is enabled', async () => {
    const outside = document.createElement('button')
    document.body.append(outside)
    outside.focus()
    const wrapper = mount(AnchoredOverlay, {
      props: { open: true, renderAnchor, focusTrapSettings: { restoreFocusOnCleanUp: true } },
      slots: { default: '<button>First</button>' },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    await settle()
    await wrapper.setProps({ focusTrapSettings: { restoreFocusOnCleanUp: true, disabled: true } })
    await settle()
    expect(document.activeElement).toBe(outside)
  })
  it('releases the trap on an anchor mousedown without closing the overlay', async () => {
    const { anchor, onClose } = fixture({
      open: true,
      focusTrapSettings: { allowOutsideClick: true },
    })
    await settle()
    anchor.element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    anchor.element.focus()
    expect(overlay()?.hasAttribute('data-focus-trap')).toBe(false)
    expect(document.activeElement).toBe(anchor.element)
    expect(onClose).not.toHaveBeenCalled()
  })
  it('leaves default and inside-center opposite-side fallbacks to the stylesheet', async () => {
    nativeSupport()
    fixture(
      {
        open: true,
        side: 'inside-center',
        cssAnchorPositioningSettings: { fallbackStrategy: 'opposite-side' },
      },
      true,
    )
    await settle()
    expect(overlay()?.style.getPropertyValue('position-try-fallbacks')).toBe('')
    expect(overlay()?.hasAttribute('data-anchor-position')).toBe(true)
  })
  it('cleans native positioning properties when changing to JavaScript positioning', async () => {
    nativeSupport()
    const settings = shallowRef({ fallbackStrategy: 'none' as const, disable: false })
    const host = mount(FeatureFlags, {
      props: { flags: { primer_react_css_anchor_positioning: true } },
      slots: {
        default: () =>
          h(
            AnchoredOverlay,
            { open: true, renderAnchor, cssAnchorPositioningSettings: settings.value },
            { default: () => h('button', 'First') },
          ),
      },
      attachTo: document.body,
    })
    wrappers.push(host)
    await settle()
    const element = overlay()!
    expect(element.style.getPropertyValue('position-anchor')).not.toBe('')
    settings.value = { fallbackStrategy: 'none', disable: true }
    await settle()
    expect(element.style.getPropertyValue('position-anchor')).toBe('')
    expect(element.style.getPropertyValue('position-try-fallbacks')).toBe('')
    expect(element.getAttribute('data-anchor-position')).toBe('false')
  })
  it('bypasses named portal lookup when the feature flag disables the portal', async () => {
    fixture(
      {
        open: true,
        overlayProps: {
          _PrivateDisablePortal: true,
          portalContainerName: 'unregistered-parity-root',
        },
      },
      true,
    )
    await settle()
    expect(overlay()).not.toBeNull()
    expect(overlay()?.closest('[data-component="Portal"]')).toBeNull()
  })
  it('does not add an icon-button tooltip inside an inherited legacy tooltip', async () => {
    const wrapper = mount(LegacyTooltip, {
      props: { content: 'External label' },
      slots: {
        default: () =>
          h(
            AnchoredOverlay,
            { open: true, renderAnchor, onClose: vi.fn(), variant: { narrow: 'fullscreen' } },
            { default: () => h('button', 'First') },
          ),
      },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    await settle()
    expect(
      document
        .querySelector('[data-component="AnchoredOverlay.CloseButton"]')
        ?.getAttribute('aria-label'),
    ).toBe('Close')
    expect(document.querySelector('[data-component="Tooltip"]')).toBeNull()
  })
})

describe('AnchoredOverlay focus, SSR and native positioning parity', () => {
  it('does not restore an unused trap ref when a closed component is unmounted', async () => {
    const current = document.createElement('button')
    const returnTo = document.createElement('button')
    document.body.append(current, returnTo)
    const wrapper = mount(AnchoredOverlay, {
      props: {
        open: false,
        renderAnchor,
        focusTrapSettings: { returnFocusRef: shallowRef(returnTo) },
      },
      attachTo: document.body,
    })
    await settle()
    current.focus()
    wrapper.unmount()
    await settle()
    expect(document.activeElement).toBe(current)
  })
  it.each([false, true])(
    'honors overlay initialFocusRef on open and reopen (native=%s)',
    async (native) => {
      if (native) nativeSupport()
      const requested = shallowRef<HTMLElement | null>(null)
      const open = shallowRef(true)
      const wrapper = mount(FeatureFlags, {
        props: { flags: { primer_react_css_anchor_positioning: native } },
        slots: {
          default: () =>
            h(
              AnchoredOverlay,
              {
                open: open.value,
                renderAnchor,
                overlayProps: { initialFocusRef: requested },
              },
              () => [
                h('button', { id: 'first' }, 'First'),
                h('button', { ref: requested }, 'Requested'),
              ],
            ),
        },
        attachTo: document.body,
      })
      wrappers.push(wrapper)
      await settle()
      expect(document.activeElement).toBe(requested.value)
      open.value = false
      await settle()
      open.value = true
      await settle()
      expect(document.activeElement).toBe(requested.value)
    },
  )
  it.each([false, true])(
    'only renders SSR content when the flag allows portal bypass (flag=%s)',
    async (enabled) => {
      const app = createSSRApp(() =>
        h(
          FeatureFlags,
          {
            flags: { primer_react_css_anchor_positioning: enabled },
          },
          () =>
            h(
              AnchoredOverlay,
              {
                open: true,
                renderAnchor,
                overlayProps: { _PrivateDisablePortal: true },
              },
              () => h('button', 'SSR content'),
            ),
        ),
      )
      const html = await renderToString(app)
      expect(html.includes('SSR content')).toBe(enabled)
    },
  )
  it('installs no JavaScript position observers on the native path or while closed', async () => {
    nativeSupport()
    const observe = vi.fn()
    const disconnect = vi.fn()
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = observe
        disconnect = disconnect
      },
    )
    const { anchor, open } = fixture({}, true)
    await settle()
    expect(observe).not.toHaveBeenCalled()
    await anchor.trigger('click')
    await settle()
    expect(overlay()?.dataset.anchorPosition).toBe('true')
    expect(observe).not.toHaveBeenCalled()
    open.value = false
    await settle()
    expect(observe).not.toHaveBeenCalled()
  })
})

describe('AnchoredOverlay independent focus settings', () => {
  const initialFocusCases = [
    ['trap only', false, false, 'First'],
    ['overlay only', true, false, 'Requested'],
    ['trap with prevented overlay focus', false, true, 'Requested'],
    ['both request second', true, false, 'Requested'],
  ] as const
  for (const native of [false, true]) {
    it.each(initialFocusCases)(
      `matches initial focus precedence: %s (native=${native})`,
      async (name, overlayFocus, prevent, expected) => {
        if (native) nativeSupport()
        const requested = shallowRef<HTMLElement | null>(null)
        const wrapper = mount(FeatureFlags, {
          props: { flags: { primer_react_css_anchor_positioning: native } },
          slots: {
            default: () =>
              h(
                AnchoredOverlay,
                {
                  open: true,
                  renderAnchor,
                  overlayProps: {
                    initialFocusRef: overlayFocus ? requested : undefined,
                    preventFocusOnOpen: prevent,
                  },
                  focusTrapSettings:
                    name === 'overlay only' ? undefined : { initialFocusRef: requested },
                },
                () => [h('button', 'First'), h('button', { ref: requested }, 'Requested')],
              ),
          },
          attachTo: document.body,
        })
        wrappers.push(wrapper)
        await settle()
        expect(document.activeElement?.textContent).toBe(expected)
      },
    )
    it(`does not focus the trap target before Overlay establishes initial focus (native=${native})`, async () => {
      if (native) nativeSupport()
      const requested = shallowRef<HTMLElement | null>(null)
      const events: string[] = []
      const wrapper = mount(FeatureFlags, {
        props: { flags: { primer_react_css_anchor_positioning: native } },
        slots: {
          default: () =>
            h(
              AnchoredOverlay,
              {
                open: true,
                renderAnchor,
                focusTrapSettings: { initialFocusRef: requested },
              },
              () => [
                h('button', { onFocus: () => events.push('First') }, 'First'),
                h(
                  'button',
                  { ref: requested, onFocus: () => events.push('Requested') },
                  'Requested',
                ),
              ],
            ),
        },
        attachTo: document.body,
      })
      wrappers.push(wrapper)
      await settle()
      expect(events).toEqual(['First'])
    })
  }
  it('stops trapping when the external trap container is replaced with an empty ref', async () => {
    const wrapper = mount(AnchoredOverlay, {
      props: { open: true, renderAnchor },
      slots: { default: '<button>Item</button>' },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    await settle()
    expect(overlay()?.hasAttribute('data-focus-trap')).toBe(true)
    await wrapper.setProps({
      focusTrapSettings: { containerRef: shallowRef<HTMLElement | null>(null) },
    })
    await settle()
    expect(overlay()?.hasAttribute('data-focus-trap')).toBe(false)
  })
  it('does not fall back to the overlay when enabling a zone with an empty container ref', async () => {
    const wrapper = mount(AnchoredOverlay, {
      props: {
        open: true,
        renderAnchor,
        focusTrapSettings: { disabled: true },
        focusZoneSettings: { disabled: true },
      },
      slots: { default: '<button id="item">Item</button>' },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    await settle()
    await wrapper.setProps({
      focusZoneSettings: { disabled: false, containerRef: shallowRef<HTMLElement | null>(null) },
    })
    await settle()
    expect(document.querySelector('#item')?.hasAttribute('tabindex')).toBe(false)
  })
})

it('keeps Overlay opening focus when the independent trap starts disabled', async () => {
  const outside = document.createElement('button')
  document.body.append(outside)
  const wrapper = mount(AnchoredOverlay, {
    props: {
      open: true,
      renderAnchor,
      focusTrapSettings: { disabled: true, returnFocusRef: shallowRef(outside) },
    },
    slots: { default: '<button>First</button>' },
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  await settle()
  expect(document.activeElement?.textContent).toBe('First')
})
