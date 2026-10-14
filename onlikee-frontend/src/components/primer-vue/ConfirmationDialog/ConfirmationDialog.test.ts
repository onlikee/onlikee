// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Fixtures exercise conditional dialogs and detached roots. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, Fragment, h, inject, nextTick, shallowRef } from 'vue'
import { ConfirmationDialog, useConfirm, type ConfirmationDialogProps } from './index'
import { ActionMenu } from '../ActionMenu'
import { ActionList } from '../ActionList'
import { dialogContextKey } from '../Dialog/context'
import { Dialog } from '../Dialog'
import { asSlot } from '../composables/useSlots'
import { PortalContext, registerPortalRoot } from '../Portal'

const wrappers: VueWrapper[] = []
const observers: Array<{
  callback: ResizeObserverCallback
  targets: Element[]
  disconnect: ReturnType<typeof vi.fn>
}> = []
async function settle() {
  await nextTick()
  await flushPromises()
  await nextTick()
}
const dialog = () => document.querySelector<HTMLElement>('[role="alertdialog"]')!
const buttons = () =>
  Array.from(dialog().querySelectorAll<HTMLButtonElement>('[data-component="Dialog.FooterButton"]'))
function key(element: Element, value: string, shiftKey = false) {
  const event = new KeyboardEvent('keydown', {
    key: value,
    bubbles: true,
    cancelable: true,
    shiftKey,
  })
  element.dispatchEvent(event)
  return event
}
function render(props: Partial<ConfirmationDialogProps> = {}) {
  const onClose = vi.fn()
  const wrapper = mount(ConfirmationDialog, {
    props: { title: 'Confirm', onClose, ...props },
    slots: { default: () => 'Are you sure?' },
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  return { wrapper, onClose }
}
beforeEach(() => {
  observers.length = 0
  vi.stubGlobal(
    'ResizeObserver',
    class {
      targets: Element[] = []
      disconnect = vi.fn()
      constructor(callback: ResizeObserverCallback) {
        observers.push({ callback, targets: this.targets, disconnect: this.disconnect })
      }
      observe(target: Element) {
        this.targets.push(target)
      }
      unobserve() {}
    },
  )
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  )
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 0, 320, 32),
  )
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(100)
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(30)
  vi.spyOn(HTMLElement.prototype, 'offsetParent', 'get').mockReturnValue(document.body)
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([
    new DOMRect(0, 0, 320, 32),
  ] as unknown as DOMRectList)
})
afterEach(async () => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  // Detached confirmations deliberately outlive their caller, just as React's createRoot does.
  while (dialog())
    dialog().querySelector<HTMLButtonElement>('[data-component="Dialog.CloseButton"]')!.click()
  await settle()
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('ConfirmationDialog', () => {
  it('renders the fixed Dialog structure, accessible title and two actions', async () => {
    render({ title: h('span', 'Delete file?') })
    await settle()
    expect(dialog().dataset.component).toBe('ConfirmationDialog')
    expect(dialog().getAttribute('aria-modal')).toBe('true')
    expect(document.getElementById(dialog().getAttribute('aria-labelledby')!)?.textContent).toBe(
      'Delete file?',
    )
    expect(dialog().querySelector('h1[data-component="Dialog.Title"]')).not.toBeNull()
    expect(dialog().querySelector('[data-component="Dialog.Body"]')?.textContent).toBe(
      'Are you sure?',
    )
    expect(buttons().map((button) => button.textContent)).toEqual(['Cancel', 'OK'])
    expect(dialog().dataset.width).toBe('medium')
    expect(dialog().dataset.height).toBe('auto')
    expect(dialog().closest('[data-component="Portal"]')).not.toBeNull()
  })

  it.each([
    [undefined, undefined, 1],
    ['primary', undefined, 1],
    ['danger', undefined, 0],
    ['danger', 'confirm', 1],
    ['normal', 'cancel', 0],
  ] as const)(
    'focuses the expected action for %s / %s',
    async (confirmButtonType, overrideButtonFocus, index) => {
      render({ confirmButtonType, overrideButtonFocus })
      await settle()
      expect(document.activeElement).toBe(buttons()[index])
    },
  )

  it('reports confirm/cancel gestures without closing its controlled mount', async () => {
    const { onClose } = render()
    await settle()
    buttons()[0]!.click()
    buttons()[1]!.click()
    expect(onClose.mock.calls).toEqual([['cancel'], ['confirm']])
    expect(dialog()).not.toBeNull()
  })

  it('matches React initial footer tab stops after establishing confirm-button focus', async () => {
    render()
    await settle()
    expect(document.activeElement).toBe(buttons()[1])
    expect(buttons()[0]!.getAttribute('tabindex')).toBe('0')
    expect(buttons()[1]!.getAttribute('tabindex')).toBe('-1')
  })

  it('reports close-button and Escape once, including the close tooltip target', async () => {
    const { onClose } = render()
    await settle()
    const close = dialog().querySelector<HTMLButtonElement>(
      '[data-component="Dialog.CloseButton"]',
    )!
    close.click()
    key(buttons()[1]!, 'Escape')
    close.focus()
    await settle()
    key(close, 'Escape')
    expect(onClose.mock.calls).toEqual([['close-button'], ['escape'], ['escape']])
  })

  it('requires both a backdrop mousedown and backdrop click, reporting escape', async () => {
    const { onClose } = render()
    await settle()
    const backdrop = dialog().parentElement!
    dialog().dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    backdrop.click()
    expect(onClose).not.toHaveBeenCalled()
    backdrop.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    dialog().click()
    expect(onClose).not.toHaveBeenCalled()
    backdrop.click()
    expect(onClose).toHaveBeenCalledExactlyOnceWith('escape')
  })

  it('supports class names, preset/custom widths and heights', async () => {
    const { wrapper } = render({ className: 'custom-dialog', width: 'large', height: 'small' })
    await settle()
    expect(dialog().classList.contains('custom-dialog')).toBe(true)
    expect(dialog().dataset.width).toBe('large')
    expect(dialog().dataset.height).toBe('small')
    await wrapper.setProps({ width: 420 })
    expect(dialog().hasAttribute('data-width')).toBe(false)
    expect(dialog().style.getPropertyValue('--dialog-width')).toBe('420px')
    await wrapper.setProps({ width: '80rem' })
    expect(dialog().style.getPropertyValue('--dialog-width')).toBe('80rem')
  })

  it('renders reactive loading states, spinners and blocks loading actions', async () => {
    const { wrapper, onClose } = render({ confirmButtonLoading: true, cancelButtonLoading: true })
    await settle()
    for (const button of buttons()) {
      expect(button.dataset.loading).toBe('true')
      expect(button.querySelector('svg')).not.toBeNull()
      button.click()
    }
    expect(onClose).not.toHaveBeenCalled()
    await wrapper.setProps({ cancelButtonLoading: false, confirmButtonLoading: false })
    expect(buttons().every((button) => button.dataset.loading !== 'true')).toBe(true)
    buttons()[1]!.click()
    expect(onClose).toHaveBeenCalledWith('confirm')
  })

  it('moves between footer actions and lets boundary Tab reach the surrounding focus trap', async () => {
    render()
    await settle()
    buttons()[0]!.focus()
    key(buttons()[0]!, 'ArrowRight')
    expect(document.activeElement).toBe(buttons()[1])
    expect(key(buttons()[1]!, 'Tab').defaultPrevented).toBe(false)
    key(buttons()[1]!, 'Tab', true)
    expect(document.activeElement).toBe(buttons()[0])
    key(buttons()[0]!, 'Tab')
    expect(document.activeElement).toBe(buttons()[1])
    const outside = document.createElement('button')
    document.body.append(outside)
    outside.focus()
    expect(dialog().contains(document.activeElement)).toBe(true)
  })

  it('updates accessible overflow and footer wrap/scroll layout from real measurements', async () => {
    render()
    await settle()
    const region = dialog().querySelector<HTMLElement>('[data-component="ScrollableRegion"]')!
    const observer = observers.find(({ targets }) => targets.includes(region))!
    const layout = observers.find(({ targets }) => targets.includes(dialog().parentElement!))!
    Object.defineProperties(region, {
      clientHeight: { configurable: true, value: 47 },
      scrollHeight: { configurable: true, value: 80 },
    })
    observer.callback([{ target: region } as unknown as ResizeObserverEntry], {} as ResizeObserver)
    layout.callback([], {} as ResizeObserver)
    await settle()
    expect(region.getAttribute('role')).toBe('region')
    expect(region.getAttribute('tabindex')).toBe('0')
    expect(region.getAttribute('aria-labelledby')).toBe(dialog().getAttribute('aria-labelledby'))
    expect(dialog().dataset.footerButtonLayout).toBe('scroll')
    Object.defineProperties(region, {
      clientHeight: { configurable: true, value: 48 },
      scrollHeight: { configurable: true, value: 48 },
    })
    observer.callback([{ target: region } as unknown as ResizeObserverEntry], {} as ResizeObserver)
    layout.callback([], {} as ResizeObserver)
    await settle()
    expect(region.hasAttribute('role')).toBe(false)
    expect(dialog().dataset.footerButtonLayout).toBe('wrap')
  })

  it('restores focus on conditional unmount and cleans scroll locks/observers', async () => {
    const open = shallowRef(false)
    const wrapper = mount(
      defineComponent({
        setup: () => () => [
          h(
            'button',
            {
              onClick: () => {
                open.value = true
              },
            },
            'Open',
          ),
          open.value
            ? h(ConfirmationDialog, {
                title: 'Confirm',
                onClose: () => {
                  open.value = false
                },
              })
            : null,
        ],
      }),
      { attachTo: document.body },
    )
    wrappers.push(wrapper)
    const trigger = wrapper.get('button').element
    trigger.focus()
    await wrapper.get('button').trigger('click')
    await settle()
    expect(document.body.hasAttribute('data-dialog-scroll-disabled')).toBe(true)
    buttons()[0]!.click()
    await settle()
    expect(document.activeElement).toBe(trigger)
    expect(document.body.hasAttribute('data-dialog-scroll-disabled')).toBe(false)
    expect(document.body.style.getPropertyValue('--prc-dialog-scrollgutter')).toBe('')
    expect(observers.every(({ disconnect }) => disconnect.mock.calls.length > 0)).toBe(true)
  })

  it('provides Dialog context for nested anchored surfaces', async () => {
    const Child = defineComponent({
      setup: () => {
        const inside = inject(dialogContextKey, false)
        return () => h('span', { 'data-inside-dialog': String(inside) })
      },
    })
    const wrapper = mount(ConfirmationDialog, {
      props: { title: 'Confirm', onClose: vi.fn() },
      slots: { default: () => h(Child) },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    await settle()
    expect(dialog().querySelector('[data-inside-dialog="true"]')).not.toBeNull()
  })

  it('extracts a direct Body and avoids nesting it or rendering the remaining children', async () => {
    wrappers.push(
      mount(ConfirmationDialog, {
        props: { title: 'Confirm', onClose: vi.fn() },
        slots: {
          default: () => [
            'Unused default content',
            h(
              Dialog.Body<'section'>,
              { as: 'section', className: 'custom-body', id: 'custom-body' },
              { default: () => 'Custom body' },
            ),
          ],
        },
        attachTo: document.body,
      }),
    )
    await settle()
    const custom = dialog().querySelector('#custom-body')!
    expect(custom.tagName).toBe('DIV')
    expect(custom.getAttribute('as')).toBe('section')
    expect(custom.classList.contains('custom-body')).toBe(true)
    expect(custom.getAttribute('data-component')).toBe('Dialog.Body')
    expect(custom.parentElement?.getAttribute('data-component')).toBe('ScrollableRegion')
    expect(dialog().querySelectorAll('[data-component="Dialog.Body"]')).toHaveLength(1)
    expect(dialog().textContent).not.toContain('Unused default content')
  })

  it('recognizes marked wrappers and keeps only the first duplicate structural slot', async () => {
    const WrappedBody = asSlot(
      defineComponent({
        setup: () => () =>
          h(Dialog.Body<'div'>, { id: 'wrapped-body' }, { default: () => 'First body' }),
      }),
      Dialog.Body,
    )
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    wrappers.push(
      mount(ConfirmationDialog, {
        props: { title: 'Confirm', onClose: vi.fn() },
        slots: {
          default: () => [
            h(WrappedBody),
            h(Dialog.Body<'div'>, null, { default: () => 'Second body' }),
          ],
        },
        attachTo: document.body,
      }),
    )
    await settle()
    expect(
      dialog().querySelector('#wrapped-body')?.parentElement?.getAttribute('data-component'),
    ).toBe('ScrollableRegion')
    expect(dialog().textContent).not.toContain('Second body')
    expect(warn).toHaveBeenCalledWith(
      'Found duplicate "body" slot. Only the first will be rendered.',
    )
  })

  it('keeps explicit Fragments opaque, as React.Children does', async () => {
    wrappers.push(
      mount(ConfirmationDialog, {
        props: { title: 'Confirm', onClose: vi.fn() },
        slots: {
          default: () =>
            h(Fragment, null, [
              h(Dialog.Body<'div'>, { id: 'fragment-body' }, { default: () => 'Nested' }),
            ]),
        },
        attachTo: document.body,
      }),
    )
    await settle()
    expect(
      dialog().querySelector('#fragment-body')?.parentElement?.getAttribute('data-component'),
    ).toBe('Dialog.Body')
    expect(dialog().querySelectorAll('[data-component="Dialog.Body"]')).toHaveLength(2)
  })

  it('replaces Header/Footer without injecting default actions or the default footer focus zone', async () => {
    wrappers.push(
      mount(ConfirmationDialog, {
        props: { title: 'Unused default title', onClose: vi.fn() },
        slots: {
          default: () => [
            h(
              Dialog.Header<'header'>,
              { as: 'header', id: 'custom-header' },
              { default: () => h('button', 'First control') },
            ),
            h(
              Dialog.Footer<'section'>,
              { as: 'section', id: 'custom-footer' },
              { default: () => [h('button', 'One'), h('button', 'Two')] },
            ),
            'Body content',
          ],
        },
        attachTo: document.body,
      }),
    )
    await settle()
    expect(dialog().querySelector('#custom-header')?.tagName).toBe('DIV')
    expect(dialog().querySelector('#custom-footer')?.tagName).toBe('DIV')
    expect(dialog().querySelector('[data-component="Dialog.Title"]')).toBeNull()
    expect(dialog().querySelector('[data-component="Dialog.CloseButton"]')).toBeNull()
    expect(buttons()).toHaveLength(0)
    expect(document.activeElement?.textContent).toBe('First control')
    const custom = dialog().querySelectorAll<HTMLButtonElement>('#custom-footer button')
    custom[0]!.focus()
    expect(key(custom[0]!, 'ArrowRight').defaultPrevented).toBe(false)
    expect(document.activeElement).toBe(custom[0])
  })

  it('inherits named Portal context through both the dialog and its nested ActionMenu', async () => {
    const root = document.createElement('div')
    document.body.append(root)
    registerPortalRoot(root, 'confirmation-context')
    wrappers.push(
      mount(PortalContext.Provider, {
        props: { value: { portalContainerName: 'confirmation-context' } },
        slots: {
          default: () =>
            h(
              ConfirmationDialog,
              { title: 'Confirm', onClose: vi.fn() },
              {
                default: () =>
                  h(ActionMenu, null, {
                    default: () => [
                      h(ActionMenu.Button, null, { default: () => 'Nested menu' }),
                      h(ActionMenu.Overlay, null, {
                        default: () =>
                          h(ActionList, null, {
                            default: () =>
                              h(ActionList.Item, null, { default: () => 'Nested action' }),
                          }),
                      }),
                    ],
                  }),
              },
            ),
        },
        attachTo: document.body,
      }),
    )
    await settle()
    expect(root.contains(dialog())).toBe(true)
    dialog().querySelector<HTMLButtonElement>('[aria-haspopup="true"]')!.click()
    await settle()
    const menu = document.querySelector<HTMLElement>('[role="menu"]')!
    expect(root.contains(menu)).toBe(true)
    key(menu.querySelector('[role="menuitem"]')!, 'Escape')
    await settle()
    expect(document.querySelector('[role="menu"]')).toBeNull()
    expect(dialog()).not.toBeNull()
  })
})

describe('useConfirm', () => {
  it.each(['confirm', 'cancel', 'close-button', 'escape'] as const)(
    'resolves %s and removes the detached host and portal',
    async (gesture) => {
      const before = Array.from(document.body.children)
      const promise = useConfirm()({ title: 'Confirm', content: h('strong', 'Content') })
      await settle()
      const host = Array.from(document.body.children).find(
        (element) =>
          !before.includes(element) && element.querySelector('[data-component="BaseStyles"]'),
      )!
      const portal = dialog().closest('[data-component="Portal"]')!
      expect(dialog().querySelector('strong')?.textContent).toBe('Content')
      if (gesture === 'confirm') buttons()[1]!.click()
      else if (gesture === 'cancel') buttons()[0]!.click()
      else if (gesture === 'escape') key(buttons()[1]!, 'Escape')
      else
        dialog().querySelector<HTMLButtonElement>('[data-component="Dialog.CloseButton"]')!.click()
      expect(await promise).toBe(gesture === 'confirm')
      await settle()
      expect(host.isConnected).toBe(false)
      expect(portal.isConnected).toBe(false)
      expect(dialog()).toBeNull()
    },
  )

  it('opens from an ActionMenu trap and preserves footer focus after the menu closes', async () => {
    const confirm = useConfirm()
    let result: Promise<boolean> | undefined
    const wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(ActionMenu, null, {
            default: () => [
              h(ActionMenu.Button, null, { default: () => 'Open menu' }),
              h(ActionMenu.Overlay, null, {
                default: () =>
                  h(ActionList, null, {
                    default: () =>
                      h(
                        ActionList.Item,
                        {
                          onSelect: () => {
                            result = confirm({ title: 'Confirm', content: 'Content' })
                          },
                        },
                        { default: () => 'Show dialog' },
                      ),
                  }),
              }),
            ],
          }),
      }),
      { attachTo: document.body },
    )
    wrappers.push(wrapper)
    await wrapper.get('button').trigger('click')
    await settle()
    document.querySelector<HTMLElement>('[role="menuitem"]')!.click()
    await settle()
    expect(document.activeElement).toBe(buttons()[1])
    expect(document.querySelector('[role="menu"]')).toBeNull()
    buttons()[0]!.click()
    expect(await result).toBe(false)
  })

  it('keeps detached roots independent from the caller and reference-counts simultaneous dialogs', async () => {
    const caller = mount(
      defineComponent({
        setup() {
          const confirm = useConfirm()
          return () =>
            h(
              'button',
              {
                onClick: () => {
                  void confirm({ title: 'First', content: 'One' })
                },
              },
              'Open',
            )
        },
      }),
      { attachTo: document.body },
    )
    await caller.get('button').trigger('click')
    await settle()
    caller.unmount()
    await settle()
    expect(dialog()).not.toBeNull()
    const second = useConfirm()({ title: 'Second', content: 'Two' })
    await settle()
    const dialogs = document.querySelectorAll<HTMLElement>('[role="alertdialog"]')
    expect(dialogs).toHaveLength(2)
    const labels = Array.from(dialogs, (element) => element.getAttribute('aria-labelledby'))
    expect(new Set(labels).size).toBe(2)
    expect(labels.map((id) => document.getElementById(id!)?.textContent)).toEqual([
      'First',
      'Second',
    ])
    dialogs[1]!.querySelector<HTMLButtonElement>('[data-component="Dialog.FooterButton"]')!.click()
    expect(await second).toBe(false)
    expect(document.body.hasAttribute('data-dialog-scroll-disabled')).toBe(true)
    buttons()[0]!.click()
    await settle()
    expect(document.body.hasAttribute('data-dialog-scroll-disabled')).toBe(false)
  })

  it('renders with a fresh application context rather than inheriting caller provides', async () => {
    const token = Symbol('caller-context')
    const Content = defineComponent({
      setup() {
        const value = inject(token, 'detached')
        return () => h('span', { 'data-context': value }, value)
      },
    })
    let result: Promise<boolean> | undefined
    const wrapper = mount(
      defineComponent({
        setup() {
          const confirm = useConfirm()
          return () =>
            h(
              'button',
              {
                onClick: () => {
                  result = confirm({ title: 'Confirm', content: h(Content) })
                },
              },
              'Open',
            )
        },
      }),
      { attachTo: document.body, global: { provide: { [token]: 'caller' } } },
    )
    wrappers.push(wrapper)
    await wrapper.get('button').trigger('click')
    await settle()
    expect(dialog().querySelector('[data-context="detached"]')).not.toBeNull()
    buttons()[0]!.click()
    expect(await result).toBe(false)
  })
})
