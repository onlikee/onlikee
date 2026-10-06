import { computed, inject, onBeforeUnmount, onMounted, shallowRef, watch, type InjectionKey, type Ref, type VNodeChild } from 'vue'
import type { ActionBarMenuItemProps, ActionBarMenuProps, ActionBarSize } from './types'

export type MenuEntry = Omit<Exclude<ActionBarMenuItemProps, { type: 'divider' }>, 'label' | 'items'> & {
  label: string | (() => VNodeChild)
  items?: MenuEntry[]
  returnFocusRef?: ActionBarMenuProps['returnFocusRef']
} | { type: 'divider' }
export interface RegisteredItem {
  element: Ref<HTMLElement | null>
  overflowing: Readonly<Ref<boolean>>
  entry: () => MenuEntry | null
}
export interface ActionBarContext {
  size: Readonly<Ref<ActionBarSize>>
  register: (item: RegisteredItem) => () => void
  observe: (element: HTMLElement, callback: (overflowing: boolean) => void) => () => void
}
export const actionBarKey: InjectionKey<ActionBarContext> = Symbol('ActionBar')
export const actionBarGroupKey: InjectionKey<Readonly<Ref<boolean>>> = Symbol('ActionBar.Group')
export const actionBarMenuKey: InjectionKey<() => void> = Symbol('ActionBar.Menu')

export function useActionBarItem(entry: RegisteredItem['entry']) {
  const bar = inject(actionBarKey, undefined)
  const group = inject(actionBarGroupKey, undefined)
  const target = shallowRef<HTMLElement | { element: HTMLElement | null } | null>(null)
  // Track the exposed ref itself: a fragment-root button's native element is attached later.
  const element = computed(() => target.value && (target.value instanceof HTMLElement ? target.value : target.value.element))
  const clipped = shallowRef(false)
  const overflowing = computed(() => group?.value || clipped.value)
  let unregister: (() => void) | undefined
  onMounted(() => { unregister = bar?.register({ element, overflowing, entry }) })
  onBeforeUnmount(() => unregister?.())
  watch(element, (node, _previous, onCleanup) => {
    // 分组中的操作项共享整个分组的裁剪状态。
    if (!node || !bar || group !== undefined) return
    onCleanup(bar.observe(node, value => { clipped.value = value }))
  }, { flush: 'post' })
  function setElement(value: unknown) {
    target.value = value as typeof target.value
  }
  return {
    element, setElement, overflowing,
    size: bar?.size ?? computed(() => 'medium' as const),
    dataOverflowing: computed(() => overflowing.value ? '' : undefined)
  }
}
