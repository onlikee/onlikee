import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { Popover } from './index'

describe('Popover SSR', () => {
  it.each([false, true])(
    'renders inline content when open=%s without document access',
    async (open) => {
      const html = await renderToString(
        createSSRApp(() =>
          h(Popover, { open, relative: true }, () =>
            h(
              Popover.Content,
              { onEscape: () => {}, onClickOutside: () => {} },
              () => 'SSR content',
            ),
          ),
        ),
      )
      expect(html).toContain('data-component="Popover"')
      expect(html).toContain('data-caret="top"')
      expect(html.includes('data-open')).toBe(open)
      expect(html).toContain('data-relative')
      expect(html).toContain('data-component="Popover.Content"')
      expect(html).toContain('data-width="small"')
      expect(html).toContain('data-height="fit-content"')
      expect(html).toContain('SSR content')
      expect(html).not.toContain('Portal')
    },
  )
})
