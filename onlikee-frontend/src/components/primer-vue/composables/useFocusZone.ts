import { shallowRef, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import { focusZone, type FocusZoneSettings } from '@primer/behaviors'
export { FocusKeys } from '@primer/behaviors'
export type { Direction } from '@primer/behaviors'

export interface FocusZoneHookSettings extends Omit<FocusZoneSettings, 'activeDescendantControl'> {
  containerRef?: Ref<HTMLElement | null>
  activeDescendantFocus?: boolean | Ref<HTMLElement | null>
  disabled?: boolean
}

/* 响应式焦点区域；作用域销毁时取消全部行为监听器。 */
export function useFocusZone(settings: MaybeRefOrGetter<FocusZoneHookSettings> = {}) {
  const first = toValue(settings)
  const containerRef = first.containerRef ?? shallowRef<HTMLElement | null>(null)
  const activeDescendantControlRef =
    typeof first.activeDescendantFocus === 'object'
      ? first.activeDescendantFocus
      : shallowRef<HTMLElement | null>(null)
  watch(
    () => {
      const current = toValue(settings)
      const container = current.containerRef?.value ?? containerRef.value
      const active =
        typeof current.activeDescendantFocus === 'object'
          ? current.activeDescendantFocus.value
          : activeDescendantControlRef.value
      return { current, container, active }
    },
    ({ current, container, active }, _previous, onCleanup) => {
      const useActiveDescendant = !!current.activeDescendantFocus
      if (!(container instanceof HTMLElement)) return
      if (useActiveDescendant && !(active instanceof HTMLElement)) return
      if (current.disabled) return
      const controller = focusZone(container, {
        ...current,
        activeDescendantControl: active ?? undefined,
      })
      onCleanup(() => controller.abort())
    },
    { flush: 'post', immediate: true },
  )
  return { containerRef, activeDescendantControlRef }
}
