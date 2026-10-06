<template>
  <InputValidation
    :id="context?.validationMessageId.value ?? ''"
    :validation-status="variant"
    :data-component="context?.parentName.value ? `${context.parentName.value}.Validation` : undefined"
  >
    <slot />
  </InputValidation>
</template>
<script setup lang="ts">
import { useChoiceGroupContext } from '../internal/components/CheckboxOrRadioGroup/context'
import InputValidation from '../internal/components/InputValidation.vue'
import type { RadioGroupValidationProps } from './types'
defineOptions({ name: 'RadioGroupValidation', __SLOT__: Symbol('RadioGroupValidation') })
defineProps<RadioGroupValidationProps>()
const context = useChoiceGroupContext()
</script>
