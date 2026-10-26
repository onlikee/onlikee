// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, h, nextTick, shallowRef } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { LiveRegionElement } from '@primer/live-region-element'
import ToggleSwitchDefault, { ToggleSwitch, type ToggleSwitchProps } from './index'
import { Text } from '../Text'
import { SelectPanel } from '../SelectPanel'

const wrappers: VueWrapper[] = []
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
  vi.useRealTimers()
})
function render(props: Partial<ToggleSwitchProps> = {}, attrs = {}) {
  const wrapper = mount(ToggleSwitch, {
    props: { 'aria-labelledby': 'label', ...props },
    attrs,
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  return wrapper
}

it('exports the component and forwards its ref to the inner button', () => {
  expect(ToggleSwitchDefault).toBe(ToggleSwitch)
  const wrapper = render()
  const instance = wrapper.vm
  expect(instance.element).toBe(wrapper.get('button').element)
  expect(instance.element).toBeInstanceOf(HTMLButtonElement)
  instance.element!.focus()
  expect(document.activeElement).toBe(instance.element)
  wrapper.unmount()
  wrappers.pop()
  expect(instance.element).toBeNull()
})

it.each([false, true])(
  'initializes uncontrolled state to %s and toggles from either target',
  async (checked) => {
    const order: string[] = []
    const click = vi.fn((event: MouseEvent) => {
      order.push('click')
      expect(event.currentTarget).toBe(event.target)
    })
    const change = vi.fn(() => order.push('change'))
    const wrapper = render({ defaultChecked: checked, onChange: change, onClick: click })
    const button = wrapper.get('button')
    expect(button.attributes('aria-pressed')).toBe(String(checked))
    expect(change).not.toHaveBeenCalled()
    await button.trigger('click')
    expect(button.attributes('aria-pressed')).toBe(String(!checked))
    expect(change).toHaveBeenLastCalledWith(!checked)
    await wrapper.get('span[aria-hidden="true"]').trigger('click')
    expect(button.attributes('aria-pressed')).toBe(String(checked))
    expect(change).toHaveBeenLastCalledWith(checked)
    expect(click).toHaveBeenCalledTimes(2)
    expect(order).toEqual(['change', 'click', 'change', 'click'])
    await wrapper.setProps({ defaultChecked: !checked })
    expect(button.attributes('aria-pressed')).toBe(String(checked))
  },
)

it('notifies controlled changes only for user interactions and keeps the supplied state', async () => {
  const first = vi.fn()
  const second = vi.fn()
  const wrapper = render({ checked: false, defaultChecked: true, onChange: first })
  const button = wrapper.get('button')
  expect(first).not.toHaveBeenCalled()
  await button.trigger('click')
  expect(first).toHaveBeenCalledExactlyOnceWith(true)
  expect(button.attributes('aria-pressed')).toBe('false')
  await wrapper.setProps({ checked: true, onChange: second, disabled: true })
  expect(button.attributes('aria-pressed')).toBe('true')
  expect(second).not.toHaveBeenCalled()
  await wrapper.setProps({ disabled: false, onChange: (checked) => second(checked) })
  expect(second).not.toHaveBeenCalled()
  await button.trigger('click')
  expect(second).toHaveBeenCalledExactlyOnceWith(false)
  expect(button.attributes('aria-pressed')).toBe('true')
  await wrapper.setProps({ checked: undefined })
  expect(button.attributes('aria-pressed')).toBe('true')
})

it.each([{ disabled: true }, { loading: true }])(
  'keeps %j focusable while suppressing callbacks',
  async (state) => {
    const change = vi.fn()
    const click = vi.fn()
    const wrapper = render({ ...state, onChange: change, onClick: click })
    const button = wrapper.get('button')
    expect(button.attributes('aria-disabled')).toBe('true')
    expect(button.attributes('disabled')).toBeUndefined()
    ;(button.element as HTMLButtonElement).focus()
    expect(document.activeElement).toBe(button.element)
    await button.trigger('click')
    await wrapper.get('span[aria-hidden="true"]').trigger('click')
    expect(change).not.toHaveBeenCalled()
    expect(click).not.toHaveBeenCalled()
    expect(button.attributes('aria-pressed')).toBe('false')
    expect(wrapper.find('[data-component="Spinner"]').exists()).toBe(!!state.loading)
  },
)

it('forwards native attributes to the wrapper and consumes the button labeling and callbacks', async () => {
  const keydown = vi.fn()
  const change = vi.fn()
  const wrapper = render(
    { className: 'source', 'aria-describedby': 'caption', onChange: change },
    {
      id: 'switch',
      class: 'custom',
      style: { marginTop: 4 },
      'data-status-label-position': 'end',
      onKeydown: keydown,
    },
  )
  expect(wrapper.attributes('id')).toBe('switch')
  expect(wrapper.classes()).toEqual(expect.arrayContaining(['source', 'custom']))
  expect((wrapper.element as HTMLElement).style.marginTop).toBe('4px')
  expect(wrapper.attributes('data-status-label-position')).toBe('end')
  expect(wrapper.attributes('aria-labelledby')).toBeUndefined()
  expect(wrapper.attributes('aria-describedby')).toBeUndefined()
  const button = wrapper.get('button')
  expect(button.attributes('id')).toBeUndefined()
  expect(button.attributes('aria-labelledby')).toBe('label')
  expect(button.attributes('aria-describedby')).toBe('loadingLabel caption')
  await button.trigger('keydown', { key: 'Enter' })
  expect(keydown).toHaveBeenCalledOnce()
  await wrapper.trigger('click')
  expect(change).not.toHaveBeenCalled()
})

it.each(['small', 'medium'] as const)(
  'renders %s size, both source icons and custom status labels',
  (size) => {
    const wrapper = render({
      size,
      buttonLabelOn: '',
      buttonLabelOff: 'Hidden',
      statusLabelPosition: 'end',
    })
    expect(wrapper.attributes('data-status-label-position')).toBe('end')
    expect(wrapper.get('button').attributes('data-size')).toBe(size)
    const labels = wrapper.findAll('[data-hidden]')
    expect(labels[0]!.text()).toBe('')
    expect(labels[0]!.attributes('data-hidden')).toBe('true')
    expect(labels[1]!.text()).toBe('Hidden')
    expect(labels[1]!.attributes('data-hidden')).toBe('false')
    expect(wrapper.findAll('button svg').map((icon) => icon.attributes('width'))).toEqual(
      size === 'small' ? ['12', '12'] : ['16', '16'],
    )
  },
)

it('delays the loading announcement, joins descriptions and clears the visible label on completion', async () => {
  vi.useFakeTimers()
  const region = new LiveRegionElement()
  region.delay = 0
  document.body.append(region)
  const wrapper = render({
    loading: true,
    loadingLabel: 'Saving notifications',
    'aria-describedby': 'caption',
  })
  expect(wrapper.get('#loadingLabel').text()).toBe('')
  expect(wrapper.get('button').attributes('aria-describedby')).toBe('loadingLabel caption')
  expect(wrapper.get('[data-component="Spinner"]').find('span').exists()).toBe(false)
  await vi.advanceTimersByTimeAsync(1999)
  expect(wrapper.get('#loadingLabel').text()).toBe('')
  await vi.advanceTimersByTimeAsync(1)
  await flushPromises()
  expect(wrapper.get('#loadingLabel').text()).toBe('Saving notifications')
  expect(region.getMessage('polite')).toBe('Saving notifications')
  await wrapper.setProps({ loadingLabel: 'Still saving' })
  await flushPromises()
  expect(region.getMessage('polite')).toBe('Still saving')
  await wrapper.setProps({ loading: false, 'aria-describedby': undefined })
  await nextTick()
  expect(wrapper.get('#loadingLabel').text()).toBe('')
  expect(wrapper.get('button').attributes('aria-describedby')).toBeUndefined()
  expect(wrapper.find('[data-component="Spinner"]').exists()).toBe(false)
  region.clear()
  region.remove()
})

it('supports an immediate loading label and clears every pending timeout on unmount', async () => {
  vi.useFakeTimers()
  const wrapper = render({ loading: true, loadingLabelDelay: 0 })
  await vi.advanceTimersByTimeAsync(0)
  expect(wrapper.get('#loadingLabel').text()).toBe('Loading')
  expect(wrapper.get('button').attributes('aria-describedby')).toBe('loadingLabel')
  const clear = vi.spyOn(globalThis, 'clearTimeout')
  wrapper.unmount()
  wrappers.pop()
  expect(clear).toHaveBeenCalled()
  const pending = render({ loading: true })
  await pending.setProps({ loadingLabelDelay: 1000 })
  const before = clear.mock.calls.length
  pending.unmount()
  wrappers.pop()
  expect(clear.mock.calls.length - before).toBe(2)
})

it.each(['button', 'submit', 'reset'] as const)(
  'preserves native %s behavior in a form',
  async (buttonType) => {
    const submit = vi.fn((event: Event) => event.preventDefault())
    const reset = vi.fn()
    const wrapper = mount(
      () =>
        h('form', { onSubmit: submit, onReset: reset }, [
          h('input', { name: 'setting', value: 'initial' }),
          h(ToggleSwitch, { 'aria-labelledby': 'label', buttonType }),
        ]),
      { attachTo: document.body },
    )
    wrappers.push(wrapper)
    const button = wrapper.get('button').element as HTMLButtonElement
    expect(button.type).toBe(buttonType)
    button.click()
    await nextTick()
    expect(submit).toHaveBeenCalledTimes(buttonType === 'submit' ? 1 : 0)
    expect(reset).toHaveBeenCalledTimes(buttonType === 'reset' ? 1 : 0)
    expect(button.getAttribute('aria-pressed')).toBe('true')
    expect([...new FormData(wrapper.element as HTMLFormElement).keys()]).toEqual(['setting'])
  },
)

it('composes Text labels and drives the existing SelectPanel message from controlled changes', async () => {
  const error = shallowRef(false)
  const wrapper = mount(() =>
    h('div', [
      h(Text, { id: 'panel-label' }, () => 'Enable error state'),
      h(ToggleSwitch, {
        'aria-labelledby': 'panel-label',
        checked: error.value,
        onChange: (checked) => (error.value = checked),
      }),
      h(SelectPanel, {
        open: false,
        selected: [],
        items: [],
        message: {
          title: error.value ? 'Unable to load' : 'No projects',
          variant: error.value ? 'error' : 'empty',
        },
      }),
    ]),
  )
  wrappers.push(wrapper)
  expect(wrapper.findComponent(SelectPanel).props('message')?.variant).toBe('empty')
  await wrapper.findComponent(ToggleSwitch).get('button').trigger('click')
  expect(wrapper.findComponent(SelectPanel).props('message')?.variant).toBe('error')
  expect(wrapper.get('button[aria-labelledby="panel-label"]').attributes('aria-pressed')).toBe(
    'true',
  )
  expect(wrapper.get('#panel-label').text()).toBe('Enable error state')
})

it('hydrates the server button, labeling and state without firing change callbacks', async () => {
  const change = vi.fn()
  const content = () =>
    h('div', [
      h(Text, { id: 'label' }, () => 'Notifications'),
      h(ToggleSwitch, { 'aria-labelledby': 'label', defaultChecked: true, onChange: change }),
    ])
  const container = document.createElement('div')
  container.innerHTML = await renderToString(createSSRApp(content))
  document.body.append(container)
  const serverButton = container.querySelector('button')!
  const warn = vi.spyOn(console, 'warn')
  const error = vi.spyOn(console, 'error')
  const app = createSSRApp(content)
  try {
    app.mount(container)
    await flushPromises()
    expect(container.querySelector('button')).toBe(serverButton)
    expect(serverButton.getAttribute('aria-pressed')).toBe('true')
    expect(change).not.toHaveBeenCalled()
    serverButton.click()
    await nextTick()
    expect(change).toHaveBeenCalledExactlyOnceWith(false)
    expect(serverButton.getAttribute('aria-pressed')).toBe('false')
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
  } finally {
    app.unmount()
    container.remove()
  }
})
