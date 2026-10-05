<template>
  <InputValidation
    :id="id || context?.validationMessageId.value || ''"
    :validation-status="variant"
    :class-name="className"
    :style="style"
    data-component="FormControl.Validation"
  >
    <slot />
  </InputValidation>
</template>
<script setup lang="ts">
import InputValidation from '../internal/components/InputValidation.vue'
import { useFormControlContext } from './context'
import type { FormControlValidationProps } from './types'
defineOptions({ name: 'FormControlValidation', __SLOT__: Symbol('FormControl.Validation') })
defineProps<FormControlValidationProps>()
const context = useFormControlContext()
</script>
