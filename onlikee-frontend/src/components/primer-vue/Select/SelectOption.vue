<script setup lang="ts">
import { inject, useAttrs } from 'vue'
import { selectValueKey } from './context'
import { normalizeReactStyle } from '../internal/style'
defineOptions({ inheritAttrs: false })
const props = defineProps<{ value: string; className?: string }>()
const attrs = useAttrs()
const selectedValue = inject(selectValueKey, undefined)
// Native selection is initialized by Select; SSR must serialize its selected option.
const vSelectDefault = {
  getSSRProps: () =>
    selectedValue?.value === undefined ? {} : { selected: selectedValue.value === props.value },
}
function nativeAttrs() {
  const { class: _class, style: _style, ...native } = attrs
  return native
}
</script>
<template>
  <option
    v-select-default
    v-bind="nativeAttrs()"
    :value="value"
    :class="[className, $attrs.class]"
    :style="normalizeReactStyle($attrs.style)"
    data-component="Select.Option"
  >
    <slot />
  </option>
</template>
