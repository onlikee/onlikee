<script setup lang="ts" generic="As extends keyof NativeElements | Component = 'span'">
import { computed, shallowRef, useAttrs, useCssModule } from 'vue'
import type { Component, NativeElements } from 'vue'
import type { TextComponentProps } from './types'
import { normalizeReactStyle } from '../internal/style'
import { resolveFocusTarget } from '../internal/focusTarget'

// eslint-disable-next-line vue/no-reserved-component-names -- Keep the public component name.
defineOptions({ name: 'Text', inheritAttrs: false })

const { as = 'span', className, size, weight, whiteSpace } = defineProps<TextComponentProps<As>>()
const attrs = useAttrs()
const styles = useCssModule()
const root = shallowRef<unknown>(null)
const element = computed(() =>
  typeof SVGElement !== 'undefined' && root.value instanceof SVGElement
    ? root.value
    : resolveFocusTarget(root.value),
)

function getRootAttrs() {
  const { class: classValue, ...rest } = attrs

  return {
    class: [className, classValue, styles['text']],
    'data-component': 'Text',
    'data-size': size,
    'data-weight': weight,
    'data-white-space': whiteSpace,
    ...rest,
    style: typeof as === 'string' ? normalizeReactStyle(attrs.style) : attrs.style,
  }
}

defineExpose({ element })
</script>

<template>
  <component :is="as" ref="root" v-bind="getRootAttrs()">
    <slot />
  </component>
</template>
<style module src="./Text.module.css" />
