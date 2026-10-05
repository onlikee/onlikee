<script setup lang="ts">
import { useAttrs } from 'vue'
import { normalizeReactStyle } from '../internal/style'
defineOptions({ inheritAttrs: false })
defineProps<{ label: string; disabled?: boolean }>()
const attrs = useAttrs()
function nativeAttrs() {
  const { style: _style, ...native } = attrs
  return native
}
</script>
<template>
  <optgroup
    v-bind="nativeAttrs()"
    :label="label"
    :disabled="disabled"
    :style="normalizeReactStyle($attrs.style)"
    data-component="Select.OptGroup"
  >
    <slot />
  </optgroup>
</template>
