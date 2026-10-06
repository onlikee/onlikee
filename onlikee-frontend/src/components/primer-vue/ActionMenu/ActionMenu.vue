<script setup lang="ts">
import { cloneVNode, computed, inject, isRef, onBeforeUnmount, onMounted, provide, shallowRef, toValue, useId, useSlots, watch, type VNode } from 'vue'
import { actionMenuContextKey } from './context'
import { assignElementRef } from '../internal/assignElementRef'
import type { ActionMenuProps, MenuCloseGesture } from './types'
import Anchor from './ActionMenuAnchor.vue'
import Button from './ActionMenuButton.vue'
import Overlay from './ActionMenuOverlay.vue'
import Tooltip from '../TooltipV2/Tooltip.vue'
import { isSlot } from '../composables/useSlots'

defineOptions({ name: 'ActionMenu', inheritAttrs: false })
const props = withDefaults(defineProps<ActionMenuProps>(), { open: undefined, anchorRef: undefined })
const emit = defineEmits<{ 'update:open': [open: boolean]; openChange: [open: boolean] }>()
const slots = useSlots()
const parent = inject(actionMenuContextKey, undefined)
const internalOpen = shallowRef(false)
const internalAnchor = shallowRef<HTMLElement | null>(null)
const anchorId = shallowRef(`${useId()}-anchor`)
const openingGesture = shallowRef<'mouse' | 'first' | 'last'>('first')
const fullscreen = shallowRef(false)
const open = computed(() => props.open ?? internalOpen.value)
const narrow = shallowRef(false)
const media = typeof window === 'undefined' ? undefined : window.matchMedia?.('(max-width: calc(768px - 0.02px))')
const updateMedia = () => { narrow.value = media?.matches ?? false }
onMounted(() => { updateMedia(); media?.addEventListener('change', updateMedia) })
onBeforeUnmount(() => media?.removeEventListener('change', updateMedia))
const anchor = computed(() => toValue(props.anchorRef) ?? internalAnchor.value)
let focusItem = (_last: boolean) => {}
function setOpen(value: boolean) {
  internalOpen.value = value
  emit('update:open', value)
  emit('openChange', value)
}
function close(gesture: MenuCloseGesture) {
  if (gesture === 'tab' && (fullscreen.value || narrow.value && props.open)) return
  setOpen(false)
  if (gesture === 'item-select' || gesture === 'tab') parent?.onClose(gesture)
}
function setAnchor(element: HTMLElement | null) {
  internalAnchor.value = element
  if (isRef(props.anchorRef)) assignElementRef(props.anchorRef, element)
  if (element?.id) anchorId.value = element.id
}
function click(event: MouseEvent, wasOpen: boolean) {
  if (event.defaultPrevented || event.button !== 0) return
  if (event.detail > 0) openingGesture.value = 'mouse'
  if (wasOpen) close('anchor-click')
  else setOpen(true)
}
function keydown(event: KeyboardEvent) {
  if (event.defaultPrevented) return
  if (event.key === 'Tab' && open.value) { close('tab'); return }
  if (event.key === 'ArrowRight' && parent) {
    openingGesture.value = 'first'; setOpen(true)
  } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    openingGesture.value = event.key === 'ArrowUp' ? 'last' : 'first'
    if (open.value) setTimeout(() => focusItem(event.key === 'ArrowUp'))
    else { setOpen(true); event.preventDefault() }
  } else if (!open.value && (event.key === ' ' || event.key === 'Enter')) {
    openingGesture.value = 'first'; setOpen(true); event.preventDefault()
  }
}
// Detached anchors own their toggle handler. Still infer the opening gesture
// and support arrows/Tab after the owner opens the menu.
watch(anchor, (element, _previous, onCleanup) => {
  if (!element || internalAnchor.value) return
  const inferClick = (event: MouseEvent) => { if (event.detail > 0) openingGesture.value = 'mouse' }
  const inferKey = (event: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'Enter', ' '].includes(event.key)) openingGesture.value = event.key === 'ArrowUp' ? 'last' : 'first'
    if (open.value) keydown(event)
  }
  element.addEventListener('click', inferClick)
  element.addEventListener('keydown', inferKey)
  onCleanup(() => { element.removeEventListener('click', inferClick); element.removeEventListener('keydown', inferKey) })
}, { flush: 'post', immediate: true })
provide(actionMenuContextKey, {
  open, anchor, anchorRefIdentity: computed(() => props.anchorRef ?? internalAnchor), anchorId,
  openingGesture, fullscreen, isSubmenu: Boolean(parent), setAnchor,
  onOpen: () => setOpen(true), onClose: close, onAnchorClick: click, onAnchorKeydown: keydown,
  setFocusItem: handler => { focusItem = handler }
})
defineExpose({ open, anchor, focus: () => anchor.value?.focus() })
// 提取的锚点在 Overlay 所在的插槽位置渲染。
const RenderContents = () => {
  const children = slots.default?.() ?? []
  const isAnchor = (child: VNode) => {
    if (isSlot(child, Anchor) || isSlot(child, Button)) return true
    if (!isSlot(child, Tooltip)) return false
    const tooltipChildren = child.children as { default?: () => VNode[] } | null
    return tooltipChildren?.default?.().some(node => isSlot(node, Button)) ?? false
  }
  const anchors = children.filter(isAnchor)
  return children.flatMap(child => isAnchor(child) ? [] : isSlot(child, Overlay) ? [...anchors.map(anchor => cloneVNode(anchor)), child] : [child])
}
</script>

<template>
  <RenderContents />
</template>
