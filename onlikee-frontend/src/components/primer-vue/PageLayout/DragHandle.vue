<script setup lang="ts">
import classes from './PageLayout.module.css'
import { onBeforeUnmount } from 'vue'
import { ARROW_KEY_STEP, defaultFormatValueText } from './usePaneWidth'
import { removeDraggingStyles, setDraggingStyles } from './paneUtils'
import type { DragHandleProps } from './types'
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<DragHandleProps>(), {
  formatValueText: defaultFormatValueText,
  'data-component': 'PageLayout.DragHandle',
})
let isDragging = false
let rafId: number | null = null
let pendingClientX: number | null = null
const targets = () => ({
  handle: props.handleRef.value,
  pane: props.dragTargetRef?.value ?? null,
  contentWrapper: props.contentWrapperRef?.value ?? null,
})
function startDragging() {
  if (isDragging) return
  setDraggingStyles(targets())
  isDragging = true
}
function endDragging() {
  if (!isDragging) return
  removeDraggingStyles(targets())
  isDragging = false
}
function pointerDown(event: PointerEvent) {
  if (event.button !== 0) return
  event.preventDefault()
  try {
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  } catch {
    // Pointer capture may be unavailable if the pointer has already been released.
  }
  props.onDragStart(event.clientX)
  startDragging()
}
function pointerMove(event: PointerEvent) {
  if (!isDragging) return
  event.preventDefault()
  pendingClientX = event.clientX
  if (rafId !== null) return
  rafId = requestAnimationFrame(() => {
    rafId = null
    if (pendingClientX !== null) {
      props.onDrag(pendingClientX, false)
      pendingClientX = null
    }
  })
}
function pointerUp(event: PointerEvent) {
  if (isDragging) event.preventDefault()
}
function lostPointerCapture() {
  if (!isDragging) return
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
    pendingClientX = null
  }
  endDragging()
  props.onDragEnd()
}
const isArrowKey = (key: string) =>
  ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)
function keyDown(event: KeyboardEvent) {
  if (!isArrowKey(event.key)) return
  event.preventDefault()
  startDragging()
  props.onDrag(
    ['ArrowLeft', 'ArrowDown'].includes(event.key) ? -ARROW_KEY_STEP : ARROW_KEY_STEP,
    true,
  )
}
function keyUp(event: KeyboardEvent) {
  if (!isArrowKey(event.key)) return
  event.preventDefault()
  endDragging()
  props.onDragEnd()
}
function setHandle(node: unknown) {
  // eslint-disable-next-line vue/no-mutating-props -- The source contract supplies a mutable DOM ref.
  props.handleRef.value = node as HTMLDivElement | null
}
onBeforeUnmount(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
})
const normalizedProps = props as typeof props & {
  ariaLabel?: string
  ariaLabelledby?: string
  dataComponent?: string
  ariaValuemin?: number
  ariaValuemax?: number
  ariaValuenow?: number
}
</script>
<template>
  <div
    :ref="setHandle"
    :class="classes.DraggableHandle"
    :data-component="normalizedProps.dataComponent ?? 'PageLayout.DragHandle'"
    role="slider"
    :aria-label="
      normalizedProps.ariaLabelledby
        ? undefined
        : (normalizedProps.ariaLabel ?? 'Draggable pane splitter')
    "
    :aria-labelledby="normalizedProps.ariaLabelledby"
    :aria-valuemin="normalizedProps.ariaValuemin"
    :aria-valuemax="normalizedProps.ariaValuemax"
    :aria-valuenow="normalizedProps.ariaValuenow"
    :aria-valuetext="
      normalizedProps.ariaValuenow !== undefined
        ? formatValueText(normalizedProps.ariaValuenow)
        : undefined
    "
    :tabindex="0"
    @pointerdown="pointerDown"
    @pointermove="pointerMove"
    @pointerup="pointerUp"
    @lostpointercapture="lostPointerCapture"
    @keydown="keyDown"
    @keyup="keyUp"
    @dblclick="onDoubleClick"
  />
</template>
