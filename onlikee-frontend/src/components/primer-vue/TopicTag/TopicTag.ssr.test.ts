import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { TopicTag } from './index'
import { Link } from '../Link'

describe('TopicTag SSR without browser globals', () => {
  it('renders a fixed div group, anchors, a button and a custom Link root', async () => {
    expect(typeof window).toBe('undefined')
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(TopicTag.Group, { 'aria-label': 'Topics' }, () => [
            h(TopicTag, {}, () => 'react'),
            h(TopicTag, { as: 'button', disabled: true }, () => 'vue'),
            h(TopicTag, { as: Link, href: '/topics/react' }, () => h('strong', 'react')),
          ]),
      }),
    )
    expect(html).toContain('<div aria-label="Topics"')
    expect(html).toContain('<a class=')
    expect(html).toContain('<button disabled')
    expect(html).toContain('href="/topics/react"')
    expect(html).toContain('<strong>react</strong>')
    expect(html).not.toContain('type=')
    expect(html).not.toContain('as=')
  })
})
