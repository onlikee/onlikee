// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { ErrorDialog } from './index'

const wrappers: VueWrapper[] = []
const dialog = () => document.querySelector<HTMLElement>('[role="alertdialog"]')!
async function settle() {
  await nextTick()
  await flushPromises()
  await nextTick()
}
beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
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
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
})
describe('Table.ErrorDialog', () => {
  it.each(['retry', 'dismiss', 'escape', 'close'] as const)(
    'maps %s once to the public event, closes and restores trigger focus',
    async (action) => {
      const open = ref(false)
      const onRetry = vi.fn(() => {
        open.value = false
      })
      const onDismiss = vi.fn(() => {
        open.value = false
      })
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
              'Open error',
            ),
            open.value
              ? h(ErrorDialog, { onRetry, onDismiss }, () => h('p', 'Could not load repositories.'))
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
      expect(dialog().textContent).toContain('Error')
      expect(dialog().textContent).toContain('Could not load repositories.')
      const buttons = Array.from(
        dialog().querySelectorAll<HTMLButtonElement>('[data-component="Dialog.FooterButton"]'),
      )
      expect(buttons.map((button) => button.textContent)).toEqual(['Dismiss', 'Retry'])
      expect(document.activeElement).toBe(buttons[1])
      if (action === 'retry') buttons[1]!.click()
      else if (action === 'dismiss') buttons[0]!.click()
      else if (action === 'close')
        dialog().querySelector<HTMLButtonElement>('[data-component="Dialog.CloseButton"]')!.click()
      else
        dialog().dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
        )
      await settle()
      expect(onRetry).toHaveBeenCalledTimes(action === 'retry' ? 1 : 0)
      expect(onDismiss).toHaveBeenCalledTimes(action === 'retry' ? 0 : 1)
      expect(document.querySelector('[role="alertdialog"]')).toBeNull()
      expect(document.activeElement).toBe(trigger)
    },
  )
  it('supports a custom reactive title', async () => {
    const wrapper = mount(ErrorDialog, {
      props: { title: 'Network error' },
      attachTo: document.body,
    })
    wrappers.push(wrapper)
    await settle()
    expect(document.getElementById(dialog().getAttribute('aria-labelledby')!)?.textContent).toBe(
      'Network error',
    )
    await wrapper.setProps({ title: 'Retry failed' })
    expect(document.getElementById(dialog().getAttribute('aria-labelledby')!)?.textContent).toBe(
      'Retry failed',
    )
  })
})
