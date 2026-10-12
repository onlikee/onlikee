<script setup lang="ts" generic="As extends keyof NativeElements | Component = 'div'">
import { Comment, Fragment, h, shallowRef, useAttrs, useCssModule, useSlots } from 'vue'
import type { Component, ComponentPublicInstance, NativeElements, VNode } from 'vue'
import { FocusKeys, useFocusZone } from '../composables/useFocusZone'
import type { ButtonGroupComponentProps } from './types'

defineOptions({ name: 'ButtonGroup', inheritAttrs: false })
const props = defineProps<ButtonGroupComponentProps<As>>()
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
const slots = useSlots()
const styles = useCssModule()
const element = shallowRef<Element | ComponentPublicInstance | null>(null)
const container = shallowRef<HTMLElement | null>(null)

function setElement(node: Element | ComponentPublicInstance | null) {
  element.value = node
  const instance = node as { element?: unknown; $el?: unknown } | null
  const root = node instanceof HTMLElement ? node : (instance?.element ?? instance?.$el)
  container.value = root instanceof HTMLElement ? root : null
}
if (typeof document !== 'undefined') {
  useFocusZone(() => ({
    containerRef: container,
    disabled: props.role !== 'toolbar',
    bindKeys: FocusKeys.ArrowHorizontal,
    focusOutBehavior: 'wrap',
  }))
}

function getRootAttrs() {
  const { class: classValue, ...rest } = attrs
  return {
    class: [props.className, classValue, styles.ButtonGroup],
    role: props.role,
    ...rest,
    'data-component': 'ButtonGroup',
  }
}

function groupChildren(nodes: VNode[]): VNode[] {
  return nodes.flatMap((node) => {
    // Template v-for fragments represent an array; explicit fragments remain a single item.
    if (node.type === Fragment && node.patchFlag > 0 && Array.isArray(node.children)) {
      return groupChildren(node.children as VNode[])
    }
    // Ignore source comments, but retain empty conditional children as React.Children.map does.
    if (node.type === Comment && node.children && node.children !== 'v-if') return []
    return [node]
  })
}
const Items = () =>
  groupChildren(slots.default?.() ?? []).map((child, index) =>
    h('div', { key: index, class: styles.Item }, [child]),
  )

defineExpose({ element })
</script>

<template>
  <component :is="as ?? 'div'" :ref="setElement" v-bind="getRootAttrs()">
    <Items />
  </component>
</template>

<style module src="./ButtonGroup.module.css" />
