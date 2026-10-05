// @vitest-environment jsdom
import { expect, test } from 'vitest'
import { mount } from '@vue/test-utils'
import ValidationAnimationContainer from './ValidationAnimationContainer.vue'

test('starts rendering with show and collapses before an animation ends', async () => {
  const wrapper = mount(ValidationAnimationContainer, { props: { show: false }, slots: { default: 'Invalid' } })
  expect(wrapper.text()).toBe('')
  await wrapper.setProps({ show: true })
  expect(wrapper.text()).toBe('Invalid')
  expect(wrapper.get('.validation-animation').attributes('data-show')).toBe('')
  expect(wrapper.element.getAttribute('style')).toContain('height: auto')
  await wrapper.setProps({ show: false })
  expect(wrapper.text()).toBe('Invalid')
  expect(wrapper.element.getAttribute('style')).toContain('height: 0px')
  await wrapper.get('.validation-animation').trigger('animationend')
  expect(wrapper.text()).toBe('')
  await wrapper.setProps({ show: true })
  expect(wrapper.text()).toBe('Invalid')
  wrapper.unmount()
})

test('preserves supplied root attributes and style alongside source layout constraints', () => {
  const wrapper = mount(ValidationAnimationContainer, { props: { show: true }, attrs: { class: 'custom', style: { color: 'red', height: '50px' }, 'data-test': 'validation' }, slots: { default: 'Invalid' } })
  expect(wrapper.classes()).toContain('custom')
  expect(wrapper.attributes('data-test')).toBe('validation')
  expect(wrapper.element.getAttribute('style')).toContain('color: red')
  expect(wrapper.element.getAttribute('style')).toContain('height: auto')
  wrapper.unmount()
})
