import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { SegmentedControl } from './index'

describe('SegmentedControl without browser globals', () => {
  it('renders all component variants on the server', async () => {
    const Icon = () => h('svg')
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(
            SegmentedControl,
            {
              'aria-label': 'View',
              fullWidth: { narrow: true, wide: false },
              variant: { narrow: 'dropdown', regular: 'subtle' },
            },
            () => [
              h(SegmentedControl.Button, { count: 0, leadingVisual: Icon }, () => 'All'),
              h(SegmentedControl.Divider),
              h(SegmentedControl.IconButton, { icon: Icon, 'aria-label': 'Code' }),
              h(SegmentedControl.Action, { label: 'Add', icon: Icon }),
            ],
          ),
      }),
    )
    expect(html).toContain('aria-label="View"')
    expect(html).toContain('data-full-width-narrow="true"')
    expect(html).toContain('data-component="SegmentedControl.Divider"')
    expect(html).toContain('data-component="SegmentedControl.IconButton"')
    expect(html).toContain('data-component="SegmentedControl.Action"')
    expect(html).toContain('data-component="CounterLabel"')
    expect(html).not.toContain('data-disable-knob-transition')
  })
})
