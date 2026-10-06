<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import Button from '../SelectPanel/SelectPanelButton.vue'
import MenuOverlay from './ActionBarMenuOverlay.vue'
import { useActionBarItem } from './context'
import type { ActionBarMenuProps } from './types'

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<ActionBarMenuProps>(), { loading: undefined, inactive: undefined, labelWrap: undefined })
const normalizedProps = props as typeof props & { ariaLabel: string }
const buttonProps = computed(() => {
  const { ariaLabel, items: _items, overflowIcon: _overflowIcon, returnFocusRef: _returnFocusRef, ...rest } = normalizedProps
  return { ...rest, 'aria-label': ariaLabel }
})
const emit = defineEmits<{ click: [event: MouseEvent] }>()
const open = shallowRef(false)
const last = shallowRef(false)
const focusAnchor = shallowRef(false)
const { element, setElement, dataOverflowing, overflowing, size } = useActionBarItem(() => ({
  label: normalizedProps.ariaLabel, items: props.items,
  leadingVisual: props.overflowIcon === 'none' ? undefined : props.overflowIcon ?? props.icon,
  returnFocusRef: props.returnFocusRef
}))
function click(event: MouseEvent) {
  if (props.disabled || props.loading) return
  emit('click', event)
  if (!event.defaultPrevented) { last.value = false; focusAnchor.value = event.detail > 0; open.value = !open.value }
}
function keydown(event: KeyboardEvent) {
  if (event.key === 'Tab' && open.value) { open.value = false; return }
  if (event.defaultPrevented || props.disabled || props.loading || !['ArrowDown', 'ArrowUp'].includes(event.key)) return
  last.value = event.key === 'ArrowUp'
  focusAnchor.value = false
  open.value = true
  event.preventDefault()
}
watch(overflowing, value => { if (value) open.value = false })
defineExpose({ element, focus: (options?: FocusOptions) => element.value?.focus(options) })
</script>

<template>
  <Button
    v-bind="{ ...$attrs, ...buttonProps }"
    :ref="setElement"
    variant="invisible"
    :size="props.size ?? size"
    data-component="ActionBar.Menu.IconButton"
    :data-overflowing="dataOverflowing"
    aria-haspopup="true"
    :aria-expanded="open"
    @click="click"
    @keydown="keydown"
  />
  <MenuOverlay
    :open="open"
    :anchor="element"
    :items="items"
    :return-focus-ref="returnFocusRef"
    :last="last"
    :focus-anchor="focusAnchor"
    @close="open = false"
  />
</template>
