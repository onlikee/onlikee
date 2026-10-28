<script setup lang="ts" generic="As extends keyof NativeElements | Component = 'a'">
import { shallowRef, useAttrs, useCssModule } from 'vue'
import type { Component, ComponentPublicInstance, NativeElements } from 'vue'
import type { TopicTagComponentProps, TopicTagElement } from './types'
import { normalizeReactStyle } from '../internal/style'

defineOptions({ name: 'TopicTag', inheritAttrs: false })
const props = defineProps<TopicTagComponentProps<As>>()
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
const styles = useCssModule()
const element = shallowRef<TopicTagElement<As> | null>(null)

function setElement(node: Element | ComponentPublicInstance | null) {
  element.value = node as TopicTagElement<As> | null
}

function getRootAttrs() {
  const { class: classValue, ...rest } = attrs
  return {
    ...rest,
    class: [props.className, classValue, styles['prc-TopicTag-TopicTag']],
    style:
      typeof props.as === 'string' || props.as == null
        ? normalizeReactStyle(attrs.style)
        : attrs.style,
  }
}

defineExpose({ element })
</script>

<template>
  <component :is="as ?? 'a'" :ref="setElement" v-bind="getRootAttrs()">
    <slot />
  </component>
</template>

<style module src="./TopicTag.module.css" />
