<script setup lang="ts">
import { useAttrs } from 'vue'
import { normalizeReactStyle } from '../internal/style'
defineOptions({ inheritAttrs: false })
defineProps<{ label?: string; disabled?: boolean; className?: string }>()
const attrs = useAttrs()
function nativeAttrs() {
  const { class: _class, style: _style, ...native } = attrs
  return native
}
</script>
<template>
  <optgroup
    v-bind="nativeAttrs()"
    :label="label"
    :class="[className, $attrs.class]"
    :disabled="disabled"
    :style="normalizeReactStyle($attrs.style)"
    data-component="Select.OptGroup"
  >
    <slot />
  </optgroup>
</template>
