<script setup lang="ts" generic="As extends keyof NativeElements | Component = 'summary'">
import { useAttrs, type Component, type NativeElements } from 'vue'
import type { SummaryComponentProps } from './types'
import { normalizeReactStyle } from '../internal/style'

defineOptions({ name: 'DetailsSummary', inheritAttrs: false })
const props = defineProps<SummaryComponentProps<As>>()
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
function bindings() {
  const { class: classValue, style, ...rest } = attrs
  return {
    as: !props.as || props.as === 'summary' ? null : 'summary',
    ...rest,
    class: [props.className, classValue],
    style: normalizeReactStyle(style),
    'data-component': 'Details.Summary',
  }
}
</script>

<template>
  <component :is="props.as ?? 'summary'" v-bind="bindings()">
    <slot />
  </component>
</template>
