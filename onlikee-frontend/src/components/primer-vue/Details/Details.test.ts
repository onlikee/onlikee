// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { h, type Component } from 'vue'
import { Details, Summary, type DetailsInstance } from './index'
import { Button } from '../Button'

const wrappers: VueWrapper[] = []
afterEach(() => wrappers.splice(0).forEach((wrapper) => wrapper.unmount()))
describe('Details', () => {
  it('supports native and component summaries with source markers and classes', () => {
    const wrapper = mount(Details, {
      slots: {
        default: () =>
          h(
            Summary as Component,
            { as: Button, className: 'summary-class', 'data-component': 'Override' },
            () => 'Summary',
          ),
      },
    })
    wrappers.push(wrapper)
    expect(wrapper.get('summary').classes()).toContain('summary-class')
    expect(wrapper.get('summary').attributes('data-component')).toBe('Details.Summary')
    expect(wrapper.get('summary').text()).toBe('Summary')
  })
  it('renders the native disclosure, forwards attributes and exposes its DOM ref', async () => {
    const wrapper = mount(Details, {
      props: { className: 'custom' },
      attrs: { open: true, id: 'details', 'data-component': 'Custom' },
      slots: { default: () => [h(Summary as Component, null, () => 'Summary'), h('p', 'Content')] },
    })
    wrappers.push(wrapper)
    expect(wrapper.element.tagName).toBe('DETAILS')
    expect(wrapper.attributes('data-component')).toBe('Custom')
    expect(wrapper.attributes('id')).toBe('details')
    expect(wrapper.classes()).toContain('custom')
    expect((wrapper.element as HTMLDetailsElement).open).toBe(true)
    expect(wrapper.get('summary').attributes('data-component')).toBe('Details.Summary')
    const instance = wrapper.vm as unknown as DetailsInstance
    expect(instance.element).toBe(wrapper.element)
    await wrapper.setProps({ open: false })
    expect((wrapper.element as HTMLDetailsElement).open).toBe(false)
    wrapper.unmount()
    wrappers.splice(wrappers.indexOf(wrapper), 1)
    expect(instance.element).toBeNull()
  })
  it('warns when no user summary is supplied in development', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mount(Details, {
      slots: { default: () => h('summary', { 'data-default-summary': '' }, 'Default') },
    })
    wrappers.push(wrapper)
    expect(warning).toHaveBeenCalledWith(
      'Warning:',
      expect.stringContaining('must have a <summary>'),
    )
  })
})
