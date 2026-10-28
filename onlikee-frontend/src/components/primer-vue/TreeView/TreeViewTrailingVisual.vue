<script setup lang="ts">
import { inject } from 'vue'
import { treeViewItemKey, defaultItemContext } from './context'
import type { TreeViewVisualProps } from './types'
import classes from './TreeView.module.css'
defineOptions({ name: 'TreeViewTrailingVisual', inheritAttrs: false })
defineProps<TreeViewVisualProps>()
defineSlots<{ default?: (props: { isExpanded: boolean }) => unknown }>()
const item = inject(treeViewItemKey, defaultItemContext)
</script>
<template>
  <div
    :id="item.trailingVisualId"
    :class="['PRIVATE_VisuallyHidden', classes.prcTreeViewTreeViewVisuallyHidden]"
    aria-hidden="true"
  >
    {{ label }}
  </div>
  <div
    :class="['PRIVATE_TreeView-item-visual', classes.prcTreeViewTreeViewItemVisual]"
    aria-hidden="true"
  >
    <slot :is-expanded="item.isExpanded.value" />
  </div>
</template>
