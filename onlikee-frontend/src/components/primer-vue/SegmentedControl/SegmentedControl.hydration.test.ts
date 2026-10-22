// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'
import { createSSRApp, h, nextTick } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { SegmentedControl } from './index'

it('hydrates responsive controls with stable Tooltip IDs and retains selection after updates', async () => {
  const Icon = () => h('svg')
  const create = () =>
    createSSRApp({
      render: () =>
        h(
          SegmentedControl,
          {
            'aria-label': 'View',
            variant: { narrow: 'dropdown', regular: 'subtle' },
          },
          () => [
            h(SegmentedControl.IconButton, { icon: Icon, 'aria-label': 'Preview' }),
            h(SegmentedControl.Divider),
            h(SegmentedControl.Button, { defaultSelected: true, count: 0 }, () => 'Code'),
            h(SegmentedControl.Action, { label: 'Add', icon: Icon }),
          ],
        ),
    })
  const host = document.createElement('div')
  host.innerHTML = await renderToString(create())
  document.body.append(host)
  const ids = Array.from(host.querySelectorAll('[id]'), (element) => element.id)
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  const app = create()
  try {
    app.mount(host)
    await nextTick()
    expect(Array.from(host.querySelectorAll('[id]'), (element) => element.id)).toEqual(ids)
    expect(new Set(ids).size).toBe(ids.length)
    const list = host.querySelector('ul[data-component="SegmentedControl"]')!
    const buttons = list.querySelectorAll('button')
    expect(buttons[1]?.getAttribute('aria-pressed')).toBe('true')
    buttons[0]?.click()
    await nextTick()
    expect(buttons[0]?.getAttribute('aria-pressed')).toBe('true')
    expect(
      host.querySelector('[data-component="ActionMenu.Button"]')?.getAttribute('aria-label'),
    ).toBe('Preview, View')
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
  } finally {
    app.unmount()
    host.remove()
    vi.restoreAllMocks()
  }
})
