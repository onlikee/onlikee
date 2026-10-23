<script setup lang="ts" generic="As extends keyof NativeElements | Component = 'div'">
import { computed, shallowRef, useAttrs } from 'vue'
import type { Component, NativeElements } from 'vue'
import { getResponsiveAttributes } from './responsive'
import type { StackItemComponentProps, StackInstance } from './types'
import { normalizeReactStyle } from '../internal/style'
import { resolveFocusTarget } from '../internal/focusTarget'

defineOptions({ name: 'StackItem', inheritAttrs: false })
const {
  as = 'div',
  grow = undefined,
  shrink = undefined,
  className,
} = defineProps<StackItemComponentProps<As>>()
const attrs = useAttrs()
const element = shallowRef<StackInstance['element']>(null)
function setElement(node: unknown) {
  element.value = node instanceof SVGElement ? node : resolveFocusTarget(node)
}
defineExpose({ element })
const responsiveAttributes = computed(() => ({
  ...getResponsiveAttributes('grow', grow),
  ...getResponsiveAttributes('shrink', shrink),
}))
</script>

<template>
  <component
    :is="as === undefined ? 'div' : as"
    :ref="setElement"
    v-bind="{ ...attrs, ...responsiveAttributes }"
    :class="[className, $style.StackItem]"
    :style="
      typeof as === 'string' || as === undefined ? normalizeReactStyle(attrs.style) : attrs.style
    "
    data-component="StackItem"
  >
    <slot />
  </component>
</template>
<style module src="./Stack.module.css" />
