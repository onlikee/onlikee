<script setup lang="ts" generic="As extends keyof NativeElements | Component = 'a'">
import { shallowRef, useAttrs } from 'vue'
import type { Component, ComponentPublicInstance, NativeElements } from 'vue'
import type { BreadcrumbsItemComponentProps } from './types'
import classes from './Breadcrumbs.module.css'
import { normalizeReactStyle } from '../internal/style'

defineOptions({ name: 'BreadcrumbsItem', inheritAttrs: false })
const props = withDefaults(defineProps<BreadcrumbsItemComponentProps<As>>(), {
  selected: undefined,
})
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
const element = shallowRef<HTMLElement | SVGElement | null>(null)

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
  const { class: classValue, style, ...rest } = attrs
  return {
    class: [props.className, classValue, classes.Item, props.selected && 'selected'],
    'aria-current': props.selected ? 'page' : undefined,
    'data-component': 'Breadcrumbs.Item',
    ...rest,
    ...(props.to !== undefined ? { to: props.to } : {}),
    style: normalizeReactStyle(style),
  }
}
defineExpose({ element })
</script>

<template>
  <component :is="as ?? 'a'" :ref="setElement" v-bind="bindings()">
    <slot />
  </component>
</template>
