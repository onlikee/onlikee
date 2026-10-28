<script setup lang="ts">
import { inject } from 'vue'
import { treeViewItemKey, defaultItemContext } from './context'
import type { TreeViewTrailingAction } from './types'
import { Tooltip } from '../Tooltip'
import { Button, IconButton } from '../Button'
import classes from './TreeView.module.css'
defineOptions({ name: 'TreeViewTrailingAction', inheritAttrs: false })
defineProps<TreeViewTrailingAction>()
const item = inject(treeViewItemKey, defaultItemContext)
function focusItem() {
  document.getElementById(item.itemId.value)?.focus()
}
</script>
<template>
  <div
    :id="item.trailingActionId"
    :class="['PRIVATE_VisuallyHidden', classes.prcTreeViewTreeViewVisuallyHidden]"
  >
    - {{ shortcutText }}
  </div>
  <div
    :class="classes.prcTreeViewTreeViewItemTrailingAction"
    aria-hidden="true"
    @click.stop
    @keydown.stop
  >
    <template v-for="(action, index) in items" :key="index">
      <Tooltip v-if="action.count" :text="action.label">
        <Button
          :aria-label="action.label"
          :leading-visual="action.icon"
          variant="invisible"
          :class-name="action.className"
          :class="classes.prcTreeViewTreeViewItemTrailingActionButton"
          :tabindex="-1"
          aria-hidden="true"
          :count="action.count"
          @click="action.onClick"
          @keydown="focusItem"
        />
      </Tooltip>
      <IconButton
        v-else
        :icon="action.icon"
        variant="invisible"
        :aria-label="action.label"
        :class-name="action.className"
        :class="classes.prcTreeViewTreeViewItemTrailingActionButton"
        :tabindex="-1"
        aria-hidden="true"
        @click="action.onClick"
        @keydown="focusItem"
      />
    </template>
  </div>
</template>
