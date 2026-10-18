import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { expect, it } from 'vitest'
import { Timeline } from './index'
import { FeatureFlags } from '../FeatureFlags'
import { Avatar } from '../Avatar'
import { Button } from '../Button'
import { RelativeTime } from '../RelativeTime'

it.each([false, true])(
  'renders full Timeline compositions without browser globals with list flag %s',
  async (enabled) => {
    const html = await renderToString(
      createSSRApp(() =>
        h(
          FeatureFlags,
          {
            flags: { primer_react_timeline_list_semantics: enabled },
          },
          () =>
            h(Timeline, { clipSidebar: 'both', id: 'timeline' }, () => [
              h(Timeline.Item, null, () => [
                h(Timeline.Avatar, null, () => h(Avatar, { alt: 'Actor', size: 40 })),
                h(Timeline.Badge, { variant: 'done', title: 'Merged' }, () => '✓'),
                h(Timeline.Body, null, () => h(RelativeTime, { datetime: '2026-10-17T00:00:00Z' })),
                h(Timeline.Actions, null, () => h(Button, null, () => 'View details')),
              ]),
              h(Timeline.Break),
            ]),
        ),
      ),
    )
    expect(html).toContain(enabled ? '<ol' : '<div')
    expect(html).toContain('data-clip-sidebar="both"')
    expect(html).toContain('data-variant="done"')
    expect(html).toContain('Oct 17, 2026')
    expect(html).toContain('View details')
    expect(html).toContain('aria-label="Actor"')
    expect(html.includes('role="presentation"')).toBe(enabled)
    expect((html.match(/<li\b/g) ?? []).length).toBe(enabled ? 2 : 0)
  },
)
