// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import {
  defineComponent,
  h,
  nextTick,
  shallowRef,
  type Component,
  type MaybeRefOrGetter,
} from 'vue'
import { Details, Summary, useDetails, type UseDetailsParameters } from '../Details'
import { Button } from '../Button'

const wrappers: VueWrapper[] = []
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
})

// Native toggle is a queued browser task, separate from Vue's render queue.
async function settle() {
  await new Promise((resolve) => setTimeout(resolve, 0))
  await nextTick()
}

function render(
  options: MaybeRefOrGetter<UseDetailsParameters> = {},
  summary: 'native' | 'button' = 'native',
  root: 'native' | 'component' = 'component',
) {
  let controls!: ReturnType<typeof useDetails>
  const wrapper = mount(
    defineComponent({
      setup() {
        controls = useDetails(options)
        return () => {
          const content = () => [
            summary === 'native'
              ? h('summary', controls.open.value ? 'Open' : 'Closed')
              : h(Summary as Component, { as: Button }, () =>
                  controls.open.value ? 'Open' : 'Closed',
                ),
            h('p', { id: 'content' }, 'Disclosure content'),
            h(Button, { onClick: () => controls.setOpen(false) }, () => 'Close'),
            h(Button, null, () => 'Inside'),
          ]
          return root === 'native'
            ? h('details', controls.getDetailsProps(), content())
            : h(Details, controls.getDetailsProps(), { default: content })
        }
      },
    }),
    { attachTo: document.body },
  )
  wrappers.push(wrapper)
  return { wrapper, controls, element: wrapper.get('details').element as HTMLDetailsElement }
}

