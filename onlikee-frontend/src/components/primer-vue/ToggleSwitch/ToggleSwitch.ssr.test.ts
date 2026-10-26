import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { expect, it } from 'vitest'
import { ToggleSwitch } from './index'
import { Text } from '../Text'

it.each([false, true])(
  'renders Text, Spinner and the %s state without browser globals',
  async (checked) => {
    const html = await renderToString(
      createSSRApp(() =>
        h('div', [
          h(Text, { id: 'label' }, () => 'Notifications'),
          h(ToggleSwitch, {
            'aria-labelledby': 'label',
            'aria-describedby': 'caption',
            checked,
            loading: true,
          }),
          h('span', { id: 'caption' }, 'Delivered by email'),
        ]),
      ),
    )
    expect(html).toContain(`aria-pressed="${checked}"`)
    expect(html).toContain('aria-disabled="true"')
    expect(html).toContain('aria-labelledby="label"')
    expect(html).toContain('aria-describedby="loadingLabel caption"')
    expect(html).toContain('data-component="Spinner"')
    expect(html).toContain('type="button"')
    expect(html).toContain('Notifications')
    expect(html).not.toContain(' disabled=')
    expect(html).not.toMatch(/>Loading</)
  },
)
