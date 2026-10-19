<script setup lang="ts">
import { computed } from 'vue'
import type { HiddenProps } from './types'

defineOptions({ name: 'Hidden', inheritAttrs: false })
const props = defineProps<HiddenProps>()
defineSlots<{ default?: () => unknown }>()

const hiddenStyles = computed(() => {
  const viewports = Array.isArray(props.when) ? props.when : [props.when]
  return {
    '--hiddenDisplay-narrow': viewports.includes('narrow') ? 'none' : undefined,
    '--hiddenDisplay-regular': viewports.includes('regular') ? 'none' : undefined,
    '--hiddenDisplay-wide': viewports.includes('wide') ? 'none' : undefined,
    ...props.style,
  }
})
</script>

<template>
  <div
    :class="[className, $attrs.class, $style.Hidden]"
    :style="hiddenStyles"
    data-component="Hidden"
  >
    <slot />
  </div>
</template>

<style module src="./Hidden.module.css" />
