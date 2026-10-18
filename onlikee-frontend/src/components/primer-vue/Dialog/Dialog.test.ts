// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { computed, defineComponent, h, nextTick, shallowRef, type VNodeChild } from 'vue'
import { XIcon } from '@onlikee/octicons-vue'
import { Dialog, type DialogFocusTarget, type DialogProps } from './index'
import { Button, IconButton } from '../Button'
import type { ButtonInstance } from '../Button/types'
import { ActionList } from '../ActionList'
import { TextInput } from '../TextInput'
import { AnchoredOverlay } from '../AnchoredOverlay'

const wrappers: VueWrapper[] = []
const observers: Array<{ callback: ResizeObserverCallback; target: Element }> = []
const element = () => document.querySelector<HTMLDivElement>('[role="dialog"]')!
const actions = () =>
  Array.from(
    element().querySelectorAll<HTMLButtonElement>('[data-component="Dialog.FooterButton"]'),
  )
async function settle() {
  await nextTick()
  await flushPromises()
  await nextTick()
}
function render(
  props: Partial<DialogProps> = {},
  children: VNodeChild | (() => VNodeChild) = 'Body',
) {
  const onClose = vi.fn()
  const wrapper = mount(Dialog, {
    props: { onClose, ...props },
    slots: { default: () => (typeof children === 'function' ? children() : children) },
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
      callback: ResizeObserverCallback
      constructor(callback: ResizeObserverCallback) {
        this.callback = callback
      }
      observe(target: Element) {
        observers.push({ callback: this.callback, target })
      }
      disconnect() {}
      unobserve() {}
    },
  )
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  )
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 0, 100, 30),
  )
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([
    new DOMRect(0, 0, 100, 30),
  ] as unknown as DOMRectList)
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(100)
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(30)
  vi.spyOn(HTMLElement.prototype, 'offsetParent', 'get').mockReturnValue(document.body)
})
afterEach(async () => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  await settle()
  document.body.innerHTML = ''
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('Dialog source contract', () => {
  it('mounts immediately with optional title, source attributes, root ref and no omitted footer', async () => {
    const { wrapper } = render()
    await settle()
    expect(element().tagName).toBe('DIV')
    expect(element().dataset).toMatchObject({
      component: 'Dialog',
      width: 'xlarge',
      height: 'auto',
      positionNarrow: 'center',
      positionRegular: 'center',
    })
    expect(element().getAttribute('aria-modal')).toBe('true')
    expect(element().hasAttribute('aria-describedby')).toBe(true)
    expect(element().querySelector('h1')?.id).toBe(element().getAttribute('aria-labelledby'))
    expect(element().querySelector('h1')?.textContent).toBe('Dialog')
    expect(element().querySelector('[data-component="Dialog.Body"]')?.textContent).toBe('Body')
    expect(element().hasAttribute('data-has-footer')).toBe(false)
    expect(element().querySelector('[data-component="Dialog.Footer"]')).toBeNull()
    expect((wrapper.vm as unknown as { element: HTMLElement }).element).toBe(element())
    expect(document.activeElement).toBe(
      element().querySelector('[data-component="Dialog.CloseButton"]'),
    )
  })
  it('renders an explicitly empty footer and keeps title/subtitle nodes and IDs', async () => {
    render({ title: h('strong', 'Title'), subtitle: h('em', 'Subtitle'), footerButtons: [] })
    await settle()
    expect(element().querySelector('h2')?.id).toBe(element().getAttribute('aria-describedby'))
    expect(element().querySelector('h1 strong')?.textContent).toBe('Title')
    expect(element().querySelector('h2 em')?.textContent).toBe('Subtitle')
    expect(element().hasAttribute('data-has-footer')).toBe(true)
    expect(element().querySelector('[data-component="Dialog.Footer"]')).not.toBeNull()
  })
  it('preserves the source rendering of a zero subtitle without creating a Subtitle heading', async () => {
    render({ subtitle: 0 })
    await settle()
    expect(element().querySelector('h1')?.parentElement?.textContent).toBe('Dialog0')
    expect(element().querySelector('[data-component="Dialog.Subtitle"]')).toBeNull()
  })
  it('passes only the source defaults to renderers and remaining children to renderBody', async () => {
    const renderHeader = vi.fn((props: Parameters<NonNullable<DialogProps['renderHeader']>>[0]) =>
      h('h1', { id: props.dialogLabelId }, 'Custom'),
    )
    const renderBody = vi.fn((props: DialogProps & { children?: VNodeChild }) =>
      h('article', null, [props.children]),
    )
    const renderFooter = vi.fn(() => null)
    render({ renderHeader, renderBody, renderFooter, 'data-component': 'CustomDialog' })
    await settle()
    expect(renderHeader.mock.lastCall?.[0]).toMatchObject({
      title: 'Dialog',
      subtitle: '',
      role: 'dialog',
      'data-component': 'CustomDialog',
    })
    expect(renderHeader.mock.lastCall?.[0].width).toBeUndefined()
    expect(renderHeader.mock.lastCall?.[0].footerButtons).toBeUndefined()
    expect(element().dataset.component).toBe('CustomDialog')
    expect(element().querySelector('article')?.textContent).toBe('Body')
    expect(element().hasAttribute('data-has-footer')).toBe(false)
  })
  it('uses structural sections in preference to render callbacks', async () => {
    const renderHeader = vi.fn(() => null)
    const renderBody = vi.fn(() => null)
    const renderFooter = vi.fn(() => null)
    render({ renderHeader, renderBody, renderFooter }, [
      h(Dialog.Footer<'div'>, null, { default: () => 'Footer' }),
      h(Dialog.Body<'div'>, null, { default: () => 'Content' }),
      h(Dialog.Header<'div'>, null, { default: () => 'Header' }),
    ])
    await settle()
    expect(renderHeader).not.toHaveBeenCalled()
    expect(renderBody).not.toHaveBeenCalled()
    expect(renderFooter).not.toHaveBeenCalled()
    expect(element().querySelectorAll('[data-component="Dialog.Body"]')).toHaveLength(1)
    expect(element().querySelector('[data-component="Dialog.Footer"]')?.textContent).toBe('Footer')
  })
  it('preserves responsive attributes and applies numeric width/style with width precedence', async () => {
    const warning = vi.spyOn(console, 'warn')
    const { wrapper } = render({
      width: 420,
      style: { marginTop: 3, opacity: 0.9, '--dialog-width': '999px' },
      className: 'custom',
      position: { narrow: 'bottom', regular: 'right', wide: 'fullscreen' },
      align: 'top',
    })
    await settle()
    expect(element().style.getPropertyValue('--dialog-width')).toBe('420px')
    expect(element().style.marginTop).toBe('3px')
    expect(element().style.opacity).toBe('0.9')
    expect(element().classList.contains('custom')).toBe(true)
    expect(element().dataset).toMatchObject({
      positionNarrow: 'bottom',
      positionRegular: 'right',
      positionWide: 'fullscreen',
      align: 'top',
    })
    expect(element().parentElement?.dataset).toMatchObject({
      positionNarrow: 'bottom',
      positionRegular: 'right',
      positionWide: 'fullscreen',
      align: 'top',
    })
    expect(element().hasAttribute('data-width')).toBe(false)
    expect(warning).not.toHaveBeenCalled()
    await wrapper.setProps({ position: 'left' })
    await settle()
    expect(element().dataset.positionRegular).toBe('left')
    expect(element().hasAttribute('data-position-narrow')).toBe(false)
  })
  it('reports source close gestures without independently removing the dialog', async () => {
    const { onClose } = render()
    await settle()
    const close = element().querySelector<HTMLButtonElement>(
      '[data-component="Dialog.CloseButton"]',
    )!
    close.click()
    expect(onClose).toHaveBeenLastCalledWith('close-button')
    close.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    )
    expect(onClose).toHaveBeenLastCalledWith('escape')
    expect(onClose).toHaveBeenCalledTimes(2)
    const backdrop = element().parentElement!
    backdrop.click()
    expect(onClose).toHaveBeenCalledTimes(2)
    backdrop.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    backdrop.click()
    expect(onClose).toHaveBeenCalledTimes(3)
    expect(onClose).toHaveBeenLastCalledWith('escape')
    expect(element()).not.toBeNull()
  })
  it('uses explicit initial and return focus refs', async () => {
    const returnTarget = document.createElement('button')
    const trigger = document.createElement('button')
    document.body.append(trigger, returnTarget)
    trigger.focus()
    const initialFocusRef = shallowRef<HTMLElement | null>(null)
    const returnFocusRef = shallowRef<HTMLElement | null>(returnTarget)
    const { wrapper } = render({ initialFocusRef, returnFocusRef }, () =>
      h('input', { ref: initialFocusRef, 'aria-label': 'Name' }),
    )

    await settle()
    expect(document.activeElement).toBe(initialFocusRef.value)
    wrapper.unmount()
    wrappers.pop()
    expect(document.activeElement).toBe(returnTarget)
  })

  it.each(['Button', 'IconButton', 'TextInput', 'ActionList.LinkItem'] as const)(
    'focuses the native element exposed by %s without passing a component instance to the trap',
    async (component) => {
      const initialFocusRef = shallowRef<DialogFocusTarget | null>(null)
      render({ initialFocusRef }, () => {
        const attrs = { ref: initialFocusRef, 'data-requested-focus': '' }
        if (component === 'Button') return h(Button, attrs, () => 'Requested')
        if (component === 'IconButton')
          return h(IconButton, { ...attrs, icon: XIcon, 'aria-label': 'Requested' })
        if (component === 'TextInput') return h(TextInput, { ...attrs, 'aria-label': 'Requested' })
        return h(ActionList, null, {
          default: () =>
            h(ActionList.LinkItem, { ...attrs, href: '#requested' }, () => 'Requested'),
        })
      })
      await settle()
      const requested = element().querySelector('[data-requested-focus]')!
      expect(requested).not.toBeNull()
      expect(document.activeElement).toBe(requested)
      expect(initialFocusRef.value).not.toBe(requested)
    },
  )

  it.each(['component', 'computed DOM'] as const)(
    'returns focus to a Button through its %s ref on close and reopen',
    async (mode) => {
      const open = shallowRef(false)
      const target = shallowRef<ButtonInstance | null>(null)
      const returnFocusRef =
        mode === 'component' ? target : computed(() => target.value?.element ?? null)
      const wrapper = mount(
        defineComponent({
          setup: () => () => [
            h(
              Button,
              {
                onClick: () => {
                  open.value = true
                },
              },
              () => 'Open',
            ),
            h(Button, { ref: target }, () => 'Return target'),
            open.value
              ? h(
                  Dialog,
                  {
                    returnFocusRef,
                    onClose: () => {
                      open.value = false
                    },
                  },
                  () => 'Body',
                )
              : null,
          ],
        }),
        { attachTo: document.body },
      )
      wrappers.push(wrapper)
      const [trigger, destination] = wrapper.findAll('button')
      for (let attempt = 0; attempt < 2; attempt++) {
        ;(trigger!.element as HTMLElement).focus()
        await trigger!.trigger('click')
        await settle()
        element().querySelector<HTMLButtonElement>('[data-component="Dialog.CloseButton"]')!.click()
        await settle()
        expect(element()).toBeNull()
        expect(document.activeElement).toBe(destination!.element)
      }
    },
  )

  it('uses the latest return target and falls back when an exposed element is unavailable', async () => {
    const first = document.createElement('button')
    const second = document.createElement('button')
    first.textContent = 'First target'
    second.textContent = 'Second target'
    document.body.append(first, second)
    first.focus()
    const returnFocusRef = shallowRef({ element: first })
    const { wrapper } = render({ returnFocusRef })
    await settle()
    returnFocusRef.value = { element: second }
    await settle()
    wrapper.unmount()
    wrappers.pop()
    expect(document.activeElement).toBe(second)

    first.focus()
    const fallback = render({
      returnFocusRef: shallowRef({ element: null }),
      initialFocusRef: shallowRef({ element: null }),
    })
    await settle()
    expect(document.activeElement).toBe(
      element().querySelector('[data-component="Dialog.CloseButton"]'),
    )
    fallback.wrapper.unmount()
    wrappers.pop()
    expect(document.activeElement).toBe(first)
  })

  it('keeps focus in the inner dialog and restores the parent Button when the inner closes', async () => {
    const outerClose = vi.fn()
    const innerOpen = shallowRef(false)
    const trigger = shallowRef<ButtonInstance | null>(null)
    const requested = shallowRef<ButtonInstance | null>(null)
    render({ title: 'Outer', onClose: outerClose }, () => [
      h(
        Button,
        {
          ref: trigger,
          onClick: () => {
            innerOpen.value = true
          },
        },
        () => 'Open inner',
      ),
      innerOpen.value
        ? h(
            Dialog,
            {
              title: 'Inner',
              initialFocusRef: requested,
              returnFocusRef: trigger,
              onClose: () => {
                innerOpen.value = false
              },
            },
            () => h(Button, { ref: requested }, () => 'Inner target'),
          )
        : null,
    ])
    await settle()
    trigger.value!.element!.click()
    await settle()
    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(2)
    expect(document.activeElement).toBe(requested.value!.element)
    requested.value!.element!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    )
    await settle()
    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1)
    expect(outerClose).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(trigger.value!.element)
    expect(document.body.hasAttribute('data-dialog-scroll-disabled')).toBe(true)
  })

  it('hands focus to a nested AnchoredOverlay component target and returns it without closing Dialog', async () => {
    const open = shallowRef(false)
    const anchor = shallowRef<ButtonInstance | null>(null)
    const requested = shallowRef<ButtonInstance | null>(null)
    const onClose = vi.fn()
    render({ onClose }, () =>
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
          renderAnchor: (bindings) =>
            h(
              Button,
              {
                ...bindings,
                ref: (value) => {
                  bindings.ref(value)
                  anchor.value = value as ButtonInstance | null
                },
              },
              () => 'Open overlay',
            ),
          overlayProps: { preventFocusOnOpen: true },
          focusTrapSettings: { initialFocusRef: requested, returnFocusRef: anchor },
        },
        () => h(Button, { ref: requested }, () => 'Overlay target'),
      ),
    )
    await settle()
    anchor.value!.element!.click()
    await settle()
    expect(document.activeElement).toBe(requested.value!.element)
    requested.value!.element!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    )
    await settle()
    expect(open.value).toBe(false)
    expect(onClose).not.toHaveBeenCalled()
    expect(element()).not.toBeNull()
    expect(document.activeElement).toBe(anchor.value!.element)
  })
  it('overwrites autofocus button refs and focuses only the first autofocus action', async () => {
    const provided = shallowRef<HTMLButtonElement | null>(null)
    const buttons: NonNullable<DialogProps['footerButtons']> = [
      { content: 'First', autoFocus: true, ref: provided },
      { content: 'Second', autoFocus: true },
    ]
    render({ footerButtons: buttons })
    await settle()
    expect(document.activeElement).toBe(actions()[0])
    expect(buttons[0]!.ref).toBe(buttons[1]!.ref)
    expect(buttons[0]!.ref?.value).toBe(actions()[0])
    expect(provided.value).toBeNull()
  })
  it('adds overflow accessibility and switches footer layout at the 48px boundary', async () => {
    render({ footerButtons: [{ content: 'Save' }] })
    await settle()
    const region = element().querySelector<HTMLElement>('[data-component="ScrollableRegion"]')!
    const overflow = observers.find((observer) => observer.target === region)!
    Object.defineProperty(region, 'scrollHeight', { value: 100, configurable: true })
    Object.defineProperty(region, 'clientHeight', { value: 47, configurable: true })
    overflow.callback([{ target: region } as unknown as ResizeObserverEntry], {} as ResizeObserver)
    const layout = observers.find((observer) => observer.target === element().parentElement)!
    layout.callback([], {} as ResizeObserver)
    await settle()
    expect(region.getAttribute('role')).toBe('region')
    expect(region.getAttribute('tabindex')).toBe('0')
    expect(region.getAttribute('aria-labelledby')).toBe(element().getAttribute('aria-labelledby'))
    expect(element().dataset.footerButtonLayout).toBe('scroll')
    Object.defineProperty(region, 'clientHeight', { value: 48, configurable: true })
    layout.callback([], {} as ResizeObserver)
    await settle()
    expect(element().dataset.footerButtonLayout).toBe('wrap')
  })
})
