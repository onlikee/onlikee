import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { SplitPageLayout } from './index'
import { Stack } from '../Stack'
import { StateLabel } from '../StateLabel'

describe('SplitPageLayout server composition', () => {
  it('renders layout regions, Stack.Item, and named status icons without browser globals', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(SplitPageLayout, null, () => [
            h(SplitPageLayout.Header, null, () => 'Header'),
            h(SplitPageLayout.Pane, { resizable: true, 'aria-label': 'Navigation' }, () => 'Pane'),
            h(SplitPageLayout.Content, null, () =>
              h(Stack, null, () =>
                h(Stack.Item, null, () => h(StateLabel, { status: 'pullMerged' }, () => 'Merged')),
              ),
            ),
            h(SplitPageLayout.Sidebar, null, () => 'Sidebar'),
            h(SplitPageLayout.Footer, null, () => 'Footer'),
          ]),
      }),
    )
    for (const name of [
      'SplitPageLayout',
      'SplitPageLayout.Header',
      'SplitPageLayout.Pane',
      'SplitPageLayout.Content',
      'SplitPageLayout.Sidebar',
      'SplitPageLayout.Footer',
      'Stack',
      'StackItem',
      'StateLabel',
    ])
      expect(html).toContain(`data-component="${name}"`)
    expect(html).toContain('aria-label="Pull request"')
    expect(html).toContain('role="slider"')
  })
})
