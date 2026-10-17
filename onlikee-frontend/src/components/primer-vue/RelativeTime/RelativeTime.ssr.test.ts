import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import { RelativeTime } from './index'
import { LabelGroup } from '../LabelGroup'
import { Label } from '../Label'
import { Heading } from '../Heading'
import { ScrollableRegion } from '../ScrollableRegion'
import { SkeletonBox } from '../Skeleton'
import { SkeletonText } from '../SkeletonText'

describe('table dependency SSR', () => {
  it('uses a deterministic UTC fallback with date and datetime precedence', async () => {
    const html = await renderToString(
      createSSRApp(() =>
        h(RelativeTime, {
          date: new Date('2020-01-01T00:00:00Z'),
          datetime: '2024-03-07T00:30:00.000Z',
          noTitle: true,
          format: 'duration',
          formatStyle: 'narrow',
          timeZoneName: 'short',
          timeZone: 'Asia/Shanghai',
          className: 'time',
          id: 'updated',
        }),
      ),
    )
    expect(html).toContain('<relative-time')
    expect(html).toContain('Mar 7, 2024')
    expect(html).toContain('datetime="2024-03-07T00:30:00.000Z"')
    expect(html).toContain(' no-title')
    expect(html).toContain('format-style="narrow"')
    expect(html).toContain('time-zone-name="short"')
    expect(html).toContain('time-zone="Asia/Shanghai"')
    expect(html).toContain('data-component="RelativeTime"')
    expect(html).toContain('id="updated"')
  })
  it('preserves supplied date content and omits no-title by default', async () => {
    const html = await renderToString(
      createSSRApp(() =>
        h(
          RelativeTime,
          {
            date: new Date('2024-03-07T00:30:00.000Z'),
          },
          { default: () => 'server rendered date' },
        ),
      ),
    )
    expect(html).toContain('server rendered date')
    expect(html).not.toContain('no-title')
  })
  it('renders the entire dependency composition without browser globals or observer work', async () => {
    const html = await renderToString(
      createSSRApp(() =>
        h('section', null, [
          h(Heading, { as: 'h3' }, { default: () => 'Labels' }),
          h(
            ScrollableRegion,
            { 'aria-label': 'Labels' },
            {
              default: () =>
                h(
                  LabelGroup,
                  { visibleChildCount: 'auto' },
                  {
                    default: () => [
                      h(Label, null, { default: () => 'One' }),
                      h(Label, null, { default: () => 'Two' }),
                    ],
                  },
                ),
            },
          ),
          h(SkeletonText, { lines: 3 }),
          h(SkeletonBox, { delay: 'long' }),
        ]),
      ),
    )
    expect(html).toContain('<h3')
    expect(html).toContain('One')
    expect(html).toContain('Two')
    expect(html.match(/data-component="SkeletonText"/g)).toHaveLength(3)
    expect(html).not.toContain('role="region"')
    expect(html).not.toContain('role="dialog"')
    expect(html).not.toContain('data-component="SkeletonBox"')
  })
})
