import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { SkeletonBox } from './index'
import { SkeletonAvatar } from '../SkeletonAvatar'
import { SkeletonText } from '../SkeletonText'

describe('Skeleton server rendering', () => {
  it('renders immediate and delayed boxes without starting timers', async () => {
    const immediate = await renderToString(createSSRApp(() => h(SkeletonBox, { height: 24 })))
    const delayed = await renderToString(createSSRApp(() => h(SkeletonBox, { delay: 'short' })))
    expect(immediate).toContain('data-component="SkeletonBox"')
    expect(immediate).toContain('height:24px')
    expect(delayed).not.toContain('<div')
  })

  it('renders responsive avatars and multiline text with stable attributes', async () => {
    const markup = await renderToString(
      createSSRApp(() =>
        h('section', [
          h(SkeletonAvatar, { size: { narrow: 24, regular: 40, wide: 64 }, square: true }),
          h(SkeletonText, { lines: 3, maxWidth: 320 }),
        ]),
      ),
    )
    expect(markup).toContain('data-component="SkeletonAvatar"')
    expect(markup).toContain('data-responsive')
    expect(markup).toContain('data-square')
    expect(markup).toContain('--avatarSize-narrow:24px')
    expect(markup).toContain('data-component="multilineContainer"')
    expect(markup).toContain('max-width:320px')
    expect(markup.match(/data-component="SkeletonText"/g)).toHaveLength(3)
  })
})
