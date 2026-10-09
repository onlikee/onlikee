<script setup lang="ts">
import { computed, inject, provide, shallowRef, toValue, watch, type Ref } from 'vue'
import Overlay from '../internal/components/Overlay.vue'
import { ActionList, ActionListContainerContext } from '../ActionList'
import MenuItem from './ActionBarMenuItem.vue'
import { actionBarMenuKey, type MenuEntry, type RegisteredItem } from './context'

const props = defineProps<{
  open: boolean
  anchor: HTMLElement | null
  items?: MenuEntry[]
  overflowItems?: RegisteredItem[]
  returnFocusRef?: Ref<HTMLElement | null> | HTMLElement | null
  submenu?: boolean
  last?: boolean
  focusAnchor?: boolean
}>()
const emit = defineEmits<{ close: [] }>()
// Read descendant props in the menu's effect, not in the toolbar's slot-rendering effect.
// Otherwise an inline items array recreated by the slot can recursively update the toolbar.
const menuEntries = computed(() =>
  props.overflowItems
    ? props.overflowItems.flatMap((item) => {
        const entry = item.entry()
        return entry ? [entry] : []
      })
    : (props.items ?? []),
)
const parentClose = inject(actionBarMenuKey, undefined)
const overlay = shallowRef<{ element: HTMLElement | null; visibility?: string } | null>(null)
const returnFocus = computed(() => toValue(props.returnFocusRef) ?? props.anchor)
const ignoreClickRefs = computed(() => [computed(() => props.anchor)])
function closeAll() {
  emit('close')
  parentClose?.()
}
provide(actionBarMenuKey, closeAll)
provide(ActionListContainerContext, {
  container: 'ActionMenu',
  listRole: 'menu',
  enableFocusZone: true,
  afterSelect: closeAll,
})
watch(
  () => [overlay.value?.element, overlay.value?.visibility, props.last, props.focusAnchor] as const,
  ([element, visibility]) => {
    if (!element || visibility === 'hidden') return
    if (props.focusAnchor) {
      props.anchor?.focus()
      return
    }
    const items = element.querySelectorAll<HTMLElement>('[role="menuitem"]')
    const target = props.last ? items[items.length - 1] : items[0]
    target?.focus()
  },
  { flush: 'post' },
)
let search = ''
let lastSearch = 0
function keydown(event: KeyboardEvent) {
  if (event.defaultPrevented) return
  if (event.key === 'Tab') {
    closeAll()
    return
  }
  if (props.submenu && event.key === 'ArrowLeft') {
    event.preventDefault()
    emit('close')
    return
  }
  // ActionMenu's mnemonic navigation focuses the next matching item, including repeated letters.
  if (event.key.length !== 1 || event.key === ' ' || event.altKey || event.ctrlKey || event.metaKey)
    return
  const now = Date.now()
  search = now - lastSearch > 500 ? event.key.toLowerCase() : search + event.key.toLowerCase()
  lastSearch = now
  const query = [...search].every((char) => char === search[0]) ? search[0] : search
  const items = Array.from(
    overlay.value?.element?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
  )
  const index = items.indexOf(document.activeElement as HTMLElement)
  const ordered = [...items.slice(index + 1), ...items.slice(0, index + 1)]
  const match = ordered.find((item) => item.textContent?.trim().toLowerCase().startsWith(query))
  if (match) {
    match.focus()
    event.preventDefault()
  }
}
</script>

<template>
  <Overlay
    ref="overlay"
    :open="open"
    :anchor="anchor"
    :side="submenu ? 'outside-right' : 'outside-bottom'"
    align="start"
    :return-focus-ref="returnFocus"
    :ignore-click-refs="ignoreClickRefs"
    :prevent-focus-on-open="true"
    data-component="ActionBar.MenuOverlay"
    @close="emit('close')"
    @keydown="keydown"
  >
    <ActionList
      :aria-label="anchor?.getAttribute('aria-label') ?? undefined"
      :aria-labelledby="anchor?.id || anchor?.getAttribute('aria-labelledby') || undefined"
    >
      <MenuItem v-for="(item, index) in menuEntries" :key="index" :item="item" />
    </ActionList>
  </Overlay>
</template>
