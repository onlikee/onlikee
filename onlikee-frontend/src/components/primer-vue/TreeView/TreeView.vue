<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide, shallowRef, useAttrs } from 'vue'
import VisuallyHidden from '../VisuallyHidden/VisuallyHidden.vue'
import AriaStatus from '../internal/components/AriaStatus.vue'
import { normalizeReactStyle } from '../internal/style'
import { treeViewRootKey } from './context'
import { useRovingTabIndex } from './useRovingTabIndex'
import { useTypeahead } from './useTypeahead'
import type { TreeViewComponentProps } from './types'
import classes from './TreeView.module.css'

defineOptions({ name: 'TreeView', inheritAttrs: false })
withDefaults(defineProps<TreeViewComponentProps>(), { flat: undefined, truncate: true })
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
const element = shallowRef<HTMLUListElement | null>(null)
const mouseDown = shallowRef(false)
const message = shallowRef('')
let pendingScroll: number | null = null
function getLabelAttrs() {
  return {
    'aria-label': attrs['aria-label'] as string | undefined,
    'aria-labelledby': attrs['aria-labelledby'] as string | undefined,
  }
}

provide(treeViewRootKey, {
  announceUpdate: (value) => {
    message.value = value
  },
  expandedStateCache: new Map(),
  scrollElementIntoView: (node) => {
    if (!node) return
    if (pendingScroll !== null) cancelAnimationFrame(pendingScroll)
    pendingScroll = requestAnimationFrame(() => {
      pendingScroll = null
      if (node.isConnected) node.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    })
  },
})
useRovingTabIndex({ containerRef: element, mouseDownRef: mouseDown })
useTypeahead({ containerRef: element, onFocusChange: (node) => node.focus() })
function onMouseUp() {
  mouseDown.value = false
}
onMounted(() => document.addEventListener('mouseup', onMouseUp))
onBeforeUnmount(() => {
  document.removeEventListener('mouseup', onMouseUp)
  if (pendingScroll !== null) cancelAnimationFrame(pendingScroll)
})
defineExpose({ element })
</script>

<template>
  <VisuallyHidden
    ><AriaStatus announce-on-show>{{ message }}</AriaStatus></VisuallyHidden
  >
  <ul
    ref="element"
    role="tree"
    v-bind="getLabelAttrs()"
    :data-omit-spacer="flat"
    :data-truncate-text="truncate || false"
    :class="[className, attrs.class, classes.prcTreeViewTreeViewRootUlStyles]"
    :style="normalizeReactStyle(style)"
    @mousedown="mouseDown = true"
  >
    <slot />
  </ul>
</template>
