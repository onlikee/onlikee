// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Independent composition and hydration fixtures. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, nextTick, shallowRef } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { Overlay } from './index'
import type { OverlayOptions } from './types'
import BaseOverlay from './BaseOverlay.vue'
import { Button } from '../Button'
import { ActionMenu } from '../ActionMenu'
import { ActionList } from '../ActionList'
import { FeatureFlags } from '../FeatureFlags'
import { PortalContext, registerPortalRoot } from '../Portal'

const wrappers: VueWrapper[] = []
async function settle() {
  await nextTick()
  await flushPromises()
  await nextTick()
}
function settings(extra: Partial<OverlayOptions> = {}): OverlayOptions {
  return {
    returnFocusRef: shallowRef<HTMLElement | null>(null),
    onEscape: vi.fn(),
    onClickOutside: vi.fn(),
    ...extra,
  }
}
function surface() {
  return document.querySelector<HTMLElement>('[data-width-auto], [data-width-small]')!
}
function key(target: Element, prevented = false) {
  const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
  if (prevented) event.preventDefault()
  target.dispatchEvent(event)
  return event
}
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('Overlay', () => {
  it('forwards polymorphic roots, attributes, classes, styles and the actual element ref', async () => {
    const click = vi.fn()
    const wrapper = mount(Overlay, {
      props: {
        ...settings(),
        as: 'section',
        width: 'small',
        maxWidth: 'large',
        height: 'fit-content',
        maxHeight: 'fit-content',
        overflow: 'hidden',
        top: 12,
        right: '2rem',
        className: 'custom',
        style: { '--top': '30px', padding: 8 },
        preventOverflow: false,
      },
      attrs: {
        id: 'surface',
        class: 'extra',
        'aria-label': 'Details',
        'data-component': 'TestOverlay',
        onClick: click,
      },
      slots: { default: () => h('button', 'Action') },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    await settle()
    const element = document.getElementById('surface')!
    expect(element.tagName).toBe('SECTION')
    expect(element.classList.contains('custom')).toBe(true)
    expect(element.classList.contains('extra')).toBe(true)
    expect(element.getAttribute('aria-label')).toBe('Details')
    expect(element.dataset.component).toBe('TestOverlay')
    expect(element.dataset.widthSmall).toBe('')
    expect(element.dataset.heightFitContent).toBe('')
    expect(element.dataset.maxHeightFitContent).toBe('')
    expect(element.dataset.maxWidthLarge).toBe('')
    expect(element.dataset.overflowHidden).toBe('')
    expect(element.dataset.reflowContainer).toBe('true')
    expect(element.style.getPropertyValue('--top')).toBe('30px')
    expect(element.style.getPropertyValue('--right')).toBe('2rem')
    expect(element.style.getPropertyValue('--left')).toBe('')
    expect(element.style.padding).toBe('8px')
    expect((wrapper.vm as unknown as { element: HTMLElement }).element).toBe(element)
    element.click()
    expect(click).toHaveBeenCalledOnce()
  })

  it('uses the React defaults without adding a component marker or a focus trap', async () => {
    const wrapper = mount(Overlay, { props: settings(), attachTo: document.body })
    wrappers.push(wrapper)
    await settle()
    const element = surface()
    expect(element.getAttribute('role')).toBe('none')
    expect(element.hasAttribute('data-width-auto')).toBe(true)
    expect(element.hasAttribute('data-height-auto')).toBe(true)
    expect(element.hasAttribute('data-visibility-visible')).toBe(true)
    expect(element.style.getPropertyValue('--left')).toBe('0px')
    expect(element.hasAttribute('data-reflow-container')).toBe(false)
    expect(element.hasAttribute('data-component')).toBe(false)
    expect(element.hasAttribute('data-focus-trap')).toBe(false)
    expect(element.parentElement?.dataset.component).toBe('Portal')
  })

  it.each([false, true])(
    'focuses the requested or first focusable element (explicit=%s)',
    async (explicit) => {
      const requested = shallowRef<HTMLElement | null>(null)
      const wrapper = mount(Overlay, {
        props: settings({ initialFocusRef: explicit ? requested : undefined }),
        slots: {
          default: () => [h(Button, () => 'First'), h('button', { ref: requested }, 'Requested')],
        },
        attachTo: document.body,
      })
      wrappers.push(wrapper)
      await settle()
      expect(document.activeElement?.textContent).toBe(explicit ? 'Requested' : 'First')
    },
  )

  it('keeps opening focus and restores the captured return target on unmount', async () => {
    const trigger = document.createElement('button')
    const replacement = document.createElement('button')
    document.body.append(trigger, replacement)
    trigger.focus()
    const returnFocusRef = shallowRef<HTMLElement | null>(trigger)
    const wrapper = mount(Overlay, {
      props: settings({ returnFocusRef, preventFocusOnOpen: true }),
      slots: { default: '<button>Content</button>' },
      attachTo: document.body,
    })
    await settle()
    expect(document.activeElement).toBe(trigger)
    surface().querySelector('button')!.focus()
    returnFocusRef.value = replacement
    wrapper.unmount()
    await settle()
    expect(document.activeElement).toBe(trigger)
  })

  it('ignores inside, ignored-ref, auxiliary and prevented outside clicks', async () => {
    const ignored = document.createElement('button')
    document.body.append(ignored)
    const options = settings({ ignoreClickRefs: [shallowRef(ignored)] })
    const wrapper = mount(Overlay, {
      props: options,
      slots: { default: '<button>Inside</button>' },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    await settle()
    for (const [target, button, prevented] of [
      [surface(), 0, false],
      [ignored, 0, false],
      [document.body, 2, false],
      [document.body, 0, true],
    ] as const) {
      const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true, button })
      if (prevented) event.preventDefault()
      target.dispatchEvent(event)
    }
    expect(options.onClickOutside).not.toHaveBeenCalled()
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    expect(options.onClickOutside).toHaveBeenCalledOnce()
  })

  it('respects prevented Escape, invokes only the latest overlay, and cleans up listeners', async () => {
    const outer = settings()
    const inner = settings()
    const first = mount(Overlay, { props: outer, attachTo: document.body })
    const second = mount(Overlay, { props: inner, attachTo: document.body })
    await settle()
    key(document.body, true)
    expect(inner.onEscape).not.toHaveBeenCalled()
    expect(key(document.body).defaultPrevented).toBe(true)
    expect(inner.onEscape).toHaveBeenCalledOnce()
    expect(outer.onEscape).not.toHaveBeenCalled()
    second.unmount()
    key(document.body)
    expect(outer.onEscape).toHaveBeenCalledOnce()
    first.unmount()
    key(document.body)
    expect(outer.onEscape).toHaveBeenCalledOnce()
  })

  it('dispatches to the inner overlay when both nested surfaces mount together', async () => {
    const outer = settings()
    const inner = settings()
    const wrapper = mount(Overlay, {
      props: outer,
      slots: { default: () => h(Overlay, inner, () => h('button', 'Inner')) },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    await settle()
    key(document.activeElement!)
    expect(inner.onEscape).toHaveBeenCalledOnce()
    expect(outer.onEscape).not.toHaveBeenCalled()
  })

  it('closes a nested ActionMenu before its parent Overlay and restores both focus targets', async () => {
    const trigger = document.createElement('button')
    document.body.append(trigger)
    const open = shallowRef(true)
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          open.value
            ? h(
                Overlay,
                settings({
                  returnFocusRef: shallowRef(trigger),
                  onEscape: () => {
                    open.value = false
                  },
                }),
                {
                  default: () =>
                    h(ActionMenu, null, {
                      default: () => [
                        h(ActionMenu.Button, () => 'Nested menu'),
                        h(ActionMenu.Overlay, null, {
                          default: () =>
                            h(ActionList, null, {
                              default: () => h(ActionList.Item, () => 'Nested item'),
                            }),
                        }),
                      ],
                    }),
                },
              )
            : null,
      }),
      { attachTo: document.body },
    )
    wrappers.push(wrapper)
    await settle()
    surface().querySelector('button')!.click()
    await settle()
    expect(document.querySelector('[role="menu"]')).not.toBeNull()
    key(document.querySelector('[role="menuitem"]')!)
    await settle()
    expect(document.querySelector('[role="menu"]')).toBeNull()
    expect(open.value).toBe(true)
    expect(document.activeElement?.textContent).toBe('Nested menu')
    key(document.activeElement!)
    await settle()
    expect(open.value).toBe(false)
    expect(document.activeElement).toBe(trigger)
  })

  it('captures initial height once per mount and animates only when visible with a side', async () => {
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(207)
    const animate = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'animate', { value: animate, configurable: true })
    const wrapper = mount(Overlay, {
      props: settings({ height: 'initial', anchorSide: 'outside-bottom', visibility: 'hidden' }),
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    await settle()
    expect(surface().style.height).toBe('207px')
    expect(animate).not.toHaveBeenCalled()
    await wrapper.setProps({ visibility: 'visible' })
    expect(animate).toHaveBeenCalledWith(
      { transform: ['translate(0px, -8px)', 'translate(0, 0)'] },
      { duration: 200, easing: 'cubic-bezier(0.33, 1, 0.68, 1)' },
    )
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(320)
    await wrapper.setProps({ width: 'small' })
    expect(surface().style.height).toBe('207px')
    delete (HTMLElement.prototype as Partial<HTMLElement>).animate
  })

  it('uses Portal context, lets explicit containers override it, and bypasses only with the flag', async () => {
    const contextRoot = document.createElement('div')
    const explicitRoot = document.createElement('div')
    document.body.append(contextRoot, explicitRoot)
    registerPortalRoot(contextRoot, 'overlay-context')
    registerPortalRoot(explicitRoot, 'overlay-explicit')
    const options = settings()
    const portalContainerName = shallowRef<string>()
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(
            PortalContext.Provider,
            { value: { portalContainerName: 'overlay-context' } },
            {
              default: () =>
                h(Overlay, { ...options, portalContainerName: portalContainerName.value }, () =>
                  h('button', 'Content'),
                ),
            },
          ),
      }),
      { attachTo: document.body },
    )
    await settle()
    expect(contextRoot.querySelector('[data-width-auto]')).not.toBeNull()
    portalContainerName.value = 'overlay-explicit'
    await settle()
    expect(explicitRoot.querySelector('[data-width-auto]')).not.toBeNull()
    wrapper.unmount()

    for (const enabled of [false, true]) {
      const inline = mount(FeatureFlags, {
        props: { flags: { primer_react_css_anchor_positioning: enabled } },
        slots: { default: () => h(Overlay, settings({ _PrivateDisablePortal: true })) },
        attachTo: document.body,
      })
      await settle()
      expect(inline.element.querySelector('[data-width-auto]') !== null).toBe(enabled)
      inline.unmount()
    }
  })

  it('hydrates browser-only portal content and renders inline during SSR when portal is disabled', async () => {
    const options = settings()
    const app = () => createSSRApp(() => h(Overlay, options, () => h('button', 'Hydrated content')))
    const html = await renderToString(app())
    expect(html).not.toContain('Hydrated content')
    const container = document.createElement('div')
    container.innerHTML = html
    document.body.append(container)
    const warn = vi.spyOn(console, 'warn')
    const client = app()
    client.mount(container)
    await settle()
    expect(surface().textContent).toBe('Hydrated content')
    expect(warn).not.toHaveBeenCalled()
    client.unmount()
    const inline = await renderToString(
      createSSRApp(() =>
        h(
          FeatureFlags,
          { flags: { primer_react_css_anchor_positioning: true } },
          {
            default: () =>
              h(Overlay, settings({ _PrivateDisablePortal: true }), () => 'Inline content'),
          },
        ),
      ),
    )
    expect(inline).toContain('Inline content')
  })
})

it('BaseOverlay stays in place, supports custom components and adds no overlay behaviors', async () => {
  const Root = defineComponent({
    setup:
      (_props, { attrs, slots }) =>
      () =>
        h('article', attrs, slots.default?.()),
  })
  const wrapper = mount(BaseOverlay, {
    props: { as: Root, top: 4 },
    slots: { default: '<button>Content</button>' },
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  await settle()
  expect(wrapper.element.tagName).toBe('ARTICLE')
  expect(document.activeElement).not.toBe(wrapper.element.querySelector('button'))
  expect(wrapper.element.closest('[data-component="Portal"]')).toBeNull()
})
