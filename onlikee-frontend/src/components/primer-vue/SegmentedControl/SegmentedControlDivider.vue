<script setup lang="ts">
import type { SegmentedControlDividerProps } from './types'
import { normalizeReactStyle } from '../internal/style'

defineOptions({
  name: 'SegmentedControlDivider',
  __SLOT__: Symbol('SegmentedControl.Divider'),
  inheritAttrs: false,
})
defineProps<SegmentedControlDividerProps>()
</script>

<template>
  <li
    aria-hidden="true"
    :class="[className, $attrs.class]"
    data-component="SegmentedControl.Divider"
    :style="normalizeReactStyle(style)"
  />
</template>
