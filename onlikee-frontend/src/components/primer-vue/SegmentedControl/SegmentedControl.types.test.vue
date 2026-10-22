<script setup lang="ts">
import { EyeIcon, PlusIcon } from '@onlikee/octicons-vue'
import { SegmentedControl } from './index'
import type { SegmentedControlProps, SegmentedControlIconButtonProps } from './types'

const props: SegmentedControlProps = {
  variant: { narrow: 'dropdown', wide: 'subtle' },
  fullWidth: { narrow: true },
}
const iconProps: SegmentedControlIconButtonProps = { 'aria-label': 'Preview', icon: EyeIcon }
const change = (_index: number) => {}
</script>

<template>
  <SegmentedControl v-bind="props" aria-label="File view" @change="change">
    <SegmentedControl.Button default-selected :leading-visual="EyeIcon" :count="0"
      >Preview</SegmentedControl.Button
    >
    <SegmentedControl.Divider :style="{ color: 'red' }" />
    <SegmentedControl.IconButton
      v-bind="iconProps"
      description="Preview file"
      tooltip-direction="n"
    />
    <SegmentedControl.Action label="Add view" :icon="PlusIcon" />
  </SegmentedControl>
  <!-- @vue-expect-error invalid size -->
  <SegmentedControl size="large" aria-label="Invalid size" />
  <!-- @vue-expect-error IconButton needs an accessible label -->
  <SegmentedControl.IconButton :icon="EyeIcon" />
  <!-- @vue-expect-error Action requires an icon -->
  <SegmentedControl.Action label="Add view" />
</template>
