<script setup lang="ts" generic="As extends keyof NativeElements | Component = 'span'">
import { computed, shallowRef, useAttrs } from 'vue'
import type { Component, NativeElements } from 'vue'
import type { LabelComponentProps, LabelInstance } from './types'
import { normalizeReactStyle } from '../internal/style'

// eslint-disable-next-line vue/no-reserved-component-names -- Preserve the Primer public name.
defineOptions({ name: 'Label', inheritAttrs: false })
const props = defineProps<LabelComponentProps<As>>()
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
const target = shallowRef<LabelInstance['element']>(null)
const element = computed<LabelInstance['element']>(() => {
  const node = target.value
  // Primer components expose their forwarded DOM ref through element.
  return node && 'element' in node ? (node as { element: LabelInstance['element'] }).element : node
})
defineExpose({ element })
</script>

<template>
  <component
    :is="props.as === undefined ? 'span' : props.as"
    ref="target"
    :class="[props.className, $style.Label]"
    :data-size="props.size === undefined ? 'small' : props.size"
    :data-variant="props.variant === undefined ? 'default' : props.variant"
    v-bind="attrs"
    :style="
      typeof props.as === 'string' || props.as === undefined
        ? normalizeReactStyle(attrs.style)
        : attrs.style
    "
    data-component="Label"
    ><slot
  /></component>
</template>

<style module src="./Label.module.css" />
