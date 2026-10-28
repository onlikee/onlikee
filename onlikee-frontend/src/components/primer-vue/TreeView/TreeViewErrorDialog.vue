<script setup lang="ts">
import { inject } from 'vue'
import { treeViewItemKey, defaultItemContext } from './context'
import type { TreeViewErrorDialogProps } from './types'
import { ConfirmationDialog } from '../ConfirmationDialog'
import type { ConfirmationDialogCloseGesture } from '../ConfirmationDialog/types'
defineOptions({ name: 'TreeViewErrorDialog', inheritAttrs: false })
const props = withDefaults(defineProps<TreeViewErrorDialogProps>(), { title: 'Error' })
defineSlots<{ default?: () => unknown }>()
const item = inject(treeViewItemKey, defaultItemContext)
function onClose(gesture: ConfirmationDialogCloseGesture) {
  setTimeout(() => document.getElementById(item.itemId.value)?.focus())
  if (gesture === 'confirm') props.onRetry?.()
  else {
    item.setIsExpanded(false)
    props.onDismiss?.()
  }
}
function onKeyDown(event: KeyboardEvent) {
  if (['Backspace', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter'].includes(event.key))
    event.stopPropagation()
}
</script>
<template>
  <div @keydown="onKeyDown">
    <ConfirmationDialog
      :title="title"
      :on-close="onClose"
      confirm-button-content="Retry"
      cancel-button-content="Dismiss"
      ><slot
    /></ConfirmationDialog>
  </div>
</template>
