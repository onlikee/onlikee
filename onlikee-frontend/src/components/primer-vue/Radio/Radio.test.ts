// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file -- Fixtures verify native forms and SSR hydration. */
import { mount, type VueWrapper } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { createSSRApp, defineComponent, h, nextTick, shallowRef } from 'vue'
import Radio, { type RadioInstance, type RadioProps } from './index'
import { RadioGroup } from '../RadioGroup'

const wrappers: VueWrapper[] = []
function track<T extends VueWrapper>(wrapper: T): T {
  wrappers.push(wrapper)
  return wrapper
}
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('Radio source contract', () => {
  it('renders a native unchecked input with shared classes, native attrs and public types', () => {
    expectTypeOf<RadioProps>().toExtend<{ value: string }>()
    expectTypeOf<RadioProps>().not.toHaveProperty('unexpected')
    const wrapper = track(
      mount(Radio, {
        props: { value: 'one', name: 'choices', className: 'source' },
        attrs: {
          class: 'custom',
          id: 'one',
          'aria-label': 'One',
          'data-component': 'CustomRadio',
          style: { marginLeft: 2 },
        },
      }),
    )
    expect(wrapper.element.tagName).toBe('INPUT')
    expect(wrapper.element.checked).toBe(false)
    expect(wrapper.attributes()).toMatchObject({
      type: 'radio',
      value: 'one',
      name: 'choices',
      id: 'one',
      'aria-label': 'One',
      'aria-checked': 'false',
      'data-component': 'Radio',
    })
    expect(wrapper.classes()).toEqual([
      'source',
      'custom',
      expect.stringContaining('Input'),
      expect.stringContaining('Radio'),
    ])
    expect(wrapper.element.style.marginLeft).toBe('2px')
  })

  it('warns for a missing name and consumes aria-hidden for the source warning check', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const unnamed = track(mount(Radio, { props: { value: 'one' } }))
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('must have a `name` attribute'))
    warn.mockClear()
    await unnamed.setProps({ name: 'choices' })
    expect(warn).not.toHaveBeenCalled()
    const hidden = track(mount(Radio, { props: { value: 'one' }, attrs: { 'aria-hidden': true } }))
    expect(warn).not.toHaveBeenCalled()
    expect(hidden.attributes('aria-hidden')).toBeUndefined()
    expect(hidden.attributes('ariaHidden')).toBeUndefined()
  })

  it('keeps defaultChecked independent from aria-checked and resets native form selection', async () => {
    const wrapper = track(
      mount(
        defineComponent({
          render: () =>
            h('form', [
              h(Radio, { value: 'one', name: 'choice', defaultChecked: true }),
              h(Radio, { value: 'two', name: 'choice' }),
            ]),
        }),
        { attachTo: document.body },
      ),
    )
    const [one, two] = wrapper.findAll<HTMLInputElement>('input')
    const form = wrapper.get<HTMLFormElement>('form').element
    expect(one!.element.checked).toBe(true)
    expect(one!.attributes('aria-checked')).toBe('false')
    expect(new FormData(form).get('choice')).toBe('one')
    two!.element.click()
    await nextTick()
    expect(one!.element.checked).toBe(false)
    expect(two!.element.checked).toBe(true)
    expect(new FormData(form).get('choice')).toBe('two')
    form.reset()
    expect(one!.element.checked).toBe(true)
    expect(two!.element.checked).toBe(false)
  })

  it('restores controlled siblings while leaving another form with the same name alone', async () => {
    const change = vi.fn()
    const wrapper = track(
      mount(
        defineComponent({
          render: () =>
            h('section', [
              h('form', [
                h(Radio, { value: 'one', name: 'same', checked: true }),
                h(Radio, { value: 'two', name: 'same', checked: false, onChange: change }),
              ]),
              h('form', [h(Radio, { value: 'other', name: 'same', defaultChecked: true })]),
            ]),
        }),
        { attachTo: document.body },
      ),
    )
    const inputs = wrapper.findAll<HTMLInputElement>('input')
    inputs[1]!.element.click()
    await nextTick()
    expect(change).toHaveBeenCalledOnce()
    expect(inputs.map((input) => input.element.checked)).toEqual([true, false, true])
  })

  it('accepts checked updates and explicit ARIA overrides without duplicating change events', async () => {
    const checked = shallowRef(false)
    const change = vi.fn()
    const wrapper = track(
      mount(
        defineComponent({
          setup: () => () =>
            h(Radio, {
              value: 'one',
              name: 'checked',
              checked: checked.value,
              onChange: change,
              'onUpdate:checked': (value) => {
                checked.value = value
              },
            }),
        }),
        { attachTo: document.body },
      ),
    )
    wrapper.get<HTMLInputElement>('input').element.click()
    await nextTick()
    expect(checked.value).toBe(true)
    expect(wrapper.get('input').attributes('aria-checked')).toBe('true')
    expect(change).toHaveBeenCalledOnce()
    const overridden = track(
      mount(Radio, {
        props: { value: 'one', name: 'override', checked: true },
        attrs: { 'aria-checked': 'mixed' },
      }),
    )
    expect(overridden.attributes('aria-checked')).toBe('mixed')
  })

  it('inherits and updates group names while preferring a nonempty per-input name', async () => {
    const wrapper = track(
      mount(RadioGroup, {
        props: { name: 'original', 'aria-labelledby': 'external' },
        slots: {
          default: () => [
            h(Radio, { value: 'one', name: '' }),
            h(Radio, { value: 'two', name: 'local' }),
          ],
        },
      }),
    )
    expect(wrapper.findAll<HTMLInputElement>('input').map((input) => input.element.name)).toEqual([
      'original',
      'local',
    ])
    await wrapper.setProps({ name: 'updated' })
    expect(wrapper.findAll<HTMLInputElement>('input').map((input) => input.element.name)).toEqual([
      'updated',
      'local',
    ])
  })

  it('forwards native disabled and required state and exposes and clears its DOM ref', async () => {
    const change = vi.fn()
    const wrapper = track(
      mount(Radio, {
        props: { name: 'native', value: 'one', disabled: true, required: true, onChange: change },
        attachTo: document.body,
      }),
    )
    const input = wrapper.element
    expect(input.required).toBe(true)
    input.click()
    await nextTick()
    expect(change).not.toHaveBeenCalled()
    await wrapper.setProps({ disabled: false })
    const instance = wrapper.vm as unknown as RadioInstance
    expect(instance.input).toBe(input)
    expect(instance.element).toBe(input)
    instance.focus()
    expect(document.activeElement).toBe(input)
    instance.blur()
    expect(document.activeElement).not.toBe(input)
    wrapper.unmount()
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    expect(instance.element).toBeNull()
  })

  it('hydrates default and controlled selection with no checked mismatch', async () => {
    for (const props of [
      { defaultChecked: true },
      { checked: true },
      { checked: false, defaultChecked: true },
    ]) {
      const App = defineComponent({
        render: () => h(Radio, { name: 'ssr', value: 'one', ...props }),
      })
      const host = document.createElement('div')
      host.innerHTML = await renderToString(createSSRApp(App))
      const input = host.querySelector('input')!
      expect(input.checked).toBe(props.checked ?? props.defaultChecked)
      const warn = vi.spyOn(console, 'warn')
      const error = vi.spyOn(console, 'error')
      const app = createSSRApp(App)
      app.mount(host)
      expect(host.querySelector('input')).toBe(input)
      expect(input.checked).toBe(props.checked ?? props.defaultChecked)
      expect(warn).not.toHaveBeenCalled()
      expect(error).not.toHaveBeenCalled()
      app.unmount()
    }
  })
})
