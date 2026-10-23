// @vitest-environment jsdom
import { renderToString } from '@vue/server-renderer'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, h, nextTick } from 'vue'
import { Spinner } from './index'

afterEach(() => vi.useRealTimers())

describe('Spinner hydration', () => {
  it.each([false, 'short'] as const)(
    'hydrates delay=%s with stable labels and client-only motion styles',
    async (delay) => {
      vi.useFakeTimers()
      vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })),
      )
      const component = { render: () => h('div', [h(Spinner, { delay }), h(Spinner)]) }
      const markup = await renderToString(createSSRApp(component))
      expect(markup).not.toContain('animation-delay')
      const host = document.createElement('div')
      host.innerHTML = markup
      document.body.append(host)
      const existing = host.querySelector('svg')
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const error = vi.spyOn(console, 'error').mockImplementation(() => {})
      const app = createSSRApp(component)
      app.mount(host)
      await nextTick()
      expect(host.querySelector('svg')).toBe(existing)
      await vi.advanceTimersByTimeAsync(300)
      const svgs = [...host.querySelectorAll('svg')]
      expect(svgs).toHaveLength(2)
      const ids = svgs.map((svg) => svg.getAttribute('aria-labelledby'))
      expect(new Set(ids).size).toBe(2)
      for (const id of ids) expect(host.querySelector(`[id="${id}"]`)?.textContent).toBe('Loading')
      expect(warn).not.toHaveBeenCalled()
      expect(error).not.toHaveBeenCalled()
      app.unmount()
      host.remove()
      expect(vi.getTimerCount()).toBe(0)
    },
  )
})
