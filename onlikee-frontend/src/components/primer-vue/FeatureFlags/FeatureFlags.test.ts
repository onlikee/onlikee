import { describe, expect, it } from 'vitest'
import { computed, createSSRApp, defineComponent, h, ref } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { FeatureFlags, FeatureFlagScope, DefaultFeatureFlags, useFeatureFlag } from './index'
import { Timeline } from '../Timeline'
import { Button } from '../Button'
describe('FeatureFlags behavior', () => {
  it('registers all source defaults, including the button loading style flag', () => {
    expect(Object.fromEntries(DefaultFeatureFlags.flags)).toEqual({
      primer_react_css_anchor_positioning: false,
      primer_react_select_panel_fullscreen_on_narrow: false,
      primer_react_select_panel_order_selected_at_top: false,
      primer_react_styled_react_use_primer_theme_providers: false,
      primer_react_action_list_group_heading_trailing_action: false,
      primer_react_action_list_item_gap: false,
      primer_react_timeline_list_semantics: false,
      primer_react_merged_forwarded_refs: false,
      primer_react_button_loading_disabled_styles: false,
    })
  })
  it('renders composed feature consumers on the server without browser globals', async () => {
    const html = await renderToString(
      createSSRApp(() =>
        h(
          FeatureFlags,
          {
            flags: {
              primer_react_timeline_list_semantics: true,
              primer_react_button_loading_disabled_styles: true,
            },
          },
          () => [
            h(Timeline, {}, () => [h(Timeline.Item, {}, () => 'Event'), h(Timeline.Break)]),
            h(Button, { loading: true }, () => 'Save'),
          ],
        ),
      ),
    )
    expect(html).toContain('<ol')
    expect(html).toContain('role="list"')
    expect(html).toContain('<li')
    expect(html).toContain('role="presentation"')
    expect(html).toContain('data-loading-disabled-styles="true"')
    expect(html).toContain('aria-disabled="true"')
  })
  it('retains source defaults and scope overrides, including explicit undefined', () => {
    expect(DefaultFeatureFlags.enabled('primer_react_select_panel_fullscreen_on_narrow')).toBe(
      false,
    )
    expect(DefaultFeatureFlags.enabled('missing')).toBe(false)
    const parent = FeatureFlagScope.create({ a: true, b: false })
    const merged = FeatureFlagScope.merge(
      parent,
      FeatureFlagScope.create({ a: undefined, b: true }),
    )
    expect(merged.enabled('a')).toBe(false)
    expect(merged.enabled('b')).toBe(true)
    merged.enable('c')
    merged.disable('b')
    expect(merged.enabled('c')).toBe(true)
    expect(parent.enabled('a')).toBe(true)
    const live = computed(() => merged.enabled('c'))
    expect(live.value).toBe(true)
    merged.disable('c')
    expect(live.value).toBe(false)
  })
  it('merges providers without discarding parent flags during SSR', async () => {
    const Consumer = defineComponent({
      setup() {
        const parent = useFeatureFlag('parent')
        const nested = useFeatureFlag('nested')
        const disabled = useFeatureFlag('disabled')
        return () => h('span', `${parent.value}/${nested.value}/${disabled.value}`)
      },
    })
    const flags = ref({ parent: true, disabled: true })
    const html = await renderToString(
      createSSRApp(() =>
        h(
          FeatureFlags,
          { flags: flags.value },
          {
            default: () =>
              h(
                FeatureFlags,
                { flags: { nested: true, disabled: false } },
                { default: () => h(Consumer) },
              ),
          },
        ),
      ),
    )
    expect(html).toContain('true/true/false')
  })
})
