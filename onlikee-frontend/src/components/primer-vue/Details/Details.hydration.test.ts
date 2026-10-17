// @vitest-environment jsdom
import { createSSRApp, h, nextTick, shallowRef, type Component } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it, vi } from 'vitest'
import { Details, Summary, useDetails } from './index'
import { Button } from '../Button'

describe('Details hydration', () => {
  it('preserves the server disclosure and activates state, refs and outside closing after hydration', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const element = shallowRef<HTMLDetailsElement | null>(null)
    const outside = vi.fn()
    const Fixture = {
      setup() {
        const { getDetailsProps, open } = useDetails({
          ref: element,
          defaultOpen: true,
          closeOnOutsideClick: true,
          onClickOutside: outside,
        })
        return () =>
          h(Details, getDetailsProps(), {
            default: () => [
              h(Summary as Component, { as: Button }, () => (open.value ? 'Open' : 'Closed')),
              h('p', 'Content'),
            ],
          })
      },
    }
    const container = document.createElement('div')
    container.innerHTML = await renderToString(createSSRApp(Fixture))
    document.body.append(container)
    const serverDetails = container.querySelector('details')!
    const app = createSSRApp(Fixture)
    try {
      app.mount(container)
      await nextTick()
      expect(container.querySelector('details')).toBe(serverDetails)
      expect(element.value).toBe(serverDetails)
      expect(serverDetails.open).toBe(true)
      expect(container.querySelector('summary')?.textContent).toContain('Open')
      document.body.click()
      await nextTick()
      expect(serverDetails.open).toBe(false)
      expect(container.querySelector('summary')?.textContent).toContain('Closed')
      expect(outside).toHaveBeenCalledOnce()
      expect(warning).not.toHaveBeenCalled()
      expect(error).not.toHaveBeenCalled()
    } finally {
      app.unmount()
      container.remove()
    }
    expect(element.value).toBeNull()
    document.body.click()
    expect(outside).toHaveBeenCalledOnce()
  })
})
