<script setup lang="ts">
import { useAttrs, useCssModule, useTemplateRef } from 'vue'
import { normalizeReactStyle } from '../internal/style'
import type { DialogHeadingComponentProps } from './types'

defineOptions({ name: 'DialogSubtitle', displayName: 'Dialog.Subtitle', inheritAttrs: false })
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
    class: [props.className, classValue, styles.Subtitle],
    'data-component': 'Dialog.Subtitle',
  }
}
defineExpose({ element })
</script>

<template>
  <h2 ref="element" v-bind="bindings()"><slot /></h2>
</template>

<style module src="./Dialog.module.css"></style>
