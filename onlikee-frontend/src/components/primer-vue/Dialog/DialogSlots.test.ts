// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { computed, defineComponent, h, shallowRef } from 'vue'
import { Dialog } from './index'
import { FeatureFlagScope } from '../FeatureFlags/FeatureFlagScope'
import { featureFlagContextKey } from '../FeatureFlags/context'
import type { DialogButtonProps } from './types'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('Dialog subcomponents', () => {
  it.each(['Header', 'Body', 'Footer', 'Title', 'Subtitle'] as const)(
    'normalizes numeric native styles on %s like React',
    (name) => {
      const wrapper = mount(Dialog[name], {
        attrs: { style: { marginTop: 3, paddingLeft: 5, opacity: 0.5, '--offset': 2 } },
      })
      const element = wrapper.element as HTMLElement
      expect(element.style.marginTop).toBe('3px')
      expect(element.style.paddingLeft).toBe('5px')
      expect(element.style.opacity).toBe('0.5')
      expect(element.style.getPropertyValue('--offset')).toBe('2')
      wrapper.unmount()
    },
  )

  it.each([false, true])(
    'tracks a changed autofocus ref with merged refs = %s',
    async (enabled) => {
      const firstRef = shallowRef<HTMLButtonElement | null>(null)
      const nextRef = shallowRef<HTMLButtonElement | null>(null)
      const flags = FeatureFlagScope.create({ primer_react_merged_forwarded_refs: enabled })
      const buttons = shallowRef<DialogButtonProps[]>([
        { content: 'Action', autoFocus: true, ref: firstRef },
      ])
      const host = defineComponent({
        setup: () => () => h(Dialog.Buttons, { buttons: buttons.value }),
      })
      const wrapper = mount(host, {
        global: { provide: { [featureFlagContextKey as symbol]: computed(() => flags) } },
        attachTo: document.body,
      })
      await flushPromises()
      const outside = document.createElement('button')
      document.body.append(outside)
      outside.focus()
      buttons.value = [{ content: 'Action', autoFocus: true, ref: nextRef }]
      await flushPromises()
      expect(firstRef.value).toBeNull()
      expect(nextRef.value).toBe(wrapper.find('button').element)
      expect(document.activeElement).toBe(enabled ? outside : nextRef.value)
      wrapper.unmount()
      outside.remove()
    },
  )
  it('keeps the source div root, forwards as and native attributes, and exposes the element', () => {
    const wrapper = mount(Dialog.Body<'section'>, {
      props: { as: 'section', className: 'source-class' },
      attrs: { class: 'vue-class', id: 'body', 'data-component': 'ignored' },
      slots: { default: 'Content' },
    })
    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('as')).toBe('section')
    expect(wrapper.attributes('data-component')).toBe('Dialog.Body')
    expect(wrapper.attributes('id')).toBe('body')
    expect(wrapper.classes()).toContain('source-class')
    expect(wrapper.classes()).toContain('vue-class')
    expect(wrapper.vm.element).toBe(wrapper.element)
    wrapper.unmount()
  })

  it('keeps heading tags fixed and shares distinct structural slot markers', () => {
    const title = mount(Dialog.Title, { slots: { default: 'Title' } })
    const subtitle = mount(Dialog.Subtitle, { slots: { default: 'Subtitle' } })
    expect(title.element.tagName).toBe('H1')
    expect(subtitle.element.tagName).toBe('H2')
    const markers = [Dialog.Header, Dialog.Body, Dialog.Footer].map((section) => section.__SLOT__)
    expect(markers.every((marker) => typeof marker === 'symbol')).toBe(true)
    expect(new Set(markers).size).toBe(3)
    title.unmount()
    subtitle.unmount()
  })

  it('focuses only the first autoFocus action and clears its forwarded ref on unmount', async () => {
    const firstRef = shallowRef<HTMLButtonElement | null>(null)
    const secondRef = shallowRef<HTMLButtonElement | null>(null)
    const wrapper = mount(Dialog.Buttons, {
      props: {
        buttons: [
          { content: 'First', buttonType: 'normal', autoFocus: true, ref: firstRef },
          { content: 'Second', buttonType: 'danger', autoFocus: true, ref: secondRef },
        ],
      },
      attachTo: document.body,
    })
    await flushPromises()
    const buttons = wrapper.findAll('button')
    expect(firstRef.value).toBe(buttons[0]!.element)
    expect(secondRef.value).toBeNull()
    expect(document.activeElement).toBe(buttons[0]!.element)
    expect(buttons[0]!.attributes('data-variant')).toBe('default')
    expect(buttons[1]!.attributes('data-variant')).toBe('danger')
    wrapper.unmount()
    expect(firstRef.value).toBeNull()
  })
})
