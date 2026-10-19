import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { Label } from './index'
import { Link } from '../Link'
import { LabelGroup } from '../LabelGroup'

describe('Label SSR without browser globals', () => {
  it('renders LabelGroup and a polymorphic Link with numeric styles and rich slot content', async () => {
    expect(typeof window).toBe('undefined')
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(
            LabelGroup,
            {},
            {
              default: () => [
                h(Label, {}, () => 'Public'),
                h(
                  Label,
                  {
                    as: Link,
                    href: '/labels',
                    variant: 'accent',
                    size: 'large',
                    style: { marginLeft: 8, lineHeight: 1.5 },
                  },
                  () => h('strong', 'Labels'),
                ),
              ],
            },
          ),
      }),
    )
    expect(html).toContain('data-component="LabelGroup"')
    expect(html.match(/data-component="Label"/g)).toHaveLength(2)
    expect(html).toContain('href="/labels"')
    expect(html).toContain('data-size="large"')
    expect(html).toContain('margin-left:8px;line-height:1.5;')
    expect(html).toContain('<strong>Labels</strong>')
  })
})
