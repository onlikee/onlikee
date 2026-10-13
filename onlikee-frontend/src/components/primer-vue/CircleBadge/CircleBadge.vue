<script setup lang="ts" generic="As extends keyof NativeElements | Component = 'div'">
import { computed, shallowRef, useAttrs } from 'vue'
import type { Component, ComponentPublicInstance, NativeElements } from 'vue'
import type { CircleBadgeComponentProps } from './types'
import classes from './CircleBadge.module.css'
import { normalizeReactStyle } from '../internal/style'

defineOptions({ name: 'CircleBadge', inheritAttrs: false })
const props = defineProps<CircleBadgeComponentProps<As>>()
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
const element = shallowRef<HTMLElement | SVGElement | null>(null)
const variantSizes = { small: 56, medium: 96, large: 128 }
const sizeStyle = computed(() => {
  const numeric =
    !Number.isNaN(Number.parseFloat(String(props.size))) && Number.isFinite(Number(props.size))
  const size = numeric ? props.size : variantSizes[props.variant ?? 'medium']
  return normalizeReactStyle({ width: size, height: size })
})

function setElement(node: Element | ComponentPublicInstance | null) {
  const instance = node as {
    element?: HTMLElement | SVGElement
    $el?: HTMLElement | SVGElement
  } | null
  element.value =
    node instanceof Element
      ? (node as HTMLElement | SVGElement)
      : (instance?.element ?? instance?.$el ?? null)
}
function bindings() {
  const { class: classValue, style: _style, ...rest } = attrs
  return {
    ...rest,
    ...(props.variant !== undefined ? { variant: props.variant } : {}),
    ...(props.size !== undefined ? { size: props.size } : {}),
    'data-component': 'CircleBadge',
    class: [classes['prc-CircleBadge-CircleBadge'], props.className, classValue],
    'data-inline': props.inline ? '' : undefined,
    style: sizeStyle.value,
  }
}
defineExpose({ element })
</script>

<template>
  <component :is="as ?? 'div'" :ref="setElement" v-bind="bindings()"><slot /></component>
</template>
