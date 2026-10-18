<script setup lang="ts">
import { shallowRef, useAttrs } from 'vue'
import type { TimelineAvatarProps } from './types'
import { normalizeReactStyle } from '../internal/style'

defineOptions({ name: 'TimelineAvatar', inheritAttrs: false })
defineProps<TimelineAvatarProps>()
const attrs = useAttrs()
const element = shallowRef<HTMLDivElement | null>(null)
defineExpose({ element })
</script>

<template>
  <div
    v-bind="attrs"
    ref="element"
    :class="[className, attrs.class, $style.TimelineItemAvatar]"
    :style="normalizeReactStyle(attrs.style)"
  >
    <slot />
  </div>
</template>

<style module src="./Timeline.module.css" />
