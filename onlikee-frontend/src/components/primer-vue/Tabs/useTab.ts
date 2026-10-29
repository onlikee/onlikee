import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useTabs } from './context'
import type { TabProps } from './types'

export function useTab(options: MaybeRefOrGetter<Pick<TabProps, 'value' | 'disabled'>>) {
  const tabs = useTabs()
  const tabProps = computed(() => {
    const { value, disabled } = toValue(options)
    const selected = tabs.selectedValue.value === value
    const tabStop =
      tabs.activationMode.value === 'manual' && tabs.focusedValue.value !== undefined
        ? tabs.focusedValue.value === value
        : selected
    return {
      'aria-disabled': disabled ? true : undefined,
      'aria-controls': `${tabs.groupId.value}-panel-${value}`,
      'aria-selected': selected,
      id: `${tabs.groupId.value}-tab-${value}`,
      role: 'tab' as const,
      tabindex: tabStop ? 0 : -1,
      onKeydown(event: KeyboardEvent) {
        if (event.key === ' ' || event.key === 'Enter') tabs.selectTab(value)
      },
      onMousedown(event: MouseEvent) {
        if (!disabled && event.button === 0 && !event.ctrlKey) tabs.selectTab(value)
        else event.preventDefault()
      },
      onFocus() {
        if (tabs.activationMode.value === 'manual') {
          if (!disabled) tabs.focusTab(value)
        } else if (!selected && !disabled) tabs.selectTab(value)
      },
    }
  })
  return { tabProps }
}
