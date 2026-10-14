<script setup lang="ts">
import { useAttrs, useCssModule, useTemplateRef } from 'vue'
import VisuallyHidden from '../VisuallyHidden/VisuallyHidden.vue'
import type { CounterLabelComponentProps } from './types'

defineOptions({ name: 'CounterLabel', inheritAttrs: false })
const props = defineProps<CounterLabelComponentProps>()
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
const styles = useCssModule()
const element = useTemplateRef<HTMLSpanElement>('element')

function getCounterAttrs() {
  const { class: classValue, 'data-component': dataComponent, ...rest } = attrs
  return {
    'aria-hidden': 'true' as const,
    'data-variant': props.variant || props.scheme || 'secondary',
    ...rest,
    'data-component': dataComponent ?? 'CounterLabel',
    class: [props.className, classValue, styles['counter-label']],
  }
}

defineExpose({ element })
</script>

<template>
  <span ref="element" v-bind="getCounterAttrs()"><slot /></span>
  <VisuallyHidden>&nbsp;(<slot />)</VisuallyHidden>
</template>

<style module src="./CounterLabel.module.css" />
