<script setup lang="ts" generic="As extends keyof NativeElements | Component = 'div'">
import { computed, shallowRef, useAttrs } from 'vue'
import type { Component, NativeElements } from 'vue'
import { getResponsiveAttributes } from './responsive'
import type { StackComponentProps, StackInstance } from './types'
import { normalizeReactStyle } from '../internal/style'
import { resolveFocusTarget } from '../internal/focusTarget'

defineOptions({ name: 'Stack', inheritAttrs: false })
const {
  as = 'div',
  direction = 'vertical',
  align = 'stretch',
  wrap = 'nowrap',
  justify = 'start',
  padding = 'none',
  gap,
  paddingBlock,
  paddingInline,
  className,
} = defineProps<StackComponentProps<As>>()
const attrs = useAttrs()
const element = shallowRef<StackInstance['element']>(null)
function setElement(node: unknown) {
  element.value = node instanceof SVGElement ? node : resolveFocusTarget(node)
}
defineExpose({ element })
const responsiveAttributes = computed(() => ({
  ...getResponsiveAttributes('gap', gap),
  ...getResponsiveAttributes('direction', direction),
  ...getResponsiveAttributes('align', align),
  ...getResponsiveAttributes('wrap', wrap),
  ...getResponsiveAttributes('justify', justify),
  ...getResponsiveAttributes('padding', padding),
  ...getResponsiveAttributes('padding-block', paddingBlock),
  ...getResponsiveAttributes('padding-inline', paddingInline),
}))
</script>

<template>
  <component
    :is="as"
    :ref="setElement"
    v-bind="{ ...attrs, ...responsiveAttributes }"
    :class="[className, $style.Stack]"
    :style="typeof as === 'string' ? normalizeReactStyle(attrs.style) : attrs.style"
    data-component="Stack"
  >
    <slot />
  </component>
</template>
<style module src="./Stack.module.css" />
