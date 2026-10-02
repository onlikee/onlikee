<template>
  <span
    :id="id ?? context?.captionId.value"
    :class="[className, context?.choice.value ? 'form-control__choice-caption' : 'form-control__caption']"
    :data-control-disabled="context?.disabled.value ? '' : undefined"
    data-component="FormControl.Caption"
  ><slot /></span>
</template>

<script setup lang="ts">
import { useFormControlContext } from './context'
defineOptions({ name: 'FormControlCaption', __SLOT__: Symbol('FormControlCaption') })
defineProps<{ id?: string; className?: string }>()
const context = useFormControlContext()
</script>

<style scoped>
.form-control__caption {
  margin: 0;
  font-size: 12px;
  line-height: 1.3333333333;
  color: var(--fgColor-muted, #656d76);
}

.form-control__choice-caption {
  display: block;
  font-size: var(--text-body-size-small, 12px);
  color: var(--fgColor-muted, #59636e);

  &:where([data-control-disabled]) {
    color: var(--control-fgColor-disabled, #818b98);
  }
}
</style>
