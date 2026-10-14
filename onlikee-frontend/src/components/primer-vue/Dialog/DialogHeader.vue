<script setup lang="ts" generic="As extends keyof NativeElements | Component = 'div'">
import { useAttrs, useCssModule, useTemplateRef } from 'vue'
import { normalizeReactStyle } from '../internal/style'
import type { Component, NativeElements } from 'vue'
import type { DialogSectionComponentProps } from './types'

defineOptions({
  name: 'DialogHeader',
  displayName: 'Dialog.Header',
  inheritAttrs: false,
  __SLOT__: Symbol('Dialog.Header'),
})
const props = defineProps<DialogSectionComponentProps<As>>()
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
const styles = useCssModule()
const element = useTemplateRef<HTMLDivElement>('element')
function bindings() {
  const { class: classValue, ...rest } = attrs
  return {
    ...rest,
    style: normalizeReactStyle(rest.style),
    as: typeof props.as === 'function' ? undefined : props.as,
    class: [props.className, classValue, styles.Header],
    'data-component': 'Dialog.Header',
  }
}
defineExpose({ element })
</script>

<template>
  <div ref="element" v-bind="bindings()"><slot /></div>
</template>

<style module src="./Dialog.module.css"></style>
