<template>
  <div
    class="form-control__leading-visual"
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

<style scoped>
.form-control__leading-visual {
  --leadingVisual-size: 16px;

  color: var(--fgColor-default, #1f2328);
  display: flex;
  align-items: center;

  &:where([data-control-disabled]) {
    color: var(--control-fgColor-disabled, #818b98);
  }

  &:where([data-has-caption]) {
    --leadingVisual-size: 24px;
  }
}

.form-control__leading-visual :deep(> *) {
  min-width: var(--leadingVisual-size, 16px);
  min-height: var(--leadingVisual-size, 16px);
  fill: currentColor;
}
</style>
