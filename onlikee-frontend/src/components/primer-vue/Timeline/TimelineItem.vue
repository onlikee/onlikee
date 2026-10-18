<script setup lang="ts">
import { shallowRef, useAttrs } from 'vue'
import { useFeatureFlag } from '../FeatureFlags'
import type { TimelineItemProps } from './types'
import { normalizeReactStyle } from '../internal/style'

defineOptions({ name: 'TimelineItem', inheritAttrs: false })
defineProps<TimelineItemProps>()
const attrs = useAttrs()
const listSemantics = useFeatureFlag('primer_react_timeline_list_semantics')
const element = shallowRef<HTMLDivElement | HTMLLIElement | null>(null)
defineExpose({ element })
</script>

<template>
  <component
    :is="listSemantics ? 'li' : 'div'"
    v-bind="attrs"
    ref="element"
    :class="[className, attrs.class, 'Timeline-Item', $style.TimelineItem]"
    :style="normalizeReactStyle(attrs.style)"
    :data-condensed="condensed ? '' : undefined"
  >
    <slot />
  </component>
</template>

<style module src="./Timeline.module.css" />
