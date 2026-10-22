import { describe, expect, it, vi } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { Portal, PortalContext } from './index'

describe('Portal without browser globals', () => {
  it('renders nothing and does not evaluate browser-only children on the server', async () => {
    expect(typeof document).toBe('undefined')
    const onMount = vi.fn()
    const children = vi.fn(() => h('button', 'Client only'))
    const html = await renderToString(
      createSSRApp(() =>
        h(
          PortalContext.Provider,
          { value: { portalContainerName: 'unregistered-on-server' } },
          {
            default: () => h(Portal, { onMount }, { default: children }),
          },
        ),
      ),
    )
    expect(html).not.toContain('Client only')
    expect(children).not.toHaveBeenCalled()
    expect(onMount).not.toHaveBeenCalled()
  })
})
