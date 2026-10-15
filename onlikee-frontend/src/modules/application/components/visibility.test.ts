// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { nextTick, type Component } from 'vue'
import CollectFirstStep from './collectForm/FirstStep.vue'
import ConnectFirstStep from './connectForm/FirstStep.vue'
import NewThirdStep from './newForm/ThirdStep.vue'

const wrappers: VueWrapper[] = []
const forms: Array<{
  name: string
  component: Component
  props: Record<string, string>
  visibilityProp: string
  updateEvent: string
}> = [
  {
    name: 'collect',
    component: CollectFirstStep,
    props: { collectName: '', collectUrl: '', collectDescription: '', collectVisibility: '公开的' },
    visibilityProp: 'collectVisibility',
    updateEvent: 'update:collect-visibility',
  },
  {
    name: 'connect',
    component: ConnectFirstStep,
    props: { appName: '', appUrl: '', appDescription: '', visibility: '公开的' },
    visibilityProp: 'visibility',
    updateEvent: 'update:visibility',
  },
  {
    name: 'new',
    component: NewThirdStep,
    props: { appName: '', appSubDomain: '', appDescription: '', visibility: '公开的' },
    visibilityProp: 'visibility',
    updateEvent: 'update:visibility',
  },
]
async function settle() {
  await nextTick()
  await flushPromises()
  await nextTick()
}
function keyboard(element: Element, key: string, type = 'keydown') {
  element.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true, cancelable: true }))
}
beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  )
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 0, 320, 32),
  )
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(320)
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(32)
  vi.spyOn(HTMLElement.prototype, 'offsetParent', 'get').mockReturnValue(document.body)
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([
    new DOMRect(0, 0, 320, 32),
  ] as unknown as DOMRectList)
})
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.replaceChildren()
})
describe.each(forms)(
  '$name visibility selector',
  ({ component, props, visibilityProp, updateEvent }) => {
    function render() {
      const wrapper = mount(component as Component, { props, attachTo: document.body })
      wrappers.push(wrapper)
      return wrapper
    }
    it('updates the existing parent contract, closes after selection, and renders the controlled value', async () => {
      const wrapper = render()
      const anchor = wrapper.get('button[aria-haspopup="dialog"]')
      expect(anchor.attributes('type')).toBe('button')
      await anchor.trigger('click')
      await settle()
      const list = document.querySelector('[role="listbox"][aria-label="选择选项"]')!
      const options = list.querySelectorAll<HTMLElement>('[role="option"]')
      expect(options).toHaveLength(2)
      expect(options[0].getAttribute('aria-selected')).toBe('true')
      expect(options[1].textContent).toContain('私有的')
      options[1].click()
      await settle()
      expect(wrapper.emitted(updateEvent)).toEqual([['私有的']])
      expect(document.querySelector('[role="dialog"]')).toBeNull()
      expect(document.activeElement).toBe(anchor.element)
      await wrapper.setProps({ [visibilityProp]: '私有的' })
      expect(anchor.text()).toBe('私有的')
      await anchor.trigger('click')
      await settle()
      const selectedOption = document.querySelectorAll<HTMLElement>('[role="option"]')[1]
      expect(selectedOption.getAttribute('aria-selected')).toBe('true')
      selectedOption.focus()
      keyboard(selectedOption, 'Escape')
      await settle()
      expect(document.querySelector('[role="dialog"]')).toBeNull()
      expect(wrapper.emitted(updateEvent)).toHaveLength(1)
    })
    it('opens and selects by keyboard and dismisses outside without changing the value', async () => {
      const wrapper = render()
      const anchor = wrapper.get('button[aria-haspopup="dialog"]')
      ;(anchor.element as HTMLElement).focus()
      keyboard(anchor.element, 'Enter')
      await settle()
      const options = document.querySelectorAll<HTMLElement>('[role="option"]')
      options[0].focus()
      keyboard(options[0], 'ArrowDown')
      expect(document.activeElement).toBe(options[1])
      keyboard(options[1], 'Enter', 'keypress')
      await settle()
      expect(wrapper.emitted(updateEvent)).toEqual([['私有的']])
      await anchor.trigger('click')
      await settle()
      document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await settle()
      expect(document.querySelector('[role="dialog"]')).toBeNull()
      expect(wrapper.emitted(updateEvent)).toHaveLength(1)
    })
  },
)
