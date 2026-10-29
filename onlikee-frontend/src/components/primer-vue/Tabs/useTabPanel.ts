import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useTabs } from './context'
import type { TabPanelProps } from './types'

export function useTabPanel(options: MaybeRefOrGetter<TabPanelProps>) {
  const tabs = useTabs()
  return {
    tabPanelProps: computed(() => {
      const { value } = toValue(options)
      return {
        'aria-labelledby': `${tabs.groupId.value}-tab-${value}`,
        'data-selected': tabs.selectedValue.value === value ? '' : undefined,
        id: `${tabs.groupId.value}-panel-${value}`,
        hidden: tabs.selectedValue.value !== value,
        role: 'tabpanel' as const,
      }
    }),
  }
}
