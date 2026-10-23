// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { TextInput } from './index'
import { TextInputWithTokens } from '../TextInputWithTokens'

const wrappers: VueWrapper[] = []
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
})

describe.each([
  ['TextInput', TextInput],
  ['TextInputWithTokens', TextInputWithTokens],
] as const)('%s Spinner composition', (prefix, component) => {
  it.each(['auto', 'leading', 'trailing'] as const)(
    'preserves SVG overlay classes and input focus through repeated loading at %s',
    async (loaderPosition) => {
      const wrapper = mount(component, {
        props: {
          tokens: [],
          loading: false,
          leadingVisual: 'Search',
          trailingVisual: 'Suffix',
          loaderPosition,
        },
        attachTo: document.body,
      })
      wrappers.push(wrapper)
      const input = wrapper.get('input').element
      input.focus()
      const leading = wrapper.get(`[data-component="${prefix}.LeadingVisual"] svg`)
      const trailing = wrapper.get(`[data-component="${prefix}.TrailingVisual"] svg`)
      for (const spinner of [leading, trailing]) {
        expect(spinner.attributes('width')).toBe('32px')
        expect(spinner.attributes('aria-hidden')).toBe('true')
        expect(spinner.attributes('aria-labelledby')).toBeUndefined()
        expect(spinner.classes()).toEqual(
          expect.arrayContaining([expect.stringContaining('_visual-spinner-overlay_')]),
        )
        expect(spinner.classes()).toEqual(
          expect.arrayContaining([expect.stringContaining('_visual-hidden_')]),
        )
        expect(spinner.element.parentElement?.className).not.toContain('visual-hidden')
      }
      expect(leading.classes()).toEqual(
        expect.arrayContaining([expect.stringContaining('_visual-spinner-leading_')]),
      )
      expect(trailing.classes()).not.toEqual(
        expect.arrayContaining([expect.stringContaining('_visual-spinner-leading_')]),
      )
      for (let cycle = 0; cycle < 2; cycle++) {
        await wrapper.setProps({ loading: true })
        const active = loaderPosition === 'trailing' ? trailing : leading
        const inactive = loaderPosition === 'trailing' ? leading : trailing
        expect(active.classes()).toEqual(
          expect.arrayContaining([expect.stringContaining('_visual-visible_')]),
        )
        expect(inactive.classes()).toEqual(
          expect.arrayContaining([expect.stringContaining('_visual-hidden_')]),
        )
        expect(document.activeElement).toBe(input)
        await wrapper.setProps({ loading: false })
        expect(leading.classes()).toEqual(
          expect.arrayContaining([expect.stringContaining('_visual-hidden_')]),
        )
        expect(trailing.classes()).toEqual(
          expect.arrayContaining([expect.stringContaining('_visual-hidden_')]),
        )
        expect(wrapper.get('input').element).toBe(input)
        expect(wrapper.get(`[data-component="${prefix}.LeadingVisual"] svg`).element).toBe(
          leading.element,
        )
      }
    },
  )

  it('uses a small silent trailing Spinner without a visual and restores it after loading', async () => {
    const wrapper = mount(component, { props: { tokens: [], loading: false } })
    wrappers.push(wrapper)
    const svg = wrapper.get(`[data-component="${prefix}.TrailingVisual"] svg`)
    expect(svg.attributes('width')).toBe('16px')
    expect(svg.classes()).not.toEqual(
      expect.arrayContaining([expect.stringContaining('_visual-spinner-overlay_')]),
    )
    expect(svg.classes()).toEqual(
      expect.arrayContaining([expect.stringContaining('_visual-hidden_')]),
    )
    expect(wrapper.find(`[data-component="${prefix}.LeadingVisual"]`).exists()).toBe(false)
    await wrapper.setProps({ loading: true })
    expect(svg.classes()).toEqual(
      expect.arrayContaining([expect.stringContaining('_visual-visible_')]),
    )
    expect(svg.attributes('aria-labelledby')).toBeUndefined()
    await wrapper.setProps({ loading: false })
    expect(svg.classes()).toEqual(
      expect.arrayContaining([expect.stringContaining('_visual-hidden_')]),
    )
  })
})
