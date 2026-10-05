import { shallowRef, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import { focusZone, type FocusZoneSettings } from '@primer/behaviors'
export { FocusKeys } from '@primer/behaviors'
export type { Direction } from '@primer/behaviors'

export interface FocusZoneHookSettings extends Omit<FocusZoneSettings, 'activeDescendantControl'> {
  containerRef?: Ref<HTMLElement | null>
  activeDescendantFocus?: boolean | Ref<HTMLElement | null>
  disabled?: boolean
}

/** Reactive Vue port of React useFocusZone. Scope disposal aborts all behavior listeners. */
export function useFocusZone(settings: MaybeRefOrGetter<FocusZoneHookSettings> = {}) {
  const first = toValue(settings)
  const containerRef = first.containerRef ?? shallowRef<HTMLElement | null>(null)
  const activeDescendantControlRef = typeof first.activeDescendantFocus === 'object'
    ? first.activeDescendantFocus : shallowRef<HTMLElement | null>(null)
  watch(() => {
    const current = toValue(settings)
    const container = current.containerRef?.value ?? containerRef.value
    const active = typeof current.activeDescendantFocus === 'object'
      ? current.activeDescendantFocus.value : activeDescendantControlRef.value
    return { current, container, active }
  }, ({ current, container, active }, _previous, onCleanup) => {
    // React :52-56 门控：container 必须 instanceof HTMLElement；启用 AD
    // （activeDescendantFocus truthy）时 control 也必须 instanceof HTMLElement
    // （truthy 判断不足以镜像，composables 审计偏差 10）。
    const useActiveDescendant = !!current.activeDescendantFocus
    if (!(container instanceof HTMLElement)) return
    if (useActiveDescendant && !(active instanceof HTMLElement)) return
    if (current.disabled) return
    const controller = focusZone(container, {
      ...current,
      // React :60：activeDescendantControl 恒取 controlRef.current ?? undefined
      // （不以 useActiveDescendant 为门，越权用法差异随之消失）。
      activeDescendantControl: active ?? undefined
    })
    onCleanup(() => controller.abort())
  }, { flush: 'post', immediate: true })
  return { containerRef, activeDescendantControlRef }
}
