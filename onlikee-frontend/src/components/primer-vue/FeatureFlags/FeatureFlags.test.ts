import { describe, expect, it } from 'vitest'
import { computed, createSSRApp, defineComponent, h, ref } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { FeatureFlags, FeatureFlagScope, DefaultFeatureFlags, useFeatureFlag } from './index'
describe('FeatureFlags behavior', () => {
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
