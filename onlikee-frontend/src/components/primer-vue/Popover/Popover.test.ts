// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, defineComponent, h, nextTick, shallowReactive, shallowRef } from 'vue'
import { renderToString } from '@vue/server-renderer'
import Popover, { PopoverContent, type PopoverProps, type PopoverContentProps } from './index'
import classes from './Popover.module.css'
import { Overlay } from '../Overlay'
import { Button } from '../Button'
import { ActionMenu } from '../ActionMenu'
import { ActionList } from '../ActionList'
import { Portal } from '../Portal'
import { registerEscapeHandler } from '../internal/documentRegistries'

const wrappers: VueWrapper[] = []
function render(props: PopoverProps = {}, content = {}) {
  const wrapper = mount(Popover, {
    props,
    slots: { default: () => h(Popover.Content, { ...content }, () => h(Button, () => 'Content')) },
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  return wrapper
}
function escape(prevented = false) {
  const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
  if (prevented) event.preventDefault()
  document.dispatchEvent(event)
  return event
}
function down(target: Element, button = 0, prevented = false) {
  const event = new MouseEvent('mousedown', { button, bubbles: true, cancelable: true })
  if (prevented) event.preventDefault()
  target.dispatchEvent(event)
  return event
}
async function settle() {
  await nextTick()
  await flushPromises()
  await nextTick()
}
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
})

