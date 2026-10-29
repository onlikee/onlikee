import { computed, onBeforeUnmount, shallowRef, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { assignElementRef } from '../internal/assignElementRef'
import { resolveFocusTarget } from '../internal/focusTarget'
import type { TabListHookProps } from './types'

export function useTabList<T extends HTMLElement>(options: MaybeRefOrGetter<TabListHookProps<T>>) {
  const target = shallowRef<unknown>(null)
  const element = computed(() => resolveFocusTarget(target.value) as T | null)
  function setElement(node: unknown) {
    target.value = node
  }
  onBeforeUnmount(() => assignElementRef(toValue(options).ref, null))
  watch(
    [element, () => toValue(options).ref],
    ([node, next], [, previous]) => {
      if (next !== previous) assignElementRef(previous, null)
      assignElementRef(next, node)
    },
    { flush: 'sync' },
  )
  return {
    tabListProps: computed(() => {
      const props = toValue(options)
      const orientation = props['aria-orientation']
      return {
        ref: setElement,
        'aria-label': props['aria-label'],
        'aria-labelledby': props['aria-labelledby'],
        'aria-orientation': orientation ?? 'horizontal',
        role: 'tablist' as const,
        onKeydown(event: KeyboardEvent) {
          const list = element.value
          if (!list) return
          const tabs = Array.from(
            list.querySelectorAll<HTMLElement>('[role="tab"]:not([aria-disabled])'),
          )
          const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'
          const previousKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'
          if (![nextKey, previousKey, 'Home', 'End'].includes(event.key)) return
          event.preventDefault()
          event.stopPropagation()
          if (event.key === 'Home') tabs[0]?.focus()
          else if (event.key === 'End') tabs[tabs.length - 1]?.focus()
          else {
            const active = list.ownerDocument.activeElement
            const focused = tabs.findIndex((tab) => tab === active)
            const current =
              focused !== -1
                ? focused
                : tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true')
            if (current === -1) return
            tabs[(current + (event.key === nextKey ? 1 : -1) + tabs.length) % tabs.length]?.focus()
          }
        },
      }
    }),
  }
}
