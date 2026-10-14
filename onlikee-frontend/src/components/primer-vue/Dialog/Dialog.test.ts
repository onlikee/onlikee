// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { h, nextTick, shallowRef, type VNodeChild } from 'vue'
import { Dialog, type DialogProps } from './index'

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
    console.log(element().outerHTML)
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
