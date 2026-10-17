<script setup lang="ts">
import { shallowRef, useAttrs } from 'vue'
import type { LabelOptions } from './types'

// eslint-disable-next-line vue/no-reserved-component-names -- Preserve the Primer public name.
defineOptions({ name: 'Label', inheritAttrs: false })
withDefaults(defineProps<LabelOptions>(), { as: 'span', size: 'small', variant: 'default' })
const attrs = useAttrs()
const element = shallowRef<HTMLElement | null>(null)
defineExpose({ element })
</script>

<template>
  <component
    :is="as"
    ref="element"
    :class="[className, $style.Label]"
    :data-size="size"
    :data-variant="variant"
    v-bind="attrs"
    data-component="Label"
    ><slot
  /></component>
</template>

<style module src="./Label.module.css" />
