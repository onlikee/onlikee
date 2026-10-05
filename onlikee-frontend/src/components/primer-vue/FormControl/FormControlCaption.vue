<template>
  <span
    :id="id ?? context?.captionId.value"
    :class="[className, 'form-control__caption']"
    :style="normalizeReactStyle(style)"
    :data-control-disabled="context?.disabled.value ? '' : undefined"
    data-component="FormControl.Caption"
  ><slot /></span>
</template>

<script setup lang="ts">
import { useFormControlContext } from './context'
import type { StyleValue } from 'vue'
import { normalizeReactStyle } from '../internal/style'
defineOptions({ name: 'FormControlCaption', __SLOT__: Symbol('FormControlCaption') })
defineProps<{ id?: string; className?: string; style?: StyleValue }>()
const context = useFormControlContext()
</script>

<style scoped>
.form-control__caption {
  display: block;
  font-size: var(--text-body-size-small, 12px);
  color: var(--fgColor-muted, #59636e);

  &:where([data-control-disabled]) {
    color: var(--control-fgColor-disabled, #818b98);
  }
}
</style>
