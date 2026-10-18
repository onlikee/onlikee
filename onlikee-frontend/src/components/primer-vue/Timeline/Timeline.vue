<script setup lang="ts">
import { computed, shallowRef, useAttrs } from 'vue'
import { useFeatureFlag } from '../FeatureFlags'
import type { TimelineProps } from './types'
import { normalizeReactStyle } from '../internal/style'

defineOptions({ name: 'Timeline', inheritAttrs: false })
const props = defineProps<TimelineProps>()
const attrs = useAttrs()
const listSemantics = useFeatureFlag('primer_react_timeline_list_semantics')
const clip = computed(() => {
  if (props.clipSidebar === true || props.clipSidebar === 'both') return 'both'
  if (props.clipSidebar === 'start' || props.clipSidebar === 'end') return props.clipSidebar
  return undefined
})
const element = shallowRef<HTMLDivElement | HTMLOListElement | null>(null)
defineExpose({ element })
</script>

<template>
  <component
    :is="listSemantics ? 'ol' : 'div'"
    v-bind="attrs"
    ref="element"
    :class="[className, attrs.class, $style.Timeline]"
    :style="normalizeReactStyle(attrs.style)"
    :role="listSemantics ? 'list' : attrs.role"
    :data-clip-sidebar="clip"
  >
    <slot />
  </component>
</template>

<style module src="./Timeline.module.css"></style>
