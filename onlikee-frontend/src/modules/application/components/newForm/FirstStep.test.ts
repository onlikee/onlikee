// @vitest-environment jsdom
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import FirstStep from './FirstStep.vue'

enableAutoUnmount(afterEach)

describe('new application framework selection', () => {
  it('offers all frameworks in one dropdown and updates the controlled selection', async () => {
    const wrapper = mount(FirstStep, {
      props: { selectedFramework: null },
      attachTo: document.body,
    })
    const anchor = wrapper.get('button[aria-haspopup="dialog"]')
    expect(anchor.text()).toBe('请选择')

    await anchor.trigger('click')
    await flushPromises()
    const dialog = document.querySelector('[role="dialog"][aria-label="选择前端框架"]')!
    const options = Array.from(dialog.querySelectorAll<HTMLElement>('[role="option"]'))
    expect(options.map((option) => option.textContent?.trim())).toEqual([
      expect.stringContaining('HTML'),
      expect.stringContaining('Vue'),
      expect.stringContaining('React'),
    ])
    expect(dialog.querySelector('img')).toBeNull()
    expect(dialog.textContent).not.toContain('推荐')

    options[1]!.click()
    await flushPromises()
    expect(wrapper.emitted('update:selected-framework')).toEqual([['vue']])
    expect(document.querySelector('[role="dialog"][aria-label="选择前端框架"]')).toBeNull()

    await wrapper.setProps({ selectedFramework: 'vue' })
    expect(anchor.text()).toBe('Vue')
  })

  it('associates the validation message with the dropdown trigger', () => {
    const wrapper = mount(FirstStep, {
      props: { selectedFramework: null, invalid: true, validation: '请选择前端框架' },
    })
    const anchor = wrapper.get('button[aria-haspopup="dialog"]')

    expect(anchor.attributes('aria-invalid')).toBe('true')
    const message = wrapper.get(`[id="${anchor.attributes('aria-describedby')}"]`)
    expect(message.text()).toBe('请选择前端框架')
  })
})
