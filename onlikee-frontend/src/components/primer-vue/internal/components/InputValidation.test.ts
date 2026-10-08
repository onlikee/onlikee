// @vitest-environment jsdom
import { afterEach, describe, expect, test } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import InputValidation from './InputValidation.vue'

const wrappers: VueWrapper[] = []
afterEach(() => {
  for (const wrapper of wrappers.splice(0)) wrapper.unmount()
})
function validation(props: Record<string, unknown>) {
  const wrapper = mount(InputValidation, { props: { id: 'message', ...props } })
  wrappers.push(wrapper)
  return wrapper
}

describe('InputValidation behavior', () => {
  test.each([
    [
      'error',
      'octicon-alert-fill',
      'M4.855.708c.5-.896 1.79-.896 2.29 0l4.675 8.351a1.312 1.312 0 0 1-1.146 1.954H1.33A1.313 1.313 0 0 1 .183 9.058ZM7 7V3H5v4Zm-1 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
    ],
    [
      'success',
      'octicon-check-circle-fill',
      'M6 0a6 6 0 1 1 0 12A6 6 0 0 1 6 0Zm-.705 8.737L9.63 4.403 8.392 3.166 5.295 6.263l-1.7-1.702L2.356 5.8l2.938 2.938Z',
    ],
  ] as const)('renders the native 12px %s octicon', (status, iconClass, path) => {
    const wrapper = validation({ validationStatus: status })
    const svg = wrapper.get('svg')
    expect(svg.attributes('viewBox')).toBe('0 0 12 12')
    expect(svg.attributes('class')).toBe(`octicon ${iconClass}`)
    expect(svg.attributes('data-component')).toBe('Octicon')
    expect(svg.attributes('width')).toBe('12')
    expect(svg.attributes('height')).toBe('12')
    expect(svg.attributes('fill')).toBe('currentColor')
    expect(svg.attributes('aria-hidden')).toBe('true')
    expect(svg.attributes('focusable')).toBe('false')
    expect(svg.attributes('display')).toBe('inline-block')
    expect(svg.attributes('overflow')).toBe('visible')
    expect(svg.attributes('style')).toContain('vertical-align: text-bottom')
    expect(svg.get('path').attributes('d')).toBe(path)
  })

  test('keeps the unitless source custom properties that drive icon and text metrics', () => {
    const wrapper = validation({ validationStatus: 'error' })
    const icon = wrapper.get('[class*="input-validation__icon_"]')
    expect(icon.attributes('style')).toContain('--inputValidation-iconSize: 16')
    expect(icon.attributes('style')).not.toContain('16px')
    expect(icon.attributes('aria-hidden')).toBe('true')
    const text = wrapper.get('[class*="input-validation__text_"]')
    expect(text.attributes('id')).toBe('message')
    expect(text.attributes('style')).toContain('--inputValidation-lineHeight: 1.3333333333333333')
  })

  test('omits the icon and status attribute without a validation status', () => {
    const wrapper = validation({})
    expect(wrapper.find('svg').exists()).toBe(false)
    expect(wrapper.find('[class*="input-validation__icon_"]').exists()).toBe(false)
    expect(wrapper.attributes('data-validation-status')).toBeUndefined()
    expect(wrapper.find('[class*="input-validation__text_"]').exists()).toBe(true)
  })

  test('forwards id fallback and extra attributes from consumers', () => {
    const wrapper = mount(InputValidation, {
      props: { id: '', validationStatus: 'success', className: 'extra' },
      attrs: { 'data-component': 'FormControl.Validation' },
    })
    wrappers.push(wrapper)
    expect(wrapper.attributes('data-component')).toBe('FormControl.Validation')
    expect(wrapper.classes()).toContain('extra')
    expect(wrapper.get('[class*="input-validation__text_"]').attributes('id')).toBe('')
  })
})
