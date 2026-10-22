<script setup lang="ts">
import { onMounted, onBeforeUnmount, shallowRef, useAttrs, type HTMLAttributes } from 'vue'
import type { ScrollableRegionOptions } from './types'
import { normalizeReactStyle } from '../internal/style'

defineOptions({ name: 'ScrollableRegion', inheritAttrs: false })
const props = defineProps<ScrollableRegionOptions>()
const attrs = useAttrs() as HTMLAttributes & { tabIndex?: HTMLAttributes['tabindex'] }
const element = shallowRef<HTMLDivElement | null>(null)
const hasOverflow = shallowRef(false)
let observer: ResizeObserver | undefined
onMounted(() => {
  if (!element.value) return
  observer = new ResizeObserver((entries) => {
    hasOverflow.value = entries.some(
      ({ target }) =>
        target.scrollHeight > target.clientHeight || target.scrollWidth > target.clientWidth,
    )
  })
  observer.observe(element.value)
})
onBeforeUnmount(() => observer?.disconnect())
function bindings() {
  const { class: _class, tabIndex, tabindex, ...rest } = attrs
  return {
    ...rest,
    ...(tabindex !== undefined || tabIndex !== undefined
      ? { tabindex: tabindex !== undefined ? tabindex : tabIndex }
      : {}),
    style: normalizeReactStyle(attrs.style),
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