describe('Popover source contracts', () => {
  it('exports the same Content component and renders the source defaults as divs', () => {
    expect(Popover.Content).toBe(PopoverContent)
    const wrapper = render()
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes()).toMatchObject({ 'data-component': 'Popover', 'data-caret': 'top' })
    expect(wrapper.classes()).toContain(classes.Popover)
    expect(wrapper.attributes('data-open')).toBeUndefined()
    expect(wrapper.attributes('data-relative')).toBeUndefined()
    const content = wrapper.get('[data-component="Popover.Content"]')
    expect(content.element.tagName).toBe('DIV')
    expect(content.classes()).toContain(classes.PopoverContent)
    expect(content.attributes('data-width')).toBe('small')
    expect(content.attributes('data-height')).toBe('fit-content')
    expect(content.attributes('overflow')).toBeUndefined()
    expect(wrapper.find('[role]').exists()).toBe(false)
    expect(wrapper.find('[data-component="Portal"]').exists()).toBe(false)
  })

  it.each<NonNullable<PopoverProps['caret']>>([
    'top',
    'bottom',
    'left',
    'right',
    'bottom-left',
    'bottom-right',
    'top-left',
    'top-right',
    'left-bottom',
    'left-top',
    'right-bottom',
    'right-top',
  ])(
    'renders caret %s and updates visibility/relative attributes without unmounting',
    async (caret) => {
      const wrapper = render({ caret, open: true, relative: true })
      const content = wrapper.get('[data-component="Popover.Content"]').element
      expect(wrapper.attributes('data-caret')).toBe(caret)
      expect(wrapper.attributes('data-open')).toBe('')
      expect(wrapper.attributes('data-relative')).toBe('')
      await wrapper.setProps({ open: false, relative: false })
      expect(wrapper.attributes('data-open')).toBeUndefined()
      expect(wrapper.attributes('data-relative')).toBeUndefined()
      expect(wrapper.get('[data-component="Popover.Content"]').element).toBe(content)
    },
  )

  it('forwards attrs, listeners, classes, numeric styles and root DOM ref with source spread precedence', async () => {
    const click = vi.fn()
    const wrapper = render(
      {
        id: 'popover',
        className: 'source',
        class: 'vue',
        style: { marginTop: 12 },
        onClick: click,
        'aria-label': 'Popover',
        'data-component': 'ignored',
        'data-caret': 'ignored',
      } as PopoverProps,
      {
        className: 'source-content',
        class: 'vue-content',
        style: { padding: 10 },
        'data-component': 'CustomContent',
        'data-width': 'custom',
        'aria-label': 'Content',
        width: 'large',
        height: 'medium',
        overflow: 'scroll',
      },
    )
    expect(wrapper.attributes('id')).toBe('popover')
    expect(wrapper.attributes('data-component')).toBe('Popover')
    expect(wrapper.attributes('data-caret')).toBe('top')
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['source', 'vue', classes.Popover]))
    expect((wrapper.element as HTMLElement).style.marginTop).toBe('12px')
    expect(wrapper.vm.element).toBe(wrapper.element)
    const content = wrapper.get('[data-component="CustomContent"]')
    expect(content.classes()).toEqual(
      expect.arrayContaining(['source-content', 'vue-content', classes.PopoverContent]),
    )
    expect(content.attributes('data-width')).toBe('custom')
    expect(content.attributes('data-height')).toBe('medium')
    expect(content.attributes('overflow')).toBe('scroll')
    expect((content.element as HTMLElement).style.padding).toBe('10px')
    await content.get('button').trigger('click')
    expect(click).toHaveBeenCalledOnce()
    await wrapper.setProps({ style: { marginTop: 18 }, className: 'updated' })
    expect((wrapper.element as HTMLElement).style.marginTop).toBe('18px')
    expect(wrapper.classes()).toContain('updated')
  })

  it('forwards the native as attribute while both roots remain divs', () => {
    const wrapper = render({ as: 'section' }, { as: 'article' })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('as')).toBe('section')
    const content = wrapper.get('[data-component="Popover.Content"]')
    expect(content.element.tagName).toBe('DIV')
    expect(content.attributes('as')).toBe('article')
  })

  it('uses the nearest open context, invokes live callbacks and consumes only handled Escape', async () => {
    const first = vi.fn()
    const second = vi.fn()
    const content = shallowReactive<PopoverContentProps>({ onEscape: first })
    const wrapper = render({ open: false }, content)
    expect(escape().defaultPrevented).toBe(false)
    expect(first).not.toHaveBeenCalled()
    await wrapper.setProps({ open: true })
    expect(escape(true).defaultPrevented).toBe(true)
    expect(first).not.toHaveBeenCalled()
    const event = escape()
    expect(first).toHaveBeenCalledExactlyOnceWith(event)
    expect(event.defaultPrevented).toBe(true)
    content.onEscape = second
    await nextTick()
    escape()
    expect(second).toHaveBeenCalledOnce()
    content.onEscape = undefined
    await nextTick()
    expect(escape().defaultPrevented).toBe(false)
    const detached = mount(Popover.Content, { props: { onEscape: first } })
    wrappers.push(detached)
    escape()
    expect(first).toHaveBeenCalledOnce()
  })

  it('handles capture mousedown outside even while closed, respecting ignored refs and cancellation', async () => {
    const ignored = document.createElement('button')
    ignored.innerHTML = '<span>Ignored</span>'
    document.body.append(ignored)
    const ignoreRef = shallowRef<HTMLElement | null>(ignored)
    const outside = vi.fn()
    const content = shallowReactive<PopoverContentProps>({
      onClickOutside: outside,
      ignoreClickRefs: [ignoreRef],
    })
    const wrapper = render({}, content)
    await settle()
    down(wrapper.get('button').element)
    down(ignored.firstElementChild!)
    down(document.body, 2)
    down(document.body, 0, true)
    document.body.click()
    document.body.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }))
    expect(outside).not.toHaveBeenCalled()
    const event = down(document.body)
    expect(outside).toHaveBeenCalledExactlyOnceWith(event)
    ignoreRef.value = null
    down(ignored)
    expect(outside).toHaveBeenCalledTimes(2)
    const next = vi.fn()
    content.onClickOutside = next
    await nextTick()
    const stopper = document.createElement('div')
    stopper.addEventListener('mousedown', (event) => event.stopPropagation())
    document.body.append(stopper)
    down(stopper)
    expect(next).toHaveBeenCalledOnce()
    wrapper.unmount()
    wrappers.pop()
    down(document.body)
    escape()
    expect(next).toHaveBeenCalledOnce()
  })

  it('lets the inner Popover consume Escape and inside clicks before outer handlers', async () => {
    const outerEscape = vi.fn()
    const innerEscape = vi.fn()
    const outerOutside = vi.fn()
    const innerOutside = vi.fn((event: MouseEvent | TouchEvent) => event.preventDefault())
    const innerOpen = shallowRef(true)
    const wrapper = mount(Popover, {
      props: { open: true },
      slots: {
        default: () =>
          h(Popover.Content, { onEscape: outerEscape, onClickOutside: outerOutside }, () =>
            h(Popover, { open: innerOpen.value }, () =>
              h(Popover.Content, { onEscape: innerEscape, onClickOutside: innerOutside }, () =>
                h('button', 'Inner'),
              ),
            ),
          ),
      },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    await settle()
    escape()
    expect(innerEscape).toHaveBeenCalledOnce()
    expect(outerEscape).not.toHaveBeenCalled()
    down(wrapper.get('button').element)
    expect(innerOutside).not.toHaveBeenCalled()
    expect(outerOutside).not.toHaveBeenCalled()
    down(document.body)
    expect(innerOutside).toHaveBeenCalledOnce()
    expect(outerOutside).not.toHaveBeenCalled()
    innerOpen.value = false
    await nextTick()
    escape()
    expect(outerEscape).toHaveBeenCalledOnce()
  })

  it('composes with the shared lower Escape registry and Overlay without moving focus', async () => {
    const lower = vi.fn()
    const cleanup = registerEscapeHandler(lower)
    const initial = document.createElement('button')
    document.body.append(initial)
    initial.focus()
    const onEscape = vi.fn()
    const wrapper = render({ open: true }, { onEscape })
    await settle()
    expect(document.activeElement).toBe(initial)
    escape()
    expect(onEscape).toHaveBeenCalledOnce()
    expect(lower).not.toHaveBeenCalled()
    wrapper.unmount()
    wrappers.pop()
    escape()
    expect(lower).toHaveBeenCalledOnce()
    cleanup()

    const overlayEscape = vi.fn()
    const popoverEscape = vi.fn()
    const overlay = mount(Overlay, {
      props: {
        returnFocusRef: shallowRef(initial),
        onEscape: overlayEscape,
        onClickOutside: vi.fn(),
        preventFocusOnOpen: true,
      },
      slots: {
        default: () =>
          h(Popover, { open: true }, () =>
            h(Popover.Content, { onEscape: popoverEscape }, () => h(Button, () => 'In overlay')),
          ),
      },
      attachTo: document.body,
    })
    wrappers.push(overlay)
    await settle()
    escape()
    expect(popoverEscape).toHaveBeenCalledOnce()
    expect(overlayEscape).not.toHaveBeenCalled()
  })

  it('hydrates the inline root and content and preserves their source attributes', async () => {
    const onEscape = vi.fn()
    const app = () =>
      createSSRApp(
        defineComponent({
          setup: () => () =>
            h(Popover, { open: true }, () =>
              h(Popover.Content, { onEscape }, () => h('button', 'Hydrated')),
            ),
        }),
      )
    const host = document.createElement('div')
    host.innerHTML = await renderToString(app())
    document.body.append(host)
    const root = host.firstElementChild
    const warn = vi.spyOn(console, 'warn')
    const client = app()
    client.mount(host)
    await settle()
    expect(host.firstElementChild).toBe(root)
    expect(host.querySelector('[data-component="Popover.Content"]')?.textContent).toBe('Hydrated')
    expect(warn).not.toHaveBeenCalled()
    escape()
    expect(onEscape).toHaveBeenCalledOnce()
    client.unmount()
  })

  it('lets a nested Overlay handle Escape and inside clicks before its parent Popover', async () => {
    const parentEscape = vi.fn()
    const parentOutside = vi.fn()
    const childEscape = vi.fn()
    const wrapper = mount(Popover, {
      props: { open: true },
      slots: {
        default: () =>
          h(Popover.Content, { onEscape: parentEscape, onClickOutside: parentOutside }, () =>
            h(
              Overlay,
              {
                returnFocusRef: shallowRef<HTMLElement | null>(null),
                onEscape: childEscape,
                onClickOutside: vi.fn(),
                preventFocusOnOpen: true,
              },
              () => h('button', { id: 'nested-overlay-action' }, 'Action'),
            ),
          ),
      },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    await settle()
    escape()
    expect(childEscape).toHaveBeenCalledOnce()
    expect(parentEscape).not.toHaveBeenCalled()
    down(document.getElementById('nested-overlay-action')!)
    expect(parentOutside).not.toHaveBeenCalled()
  })

  it('closes a nested ActionMenu before consuming the next Escape in its Popover parent', async () => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    )
    const onEscape = vi.fn()
    const wrapper = mount(Popover, {
      props: { open: true },
      slots: {
        default: () =>
          h(Popover.Content, { onEscape }, () =>
            h(ActionMenu, null, {
              default: () => [
                h(ActionMenu.Button, { id: 'nested-menu-trigger' }, () => 'More'),
                h(ActionMenu.Overlay, null, () =>
                  h(ActionList, null, () => h(ActionList.Item, null, () => 'Copy')),
                ),
              ],
            }),
          ),
      },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    await settle()
    const trigger = document.getElementById('nested-menu-trigger')!
    trigger.click()
    await settle()
    expect(document.querySelector('[role="menu"]')).not.toBeNull()
    escape()
    await settle()
    expect(document.querySelector('[role="menu"]')).toBeNull()
    expect(onEscape).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(trigger)
    escape()
    expect(onEscape).toHaveBeenCalledOnce()
  })

  it('preserves open context across Portal while outside detection follows the physical DOM', async () => {
    const onEscape = vi.fn()
    const outside = vi.fn()
    const wrapper = mount(Popover, {
      props: { open: true },
      slots: {
        default: () => [
          h(Popover.Content, { onClickOutside: outside }, () =>
            h(Portal, null, () => h('button', { id: 'portal-action' }, 'Portal action')),
          ),
          h(Portal, null, () =>
            h(Popover.Content, { onEscape }, () =>
              h('button', { id: 'portal-content-action' }, 'Content'),
            ),
          ),
        ],
      },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    await settle()
    escape()
    expect(onEscape).toHaveBeenCalledOnce()
    down(document.getElementById('portal-action')!)
    expect(outside).toHaveBeenCalledOnce()
  })
})
