<script setup lang="ts">
import { inject } from 'vue'
import { treeViewItemKey, defaultItemContext } from './context'
import type { TreeViewVisualProps } from './types'
import classes from './TreeView.module.css'
defineOptions({ name: 'TreeViewLeadingAction', inheritAttrs: false })
defineProps<TreeViewVisualProps>()
defineSlots<{ default?: (props: { isExpanded: boolean }) => unknown }>()
const item = inject(treeViewItemKey, defaultItemContext)
</script>
<template>
  <div
    :class="['PRIVATE_VisuallyHidden', classes.prcTreeViewTreeViewVisuallyHidden]"
    aria-hidden="true"
  >
    {{ label }}
  </div>
  <div
    :class="['PRIVATE_TreeView-item-leading-action', classes.prcTreeViewTreeViewItemLeadingAction]"
    aria-hidden="true"
  >
    <slot :is-expanded="item.isExpanded.value" />
  </div>
</template>
