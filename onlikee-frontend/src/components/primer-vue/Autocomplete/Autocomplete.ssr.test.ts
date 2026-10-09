import { describe, expect, expectTypeOf, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import Autocomplete, { type AutocompleteMenuItem, type AutocompleteMenuProps } from './index'
import TextInputWithTokens, {
  type TextInputWithTokensProps,
  type TokenComponentProps,
} from '../TextInputWithTokens'

describe('composite input SSR and public types', () => {
  it('renders a stable combobox ID without mounting an overlay or its menu', async () => {
    const render = () =>
      renderToString(
        h(
          Autocomplete,
          { id: 'stable' },
          {
            default: () => [
              h(Autocomplete.Input, { value: 0 }),
              h(
                Autocomplete.Overlay,
                {},
                {
                  default: () =>
                    h(Autocomplete.Menu, {
                      items: [{ id: 'zero', text: 'zero' }],
                      selectedItemIds: [],
                      'aria-labelledby': 'label',
                    }),
                },
              ),
            ],
          },
        ),
      )
    const markup = await render()
    expect(markup).toBe(await render())
    expect(markup).toContain('aria-controls="stable-listbox"')
    expect(markup).toContain('value="0"')
    expect(markup).not.toContain('role="listbox"')
  })

  it('renders token descriptions with preserved external descriptions', async () => {
    const markup = await renderToString(
      h(TextInputWithTokens, {
        id: 'tokens',
        tokens: [{ id: 'one', text: 'One' }],
        role: 'combobox',
        'aria-describedby': 'caption',
      }),
    )
    expect(markup).toContain('data-component="TextInputWithTokens"')
    expect(markup).toContain('Selected: One')
    expect(markup).toContain('aria-describedby="caption ')
  })

  it('preserves typed menu metadata and custom token component props', () => {
    interface Language extends AutocompleteMenuItem {
      metadata: { code: string }
    }
    const menu: AutocompleteMenuProps<Language> = {
      items: [{ id: 'ts', text: 'TypeScript', metadata: { code: 'ts' } }],
      selectedItemIds: [],
      'aria-labelledby': 'label',
    }
    expectTypeOf(menu.items[0]!.metadata.code).toEqualTypeOf<string>()
    const CustomToken = defineComponent({
      props: { id: { type: String, required: true }, label: { type: String, required: true } },
      setup: (props) => () => h('span', props.label),
    })
    const tokens: TextInputWithTokensProps<typeof CustomToken> = {
      tokenComponent: CustomToken,
      tokens: [{ id: 'one', label: 'One' }],
    }
    expectTypeOf<TokenComponentProps<typeof CustomToken>>().toHaveProperty('label')
    expect(tokens.tokens[0]?.label).toBe('One')
  })
})
