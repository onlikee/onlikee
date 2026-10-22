<script setup lang="ts">
import { h, inject, type VNodeChild } from 'vue'
import { ActionList } from '../ActionList'
import { IconButton } from '../Button'
import { segmentedControlActionContext } from './context'
import type { SegmentedControlActionProps } from './types'

defineOptions({
  name: 'SegmentedControlAction',
  __SLOT__: Symbol('SegmentedControl.Action'),
  inheritAttrs: false,
})
const props = defineProps<SegmentedControlActionProps>()
const variant = inject(segmentedControlActionContext, 'inline')
function menuAction(wrapperProps: Record<string, unknown>, children: VNodeChild[]) {
  return h('div', { ...wrapperProps, 'data-component': 'SegmentedControl.Action' }, children)
}
function select(event: MouseEvent | KeyboardEvent) {
  event.preventDefault()
  props.onClick?.()
}
</script>

<template>
  <template v-if="variant === 'menu'">
    <ActionList.Divider />
    <ActionList.Item
      role="menuitem"
      :disabled="disabled"
      :loading="loading"
      :private-item-wrapper="menuAction"
      @select="select"
    >
      <ActionList.LeadingVisual><component :is="icon" /></ActionList.LeadingVisual>
      {{ label }}
    </ActionList.Item>
  </template>
  <div v-else :class="$style.ActionItem" data-component="SegmentedControl.Action">
    <IconButton
      :aria-label="label"
      :class="$style.ActionButton"
      :disabled="disabled"
      :icon="icon"
      :loading="loading"
      variant="invisible"
      @click="props.onClick?.()"
    />
  </div>
</template>

<style module src="./SegmentedControl.module.css" />
