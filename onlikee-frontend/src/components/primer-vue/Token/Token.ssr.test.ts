import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { expect, it } from 'vitest'
import { Token, IssueLabelToken } from './index'
import { LabelGroup } from '../LabelGroup'
import { Label } from '../Label'
import TextInputWithTokens from '../TextInputWithTokens'
import { GitBranchIcon } from '@onlikee/octicons-vue'

it('renders the Token family, LabelGroup and custom input tokens without browser globals', async () => {
  const tokens = [{ id: 'bug', text: 'bug', fillColor: 'lightpink' }]
  const html = await renderToString(
    createSSRApp(() =>
      h('div', [
        h(LabelGroup, { visibleChildCount: 2 }, () => [
          h(Token, { text: 'main', leadingVisual: GitBranchIcon, id: 42 }),
          h(IssueLabelToken, { text: h(Label, null, () => 'Verified'), fillColor: '#0366d6' }),
          h(Token, { text: 'More', onRemove: () => {} }),
        ]),
        h(TextInputWithTokens, {
          'aria-label': 'Labels',
          role: 'combobox',
          tokenComponent: IssueLabelToken,
          tokens,
        }),
      ]),
    ),
  )
  expect(html).toContain('id="42"')
  expect(html).toContain('data-component="Label"')
  expect(html).toContain('data-component="TextInputWithTokens.Token"')
  expect(html).toContain('--label-r:255')
  expect(html).toContain('Selected: bug')
  expect(html).toContain('aria-label="Remove token"')
})
