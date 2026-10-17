// @vitest-environment jsdom
import { flushPromises, mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, h, nextTick } from 'vue'
import { RelativeTime } from './index'

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('RelativeTime browser wrapper', () => {
  it('registers the element lazily and forwards formatting, native attributes and updates', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const onRelativeTimeUpdated = vi.fn()
    const wrapper = mount(RelativeTime, {
      props: {
        date: new Date('2024-03-07T12:22:48.123Z'),
        format: 'datetime',
        formatStyle: 'long',
        noTitle: true,
        timeZoneName: 'short',
        timeZone: 'UTC',
        prefix: '',
        onRelativeTimeUpdated,
      },
      attrs: { id: 'last-updated', lang: 'en', class: 'time' },
      attachTo: document.body,
    })
    await flushPromises()
    await customElements.whenDefined('relative-time')
    expect(wrapper.element.tagName).toBe('RELATIVE-TIME')
    expect(wrapper.attributes('data-component')).toBe('RelativeTime')
    expect(wrapper.attributes('datetime')).toBe('2024-03-07T12:22:48.123Z')
    expect(wrapper.attributes('format-style')).toBe('long')
    expect(wrapper.attributes('time-zone-name')).toBe('short')
    expect(wrapper.attributes('time-zone')).toBe('UTC')
    expect(wrapper.attributes('prefix')).toBe('')
    expect(wrapper.attributes('no-title')).toBe('')
    expect(wrapper.attributes('id')).toBe('last-updated')
    expect(wrapper.classes()).toContain('time')
    expect(wrapper.vm.element).toBe(wrapper.element)
    const update = vi.spyOn(wrapper.vm.element!, 'update')
    wrapper.vm.update()
    expect(update).toHaveBeenCalledOnce()
    await wrapper.setProps({
      datetime: '2025-01-01T00:00:00.000Z',
      noTitle: false,
      format: 'relative',
      prefix: undefined,
      timeZone: undefined,
      formatStyle: undefined,
    })
    expect(wrapper.attributes('datetime')).toBe('2025-01-01T00:00:00.000Z')
    expect(wrapper.attributes('no-title')).toBeUndefined()
    expect(wrapper.attributes('prefix')).toBeUndefined()
    expect(wrapper.attributes('time-zone')).toBeUndefined()
    expect(wrapper.attributes('format-style')).toBeUndefined()
    const event = new Event('relative-time-updated')
    wrapper.element.dispatchEvent(event)
    expect(onRelativeTimeUpdated).toHaveBeenCalledWith(event)
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('hydrates the UTC fallback without timezone mismatches and preserves supplied text', async () => {
    const date = new Date('2024-03-07T00:30:00.000Z')
    const format = vi.spyOn(Date.prototype, 'toLocaleDateString').mockReturnValue('Mar 7, 2024')
    const component = () => h(RelativeTime, { date })
    const html = await renderToString(createSSRApp(component))
    const container = document.createElement('div')
    container.innerHTML = html
    document.body.append(container)
    format.mockImplementation((_locale, options) =>
      options?.timeZone === 'UTC' ? 'Mar 7, 2024' : 'Mar 6, 2024',
    )
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const app = createSSRApp(component)
    app.mount(container)
    await nextTick()
    await flushPromises()
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
    expect(container.querySelector('relative-time')?.textContent).toBe('Mar 7, 2024')
    app.unmount()

    const wrapper = mount(RelativeTime, {
      props: { date },
      slots: { default: 'server rendered date' },
    })
    expect(wrapper.text()).toBe('server rendered date')
    wrapper.unmount()
  })
})
