<script setup lang="ts">
import { onMounted, onBeforeUnmount, shallowRef, ref, useAttrs } from 'vue'
import type { ScrollableRegionOptions } from './types'

defineOptions({ name: 'ScrollableRegion', inheritAttrs: false })
const props = defineProps<ScrollableRegionOptions>()
const attrs = useAttrs()
const element = shallowRef<HTMLDivElement | null>(null)
const hasOverflow = ref(false)
let observer: ResizeObserver | undefined
function measure() {
  const target = element.value
  hasOverflow.value = Boolean(
    target &&
    (target.scrollHeight > target.clientHeight || target.scrollWidth > target.clientWidth),
  )
}
onMounted(() => {
  if (!element.value) return
  measure()
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(measure)
    observer.observe(element.value)
  }
})
onBeforeUnmount(() => observer?.disconnect())
function bindings() {
  const { class: _class, ...rest } = attrs
  return {
    ...rest,
    ...(hasOverflow.value
      ? {
          role: 'region',
          tabindex: 0,
          'aria-label': props.ariaLabel,
          'aria-labelledby': props.ariaLabelledby,
        }
      : {}),
    'data-component': 'ScrollableRegion',
  }
}
defineExpose({ element })
</script>

<template>
  <div
    ref="element"
    v-bind="bindings()"
    :class="[$style.ScrollableRegion, props.className, attrs.class]"
  >
    <slot />
  </div>
</template>

<style module src="./ScrollableRegion.module.css" />
