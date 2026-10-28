<script setup lang="ts">
import { inject } from 'vue'
import { FileDirectoryFillIcon, FileDirectoryOpenFillIcon } from '@onlikee/octicons-vue'
import { treeViewItemKey, defaultItemContext } from './context'
import classes from './TreeView.module.css'
defineOptions({ name: 'TreeViewDirectoryIcon', inheritAttrs: false })
const item = inject(treeViewItemKey, defaultItemContext)
</script>
<template>
  <div :class="['PRIVATE_TreeView-directory-icon', classes.prcTreeViewTreeViewDirectoryIcon]">
    <component :is="item.isExpanded.value ? FileDirectoryOpenFillIcon : FileDirectoryFillIcon" />
  </div>
</template>
