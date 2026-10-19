import { describe, expect, it } from 'vitest'
import { createSSRApp, Fragment, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { LabelGroup } from './index'
import { Label } from '../Label'
import { Token } from '../Token'

describe('LabelGroup SSR', () => {
  it.each([undefined, 0, 1, 'auto'] as const)(
    'renders complete initial content for visibleChildCount=%s',
    async (visibleChildCount) => {
      expect(typeof window).toBe('undefined')
      const html = await renderToString(
        createSSRApp({
          render: () =>
            h(
              LabelGroup,
              { visibleChildCount },
              {
                default: () => [
                  h(Label, {}, () => 'Public'),
                  h(Fragment, {}, [
                    h(Token, { as: 'button', text: 'One' }),
                    h(Token, { as: 'button', text: 'Two' }),
                  ]),
                ],
              },
            ),
        }),
      )
      expect(html).toContain('data-component="LabelGroup"')
      expect(html).toContain('Public')
      expect(html).toContain('One')
      expect(html).toContain('Two')
      expect(html).not.toContain('Show +')
      expect(html).not.toContain('ItemWrapper--hidden')
      expect(html.match(/<li[ >]/g)).toHaveLength(visibleChildCount ? 3 : 2)
    },
  )
})
