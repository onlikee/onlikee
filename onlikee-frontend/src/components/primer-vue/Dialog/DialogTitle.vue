<script setup lang="ts">
import { useAttrs, useCssModule, useTemplateRef } from 'vue'
import { normalizeReactStyle } from '../internal/style'
import type { DialogHeadingComponentProps } from './types'

defineOptions({ name: 'DialogTitle', displayName: 'Dialog.Title', inheritAttrs: false })
const props = defineProps<DialogHeadingComponentProps>()
defineSlots<{ default?: () => unknown }>()
const attrs = useAttrs()
const styles = useCssModule()
const element = useTemplateRef<HTMLHeadingElement>('element')
function bindings() {
  const { class: classValue, ...rest } = attrs
  return {
    ...rest,
    style: normalizeReactStyle(rest.style),
    class: [props.className, classValue, styles.Title],
    'data-component': 'Dialog.Title',
  }
}
defineExpose({ element })
</script>

<template>
  <h1 ref="element" v-bind="bindings()"><slot /></h1>
</template>

<style module src="./Dialog.module.css"></style>
