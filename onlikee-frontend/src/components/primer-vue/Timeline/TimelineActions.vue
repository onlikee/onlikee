<script setup lang="ts">
import { shallowRef, useAttrs } from 'vue'
import type { TimelineActionsProps } from './types'
import { normalizeReactStyle } from '../internal/style'

defineOptions({ name: 'TimelineActions', inheritAttrs: false })
defineProps<TimelineActionsProps>()
const attrs = useAttrs()
const element = shallowRef<HTMLDivElement | null>(null)
defineExpose({ element })
</script>

<template>
  <div
    v-bind="attrs"
    ref="element"
    :class="[className, attrs.class, $style.TimelineItemActions]"
    :style="normalizeReactStyle(attrs.style)"
  >
    <slot />
  </div>
</template>

<style module src="./Timeline.module.css" />
