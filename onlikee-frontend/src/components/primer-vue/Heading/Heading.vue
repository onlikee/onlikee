<script setup lang="ts">
import { onMounted, shallowRef, useAttrs } from 'vue'
import type { HeadingOptions } from './types'
import { normalizeReactStyle } from '../internal/style'

defineOptions({ name: 'Heading', inheritAttrs: false })
withDefaults(defineProps<HeadingOptions>(), { as: 'h2' })
const attrs = useAttrs()
const element = shallowRef<HTMLHeadingElement | null>(null)
onMounted(() => {
  if (
    import.meta.env.DEV &&
    element.value &&
    typeof HTMLHeadingElement !== 'undefined' &&
    !(element.value instanceof HTMLHeadingElement)
  )
    console.warn('This Heading component should be an instanceof of h1-h6')
})
defineExpose({ element })
</script>

<template>
  <component
    :is="as"
    ref="element"
    :class="[className, $style.Heading]"
    :data-variant="variant"
    data-component="Heading"
    v-bind="attrs"
    :style="normalizeReactStyle(attrs.style)"
    ><slot
  /></component>
</template>

<style module src="./Heading.module.css" />