describe('useDetails source behavior and compositions', () => {
  it('starts closed with the source undefined state and supports functional updates', async () => {
    const { wrapper, controls, element } = render()
    expect(controls.open.value).toBeUndefined()
    expect(element.open).toBe(false)
    expect(wrapper.get('summary').text()).toBe('Closed')
    controls.setOpen((previous) => !previous)
    await settle()
    expect(element.open).toBe(true)
    expect(wrapper.get('summary').text()).toBe('Open')
    controls.setOpen((previous) => !previous)
    await settle()
    expect(element.open).toBe(false)
  })

  it.each(['native', 'button'] as const)(
    'synchronizes native toggle and state with a %s summary',
    async (summary) => {
      const { wrapper, controls, element } = render({}, summary)
      ;(wrapper.get('summary').element as HTMLElement).click()
      await settle()
      expect(element.open).toBe(true)
      expect(controls.open.value).toBe(true)
      expect(wrapper.get('summary').text()).toBe('Open')
      ;(wrapper.get('summary').element as HTMLElement).click()
      await settle()
      expect(element.open).toBe(false)
      expect(controls.open.value).toBe(false)
    },
  )

  it('allows a composed Button to close the disclosure and preserves ordinary inside clicks', async () => {
    const outside = vi.fn()
    const { wrapper, controls, element } = render({
      defaultOpen: true,
      closeOnOutsideClick: true,
      onClickOutside: outside,
    })
    expect(element.open).toBe(true)
    await wrapper.get('#content').trigger('click')
    await wrapper.findAll('button')[1]!.trigger('click')
    expect(controls.open.value).toBe(true)
    expect(outside).not.toHaveBeenCalled()
    await wrapper.findAll('button')[0]!.trigger('click')
    await settle()
    expect(element.open).toBe(false)
    expect(wrapper.get('summary').text()).toBe('Closed')
  })

  it('closes on document click, not on mousedown, and stops listening while closed', async () => {
    const outside = vi.fn()
    const { controls, element } = render({
      defaultOpen: true,
      closeOnOutsideClick: true,
      onClickOutside: outside,
    })
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await settle()
    expect(controls.open.value).toBe(true)
    document.body.click()
    await settle()
    expect(element.open).toBe(false)
    expect(outside).toHaveBeenCalledOnce()
    expect(outside.mock.calls[0]![0]).toBeInstanceOf(MouseEvent)
    document.body.click()
    expect(outside).toHaveBeenCalledOnce()
  })

  it('allows the outside callback to cancel closing', async () => {
    const outside = vi.fn((event: MouseEvent) => event.preventDefault())
    const { controls, element } = render({
      defaultOpen: true,
      closeOnOutsideClick: true,
      onClickOutside: outside,
    })
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    await settle()
    expect(outside).toHaveBeenCalledOnce()
    expect(controls.open.value).toBe(true)
    expect(element.open).toBe(true)
  })

  it('honors already-prevented outside events while still notifying the callback', async () => {
    const outside = vi.fn()
    const { controls } = render({
      defaultOpen: true,
      closeOnOutsideClick: true,
      onClickOutside: outside,
    })
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    event.preventDefault()
    document.body.dispatchEvent(event)
    expect(outside).toHaveBeenCalledOnce()
    expect(controls.open.value).toBe(true)
  })

  it('ignores a prevented toggle event', async () => {
    const { controls, element } = render({ defaultOpen: true })
    await settle()
    const event = new Event('toggle', { cancelable: true })
    event.preventDefault()
    Object.defineProperty(event, 'target', { value: { open: false } })
    controls.getDetailsProps().onToggle(event)
    expect(controls.open.value).toBe(true)
    expect(element.open).toBe(true)
  })

  it('reacts to option changes, uses the latest callback, and treats defaultOpen as initial state', async () => {
    const first = vi.fn()
    const second = vi.fn()
    const options = shallowRef({
      defaultOpen: true,
      closeOnOutsideClick: false,
      onClickOutside: first,
    })
    const { controls } = render(() => options.value)
    document.body.click()
    expect(first).not.toHaveBeenCalled()
    options.value = { defaultOpen: false, closeOnOutsideClick: true, onClickOutside: second }
    await settle()
    expect(controls.open.value).toBe(true)
    document.body.click()
    await settle()
    expect(controls.open.value).toBe(false)
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledOnce()
    controls.setOpen(true)
    await settle()
    options.value = { ...options.value, closeOnOutsideClick: false }
    await settle()
    document.body.click()
    expect(controls.open.value).toBe(true)
    expect(second).toHaveBeenCalledOnce()
  })

  it.each(['native', 'component'] as const)(
    'sets and clears a consumer DOM ref for a %s root and removes listeners on unmount',
    async (root) => {
      const ref = shallowRef<HTMLDetailsElement | null>(null)
      const outside = vi.fn()
      const { wrapper, element } = render(
        { ref, defaultOpen: true, closeOnOutsideClick: true, onClickOutside: outside },
        'native',
        root,
      )
      expect(ref.value).toBe(element)
      await settle()
      wrapper.unmount()
      wrappers.splice(wrappers.indexOf(wrapper), 1)
      expect(ref.value).toBeNull()
      document.body.click()
      expect(outside).not.toHaveBeenCalled()
    },
  )

  it('closes a sibling disclosure but preserves the clicked disclosure', async () => {
    const first = render({ defaultOpen: true, closeOnOutsideClick: true })
    const second = render({ defaultOpen: true, closeOnOutsideClick: true })
    await second.wrapper.get('#content').trigger('click')
    await settle()
    expect(first.element.open).toBe(false)
    expect(second.element.open).toBe(true)
  })

  it('moves the DOM reference when the consumer replaces the supplied ref', async () => {
    const first = shallowRef<HTMLDetailsElement | null>(null)
    const second = shallowRef<HTMLDetailsElement | null>(null)
    const options = shallowRef({ ref: first, defaultOpen: true, closeOnOutsideClick: true })
    const { wrapper, element, controls } = render(options)
    expect(first.value).toBe(element)
    options.value = { ...options.value, ref: second }
    await settle()
    expect(first.value).toBeNull()
    expect(second.value).toBe(element)
    await wrapper.get('#content').trigger('click')
    expect(controls.open.value).toBe(true)
    document.body.click()
    await settle()
    expect(element.open).toBe(false)
  })

  it('preserves native click cancellation across composed sibling summaries', async () => {
    const first = render({
      defaultOpen: true,
      closeOnOutsideClick: true,
      onClickOutside: (event) => event.preventDefault(),
    })
    const second = render({}, 'button')
    ;(second.wrapper.get('summary').element as HTMLElement).click()
    await settle()
    expect(first.element.open).toBe(true)
    expect(second.element.open).toBe(false)
    expect(second.controls.open.value).toBeUndefined()
  })

  it('preserves the source closest-details rule for nested disclosures', async () => {
    const outer = render({ defaultOpen: true, closeOnOutsideClick: true })
    const nested = document.createElement('details')
    const content = document.createElement('span')
    nested.append(content)
    outer.element.append(nested)
    content.click()
    await settle()
    expect(outer.controls.open.value).toBe(false)
    expect(outer.element.open).toBe(false)
  })
})
