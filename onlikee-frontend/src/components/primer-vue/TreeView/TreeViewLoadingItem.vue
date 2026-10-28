<script setup lang="ts">
import { computed, provide, shallowRef, useId } from 'vue'
import Item from './TreeViewItem.vue'
import LeadingVisual from './TreeViewLeadingVisual.vue'
import { loadingPlaceholderKey } from './context'
import { SkeletonAvatar } from '../SkeletonAvatar'
import { SkeletonText } from '../SkeletonText'
import Spinner from '../Spinner/Spinner.vue'
import Text from '../Text/Text.vue'
import type { TreeViewItemInstance } from './types'
import classes from './TreeView.module.css'
defineOptions({ name: 'TreeViewLoadingItem', inheritAttrs: false })
defineProps<{ count?: number }>()
provide(loadingPlaceholderKey, true)
const itemId = useId()
const item = shallowRef<TreeViewItemInstance | null>(null)
const element = computed(() => item.value?.element ?? null)
defineExpose({ element })
</script>
<template>
  <Item v-if="count" :id="itemId" ref="item">
    <span
      v-for="i in count"
      :key="i"
      :class="[
        classes.prcTreeViewTreeViewSkeletonItemContainerStyle,
        'PRIVATE_TreeView-item-skeleton',
      ]"
    >
      <SkeletonAvatar :size="16" square />
      <SkeletonText :class-name="classes.prcTreeViewTreeItemSkeletonTextStyles" />
    </span>
    <div :class="['PRIVATE_VisuallyHidden', classes.prcTreeViewTreeViewVisuallyHidden]">
      Loading {{ count }} items
    </div>
  </Item>
  <Item v-else :id="itemId" ref="item">
    <LeadingVisual><Spinner size="small" /></LeadingVisual>
    <Text class="fgColor-muted">Loading...</Text>
  </Item>
</template>
