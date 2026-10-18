<script setup lang="ts">
import { shallowRef, useAttrs } from 'vue'
import { useFeatureFlag } from '../FeatureFlags'
import type { TimelineBreakProps } from './types'
import { normalizeReactStyle } from '../internal/style'

defineOptions({ name: 'TimelineBreak', inheritAttrs: false })
defineProps<TimelineBreakProps>()
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
    :class="[className, attrs.class, $style.TimelineBreak]"
    :style="normalizeReactStyle(attrs.style)"
    :role="listSemantics ? 'presentation' : attrs.role"
  >
    <slot />
  </component>
</template>

<style module src="./Timeline.module.css" />
