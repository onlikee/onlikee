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
// 源 CheckboxOrRadioGroupValidation.tsx 仅解构 {children, variant}——className 被静默丢弃，
// 非其 prop 面（审计偏差 13：删除 Vue 超集的 className 支持）。
defineProps<RadioGroupValidationProps>()
const context = useChoiceGroupContext()
</script>
