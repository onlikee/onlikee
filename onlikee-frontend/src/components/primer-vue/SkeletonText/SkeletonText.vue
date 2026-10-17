<script setup lang="ts">
import { useAttrs } from 'vue'
import { SkeletonBox } from '../Skeleton'
import type { SkeletonTextOptions } from './types'

defineOptions({ name: 'SkeletonText', inheritAttrs: false })
withDefaults(defineProps<SkeletonTextOptions>(), { lines: 1, size: 'bodyMedium' })
const attrs = useAttrs()
function length(value: string | number | undefined) {
  return typeof value === 'number' ? `${value}px` : value
}
</script>

<template>
  <SkeletonBox
    v-if="lines < 2"
    v-bind="attrs"
    :data-text-skeleton-size="size"
    width="100%"
    :class="[className, $style.SkeletonText]"
    :style="[attrs.style as never, { maxWidth: length(maxWidth) }]"
    data-component="SkeletonText"
  />
  <div
    v-else
    data-component="multilineContainer"
    :class="$style.SkeletonTextWrapper"
    :style="[attrs.style as never, { maxWidth: length(maxWidth) }]"
  >
    <SkeletonBox
      v-for="index in Math.floor(lines)"
      :key="index"
      v-bind="attrs"
      data-component="SkeletonText"
      data-in-multiline="true"
      :data-text-skeleton-size="size"
      :class="[className, $style.SkeletonText]"
      :style="undefined"
    />
  </div>
</template>

<style module src="./SkeletonText.module.css" />
