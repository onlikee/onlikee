<script setup lang="ts">
import { inject } from 'vue'
import { treeViewItemKey, defaultItemContext } from './context'
import type { TreeViewActionDialogProps } from './types'
import { Dialog } from '../Dialog'
import { ActionList } from '../ActionList'
import VisuallyHidden from '../VisuallyHidden/VisuallyHidden.vue'
defineOptions({ name: 'TreeViewActionDialog', inheritAttrs: false })
const props = defineProps<TreeViewActionDialogProps>()
const item = inject(treeViewItemKey, defaultItemContext)
function onClose() {
  props.onClose?.()
  setTimeout(() => document.getElementById(item.itemId.value)?.focus())
}
function onKeyDown(event: KeyboardEvent) {
  if (['Backspace', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter'].includes(event.key))
    event.stopPropagation()
}
</script>
<template>
  <div @click.stop @keydown="onKeyDown">
    <Dialog title="Supplemental actions" :on-close="onClose">
      <ActionList>
        <ActionList.Item v-for="(action, index) in items" :key="index" @select="action.onClick">
          <ActionList.LeadingVisual><component :is="action.icon" /></ActionList.LeadingVisual>
          {{ action.label }}
          <ActionList.TrailingVisual v-if="action.count"
            >{{ action.count }}<VisuallyHidden>items</VisuallyHidden></ActionList.TrailingVisual
          >
        </ActionList.Item>
      </ActionList>
    </Dialog>
  </div>
</template>
