<script setup lang="ts">
import { shallowRef, useAttrs, useCssModule } from 'vue'
import type { TextElement, TextOptions } from './types'

// eslint-disable-next-line vue/no-reserved-component-names -- Keep the public component name.
defineOptions({ name: 'Text', inheritAttrs: false })

const props = withDefaults(defineProps<TextOptions>(), { as: 'span' })
const attrs = useAttrs()
const styles = useCssModule()
const element = shallowRef<TextElement | null>(null)

function getRootAttrs() {
  const { class: classValue, ...rest } = attrs

  return {
    class: [props.className, classValue, styles['text']],
    'data-component': 'Text',
    'data-size': props.size,
    'data-weight': props.weight,
    'data-white-space': props.whiteSpace,
    ...rest
  }
}

defineExpose({ element })
</script>

<template>
  <component
    :is="as"
    ref="element"
    v-bind="getRootAttrs()"
  >
    <slot />
  </component>
</template>
<style module src="./Text.module.css" />
