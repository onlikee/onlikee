<template>
  <div
    :class="$style['form-control__leading-visual']"
    :style="normalizeReactStyle(style)"
    :data-control-disabled="context?.disabled.value ? '' : undefined"
    :data-has-caption="context?.captionId.value ? '' : undefined"
    data-component="FormControl.LeadingVisual"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useFormControlContext } from './context'
import type { StyleValue } from 'vue'
import { normalizeReactStyle } from '../internal/style'
defineOptions({ name: 'FormControlLeadingVisual', __SLOT__: Symbol('FormControlLeadingVisual'), inheritAttrs: false })
defineProps<{ style?: StyleValue }>()
const context = useFormControlContext()
</script>
<style module src="./FormControlLeadingVisual.module.css" />
