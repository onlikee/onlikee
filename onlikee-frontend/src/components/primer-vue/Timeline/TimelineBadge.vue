<script setup lang="ts">
import { useAttrs } from 'vue'
import type { TimelineBadgeProps } from './types'
import { normalizeReactStyle } from '../internal/style'

defineOptions({ name: 'TimelineBadge', inheritAttrs: false })
defineProps<TimelineBadgeProps>()
const attrs = useAttrs()
</script>

<template>
  <div :class="$style.TimelineBadgeWrapper">
    <div
      v-bind="attrs"
      :class="[className, attrs.class, $style.TimelineBadge]"
      :style="normalizeReactStyle(attrs.style)"
      :data-variant="variant"
    >
      <slot />
    </div>
  </div>
</template>

<style module src="./Timeline.module.css" />
