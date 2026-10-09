<script setup lang="ts">
import { inject, useAttrs, type OptionHTMLAttributes } from 'vue'
import { selectValueKey } from './context'
import { normalizeReactStyle } from '../internal/style'
defineOptions({ inheritAttrs: false })
const props = defineProps<{ value: string }>()
const attrs = useAttrs()
const selectedValue = inject(selectValueKey, undefined)
// Only initialize the native default. The select's value controls later changes.
const initiallySelected = selectedValue?.value === props.value
const hasInitialValue = selectedValue?.value !== undefined
function nativeAttrs() {
  const { style: _style, ...native } = attrs
  return native
}
</script>
<template>
  <option
    v-bind="nativeAttrs()"
    :value="value"
    :selected="
      hasInitialValue
        ? initiallySelected || undefined
        : ($attrs.selected as OptionHTMLAttributes['selected'])
    "
    :style="normalizeReactStyle($attrs.style)"
    data-component="Select.Option"
  >
    <slot />
  </option>
</template>
