import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { Banner } from './index'
import { Link } from '../Link'
import { Stack } from '../Stack'

describe('Banner server rendering', () => {
  it('renders in place without browser globals and preserves rich component composition', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(Stack, null, () =>
            h(
              Banner,
              {
                title: 'Server title',
                description: h(Link, { href: '#guide' }, () => 'Guide'),
                onDismiss: () => {},
              },
              {
                primaryAction: () =>
                  h(Banner.PrimaryAction, { as: 'a', href: '#upgrade' }, () => 'Upgrade'),
                secondaryAction: () => h(Banner.SecondaryAction, null, () => 'Later'),
              },
            ),
          ),
      }),
    )
    expect(html).toContain('<section')
    expect(html).toContain('data-component="Banner"')
    expect(html).toContain('data-component="Banner.Title"')
    expect(html).toContain('data-component="Banner.Description"')
    expect(html).toContain('data-component="IconButton"')
    expect(html).toContain('href="#guide"')
    expect(html.match(/data-component="Banner.PrimaryAction"/g)).toHaveLength(2)
    expect(html.match(/data-component="Banner.SecondaryAction"/g)).toHaveLength(2)
    expect(html).not.toContain('banner-host')
    expect(html).not.toContain('teleport')
  })

  it('assigns distinct title IDs to independent and compound Banners', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h('main', null, [
            h(Banner, { title: 'First' }),
            h(Banner, null, { default: () => h(Banner.Title, { as: 'h3' }, () => 'Second') }),
          ]),
      }),
    )
    const ids = [...html.matchAll(/aria-labelledby="([^"]+)"/g)].map((match) => match[1])
    expect(ids).toHaveLength(2)
    expect(new Set(ids).size).toBe(2)
    for (const id of ids) expect(html).toContain(`id="${id}"`)
    expect(html).toContain('<h3')
  })
})
